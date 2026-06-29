import { CBTI_TYPES } from "@/data/cbti-types";
import { SCENARIOS } from "@/data/scenarios";
import type {
  AiAnalysis,
  AssessmentAnswer,
  AssessmentResult,
  AxisLetter,
  AxisResult,
  CbtiCode,
  ScenarioChoice,
  ScoreVector
} from "@/lib/types";

const axisPairs = {
  information: ["V", "A"],
  emotion: ["S", "R"],
  priority: ["M", "P"],
  action: ["C", "W"]
} as const;

const defaultScores: ScoreVector = { V: 0, A: 0, S: 0, R: 0, M: 0, P: 0, C: 0, W: 0 };

export function calculateAssessment(answers: AssessmentAnswer[]): AssessmentResult {
  const selectedChoices = answers
    .map((answer) => {
      const scenario = SCENARIOS.find((item) => item.id === answer.scenarioId);
      const choice = scenario?.choices.find((item) => item.id === answer.choiceId);
      if (!scenario || !choice) return null;
      return { ...choice, scenario };
    })
    .filter(Boolean) as Array<ScenarioChoice & { scenario: (typeof SCENARIOS)[number] }>;

  const scores = selectedChoices.reduce<ScoreVector>((acc, choice) => {
    (Object.keys(acc) as AxisLetter[]).forEach((key) => {
      acc[key] += choice.score[key];
    });
    return acc;
  }, { ...defaultScores });

  const axes = {
    information: axisResult("V", "A", scores),
    emotion: axisResult("S", "R", scores),
    priority: axisResult("M", "P", scores),
    action: axisResult("C", "W", scores)
  };

  const code = `${axes.information.selected}${axes.emotion.selected}${axes.priority.selected}${axes.action.selected}` as CbtiCode;
  const type = CBTI_TYPES[code];
  const weaknesses = rankWeaknesses(axes);
  const highRiskTags = selectedChoices.flatMap((choice) => choice.riskTags);

  return {
    code,
    typeName: type.name,
    summary: type.summary,
    scores,
    axes,
    confidence: confidenceScore(answers, axes),
    primaryWeakness: weaknesses[0],
    secondaryWeakness: weaknesses[1],
    highRiskTags: topTags(highRiskTags),
    selectedChoices
  };
}

function axisResult(left: AxisLetter, right: AxisLetter, scores: ScoreVector): AxisResult {
  const leftScore = scores[left];
  const rightScore = scores[right];
  const selected = leftScore >= rightScore ? left : right;
  return {
    left,
    right,
    leftScore,
    rightScore,
    selected,
    margin: Math.abs(leftScore - rightScore)
  };
}

function confidenceScore(answers: AssessmentAnswer[], axes: AssessmentResult["axes"]): number {
  const coverage = Math.min(1, answers.length / SCENARIOS.length);
  const averageMargin =
    Object.values(axes).reduce((sum, axis) => sum + Math.min(axis.margin, 8) / 8, 0) / 4;
  const responseQuality =
    answers.reduce((sum, answer) => {
      const seconds = answer.responseTimeMs / 1000;
      if (seconds < 1.2) return sum + 0.35;
      if (seconds > 90) return sum + 0.65;
      return sum + 1;
    }, 0) / Math.max(answers.length, 1);

  return round2(0.45 * averageMargin + 0.35 * coverage + 0.2 * responseQuality);
}

function rankWeaknesses(axes: AssessmentResult["axes"]): AxisLetter[] {
  const weaknessSide: Record<keyof typeof axisPairs, AxisLetter> = {
    information: "A",
    emotion: "R",
    priority: "P",
    action: "W"
  };

  return Object.entries(axes)
    .map(([key, axis]) => {
      const weak = weaknessSide[key as keyof typeof axisPairs];
      const weakScore = axis.left === weak ? axis.leftScore : axis.rightScore;
      const strongScore = axis.left === weak ? axis.rightScore : axis.leftScore;
      return { axis: weak, risk: weakScore - strongScore };
    })
    .sort((a, b) => b.risk - a.risk)
    .map((item) => item.axis);
}

