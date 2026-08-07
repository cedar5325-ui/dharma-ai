import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "다르마(DHARMA) AI | 학생부 탐구를 설계하는 AI 플랫폼",
  description: "만화 캐릭터 메인화면, 차별화 서비스, 결제, 로그인, 시스템 설명을 포함한 홈페이지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
