"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CalendarDays, Settings } from "lucide-react";
import { isSessionActive } from "@/lib/session-manager";
import { useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHidden(isSessionActive());
  }, [pathname]);

  if (!mounted) return null;
  if (hidden) return null;
  if (pathname === "/onboarding" || pathname === "/log") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white" style={{ borderTop: "1px solid rgba(27, 67, 50, 0.08)" }}>
      <div className="max-w-md mx-auto flex items-center justify-around h-14">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-all duration-200"
            >
              <tab.Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-colors duration-200 ${isActive ? "text-forest" : "text-muted"}`}
              />
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-forest" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
