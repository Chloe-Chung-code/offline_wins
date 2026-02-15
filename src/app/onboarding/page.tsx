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
    if (!name.trim()) return;
    saveSettings({
      name: name.trim(),
      dailyGoalMinutes: goalMinutes,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    });
    router.push("/");
  }

  const isDisabled = !name.trim();

  return (
    <div className="min-h-screen flex flex-col px-6 pt-20 pb-10 bg-background">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#0F172A]">Offline Wins</h1>
        <p className="text-base text-[#94A3B8] mt-2">
          Celebrate your time away from screens.
        </p>
      </div>

      {/* Name Input */}
      <div className="w-full max-w-sm mx-auto mb-8">
        <label className="block text-sm font-medium text-[#0F172A] mb-3">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full py-3 bg-transparent text-lg text-[#0F172A] placeholder:text-[#94A3B8] outline-none border-b-2 border-[#E2E8F0] focus:border-[#3B82F6] transition-colors"
        />
      </div>

      {/* Goal Chips */}
      <div className="w-full max-w-sm mx-auto mb-10">
        <label className="block text-sm font-medium text-[#0F172A] mb-3">
          Daily offline goal
        </label>
        <div className="flex gap-2">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => handlePresetClick(preset.minutes)}
              className={`flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 ${
                goalMinutes === preset.minutes && !isCustom
                  ? "bg-[#0F172A] text-white border border-transparent"
                  : "bg-white text-[#475569] border border-[#E2E8F0]"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`flex-1 h-11 rounded-full text-sm font-medium transition-all duration-200 ${
              isCustom
                ? "bg-[#0F172A] text-white border border-transparent"
                : "bg-white text-[#475569] border border-[#E2E8F0]"
            }`}
          >
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="flex items-center gap-3 mt-3">
            <input
              type="number"
              value={customGoal}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Minutes"
              min={1}
              className="w-24 py-2 bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] outline-none text-base border-b-2 border-[#E2E8F0] focus:border-[#3B82F6] transition-colors text-center"
            />
            <span className="text-xs text-[#94A3B8] uppercase tracking-wider">minutes per day</span>
          </div>
        )}
      </div>

      {/* Let's Go Button */}
      <div className="w-full max-w-sm mx-auto mt-auto">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full py-4 rounded-full text-base font-semibold transition-all duration-200 ${
            isDisabled
              ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
              : "bg-[#0F172A] text-white active:scale-[0.98]"
          }`}
        >
          Let&apos;s Go
        </button>
      </div>
    </div>
  );
}
