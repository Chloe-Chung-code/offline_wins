import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
} from "./storage";
import type { ActiveSession, Session } from "./types";

export function startSession(): ActiveSession {
  const session: ActiveSession = {
    startTime: new Date().toISOString(),
    isActive: true,
  };
  setActiveSession(session);
  return session;
}

export function endSession(): Omit<Session, "activities" | "customActivity" | "moodRating" | "notes"> | null {
  const active = getActiveSession();
  if (!active) return null;

  const startTime = new Date(active.startTime);
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / 60000);

  const now = new Date().toISOString();
  const sessionStub = {
    id: crypto.randomUUID(),
    date: startTime.toISOString().split("T")[0],
    startTime: active.startTime,
    endTime: endTime.toISOString(),
    durationMinutes: Math.max(1, durationMinutes),
    createdAt: now,
    updatedAt: now,
  };

  clearActiveSession();
  return sessionStub;
}

export function isSessionActive(): boolean {
  const active = getActiveSession();
  return active !== null && active.isActive;
}

export function getElapsedMinutes(): number {
  const active = getActiveSession();
  if (!active) return 0;
  const elapsed = Date.now() - new Date(active.startTime).getTime();
  return Math.floor(elapsed / 60000);
}

export function getElapsedMs(): number {
  const active = getActiveSession();
  if (!active) return 0;
  return Date.now() - new Date(active.startTime).getTime();
}
