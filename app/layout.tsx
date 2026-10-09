import {SITE_ORIGIN,SITE_DESCRIPTION,publicMetadata} from '@/lib/seo';
import type { Metadata } from "next";
import "./globals.css";
import "./preferences.css";
import "./responsive.css";
import {cookies} from "next/headers";
import {PreferencesProvider} from "./preferences";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  ...publicMetadata("COZ COS CLOSET｜Cosplay 服裝租借・共用衣櫃", SITE_DESCRIPTION, "/"),
  robots: {index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
  verification: {google:process.env.GOOGLE_SITE_VERIFICATION?.split(',').map(token=>token.trim()).filter(Boolean)},
  applicationName:"COZ COS CLOSET",
  icons: {icon:[{url:"/brand-icon.png",type:"image/png",sizes:"512x512"}],shortcut:"/brand-icon.png",apple:"/brand-icon.png"},
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


