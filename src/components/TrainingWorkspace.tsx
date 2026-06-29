"use client";

import { CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { TRAINING_MODULES } from "@/data/training";

export function TrainingWorkspace() {
  const module = TRAINING_MODULES[0];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string>();
  const [score, setScore] = useState(0);
  const item = module.items[index];
  const done = index >= module.items.length;
  const accuracy = useMemo(() => Math.round((score / module.items.length) * 100), [score, module.items.length]);

  if (done) {
    return (
      <section className="screen-panel rounded-lg p-6">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-field" />
          <div>
            <h2 className="text-xl font-bold">훈련 완료</h2>
            <p className="text-sm text-gray-600">정확도 {accuracy}%로 정보처리 루프를 완료했습니다.</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 text-sm font-semibold text-white"
          onClick={() => {
            setIndex(0);
            setSelected(undefined);
            setScore(0);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          다시 훈련
        </button>
      </section>
    );
  }

  const isAnswered = Boolean(selected);
  const correct = selected === item.correct;

  return (
    <section className="screen-panel rounded-lg p-5">
      <div className="mb-5 flex items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 text-field" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-field">Training Loop</p>
          <h2 className="text-xl font-bold">{module.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{module.description}</p>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold text-gray-500">노출 {index + 1}/{module.items.length}</p>
        <p className="mt-2 text-base font-semibold leading-7 text-gray-900">{item.prompt}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {item.choices.map((choice) => (
          <button
            key={choice.key}
            disabled={isAnswered}
            onClick={() => {
              setSelected(choice.key);
              if (choice.key === item.correct) setScore((value) => value + 1);
            }}
            className={`rounded-md border p-3 text-left text-sm transition ${
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
          <p className={`font-bold ${correct ? "text-field" : "text-alert"}`}>{correct ? "적절한 판단" : "보강 필요"}</p>
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

