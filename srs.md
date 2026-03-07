# ASSIST 11기 원우 커뮤니티 - SRS (Software Requirements Specification)

## 1. 프로젝트 개요

- **프로젝트명**: ASSIST 11기 원우 커뮤니티
- **목적**: 2026년 ASSIST 경영대학원 11기 원우들의 네트워킹과 정보 공유를 위한 폐쇄형 커뮤니티 플랫폼
- **대상 사용자**: 11기 원우 (약 30~50명) 및 교수진
- **접근 제한**: 인증된 원우 및 교수진만 접속 가능 (폐쇄형)

---

## 2. 기능 요구사항

### 2.1 인증 및 권한 관리

| 항목 | 상세 |
|------|------|
| 회원가입 | 관리자 초대 방식 (초대 코드 또는 이메일 초대 링크) |
| 로그인 | 이메일/비밀번호, 소셜 로그인(Google, Kakao) |
| 역할 구분 | 관리자(운영진), 원우, 교수 |
| 관리자 권한 | 회원 승인/관리, 게시글 관리, 공지사항 등록 |

### 2.2 대시보드 (홈)

| 항목 | 상세 |
|------|------|
| 최신 공지 | 상단 고정 배너 형태로 최신 공지사항 1~3건 표시 |
| 새 게시글 | 자유게시판/칼럼 최신 글 5건 미리보기 (제목, 작성자, 작성일) |
| 다가오는 일정 | 캘린더에서 가져온 향후 7일 내 이벤트 목록 |
| 진행 중 투표 | 현재 활성화된 투표/설문 바로가기 |
| 최근 갤러리 | 최신 앨범 썸네일 미리보기 (4~6장) |
| IT 뉴스 하이라이트 | RSS에서 가져온 최신 IT 소식 3건 |
| 빠른 액션 | 글쓰기, 투표 만들기, 사진 올리기 바로가기 버튼 |

### 2.3 원우 프로필 디렉토리

| 항목 | 상세 |
|------|------|
| 프로필 정보 | 이름, 프로필 사진, 나이(기수), 연락처(전화번호), 이메일, 재직 회사, 직책/직급, 주 업종, 관심 분야, 자기소개 |
| 디렉토리 검색 | 이름, 회사명, 업종, 관심 분야로 검색/필터링 |
| 프로필 공개 범위 | 연락처 등 민감 정보는 로그인 사용자에게만 노출 |
| 프로필 수정 | 본인 프로필만 수정 가능 |
| 디지털 프로필 카드 | 프로필 정보를 카드 형태로 렌더링, QR 코드 생성 포함 |
| QR 코드 공유 | QR 스캔 시 해당 원우의 프로필 페이지로 이동 |
| 프로필 카드 저장 | 디지털 명함 이미지(PNG)로 다운로드 가능 |

### 2.4 커뮤니티 게시판

| 항목 | 상세 |
|------|------|
| 게시판 종류 | 공지사항, 자유게시판, 칼럼/인사이트 |
| 게시글 기능 | 제목, 본문(리치 텍스트), 이미지 첨부, 파일 첨부 |
| 댓글 | 게시글별 댓글, 대댓글(1단계) |
| 반응 | 좋아요/공감 기능 |
| 정렬/검색 | 최신순, 인기순, 제목/내용 검색 |
| 북마크/스크랩 | 관심 게시글 저장, 마이페이지에서 스크랩 목록 조회 |

### 2.5 IT 소식 게시판 (RSS 연동)

| 항목 | 상세 |
|------|------|
| RSS 소스 | 주요 IT 뉴스 사이트 RSS 자동 수집 (GeekNews, TechCrunch Korea 등) |
| 표시 정보 | 제목, 요약, 출처, 게시일, 원문 링크 |
| 의견 교환 | 각 뉴스 항목에 댓글 기능 |
| 갱신 주기 | 1시간 간격 자동 수집 (Cron Job) |
| 수동 공유 | 원우가 직접 IT 관련 링크 공유 가능 |
| 북마크 | IT 뉴스 항목도 개인 스크랩 가능 |

### 2.6 논문 주제 게시 및 상호 평가

| 항목 | 상세 |
|------|------|
| 논문 등록 | 제목, 초록/개요, 연구 분야, 진행 상태(구상중/진행중/완료) |
| 파일 첨부 | PDF, DOCX 등 논문 파일 업로드 |
| 상호 평가 | 별점(1~5) + 텍스트 피드백 |
| 평가 익명 여부 | 실명 기본, 익명 옵션 제공 |
| 북마크 | 관심 논문 스크랩 가능 |

### 2.7 활동사진 갤러리

