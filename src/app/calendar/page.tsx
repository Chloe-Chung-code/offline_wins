"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutShell from "@/components/ui/LayoutShell";
import * as Typography from "@/components/ui/Typography";
import StatsOverview from "@/components/insights/StatsOverview";
import CalendarHeatmap from "@/components/insights/CalendarHeatmap";
import SessionList from "@/components/insights/SessionList";
import { getSettings } from "@/lib/storage";

export default function CalendarPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <LayoutShell className="pt-14">
      <div className="mb-6">
        <Typography.H1 className="!mb-0">Insights</Typography.H1>
      </div>

      <StatsOverview />

      <div className="mb-8">
        <CalendarHeatmap />
      </div>

      <SessionList />
    </LayoutShell>
  );
}
