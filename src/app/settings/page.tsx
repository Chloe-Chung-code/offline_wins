"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutShell from "@/components/ui/LayoutShell";
import * as Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { getSettings, saveSettings, clearAllData } from "@/lib/storage";
import { getLifetimeStats } from "@/lib/streak-calculator";
import { formatDuration } from "@/lib/format";

const GOAL_PRESETS = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
];

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [customGoal, setCustomGoal] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState({ totalHours: 0, totalSessions: 0, longestStreak: 0 });
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    setGoalMinutes(settings.dailyGoalMinutes);

    const matchesPreset = GOAL_PRESETS.some((p) => p.minutes === settings.dailyGoalMinutes);
    if (!matchesPreset) {
      setIsCustom(true);
      setCustomGoal(String(settings.dailyGoalMinutes));
    }

    setStats(getLifetimeStats());
    setMemberSince(
      new Date(settings.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, [router]);

  if (!mounted) return null;

  function handlePresetClick(minutes: number) {
    setGoalMinutes(minutes);
    setIsCustom(false);
    setCustomGoal("");
    saveGoal(minutes);
  }

  function handleCustomClick() {
    setIsCustom(true);
  }

  function handleCustomChange(value: string) {
    setCustomGoal(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalMinutes(parsed);
      saveGoal(parsed);
    }
  }

  function saveGoal(minutes: number) {
    const settings = getSettings();
    saveSettings({ ...settings, dailyGoalMinutes: minutes });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  function handleClearData() {
    clearAllData();
    router.replace("/onboarding");
  }

  return (
    <LayoutShell>
      <Typography.H1>Settings</Typography.H1>

      {/* Daily Goal */}
      <section className="bg-surface-light rounded-xl p-5 border border-white/5 mb-6">
        <Typography.Label className="mb-4 block">
          Daily offline goal
        </Typography.Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => handlePresetClick(preset.minutes)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all duration-200 ${goalMinutes === preset.minutes && !isCustom
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "bg-surface text-text-secondary hover:bg-surface-elevated"
                }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all duration-200 ${isCustom
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "bg-surface text-text-secondary hover:bg-surface-elevated"
              }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-3 animate-fade-in-up mt-2">
            <input
              type="number"
              value={customGoal}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Minutes"
              min={1}
              className="w-24 py-2.5 bg-transparent text-white placeholder:text-white/20 outline-none border-b-2 border-white/10 focus:border-accent transition-colors text-center"
            />
            <Typography.Caption>minutes per day</Typography.Caption>
          </div>
        )}
        <div className="mt-3">
          <Typography.Caption>
            Current: <span className="font-semibold text-accent">{formatDuration(goalMinutes)}</span> per day
          </Typography.Caption>
        </div>
      </section>

      {/* Lifetime Stats */}
      <section className="bg-surface-light rounded-xl p-5 border border-white/5 mb-6">
        <Typography.Label className="mb-4 block">
          Lifetime stats
        </Typography.Label>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total offline" value={`${stats.totalHours}h`} />
          <StatCard label="Sessions" value={String(stats.totalSessions)} />
          <StatCard label="Longest streak" value={`${stats.longestStreak}d`} />
          <StatCard label="Member since" value={memberSince} small />
        </div>
      </section>

      {/* Clear Data */}
      <div className="text-center mt-8">
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="text-red-400 text-sm font-medium min-h-[44px] transition-colors hover:text-red-300"
        >
          Clear all data
        </button>
      </div>

      {/* App Info */}
      <div className="text-center mt-8 opacity-50">
        <Typography.Caption>
          Offline Wins v1.0 · Focus Edition 🌿
        </Typography.Caption>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-accent text-white text-sm font-semibold shadow-lg shadow-accent/20 animate-fade-in-up">
          Goal updated!
        </div>
      )}

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm border border-white/10 shadow-2xl animate-fade-in-up">
            <Typography.H2 className="mb-2">
              Delete everything?
            </Typography.H2>
            <Typography.Body className="mb-6">
              This will delete all your offline sessions and settings. This cannot be undone.
            </Typography.Body>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleClearData}
                className="flex-1 bg-red-500 hover:bg-red-600 shadow-red-900/20"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="bg-surface rounded-lg p-4 border border-white/5">
      <Typography.Caption className="mb-1">{label}</Typography.Caption>
      <p className={`font-bold text-white ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}
