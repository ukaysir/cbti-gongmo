# CBTI 실서비스 개발 계획서

작성 기준: `raw.txt` 기획안, 실제 운영 MVP, 웹/모바일 기반 서비스, Puter.js AI, Supabase DB, Vercel 배포.

## 1. 서비스 정의

CBTI(Cognitive Behavior Type Indicator)는 현대 인지전/심리전 상황을 1인칭 모바일 콘텐츠로 체험하게 하고, 장병의 선택 반응과 AI 문답을 결합해 16가지 전장심리유형과 심리적 취약점을 진단한 뒤, 맞춤형 훈련을 제공하는 진단-훈련 통합 플랫폼이다.

서비스의 본질은 성격검사가 아니라 다음 역량을 실제 디지털 상황 안에서 반복 훈련시키는 것이다.

- 허위정보, 딥페이크, 표적 문자, 감정 선동 콘텐츠를 보고도 출처와 맥락을 검증하는 능력
- 분노, 공포, 고립감, 무력감 등 감정 자극에 휘둘리지 않는 능력
- 개인 감정과 불안보다 임무와 부대 판단 기준을 우선하는 능력
- 위협을 회피하거나 확산시키지 않고 신고, 공유 절차, 대응 행동으로 전환하는 능력

## 2. 운영형 제품 목표

실제 운영 MVP는 데모성 화면이 아니라 교육 시간에 바로 사용할 수 있는 최소 운영 단위로 정의한다.

- 장병 실명 기반 프로필 생성
- 진단 세션별 응답, 시간, 결과, AI 문답 로그 저장
- 16유형 CBTI 코드 산출의 재현성 보장
- AI 문답을 통한 취약점 상세화
- 맞춤형 훈련 모듈 제공
- 훈련 전후 변화 추적
- 관리자/교관이 집단 결과를 확인할 수 있는 대시보드
- Vercel 배포와 Supabase 운영 DB 기준 설계

## 3. 사용자 역할

### 장병

- 실명, 계급, 소속 정보를 등록한다.
- CBTI 진단을 수행한다.
- AI와 후속 문답을 진행한다.
- 상세 리포트를 확인한다.
- 추천 훈련 코스를 수행한다.
- 재진단으로 변화 결과를 확인한다.

### 교관/관리자

- 부대/기수/교육 단위별 진단 현황을 확인한다.
- 개인별 상세 리포트 접근 권한을 관리한다.
- 취약 영역 통계를 확인한다.
- 훈련 완료율과 재진단 변화를 추적한다.
- 시나리오와 선택지, 훈련 콘텐츠를 관리한다.

### 시스템 관리자

- 사용자 권한, 콘텐츠 활성화, 배포 환경, DB 마이그레이션, 감사 로그를 관리한다.

## 4. 핵심 사용자 흐름

1. 장병이 서비스에 접속한다.
2. Supabase Auth 또는 운영용 초대 코드로 로그인한다.
3. 실명, 계급, 소속, 교육 회차를 등록한다.
4. CBTI 진단을 시작한다.
5. 가짜뉴스, 딥페이크, 표적 문자, SNS 조롱, 여론조작 등 시나리오를 순차적으로 본다.
6. 각 상황에서 A/B/C/D 선택지를 고른다.
7. 서버가 선택지를 저장하고 4축 점수를 계산한다.
8. 진단 완료 후 1차 CBTI 유형과 취약 축 후보를 산출한다.
9. AI가 취약 축 중심으로 3-5턴 후속 문답을 진행한다.
10. AI 문답 분석 결과를 정형 JSON으로 저장한다.
11. 서버가 점수 결과와 AI 분석 결과를 결합해 최종 리포트를 생성한다.
12. 장병은 유형명, 강점, 취약점, 위험 상황, 대응 원칙, 추천 훈련을 확인한다.
13. 추천 훈련을 수행한다.
14. 재진단 또는 미니 평가를 통해 전후 변화를 확인한다.
15. 교관은 교육 단위별 통계를 확인한다.

## 5. 기술 스택

### 프론트엔드

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui 또는 Radix UI 기반 컴포넌트
- PWA 지원
- 모바일 우선 반응형 UI
- Zustand 또는 React Context 기반 클라이언트 상태 관리
- Zod 기반 입력 검증

### AI

