"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isSessionActive } from "@/lib/session-manager";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHidden(isSessionActive());
  }, [pathname]);

  // Hide during active session or on non-main pages
  if (!mounted) return null;
  if (hidden) return null;
  if (pathname === "/onboarding" || pathname === "/log") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-cream border-t border-forest/10">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] transition-colors ${
                isActive ? "text-forest" : "text-forest/40"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? "text-forest" : "text-forest/40"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
