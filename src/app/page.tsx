"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSettings, getActiveSession, clearActiveSession, saveSession, getSessions } from "@/lib/storage";
import { startSession as startSessionManager, getElapsedMs } from "@/lib/session-manager"; // Renamed to avoid conflict
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
    timeLeft,
    duration,
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
    setRecentSessions(all.slice(-3).reverse());
  }, []);

  const handleTimerComplete = useCallback(() => {
    // 1. Show Ripple
    setIsRippleActive(true);

    // 2. Save Session Data (Unit C logic, but verified here for flow)
    // For MVP, we might auto-save or ask for tag. 
    // The current flow expects "End Session" -> Log Page.
    // But if timer *completes* (count down), maybe we show a "Session Done" state?
    // For "Focus" theme: user usually sets a goal? 
    // Wait, original app was "Stopwatch" (count up). 
    // My useTimer is "Count Down".
    // The requirement "Tracking Engine" implies we might want count-up active session?
    // "Offline Wins" concept: "Go Offline" -> Timer starts counting UP (usually).
    // Let's re-read the PRFAQ/requirements. 
    // "Timer logic... breathing animation...". 
    // Ideally, "Go Offline" is open-ended.
    // IF open-ended: `useTimer` should support "count up" or we just use `elapsedMs`.
    // The `useTimer` I wrote is a countdown. 
    // ADAPTATION: I will use `useTimer` as a UI driver for the breathing ring, 
    // but the *value* displayed will be `elapsed` (count up) to match "Offline Wins" core mechanic.
    // OR, does the user want a Focus Timer (Pomodoro)?
    // "Premium Calm aesthetic... offline...". 
    // Let's stick to the existing "Count Up" behavior for now to minimize friction, 
    // unless "Focus" implies setting a duration.
    // Checking `startSession` in `session-manager`: it just records startTime.
    // So it is Count Up.

    // REVISION: I will ignore `timeLeft` from useTimer for the DISPLAY, and use a local `elapsed` state 
    // driven by an interval, BUT use `timerStatus` for the Ring state.
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
              totalDuration={0} // Irrelevant for count up
            />
          </BreathingRing>

          <div className="mt-12">
            <Button
              variant="outline"
              onClick={handleEndSession}
              className="border-white/10 text-text-secondary hover:text-white hover:border-white/30"
            >
              End Session
            </Button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  // Render Dashboard View
  const progressRatio = goalMinutes > 0 ? todayMinutes / goalMinutes : 0;

  return (
    <LayoutShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Typography.H1>
          Hello, {userName || "Reviewer"}
        </Typography.H1>
        <div className="bg-surface-light border border-white/5 px-3 py-1 rounded-full">
          <Typography.Caption className="text-accent">
            {streak} day streak
          </Typography.Caption>
        </div>
      </div>

      {/* Main Action area */}
      <div className="flex flex-col items-center justify-center py-12">
        {/* Placeholder for DataViz/Unit C (using static ring for now) */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8 opacity-50 grayscale">
          <div className="w-full h-full rounded-full border-4 border-surface-light" />
          <div className="absolute text-center">
            <Typography.H2>{Math.round(progressRatio * 100)}%</Typography.H2>
            <Typography.Caption>Daily Goal</Typography.Caption>
          </div>
        </div>

        <Button
          variant="solid"
          size="lg"
          className="w-full max-w-xs h-16 text-lg shadow-glow animate-pulse-slow"
          onClick={handleGoOffline}
        >
          Go Offline
        </Button>
      </div>

      {/* Recent Sessions List */}
      <div className="mt-8">
        <Typography.Label className="mb-4 block">Recent Wins</Typography.Label>
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-light border border-white/5 text-center">
              <Typography.Caption>No sessions yet. Start one!</Typography.Caption>
            </div>
          ) : (
            recentSessions.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-surface-light border border-white/5 flex justify-between items-center">
                <div>
                  <Typography.Body>{formatDuration(s.durationMinutes)}</Typography.Body>
                  <Typography.Caption>{s.activities[0] || "Focus"}</Typography.Caption>
                </div>
                <Typography.Caption>{s.date.slice(5)}</Typography.Caption>
              </div>
            ))
          )}
        </div>
      </div>

      <RippleEffect active={isRippleActive} onComplete={handleRippleComplete} />
    </LayoutShell>
  );
}