- Puter.js
- `puter.ai.chat()` 기반 대화형 분석
- 사용자 Puter 로그인 허용
- AI 응답은 리포트 상세화와 질문 생성에 사용
- 최종 유형 산출은 AI가 아니라 서버 계산 로직이 담당

Puter.js 공식 문서 기준으로 `puter.ai.chat()`은 문자열 프롬프트 또는 messages 배열을 받을 수 있고, 모델, 스트리밍, 토큰 제한, temperature, function calling 옵션을 지원한다. 공식 문서: https://docs.puter.com/AI/chat/

### 백엔드/DB

- Supabase Postgres
- Supabase Auth
- Supabase Row Level Security
- Supabase Storage
- Supabase RPC 또는 Edge Functions
- Supabase Realtime은 관리자 대시보드 실시간 진행률에 선택 적용

### 배포/운영

- Vercel
- Supabase hosted project
- GitHub 기반 배포 브랜치
- Vercel Preview Deployment
- Supabase migration 기반 DB 변경 관리

## 6. 필요한 의존성

서비스 구현에 필요한 의존성만 설치한다.

### 시스템 도구

- Node.js LTS
- Git
- Supabase CLI
- Vercel CLI

Python은 현재 서비스 구현에는 필수 의존성이 아니다. 데이터 생성 스크립트나 별도 분석 도구가 필요해질 때만 추가한다.

### npm 패키지

- `next`
- `react`
- `react-dom`
- `typescript`
- `tailwindcss`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- `zustand`
- `lucide-react`
- `@heyputer/puter.js`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `recharts`
- `date-fns`

## 7. 정보 구조와 화면 설계

### 장병 화면

- `/`
  - 서비스 진입 화면
  - 현재 교육 회차 확인
  - 진단 시작 버튼

- `/profile`
  - 실명
  - 계급
  - 소속
  - 군번 또는 내부 식별번호는 운영 정책 확정 후 선택

- `/assessment/start`
  - 진단 안내
  - 개인정보 및 AI 사용 동의
  - Puter 로그인 안내

- `/assessment/[sessionId]`
  - 모바일 SNS/문자/영상형 시나리오 카드
  - A/B/C/D 선택
  - 진행률
  - 응답 시간 기록

- `/assessment/[sessionId]/interview`
  - AI 후속 문답
  - 3-5턴 제한
  - 취약 축별 질문
  - 답변 저장

- `/report/[sessionId]`
  - CBTI 코드
  - 유형명
  - 점수 레이더 차트
  - 강점
  - 취약점
  - AI 분석 요약
  - 맞춤 훈련 추천
  - 개인 대응 원칙 초안

- `/training`
  - 추천 훈련 목록
  - 완료 상태

- `/training/[moduleId]`
  - 노출 -> 판단 -> 선택 -> 피드백 루프
  - 정보처리, 감정반응, 행동순위, 대응방식 모듈

- `/growth`
  - 최초 진단, 훈련 후 진단, 최근 진단 비교

### 관리자 화면

- `/admin`
  - 전체 교육 회차 진행률
  - 진단 완료율
  - 훈련 완료율
  - 취약 축 분포

- `/admin/sessions`
  - 개인별 세션 목록
  - 상태 필터

- `/admin/reports/[sessionId]`
  - 개인 리포트 상세
  - 접근 권한 필요

- `/admin/content`
  - 시나리오, 선택지, 훈련 콘텐츠 관리

## 8. CBTI 진단 모델

CBTI는 4개 축의 이진 조합으로 16유형을 만든다.

| 축 | 긍정/보강 방향 | 취약/주의 방향 | 의미 |
| --- | --- | --- | --- |
| 정보 처리 | V Verify | A Accept | 정보를 의심하고 확인하는가, 그대로 받아들이는가 |
| 감정 반응 | S Stable | R Reactive | 감정 자극에 안정적인가, 동요하는가 |
| 행동 순위 | M Mission | P Personal | 임무/부대를 우선하는가, 개인 감정을 우선하는가 |
| 대응 방식 | C Counter | W Withdraw | 신고/대응하는가, 무시/회피하는가 |

### 16유형

