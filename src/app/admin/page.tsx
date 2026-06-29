import { SCENARIOS } from "@/data/scenarios";
import { TRAINING_MODULES } from "@/data/training";

export default function AdminPage() {
  const scenarioCount = SCENARIOS.length;
  const choiceCount = SCENARIOS.reduce((sum, scenario) => sum + scenario.choices.length, 0);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">
      <section className="screen-panel rounded-lg p-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-field">Admin Preview</p>
        <h1 className="mt-2 text-3xl font-black text-ink">운영 대시보드</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">Supabase 연결 전에는 콘텐츠 준비 상태를 보여주고, 연결 후 cohort별 완료율과 취약 축 분포를 표시합니다.</p>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-4">
        <Metric label="진단 시나리오" value={scenarioCount} />
        <Metric label="선택지 점수표" value={choiceCount} />
        <Metric label="훈련 모듈" value={TRAINING_MODULES.length} />
        <Metric label="CBTI 유형" value={16} />
      </section>
      <section className="mt-5 grid gap-3">
        {SCENARIOS.map((scenario) => (
          <div key={scenario.id} className="rounded-md border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-ink">{scenario.title}</h2>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">{scenario.category}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{scenario.content.headline}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="screen-panel rounded-lg p-4">
      <p className="text-sm font-bold text-gray-500">{label}</p>
      <p className="mt-2 text-4xl font-black text-field">{value}</p>
    </div>
  );
}

