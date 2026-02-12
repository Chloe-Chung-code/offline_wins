import { MOODS } from "./constants";
import { getSessions, getDayOverride } from "./storage";

export function getDayMood(date: string): number | null {
  // 1. Check for manual override
  const override = getDayOverride(date);
  if (override) return override.overrideMood;

  // 2. Check sessions for the day
  const sessions = getSessions(date);
  if (sessions.length === 0) return null;

  const moodsForDay = sessions
    .map((s) => s.moodRating)
    .filter((m): m is number => m !== null);

  if (moodsForDay.length === 0) return null;

  // 3. Single session → use that mood; multiple → use best
  if (moodsForDay.length === 1) return moodsForDay[0];
  return Math.max(...moodsForDay);
}

export function getMoodDisplay(rating: number): {
  emoji: string;
  color: string;
  bg: string;
  label: string;
} {
  const mood = MOODS[rating as keyof typeof MOODS];
  if (!mood) {
    return { emoji: "😐", color: "#CA8A04", bg: "#FEF9C3", label: "Okay" };
  }
  return mood;
}
