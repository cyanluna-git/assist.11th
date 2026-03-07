# ASSIST 11기 커뮤니티 - Sprint Task Breakdown

> SRS 기반 AI 구현 태스크 목록. 각 태스크는 독립적으로 실행 가능한 단위로 분리.
> 칸반 등록 전 정리 문서.

---

## Phase 1 - 핵심 기반 (MVP)

### P1-1. Next.js 15 프로젝트 초기 세팅

| 항목 | 내용 |
|------|------|
| ID | P1-1 |
| 설명 | Next.js 15 App Router + TypeScript + Tailwind CSS v4 + ShadCN UI 프로젝트 생성 및 기본 설정 |
| 구현 범위 | - `create-next-app` 프로젝트 생성 (App Router, TypeScript, Tailwind)<br>- ShadCN UI 초기화 및 기본 컴포넌트 설치 (Button, Input, Card, Dialog 등)<br>- ESLint, Prettier 설정<br>- 프로젝트 디렉토리 구조 생성 (`src/app`, `src/components`, `src/lib`, `src/db`, `src/hooks`, `src/stores`)<br>- 환경 변수 파일 (.env.local.example) 템플릿 작성 |
| 완료 조건 | `npm run dev`로 로컬 실행 확인, ShadCN 컴포넌트 렌더링 확인 |
| 의존성 | 없음 |

### P1-2. Drizzle ORM + Neon DB 스키마 정의

| 항목 | 내용 |
|------|------|
| ID | P1-2 |
| 설명 | Neon PostgreSQL 연결, Drizzle ORM 설정, SRS 섹션 7의 전체 데이터 모델을 스키마로 정의 |
| 구현 범위 | - `drizzle-orm`, `@neondatabase/serverless` 패키지 설치<br>- `src/db/schema.ts`: users, posts, comments, reactions, bookmarks, rss_items, thesis, thesis_reviews, albums, photos, events, event_rsvps, polls, poll_options, poll_votes, groups, group_members, group_posts, notifications, notification_settings, invitations 테이블 정의<br>- `src/lib/db.ts`: Neon 연결 클라이언트 설정<br>- `drizzle.config.ts` 설정<br>- 초기 마이그레이션 생성 및 실행 |
| 완료 조건 | `npx drizzle-kit push`로 Neon DB에 테이블 생성 확인, Drizzle Studio에서 테이블 조회 가능 |
| 의존성 | P1-1 |

### P1-3. Auth.js v5 인증 시스템

| 항목 | 내용 |
|------|------|
| ID | P1-3 |
| 설명 | 이메일/비밀번호 + Google + Kakao 소셜 로그인, 세션 관리, 미들웨어 보호 |
| 구현 범위 | - `next-auth` (Auth.js v5) 설치 및 설정<br>- `src/lib/auth.ts`: Auth.js 설정 (Drizzle Adapter 연동)<br>- Credentials Provider (이메일/비밀번호)<br>- Google OAuth Provider<br>- Kakao OAuth Provider<br>- `src/app/api/auth/[...nextauth]/route.ts`: Auth API 라우트<br>- `src/middleware.ts`: 인증되지 않은 사용자 리다이렉트<br>- 세션에 role(admin/member/professor) 정보 포함 |
| 완료 조건 | 이메일/비밀번호 로그인, Google 로그인, Kakao 로그인 모두 동작, 미인증 시 로그인 페이지로 리다이렉트 |
| 의존성 | P1-2 |

### P1-4. 초대 기반 회원가입

| 항목 | 내용 |
|------|------|
| ID | P1-4 |
| 설명 | 관리자가 초대 코드/이메일 링크를 발급하고, 초대받은 사용자만 가입 가능 |
| 구현 범위 | - `src/app/api/invitations/route.ts`: 초대 생성 API (관리자 전용)<br>- 초대 코드 생성 (UUID 기반), 만료일 설정<br>- Resend를 통한 초대 이메일 발송 (`src/lib/email.ts`)<br>- `src/app/(auth)/invite/[code]/page.tsx`: 초대 수락 및 회원가입 페이지<br>- `src/app/(auth)/login/page.tsx`: 로그인 페이지 UI<br>- `src/app/(auth)/register/page.tsx`: 회원가입 폼 (초대 코드 검증 포함)<br>- 초대 코드 사용 시 used_at 업데이트, 재사용 방지 |
| 완료 조건 | 관리자가 초대 생성 → 이메일 수신 → 링크 클릭 → 회원가입 → 로그인 플로우 완료 |
| 의존성 | P1-3 |

