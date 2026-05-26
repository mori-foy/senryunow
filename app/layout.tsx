import type { Metadata } from "next";
import { Reggae_One, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const reggaeOne = Reggae_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kaisei",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "川柳なう",
  description: "1日1回、5分で川柳を詠む",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${reggaeOne.variable} ${notoSansJP.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
