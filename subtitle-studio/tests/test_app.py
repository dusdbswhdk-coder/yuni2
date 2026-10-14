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
