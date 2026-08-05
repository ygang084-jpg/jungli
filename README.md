# GitHub-Vercel 배포 대시보드

여러 GitHub 저장소와 Vercel 배포 상태를 한 화면에서 확인하는 웹앱. 상세 요구사항은 [`prd-webapp.md`](./prd-webapp.md) 참고.

## 기술 스택

- **프론트엔드**: React 19 + Vite + TypeScript, Tailwind CSS v4, React Router, React Query, Zustand, axios, react-hot-toast
- **백엔드**: Node.js + Express + TypeScript, Prisma(+`@prisma/adapter-pg`) + PostgreSQL(Supabase)
- **인증**: GitHub OAuth → JWT(HttpOnly 쿠키)
- **외부 API**: GitHub REST API, Vercel REST API

## 프로젝트 구조

```
.
├─ src/                       # 프론트엔드
│  ├─ pages/                  # Home, Login, Dashboard, RepoDetail, Settings
│  ├─ components/             # 공용(Layout, ProtectedRoute, ErrorBoundary) + dashboard/, repoDetail/
│  ├─ hooks/                  # React Query 커스텀 훅
│  ├─ api/                    # 백엔드 API 호출 함수 (axios)
│  ├─ store/                  # Zustand 클라이언트 상태
│  ├─ types/                  # 프론트/백엔드 공용 타입 정의
│  └─ utils/                  # 날짜 포맷 등
└─ server/                    # 백엔드
   ├─ prisma/schema.prisma    # User, VercelToken 모델
   └─ src/
      ├─ routes/              # /api/auth, /api/repos, /api/vercel, /api/dashboard
      ├─ services/            # GitHub/Vercel API 호출, DB 조회, 캐시
      ├─ middleware/          # requireAuth, requestLogger
      ├─ utils/               # 재시도, 암호화, JWT, 에러 처리
      └─ config/              # 환경변수, 쿠키 옵션
```

프론트엔드는 **3000번**, 백엔드는 **4000번** 포트로 동작한다. 로컬 개발 중에는 `vite.config.ts`의 proxy 설정으로 `/api/*` 요청이 자동으로 백엔드로 전달되므로 CORS를 신경 쓰지 않아도 된다.

## 실행 방법

### 1. 환경변수

```bash
cp .env.example .env                    # 프론트엔드
cp server/.env.example server/.env      # 백엔드
```

