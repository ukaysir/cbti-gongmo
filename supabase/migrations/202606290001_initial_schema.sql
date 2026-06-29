create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  real_name text not null,
  rank text not null,
  unit text not null,
  role text not null default 'soldier',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists assessment_sessions (
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

create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
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

create table if not exists scenario_choices (
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

create table if not exists assessment_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  scenario_id uuid not null references scenarios(id),
  choice_id uuid not null references scenario_choices(id),
  response_time_ms int,
  created_at timestamptz not null default now(),
  unique(session_id, scenario_id)
);

create table if not exists ai_interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  turn_index int not null,
  question text not null,
  answer text,
  analysis_json jsonb,
  model text,
  created_at timestamptz not null default now()
);

create table if not exists assessment_reports (
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

create table if not exists training_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  description text not null,
  target_axis text not null,
  difficulty int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists training_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references training_modules(id) on delete cascade,
  prompt_json jsonb not null,
  correct_choice_key text not null,
  choices_json jsonb not null,
  feedback_json jsonb not null,
  order_index int not null default 0
);

create table if not exists training_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references training_modules(id),
  status text not null default 'started',
  score numeric,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists training_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references training_attempts(id) on delete cascade,
  training_item_id uuid not null references training_items(id),
  selected_choice_key text not null,
  is_correct boolean not null,
  response_time_ms int,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table cohorts enable row level security;
alter table assessment_sessions enable row level security;
alter table scenarios enable row level security;
alter table scenario_choices enable row level security;
alter table assessment_answers enable row level security;
alter table ai_interview_turns enable row level security;
alter table assessment_reports enable row level security;
alter table training_modules enable row level security;
alter table training_items enable row level security;
alter table training_attempts enable row level security;
alter table training_answers enable row level security;
alter table audit_logs enable row level security;

create policy "profiles own read" on profiles for select using (auth.uid() = id);
create policy "profiles own update" on profiles for update using (auth.uid() = id);
create policy "profiles own insert" on profiles for insert with check (auth.uid() = id);

create policy "read active scenarios" on scenarios for select using (is_active = true);
create policy "read scenario choices" on scenario_choices for select using (
  exists (select 1 from scenarios where scenarios.id = scenario_choices.scenario_id and scenarios.is_active = true)
);
create policy "read active training modules" on training_modules for select using (is_active = true);
create policy "read active training items" on training_items for select using (
  exists (select 1 from training_modules where training_modules.id = training_items.module_id and training_modules.is_active = true)
);

create policy "sessions own all" on assessment_sessions for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "answers own all" on assessment_answers for all using (
  exists (select 1 from assessment_sessions where assessment_sessions.id = assessment_answers.session_id and assessment_sessions.profile_id = auth.uid())
) with check (
  exists (select 1 from assessment_sessions where assessment_sessions.id = assessment_answers.session_id and assessment_sessions.profile_id = auth.uid())
);
create policy "ai turns own all" on ai_interview_turns for all using (
  exists (select 1 from assessment_sessions where assessment_sessions.id = ai_interview_turns.session_id and assessment_sessions.profile_id = auth.uid())
) with check (
  exists (select 1 from assessment_sessions where assessment_sessions.id = ai_interview_turns.session_id and assessment_sessions.profile_id = auth.uid())
);
create policy "reports own read" on assessment_reports for select using (auth.uid() = profile_id);
create policy "training attempts own all" on training_attempts for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "training answers own all" on training_answers for all using (
  exists (select 1 from training_attempts where training_attempts.id = training_answers.attempt_id and training_attempts.profile_id = auth.uid())
) with check (
  exists (select 1 from training_attempts where training_attempts.id = training_answers.attempt_id and training_attempts.profile_id = auth.uid())
);

create index if not exists idx_assessment_sessions_profile on assessment_sessions(profile_id);
create index if not exists idx_assessment_answers_session on assessment_answers(session_id);
create index if not exists idx_ai_interview_turns_session on ai_interview_turns(session_id);
create index if not exists idx_training_attempts_profile on training_attempts(profile_id);

