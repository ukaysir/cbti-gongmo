import type { AiAnalysis, AiInterviewTurn, AssessmentResult, AxisLetter } from "@/lib/types";
import { recommendedModules } from "@/lib/cbti";

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string | Array<{ role: string; content: string }>, options?: Record<string, unknown>) => Promise<string | { message?: { content?: string }; text?: string }>;
      };
      auth?: {
        signIn?: () => Promise<unknown>;
        isSignedIn?: () => Promise<boolean>;
      };
    };
  }
}

export async function ensurePuterLoaded(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.puter?.ai?.chat) return true;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-puter]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Puter.js load failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.dataset.puter = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Puter.js load failed"));
    document.head.appendChild(script);
  });

  return Boolean(window.puter?.ai?.chat);
}

export async function generateInterviewQuestion(result: AssessmentResult, turns: AiInterviewTurn[]): Promise<string> {
  const fallback = fallbackInterviewQuestion(result, turns);
  const loaded = await ensurePuterLoaded();
  if (!loaded || !window.puter?.ai?.chat) return fallback;

  const response = await window.puter.ai.chat(buildQuestionPrompt(result, turns), {
    model: "gpt-4o-mini",
    temperature: 0.55
  });
  const text = cleanText(typeof response === "string" ? response : response.message?.content ?? response.text ?? "");
  return text.length >= 12 ? text : fallback;
}

export function fallbackInterviewQuestion(result: AssessmentResult, turns: AiInterviewTurn[]): string {
  const weakScenario = result.selectedChoices
    .filter((choice) => choice.riskTags.length > 0)
    .at(-1);
  const lastAnswer = turns.at(-1)?.answer ?? "";

  const questions = [
    `방금 "${weakScenario?.scenario.title ?? "가장 인상 깊었던 상황"}"에서 선택한 판단의 가장 큰 근거는 무엇이었나요?`,
    lastAnswer.includes("숫자") || lastAnswer.includes("80")
      ? "방금 숫자나 여론 수치가 영향을 줬다고 했습니다. 그 수치의 조사 기관, 표본, 원문 링크 중 무엇을 먼저 확인해야 한다고 보나요?"
      : "방금 답변에서 사실이라고 느낀 단서가 있었습니다. 출처, 댓글 반응, 영상 형태, 주변 분위기 중 무엇이 가장 크게 작용했나요?",
    lastAnswer.includes("불안") || lastAnswer.includes("화") || lastAnswer.includes("무력")
      ? "그 감정이 올라온 상태에서 바로 행동하면 어떤 실수가 생길 수 있나요? 공유, 회피, 임무 집중 중 하나를 골라 설명해 주세요."
      : "그 판단이 실제 행동으로 이어진다면 어떤 위험이 생길 수 있다고 보나요?",
    "같은 상황을 다시 만나면 공식 확인, 보고, 공유 중 무엇을 먼저 하겠습니까?"
  ];

  return questions[Math.min(turns.length, questions.length - 1)];
}

function buildQuestionPrompt(result: AssessmentResult, turns: AiInterviewTurn[]): string {
  const last = turns.at(-1);
  return `
당신은 군 장병 대상 인지전 대응 교육 플랫폼의 AI 면담관입니다.
목표는 사용자의 이전 답변을 바탕으로 다음 질문 1개만 생성하는 것입니다.
최종 CBTI 코드는 바꾸지 말고, 취약 축을 더 정확히 판별하기 위한 후속 질문을 하십시오.

질문 작성 규칙:
- 한국어로 한 문장 또는 짧은 두 문장
- 비난, 낙인, 심리 치료 표현 금지
- 이전 답변의 구체 표현을 반드시 하나 이상 반영
- 사용자가 출처 확인, 감정 반응, 임무 기준, 신고/회피 중 무엇이 작동했는지 말하게 만들 것
- 답변 예시나 해설을 붙이지 말 것
- 질문만 출력

서버 계산 결과:
- CBTI: ${result.code} ${result.typeName}
- primaryWeakness: ${result.primaryWeakness}
- secondaryWeakness: ${result.secondaryWeakness}
- riskTags: ${result.highRiskTags.join(", ")}

선택 기록:
${result.selectedChoices.map((choice) => `- ${choice.scenario.title}: "${choice.text}" / risk=${choice.riskTags.join(",")}`).join("\n")}

이전 문답:
${turns.length ? turns.map((turn, index) => `${index + 1}. AI: ${turn.question}\n사용자: ${turn.answer}`).join("\n") : "아직 없음"}

${last ? `직전 사용자 답변에서 반드시 반영할 표현: "${last.answer.slice(0, 120)}"` : "첫 질문이므로 가장 위험도가 높은 선택의 판단 근거를 물어보십시오."}
`;
}

export async function analyzeWithPuter(result: AssessmentResult, turns: AiInterviewTurn[]): Promise<AiAnalysis> {
  const loaded = await ensurePuterLoaded();
  if (!loaded || !window.puter?.ai?.chat) return fallbackAnalysis(result, turns);

  const prompt = buildAnalysisPrompt(result, turns);
  const response = await window.puter.ai.chat(prompt, {
    model: "gpt-4o-mini",
    temperature: 0.2
  });

  const text = typeof response === "string" ? response : response.message?.content ?? response.text ?? "";
  const parsed = extractJson(text);
  return normalizeAnalysis(parsed, result, turns);
}

