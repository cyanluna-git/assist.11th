# ASSIST 11기 커뮤니티 - Style Guide

> assist.ai.mba 디자인 시스템 기반. ShadCN UI + Tailwind CSS v4 환경에 맞게 변환.

---

## 1. 컬러 팔레트

### Brand Colors
| Token | Hex | 용도 |
|-------|-----|------|
| `--brand` | `#0f4d81` | 기본 브랜드 블루 (버튼, 링크, 활성 상태) |
| `--brand-soft` | `#e6f0f8` | 브랜드 라이트 배경 |
| `--brand-dark` | `#0d4472` | 버튼 border, hover 상태 |
| `--accent` | `#ad7b2f` | 골드/브라운 액센트 (강조, 뱃지) |

### Background Colors
| Token | Hex | 용도 |
|-------|-----|------|
| `--bg-canvas` | `#f3f4f6` | 메인 배경 |
| `--bg-gradient-a` | `#f7f8fa` | 그라데이션 시작 |
| `--bg-gradient-b` | `#eceff3` | 그라데이션 끝 |
| `--bg-surface` | `#ffffff` | 카드/컨테이너 표면 |
| `--bg-soft` | `#f7f8fb` | 소프트 배경 |

### Text Colors
| Token | Hex | 용도 |
|-------|-----|------|
| `--text-strong` | `#16181d` | 제목, 고대비 텍스트 |
| `--text-main` | `#2b2f36` | 본문 텍스트 |
| `--text-muted` | `#677180` | 보조 텍스트 |
| `--text-subtle` | `#8b94a3` | 3차 텍스트 (메타데이터) |

### Border Colors
| Token | Hex | 용도 |
|-------|-----|------|
| `--line-subtle` | `#e1e5ec` | 라이트 보더 |
| `--line-strong` | `#cdd4df` | 다크 보더 |

### Semantic Colors
| Token | Hex | 용도 |
|-------|-----|------|
| `--success` | `#1c8b57` | 성공 (완료, 참석) |
| `--warning` | `#b3731f` | 경고 (마감 임박, 핀) |
| `--error` | `#b14949` | 에러 (삭제, 불참) |

### Status Badge Colors
```
Success: border rgba(23,119,77,0.22) / bg rgba(23,119,77,0.08) / text #126244
Error:   border rgba(177,49,35,0.22) / bg rgba(177,49,35,0.08) / text #9c2b21
Info:    border rgba(13,94,168,0.24) / bg rgba(13,94,168,0.08) / text #0f5494
Warning: bg #fff7ec / text #8b6500
```

---

## 2. 타이포그래피

### 폰트 패밀리
```
UI 폰트:      "IBM Plex Sans", "Pretendard", "Noto Sans KR", sans-serif
디스플레이 폰트: "Fraunces", serif
```

### Next.js 폰트 로딩 (구현 가이드)
```tsx
import { IBM_Plex_Sans } from 'next/font/google'
import { Fraunces } from 'next/font/google'
import localFont from 'next/font/local'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-display',
})

// Pretendard (한글) - 로컬 폰트 또는 CDN
```

### 폰트 사이즈 스케일
| 레벨 | 사이즈 | Weight | 용도 |
|------|--------|--------|------|
| Page Title | clamp(2rem, 2.4vw, 2.65rem) | 600 | 페이지 제목 |
| Section Title | 17-18px | 600 | 섹션 제목 |
| Body | 14-15px | 400 | 본문 |
| Small | 13px | 400 | 보조 텍스트 |
| Caption | 11-12px | 600 | 레이블, 메타데이터 |
| Kicker | 12px uppercase | 600 | 섹션 레이블 |

---

## 3. 레이아웃

### Border Radius
```
--radius-sm: 8px   (버튼, 인풋, 작은 요소)
--radius-md: 12px  (카드, 모달)
--radius-lg: 18px  (큰 컨테이너, 히어로 섹션)
```

### Shadows
```
--shadow-soft: 0 10px 30px rgba(15, 24, 40, 0.05)   (기본 그림자)
--shadow-card: 0 14px 40px rgba(13, 26, 44, 0.08)    (카드 그림자)
```

### Sidebar
```
데스크톱: 272px
태블릿 (<=1024px): 84px (아이콘 only)
모바일 (<=768px): 하단 탭 네비게이션
```

### Content Padding
```
데스크톱: 34px 40px 48px
태블릿:  28px 24px 40px
모바일:  18px 16px 28px
```

### 반응형 Breakpoints
```
xl:  1100px
lg:  1024px (사이드바 축소)
md:  768px  (모바일 전환)
sm:  600px  (소형 모바일)
```

---

## 4. 컴포넌트 스타일 패턴