| 변수 | 위치 | 설명 |
|---|---|---|
| `VITE_API_BASE_URL` | 루트 `.env` | 비워두면 로컬 개발 시 Vite proxy 사용 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | `server/.env` | [GitHub OAuth App](https://github.com/settings/developers) 발급값. Callback URL: `http://localhost:4000/api/auth/github/callback` |
| `DATABASE_URL` | `server/.env` | Supabase 프로젝트(`wagbfziuoxbtmvcnibsf`)의 Postgres 연결 문자열. Settings → Database에서 비밀번호 확인 |
| `ENCRYPTION_KEY` | `server/.env` | Vercel 토큰 암호화용 32바이트 base64 키. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`로 생성 |
| `JWT_SECRET` | `server/.env` | 로그인 세션 JWT 서명 키 |

Vercel Personal Access Token은 `.env`에 두지 않는다 — 로그인한 사용자가 `/settings`에서 직접 입력하면 서버가 검증 후 암호화해 DB에 저장한다. 시크릿은 전부 `server/.env`에만 두고, 브라우저에 노출되는 루트 `.env`에는 넣지 않는다.

### 2. 설치

```bash
npm install
npm install --prefix server
npx prisma generate --schema server/prisma/schema.prisma
```

### 3. 개발 서버

```bash
npm run dev            # 프론트(3000) + 백엔드(4000) 동시 실행
npm run dev:client     # 프론트엔드만
npm run dev:server     # 백엔드만
```

### 4. 빌드

```bash
npm run build                    # 프론트엔드
npm run build --prefix server    # 백엔드
```

## 기능

### 인증 (GitHub OAuth)

1. `/login` → `GET /api/auth/github` → GitHub 인가 화면(`scope=read:user repo`)
2. `GET /api/auth/github/callback`이 code를 access token으로 교환하고 GitHub 사용자 정보를 조회
3. GitHub access token은 서버 메모리에만 보관(`services/githubTokenStore.ts`) — 클라이언트로 내려가지 않음
4. 사용자 식별 정보만 담은 JWT를 HttpOnly 쿠키로 발급 → `/dashboard`로 리다이렉트
5. `requireAuth` 미들웨어가 쿠키의 JWT를 검증하고, 프론트의 `ProtectedRoute`는 `GET /api/auth/me`가 비어있으면 `/login`으로 리다이렉트
6. `POST /api/auth/logout`이 쿠키를 지우고 서버에 보관된 GitHub 토큰도 폐기

### GitHub 저장소 목록 — `GET /api/repos`

로그인한 사용자의 GitHub 저장소를 `GET /user/repos`로 페이지당 100개씩 전부 수집해 필요한 필드만 반환한다. 5분간 캐싱하며(아래 안정성 항목 참고), 현재 프론트엔드에서 직접 쓰는 화면은 없고 독립된 API로 존재한다.

### Vercel 연동 — `/settings`

1. `POST /api/vercel/connect` — 입력받은 토큰으로 `GET /v2/user`를 호출해 유효성 확인
2. 유효하면 `User` 테이블에 upsert하고, 토큰을 AES-256-GCM으로 암호화(`utils/crypto.ts`)해 `VercelToken` 테이블에 저장 (평문 토큰은 DB에도 클라이언트에도 남지 않음)
3. `GET /api/vercel/projects` — 저장된 토큰을 복호화해 Vercel 프로젝트 목록(이름/production URL/연결된 GitHub 저장소)을 반환
4. 연동 성공/실패는 토스트로 안내, 미연동 사용자에게는 대시보드에 "Vercel 연동하기" 배너 표시

**DB**: `server/prisma/schema.prisma`에 `User`(githubId/githubLogin/avatarUrl) ↔ `VercelToken`(encryptedToken/vercelUserId) 1:1 관계로 정의. Supabase 프로젝트 `wagbfziuoxbtmvcnibsf`에 `users`/`vercel_tokens` 테이블이 이미 생성되어 있다(RLS 활성화, 정책 없음 — Prisma는 anon 키가 아니라 직접 Postgres 연결을 쓰므로 무관). Prisma 7부터 연결 문자열은 `server/prisma.config.ts`(CLI용)와 `server/src/lib/prisma.ts`의 `@prisma/adapter-pg` 어댑터(런타임용)에서 각각 읽는다.

### 저장소 × 배포 매칭 — `GET /api/dashboard`

1. GitHub 저장소 목록과 Vercel 프로젝트 목록을 병렬 조회
2. Vercel `project.link.org`/`link.repo`를 `owner/repo` 형식으로 정규화(`getLinkedRepoFullName`)해 GitHub `full_name`과 대소문자 무시 비교로 매칭
3. 매칭된 저장소만 `GET /v6/deployments?limit=1`로 최근 배포 상태를 붙임
4. 응답: `{ matched: [{repo, vercelProject, latestDeployment}], unmatchedRepos, unmatchedVercelProjects, stale, cachedAt }`
5. 5분간 캐싱하고, Vercel 재연동 시 그 사용자의 캐시를 즉시 무효화

### 대시보드 UI — `/dashboard`

- **뷰 토글**: 카드형/테이블형 전환, 반응형 그리드(`sm:2 lg:3 xl:4` 컬럼)
- **표시 정보**: 저장소명 / Vercel 프로젝트명 / 배포 상태 뱃지(Ready=초록, Building=노랑, Error=빨강, Canceled=회색) / 배포 URL / 마지막 배포 시각
- **상태 필터**: 전체/Ready/Error/Building (각 개수 표시)
- **매칭 안 된 저장소**: 하단 섹션에 별도 표시, "Vercel 프로젝트 수동 연결" 버튼(아직 백엔드 미구현이라 토스트만 표시)
- 카드/테이블 행/매칭 안 된 타일 전체가 클릭 영역이며 클릭하면 저장소 상세로 이동 (내부 GitHub·배포 URL 링크는 `stopPropagation`으로 분리)
- 로딩/빈 상태/에러/Vercel 미연동/요청 제한/최신 정보 아님 각각에 맞는 UI를 표시 (아래 안정성 항목 참고)

### 저장소 상세 화면 — `/repo/:id`

- **백엔드** `GET /api/repos/:id/details`: 저장소 기본정보 + 최근 커밋 5개(`GET /repos/{full_name}/commits`), 연결된 Vercel 프로젝트의 배포 히스토리 10건(시각/상태/URL/커밋 메시지)
- **프론트엔드**: 좌측 저장소 정보 + 최근 커밋 목록, 우측 배포 히스토리 타임라인(상태별 색상 점), 상단에 대시보드로 돌아가는 링크

## 안정성 & 보안

- **재시도**: GitHub/Vercel로 나가는 모든 요청은 `utils/fetchWithRetry.ts`를 거친다 — 네트워크 오류나 429/5xx 응답이면 지수 백오프(기본 500ms, 1s, 2s)로 최대 3회까지 재시도한다.
- **장애 시 캐시 폴백**: `/api/repos`, `/api/vercel/projects`, `/api/dashboard`는 각각 사용자별로 5분간 캐싱된다(`utils/staleCache.ts`, `services/caches.ts`). 재시도까지 실패하면 만료된 캐시라도 있으면 `stale: true`와 함께 내려주고, 프론트는 "최신 정보가 아닙니다" 배너를 보여준다. 캐시가 전혀 없으면 에러로 응답한다.
- **요청 제한(rate limit) 안내**: GitHub/Vercel이 429를 반환하면(재시도 후에도) `RateLimitError`로 구분해 `429` + 안내 메시지로 응답한다. 프론트는 axios 인터셉터(`api/client.ts`)에서 429를 감지해 공통 토스트를 띄우고, 대시보드는 별도의 안내 화면도 보여준다.
- **토큰 보안**: GitHub access token은 서버 메모리에만(클라이언트/DB 미노출), Vercel PAT은 AES-256-GCM으로 암호화해 DB에 저장(`utils/crypto.ts`) — 두 토큰 모두 응답 바디에 담기지 않는다는 것을 코드 전체에서 확인함.
- **요청 로깅**: `middleware/requestLogger.ts`가 모든 요청에 `X-Request-Id`를 부여하고 메서드/경로/상태코드/응답시간을 로그로 남긴다. `app.ts`의 전역 에러 핸들러는 이 요청 ID와 함께 에러를 로그에 남기고, 항상 JSON으로 응답한다(rate limit=429, 외부 API 실패=502, 그 외=500).
- **프론트 에러 바운더리**: `components/ErrorBoundary.tsx`가 렌더링 중 예외를 잡아 화면 전체가 하얗게 죽는 대신 새로고침 안내를 보여준다 (`App.tsx` 최상단에 적용).

## 알려진 한계

- **자격증명이 자리표시자**: GitHub OAuth App(`GITHUB_CLIENT_ID/SECRET`)과 Supabase DB 비밀번호(`DATABASE_URL`)가 아직 채워지지 않았다. 실제 값을 넣기 전까지는 로그인부터 끝까지 실제 데이터로 실행해볼 수 없다.
- **브라우저 시각 확인 불가**: 이 작업 환경에는 브라우저를 열어 스크린샷을 찍을 도구가 없어, 프론트엔드는 `npm run build` 통과와 코드 리뷰로만 검증했다. 실제 렌더링은 자격증명을 채운 뒤 직접 확인 필요.
- **Vercel API 필드 매핑 미검증**: `targets.production.domain`, `link.repo`/`link.org`, `meta.githubCommitMessage` 등은 문서 기준으로 매핑했고 실제 토큰으로는 검증하지 못했다.
- **미구현 기능**: "Vercel 프로젝트 수동 연결" 버튼(UI만 있고 백엔드 없음), GitHub access token의 DB 영속화(현재는 서버 재시작 시 사라지는 메모리 저장).

## 다음 단계 후보

- Vercel 프로젝트 수동 연결 API + UI 완성
- GitHub access token을 암호화해 DB에 영속화 (서버 재시작에도 로그아웃되지 않도록)
- 실제 GitHub OAuth App / Supabase 자격증명을 채워 전체 플로우 e2e 확인
