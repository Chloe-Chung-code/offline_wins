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

const MIN_MINUTES = 5;
const MAX_MINUTES = 480; // 8 hours

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState(1);
  const [customMinutes, setCustomMinutes] = useState(0);
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
  }

  function handleCustomClick() {
    setIsCustom(true);
    // Apply current custom values
    const total = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, customHours * 60 + customMinutes));
    setGoalMinutes(total);
  }

  function handleCustomHoursChange(value: string) {
    const h = Math.max(0, Math.min(8, parseInt(value, 10) || 0));
    setCustomHours(h);
    const total = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, h * 60 + customMinutes));
    setGoalMinutes(total);
  }

  function handleCustomMinutesChange(value: string) {
    const m = Math.max(0, Math.min(59, parseInt(value, 10) || 0));
    setCustomMinutes(m);
    const total = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, customHours * 60 + m));
    setGoalMinutes(total);
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
      {/* Emoji + Title */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🌊</div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Offline Wins</h1>
        <p className="text-base text-[#94A3B8] mt-2">
          Your screen-free time deserves a win.
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
        <div
          className={`mt-2 text-sm text-[#3B82F6] transition-all duration-300 ${
            name.trim() ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
        >
          Nice to meet you, {name.trim() || ""}! 👋
        </div>
      </div>

      {/* Goal Chips */}
      <div className="w-full max-w-sm mx-auto mb-10">
        <label className="block text-sm font-medium text-[#0F172A] mb-3">
          Daily offline goal
        </label>
        <div className="flex gap-2">
          {GOAL_PRESETS.map((preset) => {
            const isSelected = goalMinutes === preset.minutes && !isCustom;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => handlePresetClick(preset.minutes)}
                className={`flex-1 h-11 rounded-full text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? "bg-[#0F172A] text-white border border-transparent scale-[1.03]"
                    : "bg-white text-[#475569] border border-[#E2E8F0] scale-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`flex-1 h-11 rounded-full text-sm font-medium transition-all duration-150 ${
              isCustom
                ? "bg-[#0F172A] text-white border border-transparent scale-[1.03]"
                : "bg-white text-[#475569] border border-[#E2E8F0] scale-100"
            }`}
          >
            Custom
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isCustom ? "max-h-20 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customHours}
              onChange={(e) => handleCustomHoursChange(e.target.value)}
              min={0}
              max={8}
              className="w-16 h-10 text-center text-[#0F172A] border border-[#E2E8F0] rounded-lg outline-none focus:border-[#3B82F6] transition-colors"
            />
            <span className="text-xs text-[#94A3B8]">hours</span>
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => handleCustomMinutesChange(e.target.value)}
              min={0}
              max={59}
              className="w-16 h-10 text-center text-[#0F172A] border border-[#E2E8F0] rounded-lg outline-none focus:border-[#3B82F6] transition-colors"
            />
            <span className="text-xs text-[#94A3B8]">minutes</span>
          </div>
        </div>
      </div>

      {/* Let's Go Button — rounded-xl to match Home screen Go Offline */}
      <div className="w-full max-w-sm mx-auto mt-auto">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
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
