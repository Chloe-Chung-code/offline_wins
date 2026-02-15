import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Offline Wins",
  description: "Focus. Breathe. Disconnect.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Offline Wins",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F8FAFC", // Ocean Calm background
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-text-primary min-h-screen">
        <ServiceWorkerRegistrar />
        <main className="max-w-md mx-auto min-h-screen pb-16 relative overflow-hidden">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