### P1-5. 공통 레이아웃 및 네비게이션

| 항목 | 내용 |
|------|------|
| ID | P1-5 |
| 설명 | 인증 후 사용하는 공통 레이아웃 — 반응형 헤더, 사이드바 네비게이션, 모바일 하단 네비게이션 |
| 구현 범위 | - `src/app/(main)/layout.tsx`: 인증 확인 후 메인 레이아웃 렌더링<br>- `src/components/layout/header.tsx`: 로고, 검색바, 알림 벨(뱃지), 프로필 드롭다운<br>- `src/components/layout/sidebar.tsx`: 네비게이션 메뉴 (대시보드, 디렉토리, 커뮤니티, IT소식, 논문, 갤러리, 캘린더, 투표, 소모임)<br>- `src/components/layout/mobile-nav.tsx`: 모바일 하단 탭 또는 햄버거 메뉴<br>- 반응형: 데스크톱=사이드바, 모바일=하단 네비게이션 |
| 완료 조건 | 데스크톱/모바일 레이아웃 전환 확인, 각 메뉴 클릭 시 해당 라우트 이동 |
| 의존성 | P1-3 |

### P1-6. 프로필 디렉토리 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P1-6 |
| 설명 | 원우 프로필 조회, 수정, 검색/필터링 API 및 이미지 업로드 |
| 구현 범위 | - `src/app/api/users/route.ts`: GET (전체 목록, 검색/필터 쿼리 파라미터 지원)<br>- `src/app/api/users/[id]/route.ts`: GET (개별 프로필), PATCH (본인 프로필 수정)<br>- 검색 파라미터: `?q=검색어&industry=업종&interest=관심분야`<br>- 프로필 사진 업로드 → Cloudflare R2 연동 (`src/lib/storage.ts`)<br>- `src/app/api/upload/route.ts`: 이미지 업로드 공통 API |
| 완료 조건 | 프로필 목록 조회, 검색/필터, 개별 조회, 본인 수정, 이미지 업로드 API 동작 확인 |
| 의존성 | P1-2 |

### P1-7. 프로필 디렉토리 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P1-7 |
| 설명 | 원우 목록 카드 그리드, 검색/필터, 프로필 상세 페이지, 프로필 수정 페이지 |
| 구현 범위 | - `src/app/(main)/directory/page.tsx`: 원우 카드 그리드 (사진, 이름, 회사, 직책, 업종)<br>- 검색바 + 필터 드롭다운 (업종, 관심 분야)<br>- `src/app/(main)/directory/[id]/page.tsx`: 프로필 상세 (전체 정보, 연락처)<br>- `src/app/(main)/profile/page.tsx`: 내 프로필 수정 폼 (사진 업로드 포함)<br>- TanStack Query로 데이터 페칭 및 캐싱 |
| 완료 조건 | 원우 목록 표시, 검색/필터 동작, 상세 페이지 이동, 프로필 수정 및 저장 확인 |
| 의존성 | P1-5, P1-6 |

### P1-8. 커뮤니티 게시판 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P1-8 |
| 설명 | 게시글 CRUD, 댓글/대댓글, 좋아요 반응 API |
| 구현 범위 | - `src/app/api/posts/route.ts`: GET (목록, board_type 필터, 페이지네이션, 정렬), POST (게시글 작성)<br>- `src/app/api/posts/[id]/route.ts`: GET (상세), PATCH (수정), DELETE (삭제)<br>- `src/app/api/comments/route.ts`: POST (댓글/대댓글 작성)<br>- `src/app/api/comments/[id]/route.ts`: PATCH (수정), DELETE (삭제)<br>- `src/app/api/posts/[id]/reactions/route.ts`: POST (좋아요 토글)<br>- board_type: 'notice' / 'free' / 'column'<br>- 공지사항은 관리자만 작성 가능 (role 체크)<br>- 게시글 수정/삭제는 작성자 또는 관리자만 가능 |
| 완료 조건 | 게시글 CRUD, 댓글/대댓글 작성/삭제, 좋아요 토글 API 동작 확인 |
| 의존성 | P1-2 |

