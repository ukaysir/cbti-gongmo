"use client";

import { CheckCircle2, RotateCcw, ShieldCheck, Target, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { TRAINING_MODULES } from "@/data/training";

interface TrainingWorkspaceProps {
  onPassed?: (summary: TrainingSummary) => void;
}

export interface TrainingSummary {
  score: number;
  total: number;
  accuracy: number;
  passed: boolean;
  missedItems: string[];
}

export function TrainingWorkspace({ onPassed }: TrainingWorkspaceProps) {
  const module = TRAINING_MODULES[0];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [correctCount, setCorrectCount] = useState(0);
  const [missedItems, setMissedItems] = useState<string[]>([]);
  const item = module.items[index];
  const done = index >= module.items.length;
  const accuracy = useMemo(() => Math.round((correctCount / module.items.length) * 100), [correctCount, module.items.length]);
  const passed = done && accuracy >= module.passScore;

  function reset() {
    setIndex(0);
    setSelected(undefined);
    setCorrectCount(0);
    setMissedItems([]);
  }

  if (done) {
    return (
      <section className="screen-panel rounded-lg p-6">
        <div className="mb-5 flex items-start gap-3">
          {passed ? <CheckCircle2 className="mt-1 h-7 w-7 text-field" /> : <XCircle className="mt-1 h-7 w-7 text-alert" />}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-field">Training Result</p>
            <h2 className="text-2xl font-black">{passed ? "훈련 통과" : "훈련 재시도 필요"}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {correctCount}/{module.items.length}문항 정답, 정확도 {accuracy}%. 통과 기준은 {module.passScore}%입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="정답" value={`${correctCount}/${module.items.length}`} />
          <Metric label="정확도" value={`${accuracy}%`} />
          <Metric label="통과 기준" value={`${module.passScore}%`} />
        </div>

        {missedItems.length > 0 && (
          <div className="mt-5 rounded-md border border-gray-200 bg-white p-4">
            <p className="font-bold text-ink">보강 필요 항목</p>
            <div className="mt-2 grid gap-2">
              {missedItems.map((missed) => (
                <div key={missed} className="rounded-md bg-red-50 px-3 py-2 text-sm text-alert">{missed}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            다시 훈련
          </button>
          {passed && (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 text-sm font-semibold text-white"
              onClick={() =>
                onPassed?.({
                  score: correctCount,
                  total: module.items.length,
                  accuracy,
                  passed,
                  missedItems
                })
              }
            >
              <Target className="h-4 w-4" />
              재진단 진행
            </button>
          )}
        </div>
      </section>
    );
  }

  const isAnswered = Boolean(selected);
  const correct = selected === item.correct;
  const progress = Math.round((index / module.items.length) * 100);

  return (
    <section className="screen-panel rounded-lg p-5">
      <div className="mb-5 flex items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 text-field" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">Training Loop</p>
          <h2 className="text-xl font-bold">{module.title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">{module.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs font-bold text-gray-500">
          <span>진행률 {index + 1}/{module.items.length}</span>
          <span>현재 정확도 {index === 0 ? 0 : Math.round((correctCount / index) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-field transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{item.threat}</span>
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-field">통과 기준 {module.passScore}%</span>
        </div>
        <p className="text-base font-semibold leading-7 text-gray-900">{item.prompt}</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {item.cues.map((cue) => (
            <div key={cue} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              검토 단서: {cue}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {item.choices.map((choice) => (
          <button
            key={choice.key}
            disabled={isAnswered}
            onClick={() => {
              setSelected(choice.key);
              if (choice.key === item.correct) {
                setCorrectCount((value) => value + 1);
              } else {
                setMissedItems((value) => [...value, `${item.threat}: ${item.principle}`]);
              }
            }}
            className={`rounded-md border p-3 text-left text-sm leading-6 transition ${
              selected === choice.key
                ? choice.key === item.correct
                  ? "border-field bg-emerald-50"
                  : "border-alert bg-red-50"
                : "border-gray-200 bg-white hover:border-field"
            }`}
          >
            <span className="mr-2 font-bold">{choice.key}</span>
            {choice.text}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className={`font-bold ${correct ? "text-field" : "text-alert"}`}>{correct ? "검증 절차 적합" : "판단 보강 필요"}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{item.principle}</p>
          <p className="mt-1 text-sm leading-6 text-gray-700">{item.feedback}</p>
          <button
            className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setSelected(undefined);
              setIndex((value) => value + 1);
            }}
          >
            다음 상황
          </button>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <p className="text-xs font-bold text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-field">{value}</p>
    </div>
  );
}