| 코드 | 유형명 | 핵심 설명 |
| --- | --- | --- |
| VSMC | 철벽 방패형 | 검증, 안정, 임무중심, 능동대응 |
| VSMW | 신중 관망형 | 정확히 판단하나 적극 대응은 약함 |
| VSPC | 분석 행동형 | 검증과 안정성은 있으나 개인 판단 비중이 큼 |
| VSPW | 냉철 고립형 | 흔들리지 않지만 공유와 신고가 약함 |
| VRMC | 열혈 검증형 | 검증과 대응은 빠르나 감정이 앞설 수 있음 |
| VRMW | 불안 검증형 | 진위 확인 욕구는 있으나 정서 동요와 위축이 큼 |
| VRPC | 충동 폭로형 | 검증 후에도 감정적 확산 위험 |
| VRPW | 회의 불안형 | 의심은 많으나 불안과 회피가 강함 |
| ASMC | 단순 돌격형 | 임무 충실하지만 정보 수용성이 높음 |
| ASMW | 묵묵 순응형 | 안정적이나 무비판적 수용과 회피 가능 |
| ASPC | 낙관 전파형 | 흔들림은 적지만 검증 없는 확산 가능 |
| ASPW | 무심 방관형 | 위협 둔감, 검증과 대응 모두 약함 |
| ARMC | 격정 행동형 | 임무중심이나 선동에 쉽게 격앙 |
| ARMW | 동요 위축형 | 가짜정보에 흔들리고 임무 이탈 우려 |
| ARPC | 감정 확산형 | 미검증 정보를 감정대로 확산 |
| ARPW | 심리 표류형 | 검증, 안정, 대응이 모두 약한 최우선 보강 대상 |

## 9. 점수화 원칙

각 선택지는 하나의 유형으로 단순 매핑하지 않고 4축 점수 벡터를 가진다. 그래야 같은 선택이라도 시나리오 맥락에 따른 강약을 표현할 수 있다.

예시:

```json
{
  "choice": "화나서 부대원들과 공유한다",
  "score": {
    "V": 0,
    "A": 2,
    "S": 0,
    "R": 3,
    "M": 0,
    "P": 2,
    "C": 1,
    "W": 0
  },
  "risk_tags": ["unverified_spread", "anger_trigger", "peer_contagion"]
}
```

### 축별 산출

각 축은 양쪽 점수 차이와 응답 일관성을 함께 본다.

```text
info_score = V - A
emotion_score = S - R
priority_score = M - P
action_score = C - W
```

산출 규칙:

- `info_score >= threshold`이면 V, 아니면 A
- `emotion_score >= threshold`이면 S, 아니면 R
- `priority_score >= threshold`이면 M, 아니면 P
- `action_score >= threshold`이면 C, 아니면 W

기본 threshold는 0으로 시작하되, 운영 데이터가 쌓이면 문항 난이도와 변별도를 반영해 조정한다.

### 신뢰도 산출

진단 신뢰도는 다음 요소로 계산한다.

- 응답 문항 수
- 축별 점수 차이
- 응답 시간 이상치
- 같은 축을 측정하는 문항 간 일관성
- AI 문답에서 선택 이유와 선택 행동이 일치하는 정도

예시:

```text
confidence = 0.45 * axis_margin_score
           + 0.25 * consistency_score
           + 0.15 * response_time_quality
           + 0.15 * ai_alignment_score
```

신뢰도가 낮으면 리포트에 "추가 문답 필요" 또는 "재진단 권장"을 표시한다.

## 10. AI 문답 설계

AI는 최종 유형을 임의로 결정하지 않는다. AI는 사용자의 선택 뒤에 있는 이유를 묻고, 자유 답변을 구조화하여 리포트와 훈련 추천을 상세화한다.

### AI 입력 데이터

AI 호출 시 다음 데이터를 제공한다.

- 세션 ID는 직접 제공하지 않고 프론트에서 내부 참조만 사용
- 사용자 실명은 원칙적으로 AI에 보내지 않는다
- 계급/소속도 분석에 꼭 필요하지 않으면 제외
- 시나리오 제목
- 시나리오 요약
- 사용자가 고른 선택지
- 해당 선택지의 점수 벡터
- 현재 1차 CBTI 코드
- 취약 축 후보
- 이전 AI 문답 요약

실명 저장은 Supabase에 하되, AI 프롬프트에는 최소 정보만 보낸다. 운영 서비스에서 개인정보 과다 전송을 피하기 위한 원칙이다.

### AI 문답 턴

기본 4턴으로 설계한다.

1. 선택 이유 탐색
2. 신뢰한 단서 탐색
3. 감정 반응과 행동 의도 탐색
4. 다음 상황에서의 대응 원칙 확인

취약 축이 명확하면 3턴으로 줄이고, 신뢰도가 낮으면 5턴까지 확장한다.

