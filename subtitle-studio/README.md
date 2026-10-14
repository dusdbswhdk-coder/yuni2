# 자막 작업실

영상 또는 음성 파일에서 한국어 자막을 추출하고, 문장과 타이밍을 검토한 뒤 SRT, TXT, ASS 파일로 저장하는 **개인 PC용 첫 버전**입니다. 기존 카드뉴스 앱과 분리된 폴더에 있습니다. GitHub Pages는 Python 음성 인식 서버를 실행할 수 없으므로 이 앱은 PC에서 실행합니다.

## Windows에서 시작하기

**간편 실행:** [SubtitleStudio-Windows.zip](https://github.com/dusdbswhdk-coder/yuni2/releases/download/subtitle-studio-preview-20261014-r7/SubtitleStudio-Windows.zip)을 다운로드해 압축을 풀고, `SubtitleStudio/SubtitleStudio.exe`를 실행하세요. Python 설치는 필요하지 않습니다. 처리 방식을 처음 사용할 때 해당 음성 인식 모델을 인터넷으로 내려받으며, 완료되면 PC에 보관됩니다. 빠른 초안도 영상 길이에 따라 1분 넘게 걸릴 수 있습니다.

**소스 코드로 실행하려면:**

1. [이 브랜치](https://github.com/dusdbswhdk-coder/yuni2/tree/codex/subtitle-studio-mvp-20261014)에서 **Code → Download ZIP**을 선택하고 압축을 풉니다.
2. Python 3.11 이상을 설치합니다. 설치할 때 **Add python.exe to PATH**를 체크합니다.
3. 압축을 푼 폴더의 subtitle-studio 안에서 **setup_windows.bat**을 한 번 실행합니다. 인터넷 연결이 필요합니다.
4. **run_windows.bat**을 실행하고 브라우저에서 **http://127.0.0.1:8765**를 엽니다.
5. 영상 파일을 선택하고 **자막 추출**을 누릅니다. 첫 실행 시 음성 인식 모델을 내려받느라 더 걸릴 수 있습니다.
6. 자막을 수정하고 **최종 SRT**를 누른 뒤 Premiere Pro 프로젝트 패널에 가져옵니다.

Windows에서 py 명령을 찾을 수 없다면 PowerShell에서 python -m pip install -r requirements.txt 와 python -m uvicorn app:app --host 127.0.0.1 --port 8765 를 실행할 수 있습니다.

## 기능과 비용

- MP4, MOV, M4A, MP3, WAV, WEBM, FLAC 파일을 최대 2GB까지 선택합니다.
- 음성 인식은 faster-whisper로 PC에서 수행합니다. 빠른 초안은 base 모델과 간단한 탐색을 사용하며, 정확도 우선은 small 모델과 단어 시간 계산을 사용합니다. 환경 변수 SUBTITLE_MODEL로 모델을 고정할 수도 있습니다. 기본은 CPU int8 실행으로 별도 CUDA 설치가 필요하지 않습니다. SUBTITLE_DEVICE=cuda를 설정해 GPU를 사용하려면 호환되는 CUDA 12/cuDNN 라이브러리가 설치되어 있어야 합니다. 처리 속도는 PC 환경에 따라 다릅니다.
- **기본 맞춤법·띄어쓰기 검사**는 Kiwi의 형태소 기반 띄어쓰기와 자주 틀리는 표기 규칙을 PC에서 실행합니다. 의심 구절과 추천 표현을 비교해 선택 적용할 수 있습니다. 문맥과 고유명사의 정확도는 직접 확인해야 합니다.
- **AI 정밀 검사**는 선택 기능입니다. OPENAI_API_KEY가 있으면 자막 문장만 OpenAI API로 보내 수정안을 받습니다. 영상 파일은 전송하지 않습니다. ChatGPT 구독과 API 요금은 별개입니다. 키는 코드나 GitHub에 넣지 마세요.
- AI 키는 실행 전 같은 PowerShell 창에서 $env:OPENAI_API_KEY="본인 키"처럼 설정한 뒤 python -m uvicorn app:app --host 127.0.0.1 --port 8765 로 실행합니다. run_windows.bat을 새 창에서 실행하면 해당 PowerShell 환경 변수가 전달되지 않을 수 있습니다.
- 원문은 보존하며, 맞춤법 제안은 하나씩 선택 적용합니다. KCC 같은 표기를 AI 검사에서 보호 단어로 입력할 수 있습니다.
- 자막끼리 같은 긴 구절이나 매우 비슷한 문장을 발견하면 **중복 의심**으로 노란 밑줄을 표시합니다. 의미상 중복 여부는 직접 판단해야 합니다.
- 자막 편집의 **한 줄 최대 글자 수**(4~40)와 **자막당 최대 줄 수**(1~3)를 바꾸면 각 자막을 즉시 재배치합니다. 초과 문장은 새로운 번호의 자막 구간으로 나뉘며 원래 시작·끝 시간 안에서 글자 수에 비례해 시간을 배분합니다. 줄 수를 늘리면 같은 원본 구간의 자막은 다시 합쳐집니다. 긴 단어는 글자 수에 맞춰 나눕니다. 자동으로 나뉜 시간은 영상과 대조해 최종 확인하세요.
- **컷 검토 표시**를 누른 자막은 빨간색 카드와 영상 아래 시간 막대에 남습니다. 최종 SRT에서는 제외되고, 검토용 SRT에는 같은 시간코드에 `[컷 검토]`로 포함됩니다. 원본 영상은 편집되지 않습니다.
- SRT, TXT, ASS는 브라우저에서 저장합니다. SRT의 시간코드는 **영상 파일의 시작 시점 0초 기준**입니다.

## 현재 범위

화자 자동 구분, 로그인·결제, 서버 작업 내역 저장, 일괄 처리, 정확도 보장은 아직 없습니다. 배경음악·겹치는 대화·브랜드명은 원본과 대조해 교정해야 합니다. 이 브랜치는 실행 환경 장애로 실제 설치 및 영상 처리 테스트를 완료하지 못했습니다.
