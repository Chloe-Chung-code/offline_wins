"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const monthSessions = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return allSessions.filter((s) => s.date.startsWith(monthPrefix));
  }, [allSessions, currentYear, currentMonth]);

  const bestMoments = useMemo(() => {
    return monthSessions
      .filter((s) => s.moodRating !== null)
      .sort((a, b) => (b.moodRating || 0) - (a.moodRating || 0))
      .slice(0, 3);
  }, [monthSessions]);

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
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-forest/5 transition-colors text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-heading text-forest">
          {formatMonthYear(currentYear, currentMonth)}
        </h1>
        <button
          type="button"
          onClick={nextMonth}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-forest/5 transition-colors text-secondary"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Streak + Today */}
      <div className="flex items-center justify-center gap-4 mb-5">
        {streak > 0 && (
          <div className="px-3 py-1.5 rounded-pill bg-gold/20 text-forest text-xs font-semibold">
            🔥 {streak} day streak
          </div>
        )}
        <div className="flex items-center gap-2">
          <ProgressRing progress={todayProgress} size={36} strokeWidth={3}>
            <span className="text-[8px] font-bold text-forest">
              {todayMinutes}m
            </span>
          </ProgressRing>
          <span className="text-caption">today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-caption py-1">
              {d}
            </div>
          ))}
        </div>

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
            const goalMetDay = !isFuture && hasSessions ? isGoalMet(dateStr) : false;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isFuture && handleDayClick(day)}
                disabled={isFuture}
                className={`aspect-square rounded-sm flex flex-col items-center justify-center relative transition-all duration-200 ${
                  isFuture
                    ? "text-muted/40 cursor-default"
                    : isToday
                    ? "ring-2 ring-forest"
                    : hasSessions
                    ? "hover:shadow-soft"
                    : ""
                }`}
                style={{
                  backgroundColor: moodDisplay
                    ? moodDisplay.bg
                    : isFuture
                    ? "#F5F2E8"
                    : hasSessions
                    ? "#EDE9D8"
                    : "#F5F2E8",
                }}
              >
                <span
                  className="text-[11px] font-medium leading-none"
                  style={{ color: moodDisplay ? moodDisplay.color : isFuture ? "#95A5A0" : "#52796F" }}
                >
                  {day}
                </span>

                {moodDisplay && (
                  <span className="text-[18px] leading-none mt-0.5">
                    {moodDisplay.emoji}
                  </span>
                )}

                {!moodDisplay && hasSessions && (
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 mt-0.5" />
                )}

                {goalMetDay && (
                  <span
                    className="absolute top-0.5 right-0.5 text-[10px] leading-none font-bold"
                    style={{ color: moodDisplay ? moodDisplay.color : "#1B4332" }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!hasAnySessions && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-secondary text-body mb-1">No sessions yet</p>
          <p className="text-caption">
            Start your first offline session from the Home tab
          </p>
        </div>
      )}

      {/* Best Moments */}
      {bestMoments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-heading text-forest mb-4">
            Best moments ✨
          </h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {bestMoments.map((session) => {
              const moodDisplay = session.moodRating
                ? getMoodDisplay(session.moodRating)
                : null;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedDate(session.date)}
                  className="flex-shrink-0 w-[200px] bg-white rounded-lg p-4 shadow-soft text-left transition-all duration-200 hover:shadow-medium"
                  style={{ borderLeft: moodDisplay ? `3px solid ${moodDisplay.color}` : undefined }}
                >
                  {moodDisplay && (
                    <span className="text-[32px] leading-none">
                      {moodDisplay.emoji}
                    </span>
                  )}
                  <p className="text-sm font-medium text-forest mt-2">
                    {formatDuration(session.durationMinutes)}
                  </p>
                  {session.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {session.activities.slice(0, 2).map((a) => (
                        <span key={a} className="text-[11px] text-secondary">{a}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-caption mt-1">{session.date}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Breakdown */}
      {activityBreakdown.length > 0 && (
        <div className="mb-8">
          <h2 className="text-heading text-forest mb-4">
            Your activities
          </h2>
          <div className="space-y-4">
            {activityBreakdown.map(({ activity, count, avgMood }) => (
              <div key={activity} className="flex items-center justify-between">
                <span className="text-body text-forest">{activity}</span>
                <span className="text-caption">
                  {count}x
                  {avgMood !== null && (
                    <> · {getMoodDisplay(Math.round(avgMood)).emoji} {avgMood.toFixed(1)}</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <DayDetailSheet date={selectedDate} onClose={handleSheetClose} />
      )}
    </div>
  );
}
