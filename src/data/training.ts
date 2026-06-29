export const TRAINING_MODULES = [
  {
    id: "information_verification",
    title: "정보처리 V/A: 출처 확인과 교차검증",
    target: "A",
    description: "그럴듯한 수치, 영상, 카드뉴스를 보았을 때 검증 절차를 자동화합니다.",
    items: [
      {
        id: "poll-80",
        prompt: "SNS 카드뉴스가 '국민 80%가 전방 사단 포기 찬성'이라고 주장합니다. 조사 기관, 표본 수, 원문 링크가 없습니다.",
        choices: [
          { key: "A", text: "좋아요가 많으니 사실로 보고 공유한다." },
          { key: "B", text: "조사 기관과 원문 링크를 확인하고 공식 채널과 대조한다." },
          { key: "C", text: "기분이 나쁘니 댓글로 반박한다." },
          { key: "D", text: "무시만 하고 아무 조치도 하지 않는다." }
        ],
        correct: "B",
        feedback: "수치가 있어도 조사 기관, 표본, 원문이 없으면 근거가 아닙니다. 공식 채널과 교차검증해야 합니다."
      },
      {
        id: "logo-domain",
        prompt: "언론사 로고와 비슷한 카드뉴스가 보급 중단을 알립니다. URL에 철자가 하나 다르고 기자명이 없습니다.",
        choices: [
          { key: "A", text: "도메인과 원문 보도 여부를 확인한다." },
          { key: "B", text: "로고가 비슷하니 신뢰한다." },
          { key: "C", text: "주변에 먼저 알려 대비시킨다." },
          { key: "D", text: "불안하지만 혼자만 본다." }
        ],
        correct: "A",
        feedback: "언론 사칭은 도메인 오탈자, 기자명 부재, 원문 링크 부재에서 흔히 드러납니다."
      },
      {
        id: "video-lipsync",
        prompt: "지휘부가 항복을 말하는 영상이 돌지만 입 모양과 음성이 어긋나고 계정은 생성 2일 차입니다.",
        choices: [
          { key: "A", text: "충격적이니 단톡방에 공유한다." },
          { key: "B", text: "공식 발표와 지휘 체계로 확인한다." },
          { key: "C", text: "진짜일지 몰라 임무를 멈춘다." },
          { key: "D", text: "아무에게도 말하지 않는다." }
        ],
        correct: "B",
        feedback: "명령, 항복, 철수 관련 영상은 공식 발표와 지휘 체계 확인 없이는 행동 근거가 될 수 없습니다."
      }
    ]
  }
];

