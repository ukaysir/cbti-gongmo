import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBTI 인지전 대응 플랫폼",
  description: "전장심리유형 진단과 맞춤형 인지전 대응 훈련 플랫폼"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