### P1-9. 커뮤니티 게시판 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P1-9 |
| 설명 | 게시판 탭(공지/자유/칼럼), 게시글 목록, 상세 페이지(댓글 포함), 글쓰기(Tiptap 에디터) |
| 구현 범위 | - `src/app/(main)/community/page.tsx`: 탭 네비게이션 (공지/자유/칼럼), 게시글 목록 (제목, 작성자, 날짜, 댓글수, 좋아요수)<br>- 정렬 (최신순/인기순), 검색 (제목/내용)<br>- `src/app/(main)/community/[id]/page.tsx`: 게시글 상세 + 댓글 목록 + 대댓글 + 좋아요 버튼<br>- `src/app/(main)/community/write/page.tsx`: 글쓰기 폼 (Tiptap 리치 텍스트 에디터, 이미지/파일 첨부)<br>- `src/components/editor/tiptap-editor.tsx`: Tiptap 에디터 컴포넌트 (볼드, 이탤릭, 링크, 이미지, 코드블록)<br>- 무한 스크롤 또는 페이지네이션 |
| 완료 조건 | 게시판 탭 전환, 글 목록/상세/작성/수정/삭제, 댓글 작성/삭제, 좋아요 토글 UI 동작 확인 |
| 의존성 | P1-5, P1-8 |

### P1-10. 대시보드 (홈)

| 항목 | 내용 |
|------|------|
| ID | P1-10 |
| 설명 | 로그인 후 첫 화면. 공지, 최신 글, 일정, 투표, 갤러리, IT 뉴스를 위젯 형태로 표시 |
| 구현 범위 | - `src/app/(main)/dashboard/page.tsx`: 대시보드 레이아웃<br>- 최신 공지 배너 (상단 고정, 최대 3건)<br>- 최신 게시글 카드 (5건, 제목/작성자/날짜)<br>- 다가오는 일정 위젯 (Phase 3 연동 전까지 빈 상태 표시)<br>- 진행 중 투표 위젯 (Phase 3 연동 전까지 빈 상태 표시)<br>- 최근 갤러리 썸네일 (Phase 2 연동 전까지 빈 상태 표시)<br>- IT 뉴스 하이라이트 (Phase 2 연동 전까지 빈 상태 표시)<br>- 빠른 액션 버튼 (글쓰기, 투표 만들기, 사진 올리기)<br>- 각 위젯은 독립 컴포넌트로 분리하여 이후 Phase에서 데이터 연동 |
| 완료 조건 | 대시보드 렌더링, 공지/최신글 위젯 데이터 표시, 빠른 액션 동작, 반응형 레이아웃 |
| 의존성 | P1-5, P1-8 |

---

## Phase 2 - 콘텐츠 확장

### P2-1. IT 소식 - RSS 수집 백엔드

| 항목 | 내용 |
|------|------|
| ID | P2-1 |
| 설명 | RSS 피드 파싱, DB 저장, Cron Job 스케줄링, 뉴스 목록/댓글 API |
| 구현 범위 | - `src/lib/rss.ts`: rss-parser를 이용한 RSS 피드 파싱 유틸 (GeekNews, TechCrunch Korea 등 소스 설정)<br>- `src/app/api/cron/rss/route.ts`: Cron Job 엔드포인트 — RSS 수집 후 rss_items 테이블에 upsert (중복 방지: url 기준)<br>- `vercel.json`: cron 스케줄 설정 (1시간 간격)<br>- `src/app/api/rss/route.ts`: GET (뉴스 목록, 페이지네이션, 소스 필터)<br>- `src/app/api/rss/share/route.ts`: POST (원우가 직접 링크 공유)<br>- 각 뉴스 항목에 댓글 기능 연동 |
| 완료 조건 | Cron API 호출 시 RSS 수집 동작, 뉴스 목록 API 응답, 수동 링크 공유 API 동작 |
| 의존성 | P1-2 |

### P2-2. IT 소식 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P2-2 |
| 설명 | RSS 뉴스 카드 목록, 소스 필터, 댓글, 원문 링크, 수동 공유 폼 |
| 구현 범위 | - `src/app/(main)/news/page.tsx`: 뉴스 카드 리스트 (제목, 요약, 출처 뱃지, 게시일, 댓글수)<br>- 소스별 필터 탭 (전체/GeekNews/TechCrunch 등)<br>- 뉴스 카드 클릭 시 원문 링크 새 탭 열기<br>- 각 뉴스 항목 하단 인라인 댓글 펼침<br>- 링크 공유 버튼 → 공유 모달 (URL, 제목, 한줄 코멘트 입력)<br>- 대시보드 IT 뉴스 위젯 데이터 연동 |
| 완료 조건 | 뉴스 목록 표시, 소스 필터, 댓글 작성, 수동 공유, 대시보드 위젯 연동 확인 |
| 의존성 | P1-5, P2-1 |

