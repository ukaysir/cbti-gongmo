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
      { id: "a", label: "A", text: "원본 출처와 게시 시각부터 확인한다.", score: score({ V: 3, S: 2, M: 1, C: 1 }), riskTags: ["source_check"], feedback: "출처와 원본 맥락 확인은 조작 영상 대응의 첫 단계입니다." },
      { id: "b", label: "B", text: "괜히 엮이기 싫으니 그냥 넘긴다.", score: score({ A: 1, S: 1, W: 3 }), riskTags: ["avoidance"], feedback: "무시는 확산을 막을 수 있지만 실제 위협이면 대응 기회를 놓칠 수 있습니다." },
      { id: "c", label: "C", text: "사실일지 몰라 부대 전체가 불안해진다.", score: score({ A: 2, R: 3, P: 1, W: 1 }), riskTags: ["fear_trigger", "uncertainty"], feedback: "불안은 자연스럽지만 확인 전 감정 결론을 내리면 조작 목적에 말려들 수 있습니다." },
      { id: "d", label: "D", text: "화가 나서 단톡방에 바로 공유한다.", score: score({ A: 2, R: 3, P: 2, C: 1 }), riskTags: ["unverified_spread", "anger_trigger"], feedback: "검증 전 공유는 인지전 콘텐츠 확산에 직접 기여할 수 있습니다." }
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
      { id: "a", label: "A", text: "공식 채널과 상급 보고 라인으로 사실 여부를 확인한다.", score: score({ V: 3, S: 2, M: 2, C: 2 }), riskTags: ["official_check"], feedback: "항복, 철수, 명령 관련 정보는 공식 지휘 체계 확인이 우선입니다." },
      { id: "b", label: "B", text: "영상이 진짜 같지만 일단 아무 말도 하지 않는다.", score: score({ A: 2, R: 1, W: 2 }), riskTags: ["silent_uncertainty"], feedback: "침묵만으로는 내부 혼란을 줄이기 어렵습니다. 확인과 보고가 필요합니다." },
      { id: "c", label: "C", text: "혹시 사실이면 끝난 것 같아 불안해진다.", score: score({ A: 2, R: 3, P: 2, W: 1 }), riskTags: ["collapse_anxiety"], feedback: "권위자 영상은 강한 심리 효과가 있으므로 감정 반응 전 공식 확인이 필요합니다." },
      { id: "d", label: "D", text: "부대원들이 알아야 하니 즉시 공유한다.", score: score({ A: 3, R: 2, P: 1, C: 1 }), riskTags: ["unverified_spread", "authority_deception"], feedback: "중요 정보일수록 검증 전 확산의 피해가 커집니다." }
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
      { id: "a", label: "A", text: "조사 기관, 표본, 원문 링크를 확인한다.", score: score({ V: 3, S: 2, M: 1, C: 1 }), riskTags: ["stat_check"], feedback: "수치는 신뢰감을 주지만 조사 근거가 없으면 심리 조작 장치일 수 있습니다." },
      { id: "b", label: "B", text: "기분 나쁘지만 넘기고 임무에 집중한다.", score: score({ S: 2, M: 2, W: 1 }), riskTags: ["passive_stability"], feedback: "감정적으로 휘둘리지 않은 점은 좋지만 반복 공격이면 신고도 필요합니다." },
      { id: "c", label: "C", text: "정말 버려진 것 같아 사기가 꺾인다.", score: score({ A: 2, R: 3, P: 2, W: 1 }), riskTags: ["isolation", "morale_drop"], feedback: "고립감 자극은 대표적인 인지전 기법입니다. 숫자보다 출처를 먼저 봐야 합니다." },
      { id: "d", label: "D", text: "댓글로 맞받아치고 주변에도 보여준다.", score: score({ A: 1, R: 3, P: 2, C: 1 }), riskTags: ["anger_trigger", "engagement_trap"], feedback: "분노 댓글은 알고리즘 확산에 도움을 줄 수 있습니다." }
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
      { id: "a", label: "A", text: "링크를 누르지 않고 공식 연락 수단으로 확인한다.", score: score({ V: 3, S: 2, M: 1, C: 2 }), riskTags: ["link_avoidance"], feedback: "개인정보가 포함돼도 링크 클릭 전 공식 확인이 우선입니다." },
      { id: "b", label: "B", text: "불안하지만 링크는 누르지 않고 혼자 참는다.", score: score({ V: 1, R: 2, P: 1, W: 2 }), riskTags: ["silent_distress"], feedback: "링크를 피한 것은 좋지만 혼자 참기보다 보고와 확인 절차가 필요합니다." },
      { id: "c", label: "C", text: "가족이 걱정돼 임무 집중이 어렵다.", score: score({ A: 2, R: 3, P: 3, W: 1 }), riskTags: ["family_trigger", "mission_disruption"], feedback: "가족 위협은 강한 표적 자극입니다. 공식 확인 루트를 자동화해야 합니다." },
      { id: "d", label: "D", text: "즉시 링크를 열고 안내대로 행동한다.", score: score({ A: 3, R: 3, P: 2, W: 1 }), riskTags: ["phishing", "urgency"], feedback: "긴급성과 개인정보는 클릭을 유도하는 대표 장치입니다." }
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
      { id: "a", label: "A", text: "지휘 체계로 확인하고 같은 문자를 받은 인원을 파악한다.", score: score({ V: 3, S: 2, M: 3, C: 2 }), riskTags: ["command_check"], feedback: "지휘 신뢰 공격은 개인 판단보다 체계 확인으로 대응해야 합니다." },
      { id: "b", label: "B", text: "확인하지 않고 불길해서 상황을 지켜본다.", score: score({ A: 2, R: 2, P: 1, W: 2 }), riskTags: ["command_doubt"], feedback: "불확실성을 방치하면 같은 메시지가 내부 불신으로 번질 수 있습니다." },
      { id: "c", label: "C", text: "나도 가족과 내 안전부터 생각해야겠다고 느낀다.", score: score({ A: 2, R: 3, P: 3, W: 1 }), riskTags: ["personal_priority"], feedback: "위협 문자는 개인 생존 본능을 자극해 임무 기준을 흔듭니다." },
      { id: "d", label: "D", text: "분대 채팅방에 캡처를 올리고 다들 조심하라고 한다.", score: score({ A: 2, R: 2, P: 1, C: 1 }), riskTags: ["unverified_spread"], feedback: "주의 목적이라도 미확인 정보 공유는 혼란을 키울 수 있습니다." }
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
      { id: "a", label: "A", text: "도메인과 공식 보도 여부를 확인하고 신고한다.", score: score({ V: 3, S: 2, M: 2, C: 3 }), riskTags: ["domain_check"], feedback: "언론 사칭은 도메인과 기자 정보 확인으로 상당수 걸러낼 수 있습니다." },
      { id: "b", label: "B", text: "무시하고 넘긴다.", score: score({ S: 1, M: 1, W: 3 }), riskTags: ["underreporting"], feedback: "무시는 개인 확산을 막지만 조직 대응을 놓칠 수 있습니다." },
      { id: "c", label: "C", text: "보급이 끊기면 버티기 어렵다고 느낀다.", score: score({ A: 2, R: 3, P: 2, W: 1 }), riskTags: ["resource_fear"], feedback: "보급 공포는 임무 지속 의지를 흔드는 핵심 자극입니다." },
      { id: "d", label: "D", text: "주변에 알려 대비하자고 말한다.", score: score({ A: 2, R: 2, M: 1, C: 1 }), riskTags: ["unverified_spread"], feedback: "대비 목적이라도 공식 확인 전 전파는 혼란을 확대합니다." }
    ]
  }
];