### 질문 생성 프롬프트 원칙

AI는 교육적이고 비난 없는 톤으로 질문한다.

금지:

- 사용자를 겁주거나 낙인찍는 표현
- 군 기밀, 실제 작전 정보 요구
- 정치적 입장 유도
- 특정 집단 혐오/선동
- 의학적 진단 표현

권장:

- "어떤 단서 때문에 그렇게 느꼈나요?"
- "출처를 확인한다면 어디를 먼저 보겠습니까?"
- "그 감정이 행동으로 이어진다면 어떤 위험이 있을까요?"
- "부대 기준으로는 어떤 절차가 더 적절할까요?"

### AI 구조화 출력

AI 답변 분석은 반드시 JSON으로 받는다. JSON 파싱 실패 시 재요청하거나 기본 분석으로 fallback한다.

```json
{
  "primary_vulnerability_axis": "R",
  "secondary_vulnerability_axis": "A",
  "detected_triggers": [
    "구체적 수치",
    "고립감",
    "조롱성 표현"
  ],
  "reasoning_patterns": [
    "출처보다 반응 수를 신뢰함",
    "여론 수치를 실제 다수 의견으로 간주함"
  ],
  "behavior_risks": [
    "무력감으로 인한 회피",
    "검증 전 내부 확산"
  ],
  "protective_factors": [
    "뒤늦게라도 출처 확인 필요성을 인식함"
  ],
  "recommended_training_modules": [
    "information_verification",
    "emotion_stabilization"
  ],
  "ai_alignment_score": 0.82,
  "report_notes": "구체적인 숫자와 다수 반응에 취약하지만, 질문 후 출처 확인 필요성을 인식했다."
}
```

### AI 결과 결합 규칙

최종 CBTI 코드는 서버 점수 결과를 따른다. AI는 다음 항목만 보정한다.

- 취약 축 우선순위
- 리포트 문장 상세화
- 추천 훈련 순서
- 개인 대응 원칙 초안
- 신뢰도 보조 점수

AI가 점수 결과와 상충하는 분석을 내면 다음 규칙을 적용한다.

- 축 점수 차이가 큰 경우: 서버 점수 우선
- 축 점수 차이가 작고 신뢰도가 낮은 경우: AI 분석을 보조 근거로 사용
- AI JSON이 스키마를 벗어난 경우: 폐기하고 재요청
- 부적절한 조언이 포함된 경우: 저장하지 않고 안전 fallback 리포트 사용

## 11. 리포트 설계

리포트는 장병이 바로 이해하고 행동으로 옮길 수 있어야 한다.

### 리포트 구성

- CBTI 코드와 유형명
- 한 줄 요약
- 축별 점수
- 강점
- 주요 취약점
- 취약해질 수 있는 상황
- AI 문답 기반 상세 분석
- 위험 행동 패턴
- 추천 훈련
- 개인 인지전 대응 원칙
- 재진단 권장 시점

### 리포트 예시 구조

```text
유형: VRMW 불안 검증형

당신은 정보를 그대로 믿기보다는 확인하려는 감각이 있지만,
구체적인 숫자, 조롱성 여론, 고립감을 자극하는 콘텐츠 앞에서
정서적으로 흔들리고 행동이 위축될 수 있습니다.

강점:
- 정보의 진위를 의심하려는 기본 감각이 있습니다.
- 감정이 가라앉은 뒤에는 출처 확인 필요성을 인식합니다.

취약점:
- 다수 여론처럼 보이는 숫자에 영향을 받기 쉽습니다.
- 고립감을 자극하는 메시지에서 무력감을 느낄 수 있습니다.
- 불안을 혼자 삭이고 신고/공유 절차로 전환하지 못할 수 있습니다.

추천 훈련:
1. 정보처리 V/A: 출처 확인과 교차검증
2. 감정반응 S/R: 감정 자극 분리와 사실 우선 판단
```

## 12. 훈련 모듈 설계

훈련은 네 영역으로 구성한다.

- 정보처리 V/A
- 감정반응 S/R
- 행동순위 M/P
- 대응방식 C/W

첫 실구현은 정보처리 V/A를 우선 구현한다. 이후 같은 엔진으로 나머지 모듈을 추가한다.

### 공통 훈련 루프

