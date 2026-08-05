# PRD: GitHub-Vercel 배포 대시보드

## 1. 배경 및 목적

### 배경

여러 개의 GitHub 저장소를 운영하다 보면, 각 저장소가 Vercel의 어떤 프로젝트/배포 주소와 연결되어 있는지, 현재 배포 상태는 어떤지 한눈에 파악하기 어렵다. GitHub과 Vercel 대시보드를 각각 오가며 확인해야 하는 번거로움이 있다.

### 목적

GitHub 저장소 목록과 Vercel 배포 정보를 하나의 화면에서 통합적으로 확인하고 관리할 수 있는 웹앱을 만든다.

### 목표

- 저장소별 배포 상태를 한 화면에서 즉시 확인
- 배포 URL 접근 시간 단축
- 배포 실패 등 이상 상황을 빠르게 인지

## 2. 타겟 사용자 및 사용 시나리오

### 타겟 사용자

- 여러 개인/사이드 프로젝트를 GitHub + Vercel로 운영하는 개발자
- 팀 단위로 다수의 저장소를 관리하는 소규모 개발팀

### 사용 시나리오

1. 사용자가 앱에 로그인(GitHub OAuth)한다.
2. 자신의 GitHub 저장소 목록이 표시된다.
3. Vercel 계정을 연동하면, 각 저장소에 매칭되는 Vercel 프로젝트와 배포 URL이 자동으로 표시된다.
4. 사용자는 배포 상태(성공/실패/빌드중)를 확인하고, 필요 시 배포 URL로 바로 이동한다.
5. 배포 실패 시 상세 로그나 원인을 확인한다.

## 3. 핵심 기능 명세 (User Story)

### 3.1 GitHub 연동

As a 사용자, I want to GitHub 계정으로 로그인하고 내 저장소 목록을 불러오고 싶다, because 매번 GitHub에 직접 들어가지 않고도 프로젝트 현황을 보고 싶기 때문이다.

세부 요구사항:
- GitHub OAuth 로그인 지원
- 사용자가 소유한 저장소(Public/Private) 목록 조회
- 저장소별 이름, 설명, 기본 브랜치, 마지막 커밋 시각, 언어 표시
- 저장소 검색 및 정렬(이름순/최근 업데이트순)

### 3.2 Vercel 연동

As a 사용자, I want to Vercel 계정을 연동해서 각 저장소의 배포 상태를 보고 싶다, because 배포가 정상적으로 되었는지 바로 확인하고 싶기 때문이다.

세부 요구사항:
- Vercel API 토큰 입력 또는 OAuth 연동
- GitHub 저장소와 Vercel 프로젝트 자동 매칭 (저장소 이름 기준, 매칭 실패 시 수동 연결 UI 제공)
- 최신 배포 상태(Building/Ready/Error/Canceled) 표시
- 최신 배포 URL(Production/Preview) 표시
- 배포 히스토리(최근 N건) 조회

### 3.3 통합 대시보드

As a 사용자, I want to 모든 저장소와 배포 상태를 하나의 화면에서 보고 싶다, because 여러 프로젝트를 오가며 확인하는 시간을 줄이고 싶기 때문이다.

세부 요구사항:
- 카드형 또는 테이블형 뷰 지원
- 각 항목: 저장소명 / 연결된 Vercel 프로젝트 / 배포 상태(뱃지) / 배포 URL(클릭 시 새 탭) / 마지막 배포 시각
- 상태별 필터(전체/성공/실패/빌드중)
- 매칭 안 된 저장소 별도 표시 및 수동 연결 유도

### 3.4 알림 (MVP 이후 확장)

- 배포 실패 시 이메일/슬랙 알림
- 새 배포 발생 시 대시보드 실시간(또는 폴링) 업데이트

## 4. 화면별 요구사항

### 4.1 로그인 화면
- GitHub OAuth 로그인 버튼
- 서비스 소개 문구

### 4.2 초기 설정 화면
- Vercel 토큰 입력 또는 OAuth 연동 버튼
- 연동 완료 후 대시보드로 이동

### 4.3 대시보드 (메인 화면)
- 상단: 검색창, 상태 필터, 정렬 옵션
- 본문: 저장소 카드/테이블 목록
- 각 카드: 저장소명, 설명, 배포 상태 뱃지, 배포 URL 링크, 마지막 업데이트 시각
- 매칭되지 않은 저장소 섹션(수동 연결 버튼 포함)

