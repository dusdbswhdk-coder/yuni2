"""Windows launcher for the bundled local subtitle server."""

from threading import Thread
from time import sleep
from urllib.request import urlopen
import webbrowser

import uvicorn

from app import app


URL = "http://127.0.0.1:8765"


def open_when_ready():
    for _ in range(100):
        try:
            with urlopen(URL, timeout=1):
                webbrowser.open(URL)
                return
        except Exception:
            sleep(0.2)


if __name__ == "__main__":
    Thread(target=open_when_ready, daemon=True).start()
    print("자막 작업실 실행 중. 종료하려면 이 창을 닫으세요.")
    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")