| 항목 | 상세 |
|------|------|
| 앨범 구성 | 행사/날짜별 앨범 생성 (예: "2026 MT", "종강 파티") |
| 사진 업로드 | 다중 이미지 업로드, 드래그 앤 드롭 지원 |
| 슬라이드쇼 | 앨범 단위 슬라이드쇼 자동 재생 (전환 효과 포함) |
| 썸네일 | 그리드 레이아웃, 라이트박스 뷰어 |
| 사진 다운로드 | 개별/일괄 다운로드 |

### 2.8 일정/이벤트 관리

| 항목 | 상세 |
|------|------|
| 캘린더 뷰 | 월간/주간/일간 캘린더 UI |
| 이벤트 생성 | 제목, 설명, 날짜/시간, 장소(텍스트 또는 지도 링크), 카테고리(수업/모임/MT/회식/스터디) |
| 참석 여부(RSVP) | 참석/불참/미정 응답, 참석자 명단 실시간 확인 |
| 반복 일정 | 매주 스터디 등 정기 일정 반복 설정 |
| 알림 연동 | 이벤트 D-1, 당일 알림 자동 발송 |
| 이벤트 생성 권한 | 모든 원우가 생성 가능 (관리자 승인 불필요) |

### 2.9 투표/설문

| 항목 | 상세 |
|------|------|
| 투표 생성 | 제목, 설명, 선택지(2~10개) |
| 투표 옵션 | 단일 선택 / 복수 선택 지원 |
| 마감 설정 | 마감일시 설정, 마감 후 자동 결과 공개 |
| 결과 표시 | 막대 그래프로 실시간 결과 시각화, 투표자 명단(선택적 공개) |
| 익명 투표 | 투표자 비공개 옵션 |
| 대시보드 연동 | 진행 중인 투표는 홈 대시보드에 노출 |

### 2.10 알림 시스템

| 항목 | 상세 |
|------|------|
| 인앱 알림 | 헤더 벨 아이콘, 읽지 않은 알림 배지, 알림 목록 드롭다운 |
| 알림 트리거 | 새 공지, 내 글에 댓글, 내 댓글에 대댓글, 새 투표, 이벤트 리마인더, 논문 피드백 수신 |
| 이메일 다이제스트 | 주간 요약 이메일 (새 글/이벤트/뉴스 요약) |
| 알림 설정 | 사용자별 알림 유형 on/off 설정 가능 |

### 2.11 스터디/소모임

| 항목 | 상세 |
|------|------|
| 소모임 생성 | 소모임명, 설명, 카테고리(AI/창업/마케팅/독서 등), 대표 이미지 |
| 멤버 관리 | 가입/탈퇴, 소모임장 지정, 최대 인원 설정(선택) |
| 전용 게시판 | 소모임 내 게시글/댓글 (소모임 멤버만 접근) |
| 소모임 일정 | 소모임 전용 일정 관리, 메인 캘린더에도 표시 |
| 소모임 목록 | 전체 소모임 탐색, 멤버 수/활동량 표시 |

### 2.12 북마크/스크랩 (통합)

| 항목 | 상세 |
|------|------|
| 스크랩 대상 | 게시글, IT 뉴스, 논문, 칼럼 |
| 스크랩 목록 | 마이페이지 > 스크랩 탭에서 통합 조회 |
| 분류 | 카테고리별 필터 (게시글/뉴스/논문) |
| 삭제 | 개별 스크랩 해제 |

### 2.13 PWA (Progressive Web App)

| 항목 | 상세 |
|------|------|
| 홈 화면 추가 | 모바일 브라우저에서 "홈 화면에 추가" 지원 |
| 앱 아이콘 | ASSIST 로고 기반 앱 아이콘 |
| 오프라인 지원 | 기본 셸(레이아웃, 네비게이션) 캐싱, 오프라인 시 안내 페이지 |
| 스플래시 스크린 | 앱 실행 시 로딩 화면 |
| 매니페스트 | name, short_name, theme_color, display: standalone |

---

## 3. 비기능 요구사항

| 항목 | 상세 |
|------|------|
| 반응형 디자인 | 모바일, 태블릿, 데스크톱 대응 (모바일 우선) |
| 성능 | 페이지 로딩 2초 이내 |
| 보안 | HTTPS, 입력값 검증, CSRF/XSS 방어 |
| 데이터 백업 | Neon 자동 백업 활용 |
| SEO | 폐쇄형이므로 불필요 (noindex 처리) |
| 접근성 | 기본 WCAG 2.1 AA 준수 (키보드 네비게이션, 스크린리더 호환) |

---

## 4. 기술스택 (권장)

### Frontend + Backend: **Next.js 15 (App Router)**

