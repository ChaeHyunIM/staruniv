# StarUniv — PRD (Product Requirements Document)

## 1. 개요

**프로젝트명:** StarUniv (스타크래프트 대학)
**한줄 요약:** FMKorea의 이미지 기반 스타크래프트 대학 티어표/크루 현황판을 DB 기반의 인터랙티브 웹 애플리케이션으로 재구축

## 2. 배경 및 문제 정의

**현재 상태:**
- 스타크래프트 대학 관련 정보(티어표, 크루 현황, FA 명단)가 FMKorea 게시글에 **이미지 형태**로 관리됨
- 특정 플레이어를 찾거나 필터링하려면 이미지를 눈으로 직접 훑어야 함
- 업데이트 시 이미지를 다시 만들어야 하며 버전 관리가 어려움
- 모바일 환경에서 이미지 기반 정보 조회가 불편함

**해결하려는 문제:**
- 플레이어 정보의 **검색/필터링 불가** 문제
- 데이터 업데이트의 **비효율성**
- 모바일 환경에서의 **열악한 UX**

**참조 사이트:**
- https://www.fmkorea.com/3844139388 (스타크래프트 티어표 v3.53)
- https://www.fmkorea.com/9060359921 (크루 현황판 / FA 명단)

## 3. 목표 및 비목표

**목표 (Goals):**
- 티어표의 모든 플레이어 정보를 DB에 저장하고 동적으로 렌더링
- 크루 현황판 및 FA 명단을 구조화된 데이터로 제공
- 종족, 티어, 크루, 성별 등 다양한 조건의 **필터링/검색** 기능
- 반응형 디자인으로 모바일/데스크톱 모두 지원
- 미니멀한 MVP로 빠르게 출시

**비목표 (Non-Goals) — MVP 범위 외:**
- 사용자 인증/로그인 시스템
- 플레이어 전적/매치 히스토리 (Phase 2)
- 관리자 대시보드 (초기에는 DB 직접 관리)
- 실시간 알림/채팅

## 4. 핵심 기능 (MVP)

### 4.1 티어표 (Tier Table)
- 전체 플레이어를 티어별로 그룹화하여 표시
- 티어 단계: God, King, Jack, Joker, Spade, 0~8 티어, Baby
- 각 플레이어 카드: 닉네임, 종족(T/Z/P), 티어, 소속 크루
- 티어표 버전 정보 표시 (현재 v3.53)

### 4.2 크루 현황판 (Crew Status Board)
- 등록된 크루 목록 (현재 14개 활성 크루)
- 각 크루별 소속 선수 명단
- 크루 등록 요건 정보 (최소 10인, 갓~8티어 7인 이상 등)

### 4.3 FA 명단 (Free Agent List)
- 남성/여성 스트리머 FA 목록 분리 표시
- 각 FA 플레이어: 닉네임, 종족, 티어

### 4.4 필터링 및 검색
- **종족 필터:** 테란(T), 저그(Z), 프로토스(P)
- **티어 필터:** 특정 티어 또는 티어 범위 선택
- **크루 필터:** 특정 크루 소속 / FA 선수만 보기
- **성별 필터:** 남성/여성 스트리머
- **텍스트 검색:** 플레이어 닉네임으로 검색
- 필터 복합 적용 지원 (예: 저그 + 3티어 이상 + FA)

### 4.5 대회 히스토리
- 역대 대회 우승 크루 목록 (2021~현재)

## 5. Phase 2 로드맵 (향후 확장)
- 플레이어 전적 기능: 매치 결과 기록, 승률, 상대 종족별 전적
- 관리자 대시보드: 웹 UI에서 데이터 CRUD
- 티어 변동 히스토리: 플레이어 티어 변경 이력 추적
- 크루 통계: 크루별 평균 티어, 종족 분포 등

---

## 6. 기술 스택

- **프레임워크**: SolidStart (TypeScript)
- **런타임**: Bun
- **DB**: PostgreSQL (Bun 내장 `bun:sql` 드라이버)
- **CSS**: Vanilla CSS + CSS Modules
- **배포**: Railway

---

## 7. DB 스키마

```sql
crews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

players (
  id SERIAL PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  race TEXT NOT NULL,          -- 'T' | 'Z' | 'P'
  tier TEXT,
  gender TEXT DEFAULT 'M',     -- 'M' | 'F'
  crew_id INTEGER REFERENCES crews(id),
  is_fa BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  winner_crew_id INTEGER REFERENCES crews(id),
  status TEXT DEFAULT 'completed'
)

tier_versions (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  released_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
)
```

---

## 구현 단계

### Phase 1: 초기 세팅
1. SolidStart + TypeScript 프로젝트 생성 (`bun create solid`)
2. 설정 파일 구성 (`.gitignore`, `.env`, `app.config.ts`)
3. DB 연결 모듈 (`src/lib/db.ts` — `bun:sql`)
4. SQL 마이그레이션 (`sql/001_create_tables.sql`)
5. Git 초기화 + 첫 커밋

### Phase 2: DB 스키마 & 시드 데이터
1. SQL 마이그레이션 파일 작성 (`sql/` 디렉토리)
2. FMKorea 게시글 크롤링하여 시드 데이터 SQL 생성
3. 시드 스크립트 실행

### Phase 3: API 라우트
SolidStart server function 방식으로 구현:
| 엔드포인트 | 설명 |
|---|---|
| `GET /api/players` | 필터/검색 쿼리 지원 |
| `GET /api/players/:nickname` | 플레이어 상세 |
| `GET /api/crews` | 크루 목록 |
| `GET /api/crews/:name` | 크루 상세 + 소속 선수 |
| `GET /api/fa` | FA 명단 |
| `GET /api/tournaments` | 대회 히스토리 |

### Phase 4: 페이지 구현
| 경로 | 설명 |
|---|---|
| `/` | 메인 티어표 뷰 (플레이어를 티어별 그룹화) |
| `/players` | 전체 플레이어 + 필터/검색 |
| `/players/:nickname` | 플레이어 상세 |
| `/crews` | 크루 현황판 |
| `/crews/:name` | 크루 상세 |
| `/fa` | FA 명단 (남/여 분리) |
| `/history` | 대회 히스토리 |

### Phase 5: 필터링 & 검색
- 종족(T/Z/P), 티어, 크루, 성별 필터
- 닉네임 텍스트 검색
- 복합 필터 적용
- URL 쿼리 파라미터로 필터 상태 유지

### Phase 6: 반응형 CSS & 마무리
- 모바일/데스크톱 반응형 레이아웃
- Railway 배포 설정

---

## 검증 기준
- 로컬에서 `bun dev`로 전체 페이지 동작 확인
- 필터/검색 조합 테스트
- 모바일 뷰포트 반응형 확인
- Railway 배포 후 프로덕션 동작 확인
