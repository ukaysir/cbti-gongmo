import type { AssessmentResult } from "@/lib/types";

const labels = {
  information: ["V 검증", "A 수용"],
  emotion: ["S 안정", "R 동요"],
  priority: ["M 임무", "P 개인"],
  action: ["C 대응", "W 회피"]
} as const;

export function ScoreBars({ result }: { result: AssessmentResult }) {
  return (
    <div className="grid gap-3">
      {Object.entries(result.axes).map(([key, axis]) => {
        const total = Math.max(axis.leftScore + axis.rightScore, 1);
        const leftWidth = Math.round((axis.leftScore / total) * 100);
        const pair = labels[key as keyof typeof labels];
        return (
          <div key={key} className="rounded-md border border-gray-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>{pair[0]}</span>
              <span className="text-xs text-gray-500">선택: {axis.selected}</span>
              <span>{pair[1]}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-field" style={{ width: `${leftWidth}%` }} />
              <div className="bg-alert" style={{ width: `${100 - leftWidth}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{axis.leftScore}점</span>
              <span>{axis.rightScore}점</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

