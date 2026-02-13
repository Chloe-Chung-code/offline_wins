"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSettings, getActiveSession } from "@/lib/storage";
import { startSession, getElapsedMs } from "@/lib/session-manager";
import { getDayTotal, getCurrentStreak } from "@/lib/streak-calculator";
import { formatDuration, formatDurationFromMs, getTodayDate } from "@/lib/format";
import ProgressRing from "@/components/ProgressRing";
import ReflectionPrompt from "@/components/ReflectionPrompt";
import InstallPrompt from "@/components/InstallPrompt";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshData = useCallback(() => {
    const settings = getSettings();
    setGoalMinutes(settings.dailyGoalMinutes);
    setUserName(settings.name);
    setTodayMinutes(getDayTotal(getTodayDate()));
    setStreak(getCurrentStreak());
  }, []);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();

    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    // Check for returning user with active session
    const active = getActiveSession();
    if (active && active.isActive) {
      // User is returning — go straight to log
      router.replace("/log?returning=true");
      return;
    }

    setHasActiveSession(false);
    refreshData();
  }, [router, refreshData]);

  // Timer for active session
  useEffect(() => {
    if (hasActiveSession) {
      timerRef.current = setInterval(() => {
        setElapsedMs(getElapsedMs());
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasActiveSession]);

  if (!mounted) return null;

  function handleGoOffline() {
    startSession();
    setHasActiveSession(true);
    setElapsedMs(0);
  }

  function handleEndSession() {
    setShowConfirmEnd(true);
  }

  function confirmEndSession() {
    setShowConfirmEnd(false);
    router.push("/log");
  }

  function cancelEndSession() {
    setShowConfirmEnd(false);
  }

  // Active session view
  if (hasActiveSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 page-transition relative">
        {/* Breathing circle */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-forest/10 animate-breathe flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-forest/20 flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-forest mb-2">
          You&apos;re offline! Enjoy.
        </h1>
        <p className="text-forest/60 mb-8">Take your time. We&apos;ll be here.</p>

        {/* Timer */}
        <div className="text-5xl font-bold text-forest tabular-nums mb-12">
          {formatDurationFromMs(elapsedMs)}
        </div>

        {/* End Session Button */}
        <button
          type="button"
          onClick={handleEndSession}
          className="px-8 py-3 rounded-pill bg-cream-dark text-forest/70 font-medium text-sm hover:bg-forest/10 transition-all min-h-[44px]"
        >
          End Session
        </button>

        {/* Confirmation Dialog */}
        {showConfirmEnd && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-6">
            <div className="bg-cream rounded-card p-6 w-full max-w-sm shadow-xl animate-fade_in_up">
              <h2 className="text-lg font-bold text-forest mb-2">
                End your offline session?
              </h2>
              <p className="text-forest/60 text-sm mb-6">
                You&apos;ve been offline for {formatDurationFromMs(elapsedMs)}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEndSession}
                  className="flex-1 py-3 rounded-pill bg-cream-dark text-forest font-medium min-h-[44px]"
                >
                  Keep Going
                </button>
                <button
                  type="button"
                  onClick={confirmEndSession}
                  className="flex-1 py-3 rounded-pill bg-forest text-cream font-medium min-h-[44px]"
                >
                  Yes, End
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Home idle view
  const progress = goalMinutes > 0 ? todayMinutes / goalMinutes : 0;
  const goalMet = progress >= 1;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 page-transition">
      {/* Reflection prompt overlay */}
      <ReflectionPrompt />

      {/* Install prompt */}
      <InstallPrompt />

      {/* Greeting */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-forest">
          Hi {userName || "there"}!
        </h1>
        <p className="text-forest/60 text-sm mt-1">
          {goalMet
            ? "You crushed your goal today! 🎉"
            : "Ready for some offline time?"}
        </p>
      </div>

      {/* Progress Ring */}
      <div className="mb-6">
        <ProgressRing progress={progress} size={200} strokeWidth={14}>
          <div className="text-center">
            <div className="text-3xl font-bold text-forest">
              {formatDuration(todayMinutes)}
            </div>
            <div className="text-xs text-forest/50 mt-1">
              of {formatDuration(goalMinutes)} goal
            </div>
          </div>
        </ProgressRing>
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <div className="mb-10 px-5 py-2 rounded-pill bg-gold/20 text-forest text-sm font-semibold animate-fade_in_up">
          🔥 {streak} day streak
        </div>
      )}

      {/* Go Offline Button */}
      <button
        type="button"
        onClick={handleGoOffline}
        className="w-full max-w-xs py-5 px-8 bg-forest text-cream text-xl font-bold rounded-pill shadow-xl hover:bg-forest-light active:scale-[0.97] transition-all duration-200 animate-pulse_gentle min-h-[64px]"
      >
        Go Offline 🌿
      </button>

      <p className="text-forest/40 text-xs mt-4">
        Tap to start tracking your offline time
      </p>
    </div>
  );
}
