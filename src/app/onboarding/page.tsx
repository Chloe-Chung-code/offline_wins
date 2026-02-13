"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSettings, saveSettings } from "@/lib/storage";

const GOAL_PRESETS = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "2h", minutes: 120 },
  { label: "3h", minutes: 180 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [customGoal, setCustomGoal] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (settings.onboardingComplete) {
      router.replace("/");
    }
  }, [router]);

  if (!mounted) return null;

  function handlePresetClick(minutes: number) {
    setGoalMinutes(minutes);
    setIsCustom(false);
    setCustomGoal("");
  }

  function handleCustomClick() {
    setIsCustom(true);
  }

  function handleCustomChange(value: string) {
    setCustomGoal(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalMinutes(parsed);
    }
  }

  function handleSubmit() {
    saveSettings({
      name: name.trim() || null,
      dailyGoalMinutes: goalMinutes,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 page-transition">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-3xl font-bold text-forest mb-3">
          Welcome to Offline Wins
        </h1>
        <p className="text-forest/70 text-lg leading-relaxed max-w-xs mx-auto">
          Celebrate your time away from screens. Not a punishment — a celebration. 🎉
        </p>
      </div>

      {/* Name Input */}
      <div className="w-full max-w-sm mb-8">
        <label className="block text-sm font-medium text-forest/80 mb-2">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 rounded-card bg-white/80 text-forest placeholder:text-forest/30 outline-none focus:ring-2 focus:ring-forest/30 shadow-sm transition-shadow"
        />
      </div>

      {/* Goal Setting */}
      <div className="w-full max-w-sm mb-10">
        <label className="block text-sm font-medium text-forest/80 mb-3">
          How much daily offline time is your goal?
        </label>
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
        <p className="text-xs text-forest/50 mt-3">
          Current goal: <span className="font-semibold">{goalMinutes} minutes</span> per day
        </p>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full max-w-sm py-4 px-8 bg-forest text-cream text-lg font-semibold rounded-pill shadow-lg hover:bg-forest-light active:scale-[0.98] transition-all duration-200 min-h-[56px]"
      >
        Let&apos;s Go! 🌿
      </button>
    </div>
  );
}
