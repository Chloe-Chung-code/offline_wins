"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSettings, getSessions } from "@/lib/storage";
import { getDayMood, getMoodDisplay } from "@/lib/mood-calculator";
import { getDayTotal, isGoalMet, getCurrentStreak } from "@/lib/streak-calculator";
import { formatDuration, getTodayDate } from "@/lib/format";
import { getMonthDays, formatMonthYear, formatDateString } from "@/lib/calendar-utils";
import ProgressRing from "@/components/ProgressRing";
import DayDetailSheet from "@/components/DayDetailSheet";
import type { Session } from "@/lib/types";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function CalendarPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setGoalMinutes(settings.dailyGoalMinutes);
    setStreak(getCurrentStreak());
    setTodayMinutes(getDayTotal(getTodayDate()));
    setAllSessions(getSessions());
  }, [router]);

  // Refresh data when sheet closes or month changes
  function refreshData() {
    setAllSessions(getSessions());
    setTodayMinutes(getDayTotal(getTodayDate()));
    setStreak(getCurrentStreak());
  }

  const days = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const todayStr = getTodayDate();
  const todayProgress = goalMinutes > 0 ? todayMinutes / goalMinutes : 0;

  // Month sessions for Best Moments and Activity Breakdown
  const monthSessions = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return allSessions.filter((s) => s.date.startsWith(monthPrefix));
  }, [allSessions, currentYear, currentMonth]);

  // Best moments: top 3 highest-mood sessions
  const bestMoments = useMemo(() => {
    return monthSessions
      .filter((s) => s.moodRating !== null)
      .sort((a, b) => (b.moodRating || 0) - (a.moodRating || 0))
      .slice(0, 3);
  }, [monthSessions]);

  // Activity breakdown
  const activityBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; totalMood: number; moodCount: number }> = {};
    for (const s of monthSessions) {
      for (const a of s.activities) {
        if (!counts[a]) counts[a] = { count: 0, totalMood: 0, moodCount: 0 };
        counts[a].count++;
        if (s.moodRating !== null) {
          counts[a].totalMood += s.moodRating;
          counts[a].moodCount++;
        }
      }
    }
    return Object.entries(counts)
      .map(([activity, data]) => ({
        activity,
        count: data.count,
        avgMood: data.moodCount > 0 ? Math.round((data.totalMood / data.moodCount) * 10) / 10 : null,
      }))
      .sort((a, b) => b.count - a.count);
  }, [monthSessions]);

  const maxActivityCount = activityBreakdown.length > 0 ? activityBreakdown[0].count : 1;

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleDayClick(day: number) {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    // Only open detail if there are sessions or it's today/past
    if (dateStr <= todayStr) {
      setSelectedDate(dateStr);
    }
  }

  function handleSheetClose() {
    setSelectedDate(null);
    refreshData();
  }

  if (!mounted) return null;

  const hasAnySessions = allSessions.length > 0;

  return (
    <div className="px-4 py-6 page-transition">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-forest/10 transition-colors text-forest/60 min-h-[44px] min-w-[44px]"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-forest">
          {formatMonthYear(currentYear, currentMonth)}
        </h1>
        <button
          type="button"
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-forest/10 transition-colors text-forest/60 min-h-[44px] min-w-[44px]"
        >
          →
        </button>
      </div>

      {/* Streak + Today's Progress */}
      <div className="flex items-center justify-center gap-4 mb-5">
        {streak > 0 && (
          <div className="px-4 py-1.5 rounded-pill bg-gold/20 text-forest text-sm font-semibold">
            🔥 {streak} day streak
          </div>
        )}
        <div className="flex items-center gap-2">
          <ProgressRing progress={todayProgress} size={40} strokeWidth={4}>
            <span className="text-[9px] font-bold text-forest">
              {formatDuration(todayMinutes)}
            </span>
          </ProgressRing>
          <span className="text-xs text-forest/50">today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-forest/40 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = formatDateString(currentYear, currentMonth, day);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            const mood = !isFuture ? getDayMood(dateStr) : null;
            const moodDisplay = mood !== null ? getMoodDisplay(mood) : null;
            const daySessions = !isFuture ? getSessions(dateStr) : [];
            const hasSessions = daySessions.length > 0;
            const goalMetToday = !isFuture && hasSessions ? isGoalMet(dateStr) : false;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isFuture && handleDayClick(day)}
                disabled={isFuture}
                className={`aspect-square rounded-[10px] flex flex-col items-center justify-center relative transition-all text-xs ${
                  isFuture
                    ? "bg-[#F9FAFB] text-forest/20 cursor-default"
                    : isToday
                    ? "ring-2 ring-forest/40"
                    : ""
                } ${
                  moodDisplay
                    ? ""
                    : hasSessions
                    ? "bg-[#F9FAFB]"
                    : "bg-[#F9FAFB]"
                }`}
                style={
                  moodDisplay
                    ? { backgroundColor: moodDisplay.bg }
                    : undefined
                }
              >
                {/* Date number */}
                <span
                  className={`text-[11px] font-medium leading-none ${
                    moodDisplay ? "" : "text-forest/60"
                  }`}
                  style={moodDisplay ? { color: moodDisplay.color } : undefined}
                >
                  {day}
                </span>

                {/* Mood emoji */}
                {moodDisplay && (
                  <span className="text-sm leading-none mt-0.5">
                    {moodDisplay.emoji}
                  </span>
                )}

                {/* Dot for sessions with no mood */}
                {!moodDisplay && hasSessions && (
                  <div className="w-1.5 h-1.5 rounded-full bg-forest/30 mt-0.5" />
                )}

                {/* Goal met checkmark */}
                {goalMetToday && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] leading-none">
                    ✅
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!hasAnySessions && (
        <div className="text-center py-8">
          <p className="text-forest/40 text-sm mb-2">No sessions yet</p>
          <p className="text-forest/30 text-xs">
            Start your first offline session! 🌿
            <br />
            Head to the Home tab to begin.
          </p>
        </div>
      )}

      {/* Best Moments */}
      {bestMoments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-forest/70 mb-3">
            Your best offline moments this month ✨
          </h2>
          <div className="space-y-2">
            {bestMoments.map((session) => {
              const moodDisplay = session.moodRating
                ? getMoodDisplay(session.moodRating)
                : null;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedDate(session.date)}
                  className="w-full bg-white/60 rounded-card p-3 shadow-sm flex items-center gap-3 text-left hover:bg-white/80 transition-colors"
                >
                  {moodDisplay && (
                    <span
                      className="text-xl w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: moodDisplay.bg }}
                    >
                      {moodDisplay.emoji}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-forest/50">{session.date}</p>
                    <p className="text-sm font-medium text-forest truncate">
                      {formatDuration(session.durationMinutes)}
                      {session.activities.length > 0 &&
                        ` — ${session.activities[0]}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Breakdown */}
      {activityBreakdown.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-forest/70 mb-3">
            What you do offline 📊
          </h2>
          <div className="space-y-3">
            {activityBreakdown.map(({ activity, count, avgMood }) => (
              <div key={activity}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-forest">{activity}</span>
                  <span className="text-xs text-forest/50">
                    {count}x
                    {avgMood !== null && (
                      <>
                        {" "}
                        · avg {getMoodDisplay(Math.round(avgMood)).emoji}{" "}
                        {avgMood.toFixed(1)}
                      </>
                    )}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-forest/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-forest/40 transition-all duration-500"
                    style={{
                      width: `${(count / maxActivityCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Detail Sheet */}
      {selectedDate && (
        <DayDetailSheet date={selectedDate} onClose={handleSheetClose} />
      )}
    </div>
  );
}
