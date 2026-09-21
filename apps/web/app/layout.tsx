import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/theme";
import { BottomNav } from "../components/ui/BottomNav";
import { InstallPrompt } from "../components/pwa/InstallPrompt";
import { CosmosBackground } from "../components/cosmos/CosmosBackground";

export const metadata: Metadata = {
  title: "iSchoolBD—Free Forever Gamified Learning for Bangladesh",
  description:
    "Bangla-first gamified learning for Bangladesh. NCTB-aligned lessons and video courses.",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/icon.svg" }],
  appleWebApp: { capable: true, statusBarStyle: "default", title: "iSchool" },
};

export const viewport: Viewport = {
  themeColor: "#22b07d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <ThemeProvider>
          <CosmosBackground />
          <div className="shell">
            <div className="shell-content">{children}</div>
            <BottomNav />
          </div>
          <InstallPrompt />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`,
          }}
        />
      </body>
    </html>
  );
}
