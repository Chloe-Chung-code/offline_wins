"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSettings, getActiveSession, getSessions } from "@/lib/storage";
import { startSession as startSessionManager } from "@/lib/session-manager";
import type { Session } from "@/lib/types";
import { getDayTotal, getCurrentStreak } from "@/lib/streak-calculator";
import { formatDuration, getTodayDate } from "@/lib/format";
import BreathingRing from "@/components/timer/BreathingRing";
import TimerDisplay from "@/components/timer/TimerDisplay";
import RippleEffect from "@/components/timer/RippleEffect";
import LayoutShell from "@/components/ui/LayoutShell";
import * as Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useTimer } from "@/hooks/useTimer";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isRippleActive, setIsRippleActive] = useState(false);

  // Unit B: Timer Hook
  const {
    status: timerStatus,
    start: startTimer,
    reset: resetTimer
  } = useTimer({
    onComplete: () => {
      handleTimerComplete();
    }
  });

  const refreshData = useCallback(() => {
    const settings = getSettings();
    setGoalMinutes(settings.dailyGoalMinutes);
    setUserName(settings.name);
    setTodayMinutes(getDayTotal(getTodayDate()));
    setStreak(getCurrentStreak());
    const all = getSessions();
    setRecentSessions(all.slice(-2).reverse());
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRippleActive(true);
  }, []);

  // Timer Interval for Count Up (since useTimer is count down/state machine)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerStatus === "running") {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus]);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }

    // Check active session
    const active = getActiveSession();
    if (active && active.isActive) {
      // Restore session
      const activeStart = new Date(active.startTime);
      const seconds = Math.floor((Date.now() - activeStart.getTime()) / 1000);
      setElapsedSeconds(seconds);
      // Start the visual timer (we pass a huge duration just to keep it "running")
      startTimer(999999);
    }

    refreshData();
  }, [router, refreshData, startTimer]);

  function handleGoOffline() {
    startSessionManager();
    setElapsedSeconds(0);
    startTimer(999999); // Start "running" state
  }

  function handleEndSession() {
    // Stop visual timer
    resetTimer();
    // Navigate to log to save
    router.push("/log");
  }

  // Clean up ripple
  const handleRippleComplete = () => {
    setIsRippleActive(false);
  };

  if (!mounted) return null;

  // Render Active Session View
  if (timerStatus === "running") {
    return (
      <LayoutShell className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <BreathingRing status={timerStatus} progress={0} size={300}>
            <TimerDisplay
              secondsRemaining={elapsedSeconds}
              totalDuration={0}
            />
          </BreathingRing>

          <div className="mt-12">
            <Button
              variant="outline"
              onClick={handleEndSession}
              className="border-slate-300 text-text-secondary hover:text-text-primary hover:border-slate-400"
            >
              End Session
            </Button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  // Render Dashboard / Idle View
  const progressRatio = goalMinutes > 0 ? Math.min(todayMinutes / goalMinutes, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // SVG progress ring constants
  const ringSize = 160;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - progressRatio);

  return (
    <LayoutShell>
      {/* Header: Greeting + Streak Pill */}
      <div className="flex items-center justify-between mb-6">
        <Typography.H1 className="!mb-0 text-2xl">
          Hello, {userName || "Reviewer"}
        </Typography.H1>
        {streak > 0 && (
          <div className="bg-accent/10 px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-accent">
              {streak} day streak
            </span>
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center py-8">
        <div className="relative inline-flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={ringStroke}
            />
            {/* Progress arc */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringDashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{progressPercent}%</span>
            <span className="text-xs text-text-secondary mt-0.5">Daily Goal</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-3">
          {todayMinutes > 0
            ? `${formatDuration(todayMinutes)} of ${formatDuration(goalMinutes)} today`
            : `${formatDuration(goalMinutes)} goal today`
          }
        </p>
      </div>

      {/* Go Offline Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleGoOffline}
          className="w-full max-w-xs h-14 rounded-xl bg-[#0F172A] text-white text-lg font-semibold shadow-lg animate-gentle-glow transition-transform duration-200 active:scale-[0.97]"
        >
          Go Offline
        </button>
      </div>

      {/* Recent Sessions (max 2, compact text lines) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Typography.Label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Recent Wins</Typography.Label>
          {recentSessions.length > 0 && (
            <button
              onClick={() => router.push("/calendar")}
              className="text-xs font-medium text-accent hover:underline"
            >
              View all
            </button>
          )}
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">
            No sessions yet. Start one!
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {formatDuration(s.durationMinutes)}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {s.activities[0] || "Focus"}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <RippleEffect active={isRippleActive} onComplete={handleRippleComplete} />
    </LayoutShell>
  );
}