1. 노출: 실제 SNS/문자/영상처럼 보이는 콘텐츠 제시
2. 판단: 사용자가 위험 단서를 찾음
3. 선택: 대응 행동 선택
4. 피드백: 왜 맞거나 틀렸는지 설명
5. 재시도: 비슷한 유형의 변형 상황 제시
6. 숙달: 일정 점수 이상이면 완료 처리

### 정보처리 V/A 훈련 예시

상황:

- "전방 사단 포기 찬성 80%"라는 SNS 게시물
- 출처 없음
- 댓글과 좋아요 수 과장
- 이미지 하단에 조작 흔적

사용자 과제:

- 출처 표시 여부 확인
- 수치의 조사 기관 확인
- 게시 시각과 원본 링크 확인
- 감정적 표현과 사실 표현 분리
- 신고/공유 전 확인 절차 선택

피드백:

- "80%" 같은 숫자는 신뢰감을 주지만, 조사 기관과 표본이 없으면 근거가 아니다.
- 좋아요 수는 사실성의 증거가 아니다.
- 전장 상황의 미확인 정보는 사기 저하와 내부 혼란을 유발할 수 있으므로 검증 전 확산하지 않는다.

## 13. Supabase 데이터베이스 설계

### `profiles`

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  real_name text not null,
  rank text not null,
  unit text not null,
  role text not null default 'soldier',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### `cohorts`

```sql
create table cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
```

### `assessment_sessions`

```sql
create table assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  cohort_id uuid references cohorts(id),
  status text not null default 'started',
  session_type text not null default 'initial',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  cbti_code text,
  confidence_score numeric,
  primary_weakness text,
  secondary_weakness text,
  score_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### `scenarios`

```sql
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text not null,
  content_type text not null,
  content_json jsonb not null,
  difficulty int not null default 1,
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### `scenario_choices`

```sql
create table scenario_choices (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  label text not null,
  text text not null,
  score_v int not null default 0,
  score_a int not null default 0,
  score_s int not null default 0,
  score_r int not null default 0,
  score_m int not null default 0,
  score_p int not null default 0,
  score_c int not null default 0,
  score_w int not null default 0,
  risk_tags text[] not null default '{}',
  feedback text,
  order_index int not null default 0
);
```

### `assessment_answers`

```sql
create table assessment_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  scenario_id uuid not null references scenarios(id),
  choice_id uuid not null references scenario_choices(id),
  response_time_ms int,
  created_at timestamptz not null default now(),
  unique(session_id, scenario_id)
);
```

### `ai_interview_turns`

```sql
create table ai_interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  turn_index int not null,
  question text not null,
  answer text,
  analysis_json jsonb,
  model text,
  created_at timestamptz not null default now()
);
```

### `assessment_reports`

```sql
create table assessment_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  cbti_code text not null,
  type_name text not null,
  summary text not null,
  strengths_json jsonb not null default '[]'::jsonb,
  weaknesses_json jsonb not null default '[]'::jsonb,
  recommended_modules_json jsonb not null default '[]'::jsonb,
  response_principles_json jsonb not null default '[]'::jsonb,
  raw_ai_json jsonb,
  created_at timestamptz not null default now()
);
```

### `training_modules`

```sql
create table training_modules (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text not null,
  target_axis text not null,
  difficulty int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### `training_items`

```sql
create table training_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references training_modules(id) on delete cascade,
  prompt_json jsonb not null,
  correct_choice_key text not null,
  choices_json jsonb not null,
  feedback_json jsonb not null,
  order_index int not null default 0
);
```

### `training_attempts`

```sql
create table training_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references training_modules(id),
  status text not null default 'started',
  score numeric,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
