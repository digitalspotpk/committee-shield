import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { MobileFrame } from "@/components/shell/MobileFrame";
import { SwRegister } from "@/components/shell/SwRegister";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Monthly committee lucky draw & insurance policy tracker for 12 members.",
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#070c0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <MobileFrame>{children}</MobileFrame>
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "!bg-ink-800/95 !backdrop-blur-xl !border !border-white/10 !rounded-2xl !text-white",
              success: "!border-emerald-400/30",
              error: "!border-rose-400/30",
            },
          }}
        />
        <SwRegister />
      </body>
    </html>
  );
}