### P2-3. 논문 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P2-3 |
| 설명 | 논문 등록/수정/삭제, 파일 업로드, 별점+피드백 평가 API |
| 구현 범위 | - `src/app/api/thesis/route.ts`: GET (목록, 분야/상태 필터, 페이지네이션), POST (논문 등록)<br>- `src/app/api/thesis/[id]/route.ts`: GET (상세), PATCH (수정), DELETE (삭제)<br>- `src/app/api/thesis/[id]/reviews/route.ts`: GET (리뷰 목록), POST (리뷰 작성 — rating, feedback, is_anonymous)<br>- 논문 파일 업로드 → R2 저장 (PDF, DOCX)<br>- 평균 별점 계산 쿼리 |
| 완료 조건 | 논문 CRUD, 파일 업로드/다운로드, 리뷰 작성/목록 조회, 평균 별점 API 동작 |
| 의존성 | P1-2, P1-6 (storage 유틸 재사용) |

### P2-4. 논문 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P2-4 |
| 설명 | 논문 카드 목록, 상세 페이지(평가 포함), 논문 등록 폼 |
| 구현 범위 | - `src/app/(main)/thesis/page.tsx`: 논문 카드 리스트 (제목, 작성자, 분야, 상태 뱃지, 평균 별점)<br>- 분야/상태 필터 드롭다운<br>- `src/app/(main)/thesis/[id]/page.tsx`: 논문 상세 (초록, 파일 다운로드 링크, 리뷰 목록)<br>- 리뷰 작성 폼 (별점 1~5 스타 컴포넌트, 텍스트 피드백, 익명 체크박스)<br>- `src/app/(main)/thesis/write/page.tsx`: 논문 등록 폼 (제목, 초록, 분야 선택, 상태, 파일 업로드) |
| 완료 조건 | 논문 목록/상세/등록 페이지, 리뷰 작성 및 별점 표시, 파일 다운로드 동작 확인 |
| 의존성 | P1-5, P2-3 |

### P2-5. 갤러리 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P2-5 |
| 설명 | 앨범 생성/삭제, 다중 사진 업로드, 사진 목록 조회, 썸네일 생성 API |
| 구현 범위 | - `src/app/api/albums/route.ts`: GET (앨범 목록), POST (앨범 생성 — title, description)<br>- `src/app/api/albums/[id]/route.ts`: GET (앨범 상세 + 사진 목록), PATCH (수정), DELETE (삭제)<br>- `src/app/api/albums/[id]/photos/route.ts`: POST (다중 사진 업로드 — R2), DELETE (사진 삭제)<br>- 이미지 리사이즈/썸네일 생성 (sharp 활용, 원본 + 썸네일 두 벌 저장)<br>- 커버 이미지 자동 설정 (첫 번째 사진) 또는 수동 지정 |
| 완료 조건 | 앨범 CRUD, 다중 이미지 업로드, 썸네일 생성, 사진 목록 조회 API 동작 |
| 의존성 | P1-2, P1-6 (storage 유틸 재사용) |

### P2-6. 갤러리 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P2-6 |
| 설명 | 앨범 그리드, 사진 그리드, 라이트박스 뷰어, 슬라이드쇼 자동 재생, 업로드 UI |
| 구현 범위 | - `src/app/(main)/gallery/page.tsx`: 앨범 카드 그리드 (커버 이미지, 제목, 사진 수, 날짜)<br>- 앨범 생성 모달 (제목, 설명 입력)<br>- `src/app/(main)/gallery/[id]/page.tsx`: 사진 그리드 (masonry 또는 균등 그리드)<br>- `src/components/gallery/lightbox.tsx`: 라이트박스 뷰어 (좌우 화살표, 닫기)<br>- `src/components/gallery/slideshow.tsx`: 슬라이드쇼 모드 (자동 재생, 전환 효과 fade/slide, 일시정지/재생 컨트롤)<br>- `src/components/gallery/photo-upload.tsx`: 드래그 앤 드롭 다중 이미지 업로드 (미리보기, 진행률 표시)<br>- 개별/일괄 다운로드 버튼<br>- 대시보드 갤러리 위젯 연동 |
| 완료 조건 | 앨범 생성, 사진 업로드, 그리드 표시, 라이트박스, 슬라이드쇼, 다운로드 동작 확인 |
| 의존성 | P1-5, P2-5 |

### P2-7. 북마크/스크랩 시스템

