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
    <div className="px-6 py-8 page-transition">
      <h1 className="text-display text-forest mb-8">Settings</h1>

      {/* Daily Goal */}
      <section className="bg-white rounded-lg p-5 shadow-soft mb-6">
        <h2 className="text-caption mb-4">
          Daily offline goal
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => handlePresetClick(preset.minutes)}
              className={`px-5 py-2.5 rounded-pill text-sm font-semibold min-h-[44px] transition-all duration-200 ${
                goalMinutes === preset.minutes && !isCustom
                  ? "bg-forest text-white shadow-medium"
                  : "bg-cream text-forest shadow-soft"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`px-5 py-2.5 rounded-pill text-sm font-semibold min-h-[44px] transition-all duration-200 ${
              isCustom
                ? "bg-forest text-white shadow-medium"
                : "bg-cream text-forest shadow-soft"
            }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-3 animate-fade_in_up mt-2">
            <input
              type="number"
              value={customGoal}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Minutes"
              min={1}
              className="w-24 py-2.5 bg-transparent text-forest placeholder:text-muted outline-none text-body border-b-2 border-forest/10 focus:border-forest/40 transition-colors text-center"
            />
            <span className="text-caption">minutes per day</span>
          </div>
        )}
        <p className="text-caption mt-3">
          Current: <span className="font-semibold text-forest">{formatDuration(goalMinutes)}</span> per day
        </p>
      </section>

      {/* Lifetime Stats */}
      <section className="bg-white rounded-lg p-5 shadow-soft mb-6">
        <h2 className="text-caption mb-4">
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
      <div className="text-center mt-8">
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="text-sunset text-sm font-medium min-h-[44px] transition-colors hover:text-sunset-light"
        >
          Clear all data
        </button>
      </div>

      {/* App Info */}
      <div className="text-center text-caption mt-8">
        Offline Wins v1.0 · AxxLabs 🌿
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-pill bg-forest text-white text-sm font-semibold shadow-medium toast-animate">
          Goal updated!
        </div>
      )}

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-6">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-medium animate-fade_in_up">
            <h2 className="text-heading text-forest mb-2">
              Delete everything?
            </h2>
            <p className="text-secondary text-body mb-6">
              This will delete all your offline sessions and settings. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 text-secondary font-medium min-h-[44px] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="flex-1 py-3 rounded-pill bg-sunset text-white font-medium min-h-[44px] transition-all duration-200"
              >
                Delete
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
    <div className="bg-cream rounded-card p-4">
      <p className="text-caption mb-1">{label}</p>
      <p className={`font-bold text-forest ${small ? "text-sm" : "text-display"}`}>
        {value}
      </p>
    </div>
  );
}