### 4.4 저장소 상세 화면
- 저장소 기본 정보(브랜치, 커밋 히스토리 일부)
- Vercel 배포 히스토리 리스트(배포 시각, 상태, URL, 커밋 메시지)

### 4.5 설정 화면
- GitHub/Vercel 토큰 재발급 또는 연결 해제
- 계정 로그아웃

## 5. 기술 스택 (조정됨)

- **프론트엔드**: React (Vite) + TypeScript + Tailwind CSS
- **라우팅**: React Router
- **백엔드**: Node.js + Express (또는 Vercel Serverless Functions)
- **DB**: PostgreSQL (Supabase 권장, Prisma ORM 사용)
- **인증**: GitHub OAuth (Passport.js 또는 직접 구현)
- **상태관리**: React Query (서버 상태) + Zustand 또는 Context (클라이언트 상태)
- **외부 API 연동**:
  - GitHub REST API (`/user/repos`, `/repos/{owner}/{repo}` 등)
  - Vercel REST API (`/v9/projects`, `/v6/deployments` 등)
- **배포**: Vercel (앱 자체도 Vercel에 배포하는 것을 권장 — dogfooding)

## 6. API 연동 방식 및 필요 권한(Scope)

### GitHub
- OAuth Scope: `repo` (Private 저장소 포함 시), `read:user`
- 주요 API:
  - `GET /user/repos` - 저장소 목록
  - `GET /repos/{owner}/{repo}` - 저장소 상세
  - `GET /repos/{owner}/{repo}/commits` - 커밋 히스토리

### Vercel
- 인증 방식: Personal Access Token 또는 Vercel Integration(OAuth)
- 주요 API:
  - `GET /v9/projects` - 프로젝트 목록
  - `GET /v6/deployments` - 배포 목록 및 상태
  - `GET /v13/deployments/{id}` - 배포 상세

### 매칭 로직
- 1차: Vercel 프로젝트에 연결된 GitHub 저장소 정보(`link.repo`, `link.org`)를 기준으로 자동 매칭
- 2차: 자동 매칭 실패 시 사용자가 직접 저장소-프로젝트를 수동으로 연결

## 7. 데이터 모델 (예시)

```
User
- id
- github_id
- github_access_token (암호화 저장)
- vercel_access_token (암호화 저장)
- created_at

Repository
- id
- user_id (FK)
- github_repo_id
- name
- full_name
- description
- default_branch
- last_commit_at

VercelProject
- id
- user_id (FK)
- repository_id (FK, nullable - 매칭 안 된 경우)
- vercel_project_id
- project_name
- production_url

Deployment
- id
- vercel_project_id (FK)
- deployment_id
- status (BUILDING / READY / ERROR / CANCELED)
- url
- created_at
```

## 8. 비기능 요구사항

### 보안
- GitHub/Vercel 토큰은 암호화하여 DB에 저장
- 토큰은 서버 사이드에서만 사용, 클라이언트에 노출 금지
- HTTPS 통신 필수

### 성능
- 저장소/배포 목록은 캐싱하여 API 호출 최소화 (예: 5분 캐시)
- 대량 저장소 보유 사용자를 위한 페이지네이션 처리

### 확장성
- 추후 GitLab, Netlify 등 다른 서비스 연동 가능하도록 어댑터 구조 고려

### 가용성
- GitHub/Vercel API 장애 시 캐시된 마지막 데이터 표시 및 에러 안내

## 9. MVP 범위와 확장 기능

### MVP (1차 릴리즈)
- GitHub OAuth 로그인
- 저장소 목록 조회
- Vercel 토큰 연동 및 자동 매칭
- 대시보드에서 배포 상태/URL 표시
- 매칭 실패 저장소 수동 연결

### 확장 기능 (2차 이후)
- 배포 실패 알림(이메일/슬랙)
- 배포 히스토리 상세 로그 조회
- 팀/조직 단위 저장소 관리
- 다른 배포 플랫폼(Netlify 등) 지원

## 10. 성공 지표 (KPI)

- 사용자당 평균 연동 저장소 수
- 대시보드 접속 후 배포 URL 클릭까지 걸리는 평균 시간 (기존 대비 단축률)
- 자동 매칭 성공률 (전체 저장소 대비 자동 연결된 비율)
- 주간 활성 사용자(WAU)