| 항목 | 내용 |
|------|------|
| ID | P2-7 |
| 설명 | 게시글/IT뉴스/논문을 스크랩하고 마이페이지에서 통합 조회하는 백엔드 + 프론트엔드 |
| 구현 범위 | - `src/app/api/bookmarks/route.ts`: GET (내 스크랩 목록, target_type 필터), POST (스크랩 추가), DELETE (스크랩 해제)<br>- 스크랩 토글 버튼 컴포넌트 (`src/components/ui/bookmark-button.tsx`) — 게시글, 뉴스, 논문 상세에 공통 사용<br>- `src/app/(main)/bookmarks/page.tsx`: 스크랩 목록 (탭: 전체/게시글/뉴스/논문), 각 항목 클릭 시 원본으로 이동<br>- target_type: 'post' / 'rss_item' / 'thesis'<br>- 기존 게시글/뉴스/논문 상세 페이지에 북마크 버튼 추가 |
| 완료 조건 | 각 콘텐츠에서 스크랩 토글, 스크랩 목록 조회/필터, 스크랩 해제 동작 확인 |
| 의존성 | P1-8, P2-1, P2-3 |

---

## Phase 3 - 커뮤니케이션 강화

### P3-1. 일정/이벤트 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P3-1 |
| 설명 | 이벤트 생성/수정/삭제, RSVP 응답, 반복 일정, 이벤트 목록 API |
| 구현 범위 | - `src/app/api/events/route.ts`: GET (목록, 날짜 범위 필터, 카테고리 필터), POST (이벤트 생성)<br>- `src/app/api/events/[id]/route.ts`: GET (상세 + RSVP 현황), PATCH (수정), DELETE (삭제)<br>- `src/app/api/events/[id]/rsvp/route.ts`: POST (참석/불참/미정 응답)<br>- 반복 일정: recurrence_rule (weekly, biweekly 등) → 조회 시 가상 인스턴스 생성<br>- 카테고리: class/meetup/mt/dinner/study |
| 완료 조건 | 이벤트 CRUD, RSVP 응답/현황 조회, 날짜 범위 필터, 반복 일정 API 동작 |
| 의존성 | P1-2 |

### P3-2. 일정/이벤트 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P3-2 |
| 설명 | 월간/주간 캘린더, 이벤트 생성 모달, RSVP UI, 참석자 명단 |
| 구현 범위 | - `src/app/(main)/calendar/page.tsx`: react-big-calendar 기반 캘린더 (월간/주간 뷰 전환)<br>- `src/components/calendar/event-modal.tsx`: 이벤트 생성/수정 모달 (제목, 설명, 날짜/시간 피커, 장소, 카테고리, 반복 설정)<br>- 이벤트 클릭 시 상세 팝오버 (설명, 장소, RSVP 버튼, 참석자 명단)<br>- RSVP 버튼 3개 (참석/불참/미정), 참석 현황 아바타 목록<br>- 카테고리별 색상 구분<br>- 대시보드 일정 위젯 연동 |
| 완료 조건 | 캘린더 월간/주간 뷰, 이벤트 생성/수정/삭제, RSVP 응답, 참석자 표시, 대시보드 연동 확인 |
| 의존성 | P1-5, P3-1 |

### P3-3. 투표/설문 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P3-3 |
| 설명 | 투표 생성, 선택지 관리, 투표 참여, 결과 집계, 마감 처리 API |
| 구현 범위 | - `src/app/api/polls/route.ts`: GET (목록, 활성/마감 필터), POST (투표 생성 — title, description, options[], is_multiple, is_anonymous, closes_at)<br>- `src/app/api/polls/[id]/route.ts`: GET (상세 + 결과), PATCH (수정 — 투표 전만), DELETE (삭제)<br>- `src/app/api/polls/[id]/vote/route.ts`: POST (투표 참여 — option_id 또는 option_ids[])<br>- 중복 투표 방지 (user_id 체크)<br>- 마감일 지나면 투표 불가, 결과만 조회<br>- 결과 집계: 선택지별 투표 수, 비율 계산 |
| 완료 조건 | 투표 생성, 참여, 중복 방지, 마감 처리, 결과 집계 API 동작 |
| 의존성 | P1-2 |

### P3-4. 투표/설문 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P3-4 |
| 설명 | 투표 카드 목록, 투표 참여 UI, 실시간 결과 그래프, 투표 생성 폼 |
| 구현 범위 | - `src/app/(main)/polls/page.tsx`: 투표 카드 리스트 (제목, 마감일, 참여자 수, 상태 뱃지 — 진행중/마감)<br>- 탭: 진행중 / 마감됨<br>- `src/app/(main)/polls/[id]/page.tsx`: 투표 상세 — 미투표 시 선택지 라디오/체크박스 표시, 투표 후 막대 그래프 결과 (recharts)<br>- 투표자 명단 (is_anonymous=false일 때만)<br>- `src/app/(main)/polls/create/page.tsx`: 투표 생성 폼 (선택지 동적 추가/삭제, 복수선택 토글, 익명 토글, 마감일시 피커)<br>- 대시보드 투표 위젯 연동 |
| 완료 조건 | 투표 목록, 투표 참여, 결과 그래프, 생성 폼, 대시보드 위젯 연동 확인 |
| 의존성 | P1-5, P3-3 |