```

### `training_answers`

```sql
create table training_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references training_attempts(id) on delete cascade,
  training_item_id uuid not null references training_items(id),
  selected_choice_key text not null,
  is_correct boolean not null,
  response_time_ms int,
  created_at timestamptz not null default now()
);
```

### `audit_logs`

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## 14. RLS 보안 원칙

실명 저장 서비스이므로 Row Level Security를 반드시 켠다.

- 장병은 자신의 `profiles`, `assessment_sessions`, `assessment_answers`, `assessment_reports`, `training_attempts`만 조회 가능
- 장병은 자신의 진행 중 세션에만 답변 추가 가능
- 완료된 세션의 답변은 수정 불가
- 교관은 자신이 담당하는 `cohort` 범위만 조회 가능
- 시스템 관리자는 콘텐츠 테이블과 전체 통계를 관리 가능
- AI 원본 응답은 관리자 전체 공개가 아니라 권한 있는 담당자만 접근 가능

## 15. 서버 로직

### 진단 시작

- 로그인 확인
- 프로필 완성 여부 확인
- 진행 중 세션이 있으면 이어하기
- 없으면 새 `assessment_sessions` 생성
- 활성 시나리오 목록을 난이도와 카테고리 균형에 맞게 배정

### 답변 저장

- `assessment_answers` insert
- 중복 시나리오 답변 방지
- 응답 시간 저장
- 선택지 점수는 클라이언트에서 신뢰하지 않고 DB에서 조회

### 1차 점수 계산

- 모든 답변의 선택지 점수 합산
- 4축 점수 계산
- CBTI 코드 산출
- 취약 축 후보 산출
- 신뢰도 1차 계산

### AI 문답 완료

- AI JSON 스키마 검증
- 부적절 응답 필터링
- AI alignment score 계산
- 취약 축 우선순위 보정

### 최종 리포트 생성

- 서버 점수 결과
- AI 구조화 분석
- CBTI 유형 템플릿
- 훈련 모듈 매핑
- 개인 대응 원칙 초안

## 16. 콘텐츠 제작 계획

MVP 초기 콘텐츠는 실제 이미지 자산 없이 웹 UI로 제작한다.

### 시나리오 콘텐츠 타입

- `fake_social_post`
- `fake_news_card`
- `sms_threat`
- `deepfake_video_mock`
- `comment_thread`
- `poll_manipulation`

### 초기 진단 시나리오 12개

- 가혹행위 조작 트윗
- 가짜 항복 영상
- 국군 조롱 인스타 게시물
- 가족 위험 표적 문자
- 지휘관 탈영 허위 문자
- 전방 부대 포기 여론조사 조작 게시물
- 민간 피해 조작 영상
- 전우 실명 언급 협박 메시지
- 군 내부 갈등 유도 댓글
- 보급 중단 허위 뉴스
- 작전 실패 루머 카드뉴스
- 포로 대우 왜곡 영상 썸네일

각 시나리오는 최소 4개 선택지를 가진다.

- 검증형 선택지
- 회피형 선택지
- 동요형 선택지
- 감정 확산형 선택지

## 17. 관리자 대시보드 지표

- 교육 회차별 참여자 수
- 진단 완료율
- AI 문답 완료율
- 훈련 완료율
- CBTI 16유형 분포
- 취약 축 분포
- 재진단 개선율
- 평균 신뢰도
- 시나리오별 오답/위험 선택 비율
- 훈련 모듈별 숙달 점수

개인 식별 정보는 기본적으로 관리자 화면에서 최소 노출하고, 상세 조회 시 권한과 감사 로그를 남긴다.

## 18. 개인정보와 안전

### 개인정보

- 실명, 계급, 소속은 Supabase에 저장
- AI 프롬프트에는 실명과 소속을 기본적으로 보내지 않음
- 리포트에는 사용자 표시 목적상 실명을 보여줄 수 있지만 AI 분석 입력에서는 제외
- 운영 전 개인정보 처리방침과 동의 문구 필요

### AI 안전

- AI는 심리 상담사나 의료 진단자로 표현하지 않는다.
- 리포트는 "심리적 취약점"이 아니라 "인지전 대응 취약 경향"으로 표현한다.
- 자해, 폭력, 기밀, 혐오, 정치 선동 관련 답변이 나오면 안전 응답으로 전환한다.
- AI 응답은 교육 참고 자료이며 공식 인사 평가 자료가 아님을 명시한다.

## 19. 배포 구조

### 환경 변수

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Puter.js는 사용자 로그인 기반으로 사용하므로 일반적인 서버 API 키를 저장하지 않는다.

### 브랜치 전략

- `main`: 운영 배포
- `develop`: 개발 통합
- feature 브랜치: 기능별 개발

### 배포 단계

1. Supabase 프로젝트 생성
2. 마이그레이션 적용
3. RLS 정책 적용
4. seed 콘텐츠 삽입
5. Vercel 프로젝트 연결
6. 환경 변수 설정
7. Preview 배포 검증
8. Production 배포

## 20. 개발 순서

### Phase 1. 기반 구축

- Node.js LTS, Git, Supabase CLI, Vercel CLI 설치
- Next.js 프로젝트 생성
- TypeScript, Tailwind, 기본 UI 구성
- Supabase 클라이언트 설정
- Auth 구조 설정

### Phase 2. DB와 진단 엔진

- Supabase 마이그레이션 작성
- RLS 정책 작성
- seed 시나리오/선택지 작성
- 점수 계산 함수 구현
- CBTI 코드 산출 함수 구현
- 신뢰도 계산 구현

### Phase 3. 진단 UI

- 모바일 시나리오 카드 UI
- SNS/문자/영상 mock 콘텐츠 컴포넌트
- 선택지 UI
- 진행률과 응답 시간 기록
- 세션 이어하기

### Phase 4. AI 문답

- Puter.js 설치 및 초기화
- Puter 로그인 상태 처리
- AI 질문 생성
- AI 답변 분석 JSON 스키마
- JSON 검증과 fallback
- 문답 로그 저장

### Phase 5. 리포트

- CBTI 유형 템플릿
- 축별 차트
- AI 상세 분석
- 훈련 추천 매핑
- 개인 대응 원칙 초안

### Phase 6. 훈련 모듈

- 정보처리 V/A 훈련 우선 구현
- 훈련 아이템 seed
- 선택/피드백/재시도 루프
- 점수와 완료 처리

### Phase 7. 관리자

- 교관 역할
- 교육 회차 관리
- 통계 대시보드
- 개인 리포트 조회
- 감사 로그

### Phase 8. 운영 품질

- 모바일 화면 QA
- RLS 테스트
- AI 실패 fallback 테스트
- Vercel Preview 검증
- Supabase 백업 정책 확인
- 개인정보 동의 문구 정리

## 21. 구현 시 우선순위

1. DB 스키마와 RLS
2. 진단 점수 로직
3. seed 콘텐츠
4. 진단 UI
5. AI 문답
6. 리포트
7. 훈련
8. 관리자 대시보드
9. 배포

AI 문답은 중요하지만, 점수 로직과 DB 기록이 먼저 안정되어야 한다. AI 결과는 리포트를 풍부하게 만들고 취약 축을 상세화하는 역할이지, 공식 진단의 유일한 근거가 아니다.

## 22. 남은 정책 결정 사항

아래 항목은 구현 중 확정이 필요하다.

- 군번 또는 개인 식별번호 저장 여부
- 교관이 개인 리포트를 볼 수 있는 권한 범위
- AI 문답 원문 보관 기간
- 교육 결과를 개인 평가와 분리한다는 고지 문구
- 부대별 관리자 초대 방식
- 운영 환경에서 Puter 로그인 안내 문구

## 23. 다음 실행 작업

1. 필요한 의존성만 설치한다.
2. `cbti` 폴더에 Next.js 프로젝트를 생성한다.
3. Supabase 마이그레이션을 작성한다.
4. CBTI 진단 로직을 TypeScript 순수 함수로 구현한다.
5. seed 시나리오 12개와 선택지 점수표를 작성한다.
6. 모바일 진단 UI를 구현한다.
7. Puter.js AI 문답과 JSON 분석 파이프라인을 붙인다.
8. 리포트와 정보처리 훈련 모듈을 구현한다.

## 24. 현재 구현 완료 상태

2026-06-29 기준으로 다음 항목이 구현되어 있다.

- Next.js App Router 기반 프로젝트 생성
- TypeScript, Tailwind CSS, lucide-react 기반 UI 구성
- 로컬 실행 가능한 홈, 진단, 훈련, 관리자 프리뷰 화면
- CBTI 4축/16유형 deterministic scoring 엔진
- 초기 진단 시나리오 6개
- 시나리오별 A/B/C/D 선택지 score vector와 risk tag
- 선택지가 너무 명백하지 않도록 실제 혼동 가능한 판단지로 고도화
- Puter.js 브라우저 로딩
- Puter AI 기반 동적 후속 질문 생성
- 이전 사용자 답변을 반영한 AI 면담 흐름
- AI JSON 분석 파이프라인
- AI 실패 시 로컬 fallback 분석
- AI 분석 결과를 리포트 요약, 취약점, 보호요인, 훈련 추천, 대응 원칙에 반영
- 정보처리 V/A 훈련 모듈 8문항
- 훈련 문항별 threat, prompt, cues, choices, principle, feedback 구조
- 훈련 통과 기준 80%
- 훈련 통과 후 재진단 흐름
- 초기 진단과 재진단 결과 비교표
- 비교표에서 4축별 훈련 전/후 선택 축, 점수, 변화량, 개선/보강 해석 표시
- Supabase 초기 schema/RLS migration 파일
- Vercel CLI와 Supabase CLI를 프로젝트 devDependency로 설치
- GitHub 원격 `https://github.com/ukaysir/cbti-gongmo.git`의 `main` 브랜치에 push 완료

