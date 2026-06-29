import type { Scenario, ScoreVector } from "@/lib/types";

const zero: ScoreVector = { V: 0, A: 0, S: 0, R: 0, M: 0, P: 0, C: 0, W: 0 };

function score(partial: Partial<ScoreVector>): ScoreVector {
  return { ...zero, ...partial };
}

export const SCENARIOS: Scenario[] = [
  {
    id: "fake-abuse-tweet",
    category: "information",
    type: "fake_social_post",
    title: "아군 간 가혹행위 조작 트윗",
    sourceLabel: "익명 군 제보 계정",
    content: {
      headline: "전방부대 내부 폭로: 지휘부가 은폐 중",
      body: "방금 올라온 영상이라며 가혹행위 장면 일부가 짧게 편집되어 퍼지고 있습니다. 댓글은 분노와 부대 비난으로 빠르게 늘어납니다.",
      meta: "조회 18.4만 / 공유 7,212 / 원본 링크 없음",
      visualCue: "흔들린 화면, 잘린 자막, 워터마크가 다른 계정명으로 덮여 있음",
      signalNotes: ["원본 출처 없음", "감정적 표현 과다", "영상 맥락 미확인"]
    },
    choices: [
      { id: "a", label: "A", text: "영상 속 장소·복장·계정 이력을 대조하고, 원본이 확인되기 전에는 교육 담당자에게 캡처만 보고한다.", score: score({ V: 3, S: 2, M: 2, C: 2 }), riskTags: ["source_check", "controlled_report"], feedback: "원본 맥락과 계정 이력을 확인하면서 확산 없이 보고하는 선택입니다." },
      { id: "b", label: "B", text: "영상이 짧고 자극적이라 조작 가능성은 있어 보이지만, 논란을 키우지 않기 위해 일단 개인적으로만 저장한다.", score: score({ V: 1, S: 1, P: 1, W: 2 }), riskTags: ["private_hoarding", "underreporting"], feedback: "조작 가능성을 감지했지만 조직적 확인과 보고로 이어지지 않았습니다." },
      { id: "c", label: "C", text: "댓글에 같은 부대명이 반복되어 완전히 무시하긴 어렵다고 보고, 주변 반응을 먼저 살핀 뒤 판단한다.", score: score({ A: 2, R: 2, P: 1, W: 1 }), riskTags: ["social_proof", "uncertainty"], feedback: "댓글 반복은 여론조작 신호일 수 있습니다. 주변 반응보다 원본과 공식 확인이 먼저입니다." },
      { id: "d", label: "D", text: "부대 명예 문제라 빠르게 해명해야 한다고 생각해, '확인 필요'라는 말과 함께 분대방에 공유한다.", score: score({ A: 2, R: 2, M: 1, C: 1 }), riskTags: ["unverified_spread", "justified_sharing"], feedback: "확인 필요 문구를 붙여도 미검증 원문을 공유하면 확산에 기여할 수 있습니다." }
    ]
  },
  {
    id: "deepfake-surrender",
    category: "information",
    type: "deepfake_video_mock",
    title: "가짜 항복 영상",
    sourceLabel: "짧은 영상 플랫폼 추천 피드",
    content: {
      headline: "긴급: 최고 지휘부 항복 명령 발표",
      body: "군복을 입은 인물이 무기를 내려놓으라고 말하는 18초 영상이 돌고 있습니다. 음성과 입 모양이 일부 어긋나지만 댓글은 이미 혼란 상태입니다.",
      meta: "업로드 11분 전 / 원본 계정 생성 2일 전",
      visualCue: "입 모양 지연, 음성 톤 불일치, 로고 흐림",
      signalNotes: ["신규 계정", "영상 합성 흔적", "공식 발표 없음"]
    },
    choices: [
      { id: "a", label: "A", text: "입 모양과 계정 생성일이 수상하므로, 공식 발표와 지휘 라인 확인 전에는 명령으로 받아들이지 않는다.", score: score({ V: 3, S: 2, M: 2, C: 2 }), riskTags: ["official_check", "deepfake_cue"], feedback: "영상 단서와 공식 지휘 체계를 함께 확인하는 고신뢰 대응입니다." },
      { id: "b", label: "B", text: "합성일 수도 있지만 영상 속 인물이 너무 비슷해 보여, 조용히 몇 명에게만 사실 여부를 물어본다.", score: score({ A: 2, R: 1, P: 1, W: 1 }), riskTags: ["authority_deception", "informal_check"], feedback: "비공식 확인은 소문 확산으로 바뀔 수 있습니다. 공식 라인을 먼저 써야 합니다." },
      { id: "c", label: "C", text: "공식 발표가 없다는 점은 걸리지만, 댓글에서 '이미 다른 부대도 봤다'는 말이 많아 상황이 심각하다고 판단한다.", score: score({ A: 3, R: 2, P: 1, W: 1 }), riskTags: ["social_proof", "collapse_anxiety"], feedback: "다수 댓글은 사실성보다 조작 규모를 보여주는 신호일 수 있습니다." },
      { id: "d", label: "D", text: "혹시 진짜면 늦게 알리는 것이 더 위험하므로, 영상 링크 대신 캡처와 요약을 공유한다.", score: score({ A: 2, R: 2, M: 1, C: 1 }), riskTags: ["unverified_spread", "urgency"], feedback: "링크가 아니어도 미확인 핵심 내용을 퍼뜨리면 동일한 혼란이 발생합니다." }
    ]
  },
  {
    id: "mocking-instagram",
    category: "emotion",
    type: "fake_social_post",
    title: "국군 조롱 인스타 게시물",
    sourceLabel: "여론조사 카드뉴스 계정",
    content: {
      headline: "국민 80%가 전방 사단 포기 찬성 #각자도생",
      body: "그럴듯한 그래프와 조롱성 문구가 결합된 게시물입니다. 댓글은 부대를 비웃고 장병의 고립감을 자극합니다.",
      meta: "조사 기관 미표기 / 표본 수 미표기",
      visualCue: "막대그래프만 있고 조사 방식 설명 없음",
      signalNotes: ["숫자 권위 효과", "고립감 자극", "출처 부재"]
    },
    choices: [
      { id: "a", label: "A", text: "80%라는 수치보다 조사 주체·표본·원문 유무를 먼저 확인하고, 근거가 없으면 판단을 보류한다.", score: score({ V: 3, S: 2, M: 1, C: 1 }), riskTags: ["stat_check"], feedback: "구체적 수치를 검증 대상으로 본 점이 핵심입니다." },
      { id: "b", label: "B", text: "숫자 근거는 부족해 보이지만 댓글 분위기가 너무 일관돼, 실제 여론이 나빠진 신호로 받아들인다.", score: score({ A: 3, R: 2, P: 1, W: 1 }), riskTags: ["social_proof", "isolation"], feedback: "댓글 일관성은 사실성보다 조작된 다수감의 신호일 수 있습니다." },
      { id: "c", label: "C", text: "기분은 나쁘지만 논쟁에 참여하지 않고, 같은 계정이 반복적으로 올렸는지 확인해 신고 여부를 판단한다.", score: score({ V: 2, S: 2, M: 1, C: 2 }), riskTags: ["pattern_check", "controlled_report"], feedback: "감정 대응을 줄이고 반복 패턴을 확인하는 균형 잡힌 대응입니다." },
      { id: "d", label: "D", text: "아군 사기를 위해 반박 자료가 필요하다고 보고, 게시물을 캡처해 단톡방에 올려 의견을 모은다.", score: score({ A: 1, R: 2, M: 1, C: 1 }), riskTags: ["engagement_trap", "unverified_spread"], feedback: "반박 목적이라도 원문 확산과 감정 동원을 유발할 수 있습니다." }
    ]
  },
  {
    id: "family-sms",
    category: "emotion",
    type: "sms_threat",
    title: "가족 위험 표적 문자",
    sourceLabel: "알 수 없는 번호",
    content: {
      headline: "[긴급] 가족 거주지 인근 위험 발생",
      body: "당신의 이름과 가족 지역을 언급하며 지금 즉시 연락하지 않으면 늦는다는 문자가 도착했습니다.",
      meta: "링크 포함 / 발신 번호 해외 중계",
      visualCue: "개인정보 일부와 단축 URL이 함께 표시됨",
      signalNotes: ["표적화", "시간 압박", "단축 URL"]
    },
    choices: [
      { id: "a", label: "A", text: "문자에 나온 링크는 열지 않고, 기존에 알고 있던 가족 연락처와 부대 보고 절차로 동시에 확인한다.", score: score({ V: 3, S: 2, M: 2, C: 2 }), riskTags: ["link_avoidance", "official_check"], feedback: "새 링크가 아니라 기존 신뢰 채널로 확인하는 것이 핵심입니다." },
      { id: "b", label: "B", text: "이름과 지역이 맞아 보여 위험 신호로 여기되, 링크 대신 문자 내용을 검색해 비슷한 사례가 있는지 먼저 본다.", score: score({ V: 2, R: 1, P: 1, W: 1 }), riskTags: ["partial_verification", "family_trigger"], feedback: "링크를 피한 점은 좋지만 검색만으로 끝내지 말고 공식 확인으로 이어져야 합니다." },
      { id: "c", label: "C", text: "가족이 걸린 문제라 공식 절차보다 빠른 확인이 중요하다고 보고, 링크 미리보기만 확인한다.", score: score({ A: 3, R: 3, P: 2, W: 1 }), riskTags: ["phishing", "urgency"], feedback: "미리보기나 일부 클릭도 추적과 피싱 위험이 있습니다." },
      { id: "d", label: "D", text: "나만 받은 문자인지 확인하려고 원문과 번호를 동료에게 보여주며 같은 사례가 있는지 묻는다.", score: score({ V: 1, R: 2, P: 1, C: 1 }), riskTags: ["informal_check", "privacy_spread"], feedback: "사례 확인 의도는 이해되지만 개인정보와 악성 링크가 확산될 수 있습니다." }
    ]
  },
  {
    id: "commander-desertion",
    category: "priority",
    type: "sms_threat",
    title: "지휘관 탈영 허위 문자",
    sourceLabel: "익명 제보 문자",
    content: {
      headline: "네 지휘관은 이미 빠져나갔다",
      body: "지휘관이 탈영했고 남은 병력만 버려졌다는 문자가 여러 명에게 동시에 도착했습니다.",
      meta: "동일 문구 반복 수신 / 발신 번호 변조 의심",
      visualCue: "군 내부 용어를 섞었지만 세부 호칭이 어색함",
      signalNotes: ["지휘 신뢰 공격", "동시 표적 문자", "임무 이탈 유도"]
    },
    choices: [
      { id: "a", label: "A", text: "문구와 발신번호를 보존하되, 단톡방 확산 없이 지휘 체계로 확인하고 동일 수신 여부를 절차대로 파악한다.", score: score({ V: 3, S: 2, M: 3, C: 2 }), riskTags: ["command_check", "controlled_report"], feedback: "지휘 신뢰 공격은 개인 추측이 아니라 체계 확인으로 대응해야 합니다." },
      { id: "b", label: "B", text: "세부 호칭이 어색해 가짜 같지만, 지휘관 소재가 확인될 때까지 마음이 불안해 임무 집중이 흔들린다.", score: score({ V: 1, R: 3, P: 2, W: 1 }), riskTags: ["command_doubt", "mission_disruption"], feedback: "가짜 단서를 봐도 불안이 행동을 지배하면 공격 효과가 발생합니다." },
      { id: "c", label: "C", text: "여러 명이 동시에 받았다면 조직적 공격일 수 있어, 캡처를 모아 담당자에게 전달하자고 제안한다.", score: score({ V: 2, S: 2, M: 2, C: 2 }), riskTags: ["pattern_check", "controlled_report"], feedback: "동시 수신을 공격 패턴으로 보고 통제된 방식으로 전달하는 대응입니다." },
      { id: "d", label: "D", text: "혹시 진짜면 각자 대비해야 하므로, 문자 내용을 요약해 동료들에게 조심하라고 알린다.", score: score({ A: 2, R: 2, P: 2, C: 1 }), riskTags: ["unverified_spread", "personal_priority"], feedback: "대비 목적이라도 미확인 지휘 불신 메시지는 내부 혼란을 키웁니다." }
    ]
  },
  {
    id: "supply-news",
    category: "action",
    type: "fake_news_card",
    title: "보급 중단 허위 뉴스",
    sourceLabel: "전시 속보 카드뉴스",
    content: {
      headline: "속보: 전방 보급로 완전 차단",
      body: "정식 언론처럼 보이는 카드뉴스가 보급 중단과 철수 가능성을 언급합니다. 로고는 실제 언론과 비슷하지만 URL이 다릅니다.",
      meta: "도메인 오탈자 / 기자명 없음",
      visualCue: "로고 색이 미세하게 다르고 URL에 하이픈이 추가됨",
      signalNotes: ["언론 사칭", "도메인 오탈자", "작전 지속성 공격"]
    },
    choices: [
      { id: "a", label: "A", text: "로고보다 URL, 기자명, 원문 보도 여부를 확인하고, 사칭 정황이 있으면 지정 채널에 신고한다.", score: score({ V: 3, S: 2, M: 2, C: 3 }), riskTags: ["domain_check", "controlled_report"], feedback: "언론 사칭은 도메인, 기자명, 원문 여부로 검증하는 것이 효과적입니다." },
      { id: "b", label: "B", text: "도메인이 조금 이상하지만 보급 문제는 중대하므로, 사실 여부가 나올 때까지 개인적으로 대비 물품을 점검한다.", score: score({ V: 1, R: 2, P: 2, W: 1 }), riskTags: ["resource_fear", "personal_priority"], feedback: "검증 없이 개인 대비 행동으로 옮기면 불안이 실제 행동을 바꾼 것입니다." },
      { id: "c", label: "C", text: "가짜일 가능성이 있어 보이지만, 대비 차원에서 '확인 중'이라고 표시해 주변에 공유한다.", score: score({ A: 2, R: 2, M: 1, C: 1 }), riskTags: ["unverified_spread", "justified_sharing"], feedback: "확인 중 표시가 있어도 미검증 핵심 정보는 확산 위험이 큽니다." },
      { id: "d", label: "D", text: "불안을 키우지 않기 위해 아무에게도 말하지 않고 넘긴다.", score: score({ S: 1, M: 1, W: 3 }), riskTags: ["underreporting"], feedback: "확산을 막는 점은 좋지만 사칭 정황이 있으면 신고로 전환해야 합니다." }
    ]
  }
];
