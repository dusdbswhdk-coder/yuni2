from fastapi.testclient import TestClient

import app as subtitle_app


class FakeSegment:
    start = 1.25
    end = 2.75
    text = " 안녕하세요. "


class FakeInfo:
    language = "ko"


class FakeModel:
    def transcribe(self, path, **options):
        with open(path, "rb") as source:
            assert source.read() == b"video bytes"
        assert options["language"] == "ko"
        return iter([FakeSegment()]), FakeInfo()


def test_transcription_returns_editable_timed_segments(monkeypatch):
    monkeypatch.setattr(subtitle_app, "_model", FakeModel())
    client = TestClient(subtitle_app.app)
    response = client.post(
        "/api/transcribe",
        data={"language": "ko"},
        files={"file": ("sample.mp4", b"video bytes", "video/mp4")},
    )
    assert response.status_code == 200
    assert response.json() == {
        "language": "ko",
        "segments": [{
            "id": 0, "start": 1.25, "end": 2.75,
            "text": "안녕하세요.", "original": "안녕하세요.",
        }],
    }


def test_invalid_file_is_rejected():
    client = TestClient(subtitle_app.app)
    response = client.post(
        "/api/transcribe",
        data={"language": "ko"},
        files={"file": ("sample.exe", b"unsafe", "application/octet-stream")},
    )
    assert response.status_code == 400


def test_optional_ai_check_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client = TestClient(subtitle_app.app)
    response = client.post("/api/proofread", json={"segments": []})
    assert response.status_code == 400

def test_model_uses_private_cache_and_retries_busy_download(monkeypatch, tmp_path):
    import sys
    from types import SimpleNamespace

    calls = []
    ready_model = object()

    class BusyFile(OSError):
        winerror = 32

    def fake_whisper(name, **options):
        calls.append((name, options))
        if len(calls) == 1:
            raise BusyFile("file is in use")
        return ready_model

    cache = tmp_path / "models"
    monkeypatch.setenv("SUBTITLE_MODEL_CACHE", str(cache))
    monkeypatch.setitem(sys.modules, "faster_whisper", SimpleNamespace(WhisperModel=fake_whisper))
    monkeypatch.setattr(subtitle_app, "_model", None)
    monkeypatch.setattr(subtitle_app, "sleep", lambda seconds: None)

    assert subtitle_app.model() is ready_model
    assert subtitle_app.model() is ready_model
    assert len(calls) == 2
    assert calls[0][1]["download_root"] == str(cache)
    assert calls[0][1]["device"] == "cpu"
    assert calls[0][1]["compute_type"] == "int8"
    assert cache.is_dir()
