"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

    // Check if current goal matches a preset
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
  }

  function handleClearData() {
    clearAllData();
    router.replace("/onboarding");
  }

  return (
    <div className="px-6 py-8 page-transition">
      <h1 className="text-2xl font-bold text-forest mb-8">Settings</h1>

      {/* Daily Goal */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-forest/70 mb-3">
          Daily offline goal
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => handlePresetClick(preset.minutes)}
              className={`px-5 py-3 rounded-pill text-sm font-semibold min-h-[44px] transition-all duration-200 ${
                goalMinutes === preset.minutes && !isCustom
                  ? "bg-forest text-cream shadow-md"
                  : "bg-white/80 text-forest hover:bg-forest/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`px-5 py-3 rounded-pill text-sm font-semibold min-h-[44px] transition-all duration-200 ${
              isCustom
                ? "bg-forest text-cream shadow-md"
                : "bg-white/80 text-forest hover:bg-forest/10"
            }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-2 animate-fade_in_up">
            <input
              type="number"
              value={customGoal}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Minutes"
              min={1}
              className="w-24 px-4 py-3 rounded-card bg-white/80 text-forest placeholder:text-forest/30 outline-none focus:ring-2 focus:ring-forest/30 shadow-sm"
            />
            <span className="text-sm text-forest/60">minutes per day</span>
          </div>
        )}
        <p className="text-xs text-forest/50 mt-2">
          Current goal: <span className="font-semibold">{formatDuration(goalMinutes)}</span> per day
        </p>
      </section>

      {/* Lifetime Stats */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-forest/70 mb-3">
          Lifetime stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total offline" value={`${stats.totalHours}h`} />
          <StatCard label="Sessions" value={String(stats.totalSessions)} />
          <StatCard label="Longest streak" value={`${stats.longestStreak}d`} />
          <StatCard label="Member since" value={memberSince} small />
        </div>
      </section>

      {/* Clear Data */}
      <section className="mb-8">
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="w-full py-3 rounded-pill bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors min-h-[44px]"
        >
          Clear all data
        </button>
      </section>

      {/* App Info */}
      <div className="text-center text-xs text-forest/30 mt-12">
        Offline Wins v1.0 — Built by AxxLabs
      </div>

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-6">
          <div className="bg-cream rounded-card p-6 w-full max-w-sm shadow-xl animate-fade_in_up">
            <h2 className="text-lg font-bold text-forest mb-2">
              Delete everything?
            </h2>
            <p className="text-forest/60 text-sm mb-6">
              This will delete all your offline sessions and settings. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-pill bg-cream-dark text-forest font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="flex-1 py-3 rounded-pill bg-red-600 text-white font-medium min-h-[44px]"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
    <div className="bg-white/60 rounded-card p-4 shadow-sm">
      <p className="text-xs text-forest/50 mb-1">{label}</p>
      <p className={`font-bold text-forest ${small ? "text-sm" : "text-xl"}`}>
        {value}
      </p>
    </div>
  );
}