function topTags(tags: string[]): string[] {
  const counts = tags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function mergeAiAnalysis(result: AssessmentResult, analysis?: AiAnalysis) {
  const type = CBTI_TYPES[result.code];
  const modules = analysis?.recommended_training_modules ?? recommendedModules(result);
  const aiGuidance =
    analysis && analysis.detected_triggers.length
      ? `${type.guidance} AI 문답에서는 ${analysis.detected_triggers.slice(0, 2).join(", ")} 자극이 주요 판단 변수로 확인되었습니다.`
      : type.guidance;

  return {
    headline: `${result.code} ${result.typeName}`,
    summary: buildSummary(result, analysis),
    guidance: aiGuidance,
    strengths: buildStrengths(result, analysis),
    weaknesses: buildWeaknesses(result, analysis),
    modules,
    principles: buildPrinciples(result, analysis),
    aiFindings: buildAiFindings(analysis)
  };
}

export function recommendedModules(result: AssessmentResult): string[] {
  const map: Record<AxisLetter, string> = {
    A: "information_verification",
    R: "emotion_stabilization",
    P: "mission_priority",
    W: "counter_action",
    V: "advanced_verification",
    S: "stress_resilience",
    M: "mission_leadership",
    C: "response_leadership"
  };
  return [map[result.primaryWeakness], map[result.secondaryWeakness]];
}

function buildSummary(result: AssessmentResult, analysis?: AiAnalysis): string {
  if (!analysis) return result.summary;
  const triggers = analysis.detected_triggers.slice(0, 2).join(", ");
  const pattern = analysis.reasoning_patterns[0];
  const note = analysis.report_notes || result.summary;
  return triggers || pattern
    ? `${note} 특히 AI 문답에서는 ${triggers || "특정 자극"}에 대한 반응과 "${pattern || "판단 근거를 재점검하려는 태도"}"가 최종 훈련 추천에 반영되었습니다.`
    : note;
}

function buildStrengths(result: AssessmentResult, analysis?: AiAnalysis): string[] {
  const strengths: string[] = [];
  if (result.axes.information.selected === "V") strengths.push("미확인 정보를 바로 믿지 않고 출처를 확인하려는 감각이 있습니다.");
  if (result.axes.emotion.selected === "S") strengths.push("감정 자극이 있어도 판단을 유지하는 안정성이 있습니다.");
  if (result.axes.priority.selected === "M") strengths.push("개인 감정보다 임무와 부대 기준을 우선하려는 경향이 있습니다.");
  if (result.axes.action.selected === "C") strengths.push("위협 신호를 발견했을 때 신고나 대응 행동으로 전환할 수 있습니다.");
  analysis?.protective_factors.forEach((factor) => strengths.push(`AI 문답 보호요인: ${factor}`));
  return strengths.length ? [...new Set(strengths)].slice(0, 6) : ["위협 상황을 경험한 뒤 자신의 반응을 되돌아볼 수 있는 점이 훈련의 출발점입니다."];
}

function buildWeaknesses(result: AssessmentResult, analysis?: AiAnalysis): string[] {
  const items: string[] = [];
  if (result.axes.information.selected === "A") items.push("그럴듯한 수치, 영상, 카드뉴스를 검증 전 사실로 받아들일 수 있습니다.");
  if (result.axes.emotion.selected === "R") items.push("조롱, 고립감, 가족 위협처럼 감정을 누르는 자극에 판단 속도가 흔들릴 수 있습니다.");
  if (result.axes.priority.selected === "P") items.push("강한 개인 불안이 임무 기준보다 먼저 떠오를 수 있습니다.");
  if (result.axes.action.selected === "W") items.push("위협을 알아차려도 혼자 참거나 넘기면서 조직적 대응으로 연결하지 못할 수 있습니다.");
  analysis?.reasoning_patterns.forEach((pattern) => items.push(`AI 문답 사고패턴: ${pattern}`));
  analysis?.behavior_risks.forEach((risk) => items.push(risk));
  return [...new Set(items)].slice(0, 6);
}

function buildPrinciples(result: AssessmentResult, analysis?: AiAnalysis): string[] {
  const triggers = analysis?.detected_triggers?.slice(0, 2).join(", ");
  return [
    "숫자, 영상, 긴급 문구를 보더라도 원본 출처와 공식 채널을 먼저 확인한다.",
    "감정이 먼저 올라오면 공유하지 않고 30초 멈춘 뒤 사실 단서와 감정 표현을 분리한다.",
    "임무, 부대 안전, 공식 절차 기준으로 행동을 선택한다.",
    "위협 신호가 반복되거나 표적화되어 있으면 캡처 후 지정 채널로 보고한다.",
    triggers ? `${triggers} 자극에는 특히 공유 전 검증 절차를 적용한다.` : "좋은 의도의 공유라도 검증 전 확산은 하지 않는다."
  ].slice(0, result.confidence < 0.55 ? 5 : 4);
}

function buildAiFindings(analysis?: AiAnalysis): string[] {
  if (!analysis) return [];
  const findings = [
    analysis.detected_triggers.length ? `취약 자극: ${analysis.detected_triggers.join(", ")}` : "",
    analysis.reasoning_patterns.length ? `판단 패턴: ${analysis.reasoning_patterns.join(" / ")}` : "",
    analysis.behavior_risks.length ? `행동 위험: ${analysis.behavior_risks.join(" / ")}` : "",
    analysis.protective_factors.length ? `보호 요인: ${analysis.protective_factors.join(" / ")}` : "",
    `AI-진단 정합도: ${Math.round(analysis.ai_alignment_score * 100)}%`
  ].filter(Boolean);

  return findings.slice(0, 5);
}