### P3-5. 알림 시스템 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P3-5 |
| 설명 | 알림 생성 유틸, 알림 목록 API, 읽음 처리, 알림 설정, 주간 이메일 다이제스트 |
| 구현 범위 | - `src/lib/notifications.ts`: 알림 생성 유틸 함수 — createNotification(userId, type, title, message, link)<br>- 기존 API에 알림 트리거 추가:<br>  - 댓글 작성 시 → 글 작성자에게 알림<br>  - 대댓글 시 → 댓글 작성자에게 알림<br>  - 새 공지 → 전체 알림<br>  - 논문 리뷰 → 논문 작성자에게 알림<br>  - 새 투표 → 전체 알림<br>  - 이벤트 리마인더 → 참석 응답자에게 알림<br>- `src/app/api/notifications/route.ts`: GET (내 알림 목록, 읽지않음 필터), PATCH (읽음 처리, 전체 읽음)<br>- `src/app/api/notifications/settings/route.ts`: GET/PATCH (알림 유형별 on/off 설정)<br>- `src/app/api/cron/digest/route.ts`: 주간 이메일 다이제스트 — Resend로 요약 이메일 발송<br>- `vercel.json`에 digest cron 추가 (매주 월요일 09:00) |
| 완료 조건 | 각 트리거에서 알림 생성, 알림 목록 조회, 읽음 처리, 설정 변경, 다이제스트 이메일 발송 확인 |
| 의존성 | P1-8, P2-1, P2-3, P3-1, P3-3 |

### P3-6. 알림 시스템 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P3-6 |
| 설명 | 헤더 알림 벨 아이콘(뱃지), 드롭다운 알림 목록, 알림 전체 페이지, 알림 설정 |
| 구현 범위 | - `src/components/notifications/notification-bell.tsx`: 헤더 벨 아이콘 + 읽지않은 수 뱃지, 클릭 시 드롭다운<br>- `src/components/notifications/notification-dropdown.tsx`: 최근 알림 5건 드롭다운 (아이콘, 제목, 시간, 읽음 상태), "전체 보기" 링크<br>- `src/app/(main)/notifications/page.tsx`: 알림 전체 목록 (무한 스크롤), 전체 읽음 버튼<br>- `src/app/(main)/profile/notifications/page.tsx`: 알림 설정 — 유형별 토글 스위치<br>- TanStack Query로 알림 목록 주기적 폴링 (30초 간격) |
| 완료 조건 | 벨 아이콘 뱃지, 드롭다운 표시, 클릭 시 읽음 처리, 전체 목록, 설정 페이지 동작 확인 |
| 의존성 | P1-5, P3-5 |

---

## Phase 4 - 부가 기능

### P4-1. 소모임 - 백엔드

| 항목 | 내용 |
|------|------|
| ID | P4-1 |
| 설명 | 소모임 CRUD, 멤버 관리, 전용 게시판, 소모임 일정 연동 API |
| 구현 범위 | - `src/app/api/groups/route.ts`: GET (소모임 목록, 카테고리 필터), POST (소모임 생성)<br>- `src/app/api/groups/[id]/route.ts`: GET (상세 + 멤버 목록), PATCH (수정 — leader만), DELETE (삭제 — leader만)<br>- `src/app/api/groups/[id]/members/route.ts`: POST (가입), DELETE (탈퇴)<br>- `src/app/api/groups/[id]/posts/route.ts`: GET (소모임 게시글 목록), POST (게시글 작성 — 멤버만)<br>- 소모임 일정: events 테이블에 group_id 컬럼 추가 (nullable), 소모임 일정은 메인 캘린더에도 표시<br>- 멤버 수 제한 체크 (max_members) |
| 완료 조건 | 소모임 CRUD, 가입/탈퇴, 게시글 CRUD, 멤버 권한 체크, 일정 연동 API 동작 |
| 의존성 | P1-2, P3-1 |

### P4-2. 소모임 - 프론트엔드