현재 주요 구현 파일은 다음과 같다.

- `src/components/AssessmentWorkspace.tsx`: 전체 진단, AI 면담, 리포트, 훈련, 재진단, 비교 흐름
- `src/components/TrainingWorkspace.tsx`: 통과 기준 기반 훈련 루프
- `src/data/scenarios.ts`: CBTI 진단 시나리오와 점수 선택지
- `src/data/training.ts`: 정보처리 훈련 콘텐츠
- `src/lib/cbti.ts`: 점수 계산과 리포트 병합
- `src/lib/ai.ts`: Puter AI 질문 생성과 분석
- `supabase/migrations/202606290001_initial_schema.sql`: 운영 DB 초기 설계

## 25. 다음 개발 인수인계

다음 개발자는 `agents.md`를 먼저 읽고 아래 순서로 이어가면 된다.

### 25-1. Supabase 실제 연결

현재 앱은 로컬 상태 기반으로 전체 흐름이 동작한다. 다음 단계는 Supabase Auth와 DB persistence를 붙이는 것이다.

- Supabase 프로젝트 생성
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- `supabase/migrations/202606290001_initial_schema.sql` 적용
- 실명 프로필을 `profiles`에 저장
- 진단 시작 시 `assessment_sessions` 생성
- 선택 응답을 `assessment_answers`에 저장
- AI 문답을 `ai_interview_turns`에 저장
- 리포트를 `assessment_reports`에 저장
- 훈련 시도와 답변을 `training_attempts`, `training_answers`에 저장
- 재진단은 `assessment_sessions.session_type = 'reassessment'`로 저장