| 구분 | 기술 | 선정 이유 |
|------|------|-----------|
| 프레임워크 | **Next.js 15** (App Router) | 풀스택 프레임워크, SSR/SSG 지원, API Routes 내장 |
| 언어 | **TypeScript** | 타입 안정성, 유지보수 용이 |
| UI 라이브러리 | **ShadCN UI + Tailwind CSS v4** | 커스텀 가능한 컴포넌트, 빠른 UI 개발 |
| ORM | **Drizzle ORM** | 타입 안전, 경량, Neon과 공식 연동 지원 |
| 인증 | **NextAuth.js (Auth.js v5)** | Google/Kakao 소셜 로그인, 초대 기반 가입 |
| 리치 텍스트 에디터 | **Tiptap** | 가볍고 확장 가능한 에디터 |
| 이미지 최적화 | **Next.js Image** + **sharp** | 자동 리사이즈, WebP 변환 |
| 상태 관리 | **Zustand** | 경량, 간단한 전역 상태 관리 |
| 데이터 페칭 | **TanStack Query** | 서버 상태 캐싱, 자동 갱신 |
| RSS 파싱 | **rss-parser** | RSS/Atom 피드 파싱 |
| 캘린더 UI | **react-big-calendar** 또는 **FullCalendar** | 월간/주간/일간 뷰 지원 |
| QR 코드 생성 | **qrcode.react** | 프로필 QR 코드 생성 |
| 차트/그래프 | **recharts** | 투표 결과 시각화 |
| 이메일 발송 | **Resend** | 초대 메일, 주간 다이제스트 발송 (무료 100통/일) |
| PWA | **next-pwa** 또는 **@serwist/next** | Service Worker, 매니페스트 자동 생성 |

### Database: **Neon (Serverless PostgreSQL)**

| 항목 | 상세 |
|------|------|
| 서비스 | Neon |
| Free Tier | 0.5 GB 스토리지, 브랜칭 지원 |
| 장점 | 서버리스, 자동 스케일링, cold start 빠름, Drizzle ORM 공식 지원 |

### 파일 스토리지: **Vercel Blob** 또는 **Cloudflare R2**

| 옵션 | 무료 | 장점 |
|------|------|------|
| **Vercel Blob** | 기본 포함 | Vercel 통합, 간편한 업로드 API |
| **Cloudflare R2** | 10GB/월 무료 | S3 호환, 대용량 이미지에 유리, 이그레스 무료 |

> 갤러리 이미지가 많을 것으로 예상되므로 **Cloudflare R2** 권장

---

## 5. 배포 서비스: **Vercel** (권장)

| 항목 | 상세 |
|------|------|
| 플랫폼 | **Vercel** (Hobby Plan - 무료) |
| 이유 | Next.js 공식 호스팅, 자동 배포(GitHub 연동), 글로벌 CDN, Serverless Functions, Cron Jobs 지원 |
| 도메인 | 커스텀 도메인 연결 가능 (무료 SSL) |
| Cron Jobs | `vercel.json`에서 설정 → RSS 자동 수집, 주간 다이제스트 발송 스케줄링 |
| 제한사항 | Hobby Plan: 월 100GB 대역폭, Serverless 실행 시간 10초 |

### 배포 대안 비교

| 서비스 | 무료 여부 | Next.js 지원 | 장점 | 단점 |
|--------|-----------|-------------|------|------|
| **Vercel** | O (Hobby) | 최적 | Next.js 네이티브, 가장 쉬운 배포 | 상업적 사용 시 유료 |
| Cloudflare Pages | O | 지원 | 무제한 대역폭, R2 연동 용이 | Next.js 일부 기능 제한 |
| Netlify | O | 지원 | 쉬운 설정 | Next.js 최신 기능 지연 |
| Railway | 일부 무료 | 지원 | Docker 지원, DB 내장 가능 | 무료 크레딧 한정 |

---

## 6. 프로젝트 구조 (예상)

