"""Local subtitle editor. Run with: python -m uvicorn app:app --host 127.0.0.1 --port 8765"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="자막 작업실")
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")
_model = None
MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".m4a", ".mp3", ".wav", ".webm", ".flac"}


def model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        _model = WhisperModel(
            os.getenv("SUBTITLE_MODEL", "small"),
            device=os.getenv("SUBTITLE_DEVICE", "auto"),
            compute_type=os.getenv("SUBTITLE_COMPUTE_TYPE", "default"),
        )
    return _model


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html")


@app.post("/api/transcribe")
def transcribe(file: UploadFile = File(...), language: str = Form("ko")):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "지원하지 않는 파일 형식입니다.")
    if language not in {"ko", "en", "ja", "zh", "auto"}:
        raise HTTPException(400, "지원하지 않는 언어입니다.")

    total = 0
    with tempfile.TemporaryDirectory(prefix="subtitle-studio-") as directory:
        path = Path(directory) / ("source" + suffix)
        with path.open("wb") as output:
            while chunk := file.file.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, "파일 크기는 2GB 이하여야 합니다.")
                output.write(chunk)
        if total == 0:
            raise HTTPException(400, "빈 파일입니다.")
        try:
            parts, info = model().transcribe(
                str(path),
                language=None if language == "auto" else language,
                vad_filter=True,
                word_timestamps=True,
            )
            result = [
                {
                    "id": index,
                    "start": round(part.start, 3),
                    "end": round(part.end, 3),
                    "text": part.text.strip(),
                    "original": part.text.strip(),
                }
                for index, part in enumerate(parts)
                if part.text.strip()
            ]
        except Exception as exc:
            raise HTTPException(422, f"음성 처리에 실패했습니다: {exc}") from exc
    return {"segments": result, "language": info.language}


class ProofreadRequest(BaseModel):
    segments: list[dict]
    protected_terms: str = ""


@app.post("/api/proofread")
def proofread(payload: ProofreadRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(400, "고급 맞춤법 검사에는 OPENAI_API_KEY가 필요합니다.")
    if len(payload.segments) > 1000:
        raise HTTPException(400, "한 번에 1,000개 이하의 구간을 검사해 주세요.")

    from openai import OpenAI

    client = OpenAI()
    suggestions = []
    for offset in range(0, len(payload.segments), 50):
        batch = [
            {"id": str(item.get("id")), "text": str(item.get("text", ""))[:500]}
            for item in payload.segments[offset : offset + 50]
        ]
        prompt = (
            "한국어 영상 자막의 맞춤법과 띄어쓰기만 검사하세요. 구어체, 의미, 호칭, "
            "문장 길이, 줄바꿈과 고유명사는 유지하세요. 음성을 추측해 새 말을 만들지 마세요. "
            "수정이 필요한 항목만 suggestions 배열에 반환하세요. 각 항목은 id, corrected, "
            "reason 문자열을 포함합니다. 반드시 JSON 객체만 반환하세요.\n"
            f"보호할 표기: {payload.protected_terms[:2000]}\n"
            f"입력: {json.dumps(batch, ensure_ascii=False)}"
        )
        try:
            response = client.chat.completions.create(
                model=os.getenv("SUBTITLE_PROOFREAD_MODEL", "gpt-4o-mini"),
                temperature=0,
                response_format={"type": "json_object"},
                messages=[{"role": "user", "content": prompt}],
            )
            data = json.loads(response.choices[0].message.content or "{}")
        except Exception as exc:
            raise HTTPException(502, f"맞춤법 검사 요청에 실패했습니다: {exc}") from exc

        originals = {entry["id"]: entry["text"] for entry in batch}
        for entry in data.get("suggestions", []):
            if not isinstance(entry, dict):
                continue
            key = str(entry.get("id"))
            corrected = entry.get("corrected")
            if key in originals and isinstance(corrected, str) and corrected != originals[key]:
                suggestions.append({
                    "id": key,
                    "corrected": corrected,
                    "reason": str(entry.get("reason", ""))[:200],
                })
    return {"suggestions": suggestions}
