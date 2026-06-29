"use client";

import { Bot, ChevronRight, ClipboardCheck, Loader2, Radar, Shield, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SCENARIOS } from "@/data/scenarios";
import { analyzeWithPuter, fallbackAnalysis, fallbackInterviewQuestion, generateInterviewQuestion } from "@/lib/ai";
import { calculateAssessment, mergeAiAnalysis } from "@/lib/cbti";
import type { AiAnalysis, AiInterviewTurn, AssessmentAnswer, ProfileDraft } from "@/lib/types";
import { ScoreBars } from "@/components/ScoreBars";
import { TrainingWorkspace } from "@/components/TrainingWorkspace";

export function AssessmentWorkspace() {
  const [profile, setProfile] = useState<ProfileDraft>({ realName: "", rank: "", unit: "" });
  const [phase, setPhase] = useState<"profile" | "assessment" | "interview" | "report" | "training">("profile");
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [turns, setTurns] = useState<AiInterviewTurn[]>([]);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [questionSource, setQuestionSource] = useState<"ai" | "fallback">("ai");

  const currentScenario = SCENARIOS[answers.length];
  const result = useMemo(() => (answers.length === SCENARIOS.length ? calculateAssessment(answers) : undefined), [answers]);
  const report = result ? mergeAiAnalysis(result, analysis) : undefined;

  useEffect(() => {
    if (phase !== "interview" || !result || currentQuestion) return;
    void loadQuestion(result, turns);
  }, [phase, result, currentQuestion, turns]);

  function choose(choiceId: string) {
    setAnswers((value) => [
      ...value,
      {
        scenarioId: currentScenario.id,
        choiceId,
        responseTimeMs: Date.now() - startedAt
      }
    ]);
    setStartedAt(Date.now());
    if (answers.length + 1 === SCENARIOS.length) setPhase("interview");
  }

  async function submitTurn() {
    if (!result || !draftAnswer.trim() || !currentQuestion) return;
    const nextTurns = [...turns, { question: currentQuestion, answer: draftAnswer.trim() }];
    setTurns(nextTurns);
    setDraftAnswer("");
    setCurrentQuestion("");

    if (nextTurns.length >= 4) {
      setIsAnalyzing(true);
      try {
        setAnalysis(await analyzeWithPuter(result, nextTurns));
      } catch {
        setAnalysis(fallbackAnalysis(result, nextTurns));
      } finally {
        setIsAnalyzing(false);
        setPhase("report");
      }
    } else {
      await loadQuestion(result, nextTurns);
    }
  }

  async function loadQuestion(nextResult = result, nextTurns = turns) {
    if (!nextResult) return;
    setIsQuestionLoading(true);
    try {
      const question = await generateInterviewQuestion(nextResult, nextTurns);
      setCurrentQuestion(question);
      setQuestionSource("ai");
    } catch {
      setCurrentQuestion(fallbackInterviewQuestion(nextResult, nextTurns));
      setQuestionSource("fallback");
    } finally {
      setIsQuestionLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-5 lg:grid-cols-[360px_1fr] lg:px-6">
      <aside className="screen-panel h-fit rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-field text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">CBTI</p>
            <h1 className="text-xl font-black text-ink">인지전 대응 플랫폼</h1>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <Status label="프로필" active={phase === "profile"} done={profile.realName.length > 1} />
          <Status label="진단" active={phase === "assessment"} done={answers.length === SCENARIOS.length} />
          <Status label="AI 문답" active={phase === "interview"} done={Boolean(analysis)} />
          <Status label="훈련" active={phase === "training"} done={false} />
        </div>
        <div className="mt-5 rounded-md bg-white p-4 text-sm leading-6 text-gray-700">
          <p className="font-bold text-ink">운영 설계 원칙</p>
          <p className="mt-1">CBTI 코드는 선택지 점수로 재현 가능하게 계산하고, AI는 자유 답변을 분석해 리포트와 훈련 추천을 상세화합니다.</p>
        </div>
      </aside>

      {phase === "profile" && (
        <section className="screen-panel rounded-lg p-5">
          <Header icon={<UserRound />} eyebrow="Profile" title="실명 기반 교육 프로필" />
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Input label="실명" value={profile.realName} onChange={(realName) => setProfile((value) => ({ ...value, realName }))} />
            <Input label="계급" value={profile.rank} onChange={(rank) => setProfile((value) => ({ ...value, rank }))} placeholder="예: 병장" />
            <Input label="소속" value={profile.unit} onChange={(unit) => setProfile((value) => ({ ...value, unit }))} placeholder="예: 1중대 2소대" />
          </div>
          <button
            disabled={!profile.realName || !profile.rank || !profile.unit}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={() => {
              setStartedAt(Date.now());
              setPhase("assessment");
            }}
          >
            진단 시작
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {phase === "assessment" && currentScenario && (
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="phone-shell rounded-[2rem] p-3">
            <div className="rounded-[1.5rem] bg-[#f8fafc] p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-bold text-gray-500">
                <span>{profile.rank} {profile.realName}</span>
                <span>{answers.length + 1}/{SCENARIOS.length}</span>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-signal">{currentScenario.sourceLabel}</p>
                <h2 className="mt-2 text-xl font-black leading-7 text-ink">{currentScenario.content.headline}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-700">{currentScenario.content.body}</p>
                <div className="mt-4 rounded-md bg-gray-100 p-3 text-sm text-gray-600">{currentScenario.content.visualCue}</div>
                <p className="mt-3 text-xs font-semibold text-gray-500">{currentScenario.content.meta}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {currentScenario.choices.map((choice) => (
                  <button key={choice.id} className="rounded-md border border-gray-200 bg-white p-3 text-left text-sm hover:border-field" onClick={() => choose(choice.id)}>
                    <span className="mr-2 font-black text-field">{choice.label}</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="screen-panel h-fit rounded-lg p-5">
            <Header icon={<Radar />} eyebrow="Scenario" title={currentScenario.title} />
            <div className="mt-4 grid gap-2">
              {currentScenario.content.signalNotes.map((note) => (
                <div key={note} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">{note}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === "interview" && result && (
        <section className="screen-panel rounded-lg p-5">
          <Header icon={<Bot />} eyebrow="AI Interview" title="취약점 상세화를 위한 문답" />
          <div className="mt-4 grid gap-3">
            {turns.map((turn, index) => (
              <div key={`${turn.question}-${index}`} className="rounded-md border border-gray-200 bg-white p-3">
                <p className="text-xs font-bold text-field">AI 질문 {index + 1}</p>
                <p className="mt-1 text-sm leading-6 text-gray-700">{turn.question}</p>
                <p className="mt-2 rounded-md bg-gray-50 p-2 text-sm leading-6 text-ink">{turn.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-field">질문 {turns.length + 1}/4</p>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                {questionSource === "ai" ? "Puter AI 생성" : "로컬 fallback"}
              </span>
            </div>
            {isQuestionLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                이전 답변과 선택 기록을 기반으로 다음 질문을 생성 중입니다.
              </div>
            ) : (
              <p className="mt-2 text-lg font-semibold leading-8 text-ink">{currentQuestion}</p>
            )}
          </div>
          <textarea
            className="mt-4 min-h-32 w-full rounded-md border border-gray-300 bg-white p-3 outline-none focus:border-field"
            value={draftAnswer}
            onChange={(event) => setDraftAnswer(event.target.value)}
            placeholder="선택 이유, 신뢰한 단서, 느낀 감정, 다음 대응을 구체적으로 적어주세요."
          />
          <button disabled={isAnalyzing || isQuestionLoading || !currentQuestion || !draftAnswer.trim()} className="mt-4 inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 font-semibold text-white disabled:bg-gray-300" onClick={submitTurn}>
            {isAnalyzing || isQuestionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {turns.length >= 3 ? "AI 분석 및 리포트 생성" : "다음 질문"}
          </button>
        </section>
      )}

      {phase === "report" && result && report && (
        <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="screen-panel rounded-lg p-5">
            <Header icon={<ClipboardCheck />} eyebrow="Report" title={report.headline} />
            <p className="mt-4 text-lg leading-8 text-gray-800">{report.summary}</p>
            <div className="mt-5">
              <ScoreBars result={result} />
            </div>
            <ReportBlock title="강점" items={report.strengths} />
            <ReportBlock title="취약점" items={report.weaknesses} />
            {report.aiFindings.length > 0 && <ReportBlock title="AI 문답 기반 근거" items={report.aiFindings} />}
            <ReportBlock title="개인 대응 원칙" items={report.principles} />
            <button className="mt-5 rounded-md bg-field px-4 py-2 font-semibold text-white" onClick={() => setPhase("training")}>추천 훈련 시작</button>
          </div>
          <div className="screen-panel h-fit rounded-lg p-5">
            <p className="text-sm font-bold text-gray-500">진단 신뢰도</p>
            <p className="mt-1 text-4xl font-black text-field">{Math.round(result.confidence * 100)}%</p>
            <p className="mt-4 text-sm leading-6 text-gray-700">{report.guidance}</p>
            <div className="mt-4 grid gap-2">
              {report.modules.map((module) => (
                <div key={module} className="rounded-md bg-white p-3 text-sm font-semibold text-gray-700">{module}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === "training" && <TrainingWorkspace />}
    </main>
  );
}

function Header({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-field text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">{eyebrow}</p>
        <h2 className="text-2xl font-black text-ink">{title}</h2>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-gray-700">
      {label}
      <input className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-field" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Status({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return <div className={`rounded-md border px-3 py-2 text-center font-bold ${active ? "border-field bg-emerald-50 text-field" : done ? "border-gray-200 bg-white text-ink" : "border-gray-200 bg-gray-50 text-gray-400"}`}>{label}</div>;
}

function ReportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-black text-ink">{title}</h3>
      <div className="mt-2 grid gap-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-700">{item}</div>
        ))}
      </div>
    </div>
  );
}
