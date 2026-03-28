# 설치 가이드 스크린샷 체크리스트

## 목적

이 문서는 설치/가입 가이드 페이지에 넣을 실제 스크린샷을 수집하기 위한 체크리스트다

현재 페이지에는 공식 사이트 캡처가 먼저 들어가 있다  
이 문서는 이후 `직접 찍은 실제 설치 화면`으로 교체하기 위한 촬영 목록이다

---

## 촬영 원칙

- 가능하면 `Windows 환경` 기준으로 촬영
- 학생이 실제로 보게 되는 화면만 찍기
- 한 장에 너무 많은 정보를 담지 않기
- 클릭할 버튼이나 체크박스가 보이게 찍기
- 개인정보는 보이지 않게 처리
- 파일명은 영어 소문자와 하이픈으로 통일

예시:

- `python-installer-path-checkbox.png`
- `wsl-install-powershell-result.png`
- `vscode-extensions-copilot-wsl-python.png`

---

## 최우선 촬영 항목

### 1. Python 설치기 PATH 체크박스

- 파일명 추천: `python-installer-path-checkbox.png`
- 왜 중요한가:
  - 초보자가 가장 자주 막히는 지점
- 어디에 넣나:
  - [install-python.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-python.html)

### 2. WSL 설치 결과 화면

- 파일명 추천: `wsl-install-powershell-result.png`
- 왜 중요한가:
  - `wsl --install` 실행 후 어떤 화면이 보여야 하는지 알 수 있음
- 어디에 넣나:
  - [install-wsl.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-wsl.html)

### 3. Ubuntu 초기 설정 화면

- 파일명 추천: `wsl-ubuntu-first-setup.png`
- 왜 중요한가:
  - username / password 입력에서 초보자가 많이 당황함
- 어디에 넣나:
  - [install-wsl.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-wsl.html)

### 4. 버전 확인 명령 결과 화면

- 파일명 추천:
  - `git-version-check.png`
  - `node-npm-version-check.png`
  - `python-version-check.png`
  - `wsl-list-version-check.png`
- 왜 중요한가:
  - 학생이 설치 완료 여부를 스스로 판단할 수 있음
- 어디에 넣나:
  - [install-git.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-git.html)
  - [install-node.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-node.html)
  - [install-python.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-python.html)
  - [install-wsl.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-wsl.html)

### 5. VS Code 확장 설치 화면

- 파일명 추천: `vscode-extensions-copilot-wsl-python.png`
- 왜 중요한가:
  - 무엇을 설치해야 하는지 한 번에 보여줄 수 있음
- 어디에 넣나:
  - [install-vscode.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-vscode.html)

---

## 페이지별 촬영 목록

### GitHub / Vercel 가입

- `github-signup-email-step.png`
- `github-email-verification.png`
- `vercel-signup-github.png`

연결 페이지:

- [accounts.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/accounts.html)

### Git 설치

- `git-download-page.png`
- `git-installer-default-options.png`
- `git-version-check.png`

연결 페이지:

- [install-git.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-git.html)

### Node.js 설치

- `node-download-lts.png`
- `node-installer-finish.png`
- `node-npm-version-check.png`

연결 페이지:

- [install-node.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-node.html)

### Python 설치

- `python-download-page.png`
- `python-installer-path-checkbox.png`
- `python-version-check.png`

연결 페이지:

- [install-python.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-python.html)

### WSL 설치

- `wsl-install-powershell-result.png`
- `wsl-ubuntu-first-setup.png`
- `wsl-list-version-check.png`

연결 페이지:

- [install-wsl.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-wsl.html)

### VS Code 설치

- `vscode-download-user-installer.png`
- `vscode-github-signin.png`
- `vscode-extensions-copilot-wsl-python.png`

연결 페이지:

- [install-vscode.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-vscode.html)

### Antigravity 설치

- `antigravity-download-page.png`
- `antigravity-first-setup.png`
- `antigravity-browser-setup.png`

연결 페이지:

- [install-antigravity.html](/Users/cyanluna-pro16/dev/toys/vibe.coding/site/install-antigravity.html)

---

## 촬영 순서 추천

1. Python PATH 체크박스
2. WSL 설치와 Ubuntu 초기 설정
3. VS Code 확장 설치 화면
4. Git / Node / Python / WSL 버전 확인 화면
5. Git 설치 마법사
6. GitHub / Vercel 가입 화면
7. Antigravity 초기 설정 화면

---

## 공식 링크 모음

- GitHub 가입: https://github.com/signup
- GitHub 시작 문서: https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account
- Vercel 가입: https://vercel.com/signup
- Vercel 계정 문서: https://vercel.com/docs/accounts
- Git 설치: https://git-scm.com/install/windows
- Git 설치 문서: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
- Node.js 다운로드: https://nodejs.org/en/download/
- Node.js 릴리스: https://nodejs.org/en/download/releases/
- Python 다운로드: https://www.python.org/downloads/
- Python on Windows: https://docs.python.org/3/using/windows.html
- WSL 설치: https://learn.microsoft.com/en-us/windows/wsl/install
- VS Code 다운로드: https://code.visualstudio.com/download
- VS Code on Windows: https://code.visualstudio.com/docs/setup/windows
- VS Code + WSL: https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-vscode
- Antigravity Codelab: https://codelabs.developers.google.com/getting-started-google-antigravity
- Antigravity 다운로드: https://antigravity.google/download
- Antigravity 문서: https://antigravity.google/docs

