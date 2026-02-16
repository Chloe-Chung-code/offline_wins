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
    const check = () => setHidden(isSessionActive());
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (!mounted) return null;
  if (hidden) return null;

  // Hide on onboarding or log if needed
  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full relative group"
            >
              <div
                className={`transition-all duration-300 ${isActive ? "text-[#0F172A] translate-y-0" : "text-[#94A3B8] group-hover:text-text-primary translate-y-1"
                  }`}
              >
                <tab.Icon
                  size={24}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${isActive ? "opacity-100 translate-y-0 text-[#0F172A]" : "opacity-0 translate-y-2 text-[#94A3B8]"
                  }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}
