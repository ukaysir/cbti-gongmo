# Agent Handoff Guide

이 저장소는 CBTI(Cognitive Behavior Type Indicator) 기반 인지전 대응 진단/훈련 웹서비스입니다. 다음 작업자는 이 문서를 먼저 읽고 현재 구현 상태를 유지하면서 이어서 개발하십시오.

## Current Repository

- Local path: `C:\Users\CKIRUser\Downloads\cbti`
- GitHub remote: `https://github.com/ukaysir/cbti-gongmo.git`
- Main branch: `main`
- App framework: Next.js App Router, TypeScript, Tailwind CSS
- AI integration target: Puter.js via browser script `https://js.puter.com/v2/`
- DB target: Supabase Postgres/Auth/RLS
- Deploy target: Vercel

## Important Windows Execution Notes

이 환경에서는 `node_modules/.bin/*.cmd` 실행이 `EPERM`으로 막힐 수 있습니다. `npm run build`, `npm run typecheck`가 실패하면 아래처럼 JS 엔트리를 직접 실행하십시오.

```powershell
$env:Path = 'C:\Program Files\nodejs;C:\Program Files\Git\cmd;' + $env:Path
node .\node_modules\typescript\bin\tsc --noEmit --pretty false
node .\node_modules\next\dist\bin\next build
node .\node_modules\next\dist\bin\next dev -p 3000
node .\node_modules\supabase\dist\supabase.js --version
node .\node_modules\vercel\dist\index.js --version
```

`node_modules`, `.next`, `.next-dev.log`, `tsconfig.tsbuildinfo`는 커밋하지 마십시오.

## Current Implemented Flow

1. User enters real-name profile information locally in the UI.
2. User completes CBTI assessment scenarios.
3. The deterministic scoring engine calculates CBTI code from selected choices.
4. Puter AI generates dynamic follow-up questions based on the assessment result and previous answers.
5. AI analysis is merged into the report as triggers, reasoning patterns, behavior risks, protective factors, and recommendations.
6. User starts the information verification training module.
7. Training requires at least 80% accuracy to pass.
8. Passing training starts reassessment.
9. Reassessment result is compared against the initial assessment in a table showing axis changes and improvement status.

## Key Files

- `src/components/AssessmentWorkspace.tsx`
  - Main end-to-end product flow.
  - Phases: profile, assessment, interview, report, training, reassessment, comparison.
  - Owns initial answers, reassessment answers, AI interview turns, final comparison view.

- `src/components/TrainingWorkspace.tsx`
  - Training loop UI.
  - Shows threat type, cues, choices, feedback, pass/fail result.
  - Calls `onPassed` after passing threshold.

- `src/data/scenarios.ts`
  - Assessment scenarios and weighted A/B/C/D choices.
  - Choices are intentionally not obvious. Preserve that style.

- `src/data/training.ts`
  - Training module items.
  - Training choices should model realistic confusion, not childish right/wrong options.

- `src/lib/cbti.ts`
  - Deterministic CBTI scoring and report merge logic.
  - Do not let AI override the official CBTI code directly.

- `src/lib/ai.ts`
  - Puter.js loading.
  - Dynamic AI question generation.
  - AI JSON analysis and local fallback.

- `supabase/migrations/202606290001_initial_schema.sql`
  - Initial Supabase schema and RLS policies.

- `development.md`
  - Product and implementation plan.
  - Keep updated after meaningful architectural changes.

## Product Rules

- CBTI code must remain reproducible from stored answers and score vectors.
- AI should influence report detail, interview flow, and training recommendation, but not arbitrarily change deterministic CBTI result.
- Real-name profile data belongs in Supabase once Auth is implemented.
- Avoid sending real name, unit, or sensitive personal details to Puter AI unless there is a clear operational reason.
- Assessment and training choices must be realistic enough that users need to inspect evidence, source, context, and action consequences.
- Training should improve practical detection skill, not merely teach users to pick the most virtuous sentence.

## Validation Before Commit

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;C:\Program Files\Git\cmd;' + $env:Path
node .\node_modules\typescript\bin\tsc --noEmit --pretty false
node .\node_modules\next\dist\bin\next build
```

If a local dev server is already running, verify:

```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/assessment' -UseBasicParsing -TimeoutSec 20
```

## Next Development Priorities

1. Connect Supabase Auth and real profile persistence.
2. Persist assessment sessions, answers, AI interview turns, reports, training attempts, and reassessment results.
3. Add seed/migration data for scenarios and training items instead of keeping content only in TypeScript.
4. Add admin cohort dashboard with real Supabase queries.
5. Add mobile QA pass and interaction polish.
6. Add AI prompt hardening and structured retry when Puter returns non-JSON analysis.
7. Add Vercel deployment configuration and production environment setup.

