# StarUniv — PRD (Product Requirements Document)

## 개요
FMKorea 스타크래프트 대학 티어표/크루 현황판을 DB 기반 웹으로 재구축한다.

## 기술 스택
- **프레임워크**: SolidStart (TypeScript)
- **런타임**: Bun
- **DB**: PostgreSQL (Bun 내장 `bun:sql` 드라이버)
- **배포**: Railway

---

## DB 스키마

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