### 버튼
```
Primary:   bg var(--brand) / color #fff / border 1px solid #0d4472 / radius var(--radius-sm)
Secondary: bg var(--bg-surface) / color var(--text-main) / border 1px solid var(--line-strong) / radius var(--radius-sm)
```

### 카드
```
bg var(--bg-surface) / border 1px solid var(--line-subtle) / radius var(--radius-lg) / shadow var(--shadow-soft)
```

### 입력 필드
```
border 1px solid var(--line-strong) / radius var(--radius-sm) / bg var(--bg-surface) / color var(--text-main) / padding 11px 12px
```

### Status Badge
```
padding 4px 10px / radius 999px / font-size 11px / font-weight 600
(각 상태별 색상은 Semantic Colors 참조)
```

---

## 5. ShadCN UI + Tailwind CSS v4 매핑

### globals.css CSS 변수 (ShadCN 포맷)
```css
@layer base {
  :root {
    /* Background */
    --background: 210 20% 96%;          /* #f3f4f6 */
    --foreground: 220 12% 10%;          /* #16181d */
    --card: 0 0% 100%;                  /* #ffffff */
    --card-foreground: 218 11% 19%;     /* #2b2f36 */
    --popover: 0 0% 100%;
    --popover-foreground: 218 11% 19%;

    /* Brand / Primary */
    --primary: 207 78% 28%;             /* #0f4d81 */
    --primary-foreground: 0 0% 100%;
    --primary-soft: 207 58% 94%;        /* #e6f0f8 */

    /* Accent (Gold) */
    --accent: 35 58% 43%;               /* #ad7b2f */
    --accent-foreground: 0 0% 100%;

    /* Secondary */
    --secondary: 216 14% 97%;           /* #f7f8fb */
    --secondary-foreground: 218 11% 19%;

    /* Muted */
    --muted: 216 14% 97%;               /* #f7f8fb */
    --muted-foreground: 213 10% 45%;    /* #677180 */

    /* Border */
    --border: 216 16% 90%;              /* #e1e5ec */
    --input: 214 14% 84%;               /* #cdd4df */
    --ring: 207 78% 28%;                /* #0f4d81 */

    /* Semantic */
    --destructive: 0 38% 50%;           /* #b14949 */
    --destructive-foreground: 0 0% 100%;
    --success: 152 64% 33%;             /* #1c8b57 */
    --warning: 30 66% 41%;              /* #b3731f */

    /* Radius */
    --radius: 0.75rem;                  /* 12px (ShadCN base) */

    /* Sidebar */
    --sidebar-width: 272px;
    --sidebar-width-collapsed: 84px;

    /* Shadows */
    --shadow-soft: 0 10px 30px rgba(15, 24, 40, 0.05);
    --shadow-card: 0 14px 40px rgba(13, 26, 44, 0.08);
  }
}
```

### Tailwind CSS v4 확장 (tailwind.config.ts)
```ts
// Tailwind CSS v4는 @theme 디렉티브 사용
// src/app/globals.css 에 아래 추가:

@theme {
  --color-brand: #0f4d81;
  --color-brand-soft: #e6f0f8;
  --color-brand-dark: #0d4472;
  --color-accent: #ad7b2f;
  --color-canvas: #f3f4f6;
  --color-surface: #ffffff;
  --color-text-strong: #16181d;
  --color-text-main: #2b2f36;
  --color-text-muted: #677180;
  --color-text-subtle: #8b94a3;
  --color-line-subtle: #e1e5ec;
  --color-line-strong: #cdd4df;
  --color-success: #1c8b57;
  --color-warning: #b3731f;
  --color-error: #b14949;

  --font-ui: "IBM Plex Sans", "Pretendard", "Noto Sans KR", sans-serif;
  --font-display: "Fraunces", serif;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;

  --shadow-soft: 0 10px 30px rgba(15, 24, 40, 0.05);
  --shadow-card: 0 14px 40px rgba(13, 26, 44, 0.08);
}
```

---

## 6. 디자인 원칙

- **Light theme only** (다크 모드 미구현)
- **기본 배경은 밝은 회색** (#f3f4f6), 카드는 흰색 (#ffffff)
- **브랜드 블루 (#0f4d81)** 를 주요 인터랙션 색상으로 사용
- **골드 액센트 (#ad7b2f)** 를 강조/하이라이트에 사용
- **부드러운 그림자** 와 **넉넉한 border-radius** 로 모던하고 깔끔한 느낌
- **서체**: 영문 IBM Plex Sans, 한글 Pretendard/Noto Sans KR, 디스플레이 Fraunces
- **모바일 우선**: 하단 탭 네비게이션, 데스크톱에서 사이드바로 전환