### 25-2. 콘텐츠 DB화

현재 `scenarios.ts`, `training.ts`에 콘텐츠가 TypeScript 상수로 들어 있다. 운영 단계에서는 Supabase seed/migration으로 옮기는 것이 맞다.

- `scenarios` seed 작성
- `scenario_choices` seed 작성
- `training_modules` seed 작성
- `training_items` seed 작성
- 관리자 화면에서 콘텐츠 활성/비활성 관리

### 25-3. 관리자 기능

현재 `/admin`은 콘텐츠 상태 프리뷰다. 실제 운영 대시보드는 Supabase 연결 후 구현한다.

- cohort 생성
- cohort별 참여자 목록
- 진단 완료율
- AI 문답 완료율
- 훈련 통과율
- 재진단 개선율
- 16유형 분포
- 4축 취약점 분포
- 개인 리포트 조회 권한과 audit log

### 25-4. AI 강화

현재 Puter AI는 질문 생성과 최종 JSON 분석에 사용된다. 다음 단계는 안정성과 정확도를 높이는 것이다.

- 질문 생성 결과가 너무 짧거나 일반적이면 재요청
- JSON 분석 파싱 실패 시 repair prompt 재호출
- AI 분석 confidence와 deterministic confidence를 분리 표시
- 개인정보를 AI 프롬프트에 보내지 않는 정책 유지
- AI가 CBTI 코드를 직접 바꾸지 못하도록 유지

### 25-5. 검증 명령

이 Windows 환경에서는 `node_modules/.bin/*.cmd` 실행이 막힐 수 있으므로 다음 명령을 사용한다.

```powershell
$env:Path = 'C:\Program Files\nodejs;C:\Program Files\Git\cmd;' + $env:Path
node .\node_modules\typescript\bin\tsc --noEmit --pretty false
node .\node_modules\next\dist\bin\next build
```

로컬 개발 서버:

```powershell
$env:Path = 'C:\Program Files\nodejs;C:\Program Files\Git\cmd;' + $env:Path
node .\node_modules\next\dist\bin\next dev -p 3000
```

현재 확인된 정상 경로:

- `/`
- `/assessment`
- `/training`
- `/admin`

### 25-6. Git 작업

커밋 전에는 항상 다음을 확인한다.

```powershell
git status -sb
git diff --stat
```

커밋 대상에서 제외할 것:

- `node_modules`
- `.next`
- `.next-dev.log`
- `tsconfig.tsbuildinfo`
- `.env`
- `.env.local`
