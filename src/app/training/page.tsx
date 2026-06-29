import Link from "next/link";
import { TrainingWorkspace } from "@/components/TrainingWorkspace";

export default function TrainingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <Link href="/" className="text-sm font-bold text-field">홈으로</Link>
      <div className="mt-4">
        <TrainingWorkspace />
      </div>
    </main>
  );
}

