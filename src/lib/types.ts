export interface UserSettings {
  name: string | null;
  dailyGoalMinutes: number;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface ActiveSession {
  startTime: string;
  isActive: boolean;
}

export interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  activities: string[];
  customActivity: string | null;
  moodRating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayOverride {
  date: string;
  overrideMood: number;
  updatedAt: string;
}

export type TimerStatus = "idle" | "running" | "paused" | "completed";
