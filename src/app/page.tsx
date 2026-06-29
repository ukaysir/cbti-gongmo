import { ArrowRight, Database, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-8 px-4 py-10 lg:grid-cols-[1fr_460px] lg:px-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-field">Cognitive Behavior Type Indicator</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.05] text-ink md:text-7xl">
            인지전 상황을 직접 판단하고 대응 습관을 훈련합니다.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
            CBTI는 가짜뉴스, 딥페이크, 표적 문자, 감정 선동 콘텐츠를 모바일 환경에서 체험하게 하고 선택 기록과 AI 문답으로 전장심리유형을 진단합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/assessment" className="inline-flex items-center gap-2 rounded-md bg-field px-5 py-3 font-bold text-white">
              진단 시작
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-3 font-bold text-ink">
              운영 대시보드
            </Link>
          </div>
        </div>
        <div className="screen-panel rounded-lg p-5">
          <div className="grid gap-3">
            <Feature icon={<ShieldCheck />} title="재현 가능한 진단" body="CBTI 코드는 선택지 점수와 서버 로직으로 산출해 운영 신뢰도를 확보합니다." />
            <Feature icon={<Sparkles />} title="AI 문답 상세화" body="Puter.js 기반 문답으로 선택 뒤의 심리적 단서와 훈련 우선순위를 분석합니다." />
            <Feature icon={<Database />} title="Supabase 운영 구조" body="실명 프로필, 진단 세션, AI 로그, 훈련 이력을 RLS 기반으로 저장하도록 설계했습니다." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-field text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <h2 className="font-black text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{body}</p>
    </div>
  );
}