```
assist-11th/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # 로그인, 회원가입
│   │   ├── (main)/                 # 인증 후 메인 레이아웃
│   │   │   ├── dashboard/          # 대시보드 (홈)
│   │   │   ├── directory/          # 원우 프로필 디렉토리
│   │   │   ├── community/          # 커뮤니티 게시판
│   │   │   ├── columns/            # 칼럼/인사이트
│   │   │   ├── news/               # IT 소식 (RSS)
│   │   │   ├── thesis/             # 논문 주제/평가
│   │   │   ├── gallery/            # 활동사진 갤러리
│   │   │   ├── calendar/           # 일정/이벤트 관리
│   │   │   ├── polls/              # 투표/설문
│   │   │   ├── groups/             # 스터디/소모임
│   │   │   ├── bookmarks/          # 북마크/스크랩
│   │   │   ├── notifications/      # 알림 목록
│   │   │   └── profile/            # 내 프로필 관리 (QR 카드 포함)
│   │   └── api/                    # API Routes
│   │       ├── auth/               # 인증 API
│   │       ├── users/              # 사용자/프로필 API
│   │       ├── posts/              # 게시글 API
│   │       ├── comments/           # 댓글 API
│   │       ├── rss/                # RSS 수집 API
│   │       ├── events/             # 이벤트/일정 API
│   │       ├── polls/              # 투표 API
│   │       ├── groups/             # 소모임 API
│   │       ├── bookmarks/          # 북마크 API
│   │       ├── notifications/      # 알림 API
│   │       ├── upload/             # 파일 업로드 API
│   │       └── cron/               # Cron Job 엔드포인트 (RSS 수집, 다이제스트)
│   ├── components/                 # 공통 UI 컴포넌트
│   │   ├── ui/                     # ShadCN UI 컴포넌트
│   │   ├── layout/                 # 레이아웃 (헤더, 사이드바, 푸터)
│   │   ├── editor/                 # Tiptap 에디터
│   │   ├── calendar/               # 캘린더 컴포넌트
│   │   ├── gallery/                # 갤러리/슬라이드쇼 컴포넌트
│   │   └── notifications/          # 알림 벨/드롭다운
│   ├── lib/                        # 유틸리티, DB 클라이언트
│   │   ├── db.ts                   # Neon/Drizzle 연결
│   │   ├── auth.ts                 # Auth.js 설정
│   │   ├── storage.ts              # R2/Blob 업로드 유틸
│   │   ├── email.ts                # Resend 이메일 유틸
│   │   └── rss.ts                  # RSS 파싱 유틸
│   ├── db/                         # Drizzle 스키마, 마이그레이션
│   │   ├── schema.ts               # 테이블 스키마 정의
│   │   └── migrations/             # 마이그레이션 파일
│   ├── hooks/                      # 커스텀 React 훅
│   └── stores/                     # Zustand 스토어
├── public/
│   ├── manifest.json               # PWA 매니페스트
│   └── icons/                      # 앱 아이콘
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

---

## 7. 핵심 데이터 모델 (요약)

```
users            : id, name, email, phone, company, position, industry, interests, bio, avatar_url, role, created_at
posts            : id, author_id, board_type, title, content, created_at, updated_at
comments         : id, post_id, author_id, parent_id, content, created_at
reactions        : id, post_id, user_id, type
bookmarks        : id, user_id, target_type, target_id, created_at
rss_items        : id, source, title, summary, url, published_at
thesis           : id, author_id, title, abstract, field, status, file_url
thesis_reviews   : id, thesis_id, reviewer_id, rating, feedback, is_anonymous
albums           : id, title, description, cover_image_url, created_at
photos           : id, album_id, uploader_id, image_url, caption, created_at
events           : id, creator_id, title, description, location, start_at, end_at, category, is_recurring, recurrence_rule
event_rsvps      : id, event_id, user_id, status (attending/declined/maybe)
polls            : id, creator_id, title, description, is_multiple, is_anonymous, closes_at
poll_options     : id, poll_id, text
poll_votes       : id, poll_option_id, user_id
groups           : id, name, description, category, image_url, leader_id, max_members, created_at
group_members    : id, group_id, user_id, joined_at
group_posts      : id, group_id, author_id, title, content, created_at
notifications    : id, user_id, type, title, message, link, is_read, created_at
notification_settings : id, user_id, type, enabled
invitations      : id, email, role, code, invited_by, used_at, expires_at
```

---

## 8. 권장 조합 요약

```
Next.js 15 + TypeScript + ShadCN UI + Tailwind CSS v4
+ Drizzle ORM + Neon (PostgreSQL)
+ Auth.js v5 (NextAuth)
+ Cloudflare R2 (이미지 스토리지)
+ Resend (이메일)
+ Vercel (배포)
```

> **예상 월 비용: 0원** (소규모 커뮤니티 기준, 모든 서비스 무료 티어 내 운영 가능)

---

## 9. 개발 우선순위 (권장 단계)

### Phase 1 - 핵심 기반 (MVP)
1. 프로젝트 세팅 (Next.js, Drizzle, Neon, Auth.js)
2. 인증/초대 시스템
3. 원우 프로필 디렉토리
4. 커뮤니티 게시판 (공지/자유/칼럼 + 댓글)
5. 대시보드 (홈)

### Phase 2 - 콘텐츠 확장
6. IT 소식 게시판 (RSS 연동)
7. 논문 주제 게시 및 상호 평가
8. 활동사진 갤러리 + 슬라이드쇼
9. 북마크/스크랩

### Phase 3 - 커뮤니케이션 강화
10. 일정/이벤트 관리 (캘린더)
11. 투표/설문
12. 알림 시스템 (인앱 + 이메일 다이제스트)

### Phase 4 - 부가 기능
13. 스터디/소모임
14. 디지털 프로필 카드 + QR
15. PWA 설정
