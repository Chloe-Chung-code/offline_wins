"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings, saveSettings, clearAllData } from "@/lib/storage";
import { getLifetimeStats } from "@/lib/streak-calculator";

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
  const [customHours, setCustomHours] = useState(0);
  const [customMins, setCustomMins] = useState(0);
  const [isCustom, setIsCustom] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalSessions: 0,
    longestStreak: 0,
  });
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    setGoalMinutes(settings.dailyGoalMinutes);

    const matchesPreset = GOAL_PRESETS.some(
      (p) => p.minutes === settings.dailyGoalMinutes
    );
    if (!matchesPreset) {
      setIsCustom(true);
      setCustomHours(Math.floor(settings.dailyGoalMinutes / 60));
      setCustomMins(settings.dailyGoalMinutes % 60);
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
    setCustomHours(0);
    setCustomMins(0);
    saveGoal(minutes);
  }

  function handleCustomClick() {
    setIsCustom(true);
    // Initialize custom fields from current goal
    setCustomHours(Math.floor(goalMinutes / 60));
    setCustomMins(goalMinutes % 60);
  }

  function handleCustomHoursChange(value: string) {
    const h = parseInt(value, 10) || 0;
    setCustomHours(h);
    const total = h * 60 + customMins;
    if (total > 0) {
      setGoalMinutes(total);
      saveGoal(total);
    }
  }

  function handleCustomMinsChange(value: string) {
    const m = parseInt(value, 10) || 0;
    setCustomMins(m);
    const total = customHours * 60 + m;
    if (total > 0) {
      setGoalMinutes(total);
      saveGoal(total);
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
    <div className="min-h-screen bg-[#F8FAFC] px-5 pt-14 pb-24">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Settings</h1>

      {/* Daily Goal */}
      <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <p className="text-base font-medium text-[#0F172A] mb-4">
          Daily offline goal
        </p>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => handlePresetClick(preset.minutes)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium min-h-[44px] transition-all duration-200 ${
                goalMinutes === preset.minutes && !isCustom
                  ? "bg-[#0F172A] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#475569]"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`px-5 py-2.5 rounded-full text-sm font-medium min-h-[44px] transition-all duration-200 ${
              isCustom
                ? "bg-[#0F172A] text-white"
                : "bg-white border border-[#E2E8F0] text-[#475569]"
            }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-3 animate-fade-in-up mt-4">
            <input
              type="number"
              value={customHours}
              onChange={(e) => handleCustomHoursChange(e.target.value)}
              min={0}
              className="w-16 h-10 text-center border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
            <span className="text-sm text-[#475569]">hours</span>
            <input
              type="number"
              value={customMins}
              onChange={(e) => handleCustomMinsChange(e.target.value)}
              min={0}
              max={59}
              className="w-16 h-10 text-center border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
            <span className="text-sm text-[#475569]">minutes</span>
          </div>
        )}
      </section>

      {/* Lifetime Stats */}
      <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <p className="text-base font-medium text-[#0F172A] mb-4">
          Lifetime stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F1F5F9] rounded-lg p-4">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
              Total offline
            </p>
            <p className="text-2xl font-bold text-[#0F172A]">
              {stats.totalHours}h
            </p>
          </div>
          <div className="bg-[#F1F5F9] rounded-lg p-4">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
              Sessions
            </p>
            <p className="text-2xl font-bold text-[#0F172A]">
              {stats.totalSessions}
            </p>
          </div>
          <div className="bg-[#F1F5F9] rounded-lg p-4">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
              Longest streak
            </p>
            <p className="text-2xl font-bold text-[#0F172A]">
              {stats.longestStreak}d
            </p>
          </div>
          <div className="bg-[#F1F5F9] rounded-lg p-4">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
              Member since
            </p>
            <p className="text-sm font-bold text-[#0F172A]">{memberSince}</p>
          </div>
        </div>
      </section>

      {/* Clear Data */}
      <div className="text-center mt-8">
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="text-red-400 text-sm font-medium min-h-[44px]"
        >
          Clear all data
        </button>
      </div>

      {/* App Info */}
      <div className="text-center mt-8">
        <p className="text-xs text-[#94A3B8]">
          Offline Wins v1.0 · AxxLabs
        </p>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-lg animate-fade-in-up">
          Goal updated ✓
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in-up">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
              Delete everything?
            </h2>
            <p className="text-sm text-[#475569] mb-6">
              This will delete all your offline sessions and settings. This
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-[#F1F5F9] text-[#475569] rounded-xl py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-medium"
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