| 항목 | 내용 |
|------|------|
| ID | P4-2 |
| 설명 | 소모임 카드 목록, 상세 페이지(멤버, 게시판, 일정), 소모임 생성 |
| 구현 범위 | - `src/app/(main)/groups/page.tsx`: 소모임 카드 그리드 (대표 이미지, 소모임명, 카테고리 뱃지, 멤버 수, 활동량)<br>- 카테고리 필터 (전체/AI/창업/마케팅/독서 등)<br>- `src/app/(main)/groups/[id]/page.tsx`: 소모임 상세 — 탭 구조 (소개/게시판/일정/멤버)<br>  - 소개 탭: 설명, 가입/탈퇴 버튼<br>  - 게시판 탭: 소모임 전용 게시글 목록 + 글쓰기<br>  - 일정 탭: 소모임 전용 미니 캘린더<br>  - 멤버 탭: 멤버 아바타 목록, 소모임장 표시<br>- `src/app/(main)/groups/create/page.tsx`: 소모임 생성 폼 |
| 완료 조건 | 소모임 목록/상세/생성, 가입/탈퇴, 게시판, 일정, 멤버 목록 UI 동작 확인 |
| 의존성 | P1-5, P4-1 |

### P4-3. 디지털 프로필 카드 + QR 코드

| 항목 | 내용 |
|------|------|
| ID | P4-3 |
| 설명 | 프로필 정보를 디지털 명함 형태로 렌더링, QR 코드 포함, 이미지로 저장 |
| 구현 범위 | - `src/components/profile/profile-card.tsx`: 디지털 명함 UI (이름, 회사, 직책, 연락처, 이메일, QR 코드 — 스타일링된 카드)<br>- qrcode.react로 QR 코드 생성 (프로필 페이지 URL 인코딩)<br>- html-to-image 또는 html2canvas로 카드 → PNG 변환 다운로드<br>- `src/app/(main)/profile/card/page.tsx`: 프로필 카드 미리보기 + 다운로드 버튼<br>- 프로필 상세 페이지에 QR 코드 표시 영역 추가 |
| 완료 조건 | 프로필 카드 렌더링, QR 코드 생성, PNG 다운로드, QR 스캔 시 프로필 페이지 이동 확인 |
| 의존성 | P1-7 |

### P4-4. PWA 설정

| 항목 | 내용 |
|------|------|
| ID | P4-4 |
| 설명 | 모바일 홈 화면 추가, 앱 아이콘, 스플래시 스크린, 기본 오프라인 캐싱 |
| 구현 범위 | - @serwist/next 설치 및 설정<br>- `public/manifest.json`: name, short_name, icons (192x192, 512x512), theme_color, background_color, display: standalone, start_url<br>- `public/icons/`: 앱 아이콘 여러 사이즈 생성<br>- Service Worker: 정적 자산 캐싱 (JS, CSS, 폰트), 네비게이션 셸 캐싱<br>- 오프라인 폴백 페이지 (`/offline`): "인터넷 연결을 확인해주세요" 안내<br>- `next.config.ts`에 PWA 플러그인 적용<br>- iOS/Android 메타 태그 (apple-touch-icon, apple-mobile-web-app-capable) |
| 완료 조건 | Lighthouse PWA 체크 통과, 모바일 "홈 화면에 추가" 동작, 오프라인 시 폴백 페이지 표시 |
| 의존성 | P1-5 |

### P4-5. 최종 통합 테스트 및 Vercel 배포

| 항목 | 내용 |
|------|------|
| ID | P4-5 |
| 설명 | Vercel 프로젝트 설정, 환경 변수 등록, 배포, 전체 기능 E2E 점검 |
| 구현 범위 | - Vercel 프로젝트 연결 (GitHub 리포지토리)<br>- 환경 변수 설정 (Neon DB URL, Auth.js Secret, Google/Kakao OAuth, R2 키, Resend API Key)<br>- 커스텀 도메인 연결 (선택)<br>- `vercel.json` Cron Jobs 최종 확인 (RSS 수집, 다이제스트)<br>- 전체 기능 플로우 점검:<br>  - 초대 → 가입 → 로그인<br>  - 프로필 등록/수정/검색<br>  - 게시글 작성/댓글/좋아요<br>  - RSS 뉴스 수집/표시<br>  - 논문 등록/평가<br>  - 갤러리 업로드/슬라이드쇼<br>  - 캘린더 이벤트/RSVP<br>  - 투표 생성/참여/결과<br>  - 알림 수신/읽음<br>  - 소모임 생성/가입/게시판<br>  - 프로필 카드/QR<br>  - PWA 홈화면 추가<br>  - 모바일 반응형 확인 |
| 완료 조건 | Vercel 프로덕션 배포 완료, 전체 기능 정상 동작, 모바일/데스크톱 확인 |
| 의존성 | 전체 태스크 완료 |

