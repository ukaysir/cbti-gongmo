export type AxisLetter = "V" | "A" | "S" | "R" | "M" | "P" | "C" | "W";
export type CbtiCode = `${"V" | "A"}${"S" | "R"}${"M" | "P"}${"C" | "W"}`;

export type ScoreVector = Record<AxisLetter, number>;

export type ScenarioType =
  | "fake_social_post"
  | "fake_news_card"
  | "sms_threat"
  | "deepfake_video_mock"
  | "comment_thread"
  | "poll_manipulation";

export interface ScenarioChoice {
  id: string;
  label: "A" | "B" | "C" | "D";
  text: string;
  score: ScoreVector;
  riskTags: string[];
  feedback: string;
}

export interface Scenario {
  id: string;
  category: "information" | "emotion" | "priority" | "action";
  type: ScenarioType;
  title: string;
  sourceLabel: string;
  content: {
    headline: string;
    body: string;
    meta: string;
    visualCue: string;
    signalNotes: string[];
  };
  choices: ScenarioChoice[];
}

export interface ProfileDraft {
  realName: string;
  rank: string;
  unit: string;
}

export interface AssessmentAnswer {
  scenarioId: string;
  choiceId: string;
  responseTimeMs: number;
}

export interface AxisResult {
  left: AxisLetter;
  right: AxisLetter;
  leftScore: number;
  rightScore: number;
  selected: AxisLetter;
  margin: number;
}

export interface AssessmentResult {
  code: CbtiCode;
  typeName: string;
  summary: string;
  scores: ScoreVector;
  axes: {
    information: AxisResult;
    emotion: AxisResult;
    priority: AxisResult;
    action: AxisResult;
  };
  confidence: number;
  primaryWeakness: AxisLetter;
  secondaryWeakness: AxisLetter;
  highRiskTags: string[];
  selectedChoices: Array<ScenarioChoice & { scenario: Scenario }>;
}

export interface AiInterviewTurn {
  question: string;
  answer: string;
}

export interface AiAnalysis {
  primary_vulnerability_axis: AxisLetter;
  secondary_vulnerability_axis: AxisLetter;
  detected_triggers: string[];
  reasoning_patterns: string[];
  behavior_risks: string[];
  protective_factors: string[];
  recommended_training_modules: string[];
  ai_alignment_score: number;
  report_notes: string;
}