function buildAnalysisPrompt(result: AssessmentResult, turns: AiInterviewTurn[]): string {
  return `
당신은 군 장병 대상 인지전 대응 교육 플랫폼의 분석 보조 AI입니다.
최종 CBTI 유형 코드는 서버 계산값을 절대 변경하지 마십시오.
사용자 답변에서 취약 자극, 사고 패턴, 행동 위험, 보호 요인을 분석해 JSON만 출력하십시오.
리포트 문장은 사용자가 실제로 한 답변의 표현을 반영해 구체적으로 작성하십시오.

서버 계산 결과:
- CBTI: ${result.code} ${result.typeName}
- primaryWeakness: ${result.primaryWeakness}
- secondaryWeakness: ${result.secondaryWeakness}
- highRiskTags: ${result.highRiskTags.join(", ")}

선택 기록:
${result.selectedChoices.map((choice) => `- ${choice.scenario.title}: ${choice.text} / tags=${choice.riskTags.join(",")}`).join("\n")}

AI 문답:
${turns.map((turn, index) => `${index + 1}. Q: ${turn.question}\nA: ${turn.answer}`).join("\n")}

반드시 아래 JSON 스키마만 출력:
{
  "primary_vulnerability_axis": "A|R|P|W|V|S|M|C",
  "secondary_vulnerability_axis": "A|R|P|W|V|S|M|C",
  "detected_triggers": ["string"],
  "reasoning_patterns": ["string"],
  "behavior_risks": ["string"],
  "protective_factors": ["string"],
  "recommended_training_modules": ["information_verification|emotion_stabilization|mission_priority|counter_action"],
  "ai_alignment_score": 0.0,
  "report_notes": "사용자 답변의 구체 내용을 반영한 3-5문장 상세 분석"
}
`;
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

function normalizeAnalysis(value: unknown, result: AssessmentResult, turns: AiInterviewTurn[]): AiAnalysis {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const fallback = fallbackAnalysis(result, turns);
  return {
    primary_vulnerability_axis: axis(input.primary_vulnerability_axis) ?? fallback.primary_vulnerability_axis,
    secondary_vulnerability_axis: axis(input.secondary_vulnerability_axis) ?? fallback.secondary_vulnerability_axis,
    detected_triggers: strings(input.detected_triggers, fallback.detected_triggers),
    reasoning_patterns: strings(input.reasoning_patterns, fallback.reasoning_patterns),
    behavior_risks: strings(input.behavior_risks, fallback.behavior_risks),
    protective_factors: strings(input.protective_factors, fallback.protective_factors),
    recommended_training_modules: strings(input.recommended_training_modules, fallback.recommended_training_modules),
    ai_alignment_score: typeof input.ai_alignment_score === "number" ? Math.max(0, Math.min(1, input.ai_alignment_score)) : fallback.ai_alignment_score,
    report_notes: typeof input.report_notes === "string" ? input.report_notes : fallback.report_notes
  };
}

export function fallbackAnalysis(result: AssessmentResult, turns: AiInterviewTurn[]): AiAnalysis {
  const answerText = turns.map((turn) => turn.answer).join(" ");
  const triggers = [
    answerText.includes("숫자") || result.highRiskTags.includes("stat_check") ? "구체적인 수치" : "",
    answerText.includes("댓글") || result.highRiskTags.includes("engagement_trap") ? "다수 댓글과 반응" : "",
    answerText.includes("가족") || result.highRiskTags.includes("family_trigger") ? "가족 안전 위협" : "",
    result.highRiskTags.includes("authority_deception") ? "권위자 영상" : "",
    result.highRiskTags.includes("isolation") ? "고립감 자극" : ""
  ].filter(Boolean);

  return {
    primary_vulnerability_axis: result.primaryWeakness,
    secondary_vulnerability_axis: result.secondaryWeakness,
    detected_triggers: triggers.length ? triggers : result.highRiskTags.slice(0, 3),
    reasoning_patterns: ["시각적 단서와 사회적 반응을 사실성의 근거로 해석할 가능성이 있습니다."],
    behavior_risks: result.highRiskTags.includes("unverified_spread")
      ? ["검증 전 내부 공유로 혼란을 확산시킬 수 있습니다."]
      : ["위협을 인지해도 조직적 보고 절차로 전환이 늦어질 수 있습니다."],
    protective_factors: ["문답 과정에서 자신의 판단 근거를 되돌아볼 수 있습니다."],
    recommended_training_modules: recommendedModules(result),
    ai_alignment_score: 0.72,
    report_notes: `${result.typeName} 경향이 나타났습니다. 선택 기록상 ${result.primaryWeakness} 축 보강이 우선이며, 문답 내용은 검증 절차와 행동 전환 훈련이 필요함을 보여줍니다.`
  };
}

function axis(value: unknown): AxisLetter | undefined {
  const allowed = ["V", "A", "S", "R", "M", "P", "C", "W"];
  return typeof value === "string" && allowed.includes(value) ? (value as AxisLetter) : undefined;
}

function strings(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value.slice(0, 8) : fallback;
}

function cleanText(value: string): string {
  return value
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^질문\s*[:：]\s*/i, "")
    .trim();
}