---

## 태스크 요약 테이블

| Phase | ID | 제목 | 의존성 |
|-------|-----|------|--------|
| **1** | P1-1 | Next.js 15 프로젝트 초기 세팅 | - |
| **1** | P1-2 | Drizzle ORM + Neon DB 스키마 정의 | P1-1 |
| **1** | P1-3 | Auth.js v5 인증 시스템 | P1-2 |
| **1** | P1-4 | 초대 기반 회원가입 | P1-3 |
| **1** | P1-5 | 공통 레이아웃 및 네비게이션 | P1-3 |
| **1** | P1-6 | 프로필 디렉토리 - 백엔드 | P1-2 |
| **1** | P1-7 | 프로필 디렉토리 - 프론트엔드 | P1-5, P1-6 |
| **1** | P1-8 | 커뮤니티 게시판 - 백엔드 | P1-2 |
| **1** | P1-9 | 커뮤니티 게시판 - 프론트엔드 | P1-5, P1-8 |
| **1** | P1-10 | 대시보드 (홈) | P1-5, P1-8 |
| **2** | P2-1 | IT 소식 - RSS 수집 백엔드 | P1-2 |
| **2** | P2-2 | IT 소식 - 프론트엔드 | P1-5, P2-1 |
| **2** | P2-3 | 논문 - 백엔드 | P1-2, P1-6 |
| **2** | P2-4 | 논문 - 프론트엔드 | P1-5, P2-3 |
| **2** | P2-5 | 갤러리 - 백엔드 | P1-2, P1-6 |
| **2** | P2-6 | 갤러리 - 프론트엔드 | P1-5, P2-5 |
| **2** | P2-7 | 북마크/스크랩 시스템 | P1-8, P2-1, P2-3 |
| **3** | P3-1 | 일정/이벤트 - 백엔드 | P1-2 |
| **3** | P3-2 | 일정/이벤트 - 프론트엔드 | P1-5, P3-1 |
| **3** | P3-3 | 투표/설문 - 백엔드 | P1-2 |
| **3** | P3-4 | 투표/설문 - 프론트엔드 | P1-5, P3-3 |
| **3** | P3-5 | 알림 시스템 - 백엔드 | P1-8, P2-1, P2-3, P3-1, P3-3 |
| **3** | P3-6 | 알림 시스템 - 프론트엔드 | P1-5, P3-5 |
| **4** | P4-1 | 소모임 - 백엔드 | P1-2, P3-1 |
| **4** | P4-2 | 소모임 - 프론트엔드 | P1-5, P4-1 |
| **4** | P4-3 | 디지털 프로필 카드 + QR | P1-7 |
| **4** | P4-4 | PWA 설정 | P1-5 |
| **4** | P4-5 | 최종 통합 테스트 및 배포 | 전체 |

**총 28개 태스크** (Phase 1: 10개 / Phase 2: 7개 / Phase 3: 6개 / Phase 4: 5개)

---

## 병렬 실행 가능 태스크

의존성 그래프 기준으로 동시에 진행 가능한 태스크 그룹:

### Phase 1 병렬 그룹
```
P1-1 → P1-2 ─┬→ P1-3 → P1-4
              │        → P1-5 ─┬→ P1-7 (P1-6 완료 후)
              │                ├→ P1-9 (P1-8 완료 후)
              │                └→ P1-10 (P1-8 완료 후)
              ├→ P1-6 ─────────┘
              └→ P1-8 ─────────┘
```
> P1-6과 P1-8은 P1-2 완료 후 **동시 진행 가능**

### Phase 2 병렬 그룹
```
P2-1, P2-3, P2-5 → 모두 P1-2에만 의존 → 동시 진행 가능
P2-2, P2-4, P2-6 → 각각의 백엔드 완료 후 동시 진행 가능
P2-7 → P2-1, P2-3 완료 후
```

### Phase 3 병렬 그룹
```
P3-1, P3-3 → P1-2에만 의존 → 동시 진행 가능
P3-2, P3-4 → 각각의 백엔드 완료 후 동시 진행 가능
P3-5 → Phase 2 + P3-1, P3-3 완료 후
P3-6 → P3-5 완료 후
```

### Phase 4 병렬 그룹
```
P4-1, P4-3, P4-4 → 동시 진행 가능
P4-2 → P4-1 완료 후
P4-5 → 전체 완료 후
```
