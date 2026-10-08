import type { Metadata } from "next";
import "./globals.css";
import "./preferences.css";
import {cookies} from "next/headers";
import {PreferencesProvider} from "./preferences";

export const metadata: Metadata = {
  title: "COZ COS CLOSET｜共用衣櫃",
  description: "下一個角色，換你登場。探索 Cos 服裝、分享衣櫃，讓熱愛再次出場。",
  icons: {
    icon: "/coz-logo-transparent.png",
    shortcut: "/coz-logo-transparent.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const prefs=await cookies();
  const language=prefs.get("cos_language")?.value==="en"?"en":"zh";
  const theme=prefs.get("cos_theme")?.value==="light"?"light":"dark";
  return (
    <html lang={language==="en"?"en":"zh-Hant"} data-language={language} data-theme={theme}>
      <body className="antialiased"><PreferencesProvider initialLanguage={language} initialTheme={theme}>{children}</PreferencesProvider></body>
    </html>
  );
}


