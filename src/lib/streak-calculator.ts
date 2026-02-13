import { getSessions, getSettings } from "./storage";
import type { Session } from "./types";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDayTotal(date: string): number {
  const sessions = getSessions(date);
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function isGoalMet(date: string): boolean {
  const settings = getSettings();
  return getDayTotal(date) >= settings.dailyGoalMinutes;
}

export function getCurrentStreak(): number {
  const today = new Date();
  let streak = 0;
  let currentDate = today;

  // Check today first — if goal not met today, start checking from yesterday
  if (isGoalMet(formatDate(currentDate))) {
    streak = 1;
    currentDate = addDays(currentDate, -1);
  } else {
    currentDate = addDays(currentDate, -1);
  }

  // Count consecutive days backward
  while (isGoalMet(formatDate(currentDate))) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }

  return streak;
}

export function getLifetimeStats(): {
  totalHours: number;
  totalSessions: number;
  longestStreak: number;
} {
  const sessions = getSessions();
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalSessions = sessions.length;

  // Calculate longest streak
  const longestStreak = calculateLongestStreak(sessions);

  return { totalHours, totalSessions, longestStreak };
}

function calculateLongestStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  // Get unique dates with sessions
  const datesWithSessions = Array.from(new Set(sessions.map((s) => s.date))).sort();
  if (datesWithSessions.length === 0) return 0;

  let longest = 0;
  let current = 0;

  // Go through each date from earliest to latest
  const startDate = new Date(datesWithSessions[0]);
  const endDate = new Date(datesWithSessions[datesWithSessions.length - 1]);

  let d = new Date(startDate);
  while (d <= endDate) {
    const dateStr = formatDate(d);
    if (isGoalMet(dateStr)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    d = addDays(d, 1);
  }

  return longest;
}
