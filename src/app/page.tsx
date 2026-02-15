"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSettings, getActiveSession, clearActiveSession, saveSession, getSessions } from "@/lib/storage";
import { startSession, getElapsedMs } from "@/lib/session-manager";
import type { Session } from "@/lib/types";
import { getDayTotal, getCurrentStreak } from "@/lib/streak-calculator";
import { formatDuration, formatDurationFromMs, getTodayDate } from "@/lib/format";
// import ProgressRing from "@/components/ProgressRing";
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
  const [autoExpireNotice, setAutoExpireNotice] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [startedAt, setStartedAt] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshData = useCallback(() => {
    const settings = getSettings();
    setGoalMinutes(settings.dailyGoalMinutes);
    setUserName(settings.name);
    setTodayMinutes(getDayTotal(getTodayDate()));
    setStreak(getCurrentStreak());
    const all = getSessions();
    setRecentSessions(all.slice(-3).reverse());
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
      const startTime = new Date(active.startTime);
      const elapsed = Date.now() - startTime.getTime();
      const MAX_SESSION_MS = 8 * 60 * 60 * 1000;

      if (elapsed > MAX_SESSION_MS) {
        const endTime = new Date(startTime.getTime() + MAX_SESSION_MS);
        const now = new Date().toISOString();
        const expiredSession: Session = {
          id: crypto.randomUUID(),
          date: startTime.toISOString().split("T")[0],
          startTime: active.startTime,
          endTime: endTime.toISOString(),
          durationMinutes: 480,
          activities: [],
          customActivity: null,
          moodRating: null,
          notes: null,
          createdAt: now,
          updatedAt: now,
        };
        saveSession(expiredSession);
        clearActiveSession();
        const timeStr = startTime.toLocaleString("en-US", {
          month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        });
        setAutoExpireNotice(`Your session from ${timeStr} was automatically saved (8h max).`);
        setTimeout(() => setAutoExpireNotice(null), 5000);
      } else {
        router.replace("/log?returning=true");
        return;
      }
    }

    setHasActiveSession(false);
    refreshData();
  }, [router, refreshData]);

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
    const active = getActiveSession();
    if (active) {
      setStartedAt(new Date(active.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    } else {
      setStartedAt(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 page-transition relative">
        {/* Breathing circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-64 h-64 rounded-full animate-breathe"
            style={{ border: "1px solid #95D5B2" }}
          />
        </div>

        <p className="text-secondary text-body mb-4">You&apos;re offline</p>

        {/* Timer */}
        <div className="text-number text-forest mb-2" style={{ fontSize: "4rem" }}>
          {formatDurationFromMs(elapsedMs)}
        </div>

        <p className="text-muted text-caption mb-auto">started at {startedAt}</p>

        {/* End Session */}
        <button
          type="button"
          onClick={handleEndSession}
          className="mb-12 text-secondary text-body font-medium min-h-[44px] transition-colors hover:text-forest"
        >
          End session &rarr;
        </button>

        {/* Confirmation Dialog */}
        {showConfirmEnd && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-6">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-medium animate-fade_in_up">
              <h2 className="text-heading text-forest mb-2">
                End your offline session?
              </h2>
              <p className="text-secondary text-body mb-6">
                You&apos;ve been offline for {formatDurationFromMs(elapsedMs)}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelEndSession}
                  className="flex-1 py-3 rounded-pill bg-forest text-white font-medium min-h-[44px] transition-all duration-200"
                >
                  Keep Going
                </button>
                <button
                  type="button"
                  onClick={confirmEndSession}
                  className="flex-1 py-3 text-secondary font-medium min-h-[44px] transition-all duration-200"
                >
                  End
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
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-8 page-transition">
      {/* Auto-expire notice */}
      {autoExpireNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-forest text-white text-sm font-medium shadow-medium max-w-sm text-center toast-animate">
          {autoExpireNotice}
        </div>
      )}

      <ReflectionPrompt />
      <InstallPrompt />

      {/* Top: Greeting + Streak */}
      <div className="w-full flex items-center justify-between mb-8">
        <h1 className="text-heading text-forest">
          Hi {userName || "there"}
        </h1>
        <div className={`px-3 py-1.5 rounded-pill text-xs font-semibold ${streak > 0 ? "bg-gold/20 text-forest" : "bg-forest/5 text-muted"}`}>
          {streak > 0 ? `🔥 ${streak}` : "🌱 0"}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="mb-2">
        {/* <ProgressRing progress={progress} size={180} strokeWidth={14}>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-forest">
              {Math.round(progress * 100)}%
            </span>
            <span className="text-sm font-medium text-secondary uppercase tracking-wider mt-1">
              Daily Goal
            </span>
          </div>
        </ProgressRing> */}
      </div>

      <p className="text-caption mb-8">
        {goalMet ? "Goal reached! ✨" : `of ${goalMinutes}m goal`}
      </p>

      {/* Go Offline Button */}
      <button
        type="button"
        onClick={handleGoOffline}
        className="w-full max-w-xs py-4 bg-forest text-white text-lg font-semibold rounded-pill shadow-button active:scale-[0.97] transition-all duration-200 animate-pulse_gentle min-h-[64px] mb-8"
      >
        Go Offline
      </button>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="w-full space-y-2">
          {recentSessions.slice(0, 2).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => router.push("/calendar")}
              className="w-full bg-white rounded-card p-3 shadow-soft flex items-center gap-3 text-left transition-all duration-200 hover:shadow-medium"
            >
              <div className="flex-1 text-sm text-forest">
                {formatDuration(s.durationMinutes)}
                {s.activities.length > 0 && ` · ${s.activities[0]}`}
                {s.moodRating && (() => {
                  const moods: Record<number, string> = { 1: "😫", 2: "😕", 3: "😐", 4: "😊", 5: "🤩" };
                  return ` · ${moods[s.moodRating] || ""}`;
                })()}
              </div>
              <span className="text-muted text-xs">{s.date.slice(5)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
