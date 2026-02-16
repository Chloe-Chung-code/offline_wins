"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSettings, getSessions } from "@/lib/storage";
import {
  getMonthDays,
  formatMonthYear,
  formatDateString,
  formatDayHeader,
} from "@/lib/calendar-utils";
import { getDayMood, getMoodDisplay } from "@/lib/mood-calculator";
import {
  getDayTotal,
  isGoalMet,
  getCurrentStreak,
} from "@/lib/streak-calculator";
import { formatDuration, getTodayDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

const MOOD_BG: Record<number, string> = {
  1: "bg-[#FEE2E2]",
  2: "bg-[#FFEDD5]",
  3: "bg-[#FEF9C3]",
  4: "bg-[#ECFCCB]",
  5: "bg-[#DCFCE7]",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [router]);

  // Reset selected date when month changes
  useEffect(() => {
    setSelectedDate(null);
  }, [year, month]);

  const today = useMemo(() => getTodayDate(), []);
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  const streak = useMemo(() => (mounted ? getCurrentStreak() : 0), [mounted]);

  const days = useMemo(
    () => (mounted ? getMonthDays(year, month) : []),
    [mounted, year, month]
  );

  const settings = useMemo(
    () => (mounted ? getSettings() : null),
    [mounted]
  );

  const todayTotal = useMemo(
    () => (mounted ? getDayTotal(today) : 0),
    [mounted, today]
  );

  const goalMinutes = settings?.dailyGoalMinutes ?? 60;

  const selectedSessions: Session[] = useMemo(() => {
    if (!mounted || !selectedDate) return [];
    return getSessions(selectedDate);
  }, [mounted, selectedDate]);

  const monthSessions = useMemo(() => {
    if (!mounted) return { totalMinutes: 0, totalSessions: 0 };
    const all = getSessions();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const filtered = all.filter((s) => s.date.startsWith(monthStr));
    const totalMinutes = filtered.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );
    return { totalMinutes, totalSessions: filtered.length };
  }, [mounted, year, month]);

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-5">
      {/* 1. Header */}
      <div className="pt-14 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Calendar</h1>
        {streak > 0 ? (
          <span className="bg-[#FEF3C7] text-[#92400E] rounded-full px-2.5 py-1 text-xs font-medium">
            🔥 {streak}
          </span>
        ) : (
          <span className="text-sm text-[#94A3B8]">🌱 Start your streak!</span>
        )}
      </div>

      {/* 2. Month navigator */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={prevMonth}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="text-[#94A3B8]" size={20} />
        </button>
        <span className="text-lg font-semibold text-[#0F172A]">
          {formatMonthYear(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="text-[#94A3B8]" size={20} />
        </button>
      </div>

      {/* 3. Day-of-week header row */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-xs font-medium text-[#94A3B8] text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 4. Monthly calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = formatDateString(year, month, day);
          const mood = getDayMood(dateStr);
          const sessions = getSessions(dateStr);
          const hasSessions = sessions.length > 0;
          const goalMet = isGoalMet(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          let cellBg = "bg-[#F1F5F9]";
          let moodEmoji: string | null = null;

          if (mood !== null) {
            cellBg = MOOD_BG[mood] || "bg-[#F1F5F9]";
            const display = getMoodDisplay(mood);
            moodEmoji = display.emoji;
          } else if (hasSessions) {
            cellBg = "bg-[#E2E8F0]";
          }

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                "aspect-square rounded-xl relative flex flex-col items-center justify-center",
                cellBg,
                isToday && "ring-2 ring-[#3B82F6] ring-offset-1",
                isSelected && "ring-2 ring-[#0F172A] ring-offset-1"
              )}
            >
              {mood !== null ? (
                <>
                  <span className="absolute top-1 left-1.5 text-[10px] text-[#475569] leading-none">
                    {day}
                  </span>
                  <span className="text-base leading-none">{moodEmoji}</span>
                </>
              ) : (
                <span
                  className={cn(
                    "text-xs",
                    hasSessions ? "text-[#475569]" : "text-[#94A3B8]"
                  )}
                >
                  {day}
                </span>
              )}
              {goalMet && (
                <span className="absolute bottom-0.5 right-1 text-[10px] text-[#16A34A] leading-none">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Today's progress */}
      {isCurrentMonth && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-[#0F172A]">Today</span>
            <span className="text-sm text-[#94A3B8]">
              {todayTotal}m / {goalMinutes}m
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3B82F6] transition-all"
              style={{
                width: `${Math.min(100, (todayTotal / goalMinutes) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Selected day detail */}
      {selectedDate && (
        <div className="mt-6 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-[#0F172A]">
                {formatDayHeader(selectedDate)}
              </span>
              <div className="flex items-center gap-2">
                {selectedSessions.length > 0 && (
                  <span className="text-sm text-[#475569]">
                    {formatDuration(
                      selectedSessions.reduce(
                        (sum, s) => sum + s.durationMinutes,
                        0
                      )
                    )}
                  </span>
                )}
                {isGoalMet(selectedDate) && (
                  <span className="text-xs text-[#16A34A] font-medium">
                    ✓ Goal
                  </span>
                )}
              </div>
            </div>

            {selectedSessions.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-4">
                No offline time this day
              </p>
            ) : (
              <div className="space-y-0">
                {selectedSessions.map((session, i) => {
                  const moodDisplay = session.moodRating
                    ? getMoodDisplay(session.moodRating)
                    : null;
                  const endTime = new Date(session.endTime);
                  const timeStr = endTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const activityEmojis = session.activities
                    .map((a) => a.split(" ")[0])
                    .join("");

                  return (
                    <div key={session.id}>
                      {i > 0 && <div className="border-t border-[#E2E8F0] my-2" />}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#475569]">
                          {formatDuration(session.durationMinutes)}
                          {activityEmojis && ` · ${activityEmojis}`}
                          {moodDisplay && ` · ${moodDisplay.emoji}`}
                          {` · ${timeStr}`}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/log?edit=${session.id}`)
                          }
                          className="text-sm text-[#3B82F6] font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      {session.notes && (
                        <p className="text-xs text-[#94A3B8] italic mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Monthly summary */}
      <div className="mt-6 mb-20">
        <p className="text-sm font-medium text-[#0F172A] mb-3">This month</p>
        <div className="flex gap-3">
          <span className="bg-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#475569]">
            {formatDuration(monthSessions.totalMinutes)} total
          </span>
          <span className="bg-[#F1F5F9] rounded-lg px-3 py-2 text-sm text-[#475569]">
            {monthSessions.totalSessions} sessions
          </span>
        </div>
      </div>
    </div>
  );
}
