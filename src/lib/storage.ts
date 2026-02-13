import { STORAGE_KEYS, DEFAULT_DAILY_GOAL_MINUTES } from "./constants";
import type { UserSettings, ActiveSession, Session, DayOverride } from "./types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Settings
export function getSettings(): UserSettings {
  const settings = getItem<UserSettings>(STORAGE_KEYS.SETTINGS);
  if (!settings) {
    return {
      name: null,
      dailyGoalMinutes: DEFAULT_DAILY_GOAL_MINUTES,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };
  }
  return settings;
}

export function saveSettings(settings: UserSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Active Session
export function getActiveSession(): ActiveSession | null {
  return getItem<ActiveSession>(STORAGE_KEYS.ACTIVE_SESSION);
}

export function setActiveSession(session: ActiveSession): void {
  setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
}

export function clearActiveSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

// Sessions
export function getSessions(date?: string): Session[] {
  const sessions = getItem<Session[]>(STORAGE_KEYS.SESSIONS) || [];
  if (date) {
    return sessions.filter((s) => s.date === date);
  }
  return sessions;
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  sessions.push(session);
  setItem(STORAGE_KEYS.SESSIONS, sessions);
}

export function updateSession(id: string, updates: Partial<Session>): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.SESSIONS, sessions);
  }
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  setItem(STORAGE_KEYS.SESSIONS, sessions);
}

// Day Overrides
export function getDayOverride(date: string): DayOverride | null {
  const overrides = getItem<DayOverride[]>(STORAGE_KEYS.DAY_OVERRIDES) || [];
  return overrides.find((o) => o.date === date) || null;
}

export function saveDayOverride(override: DayOverride): void {
  const overrides = getItem<DayOverride[]>(STORAGE_KEYS.DAY_OVERRIDES) || [];
  const index = overrides.findIndex((o) => o.date === override.date);
  if (index !== -1) {
    overrides[index] = override;
  } else {
    overrides.push(override);
  }
  setItem(STORAGE_KEYS.DAY_OVERRIDES, overrides);
}

// Dismissed Prompts
export function getDismissedPrompts(): string[] {
  return getItem<string[]>(STORAGE_KEYS.PROMPT_DISMISSED) || [];
}

export function dismissPrompt(date: string): void {
  const dismissed = getDismissedPrompts();
  if (!dismissed.includes(date)) {
    dismissed.push(date);
    setItem(STORAGE_KEYS.PROMPT_DISMISSED, dismissed);
  }
}

// Clear all data
export function clearAllData(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
