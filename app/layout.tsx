import type { Metadata } from "next";
import { Yuji_Boku } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const yujiBoku = Yuji_Boku({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kaisei",
  display: "swap",
  preload: false,
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
      className={`${yujiBoku.variable} h-full`}
    >
      <body className="min-h-full pb-16">
        <AuthProvider>
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
