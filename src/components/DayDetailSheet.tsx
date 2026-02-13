"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions, saveDayOverride } from "@/lib/storage";
import { getDayTotal } from "@/lib/streak-calculator";
import { isGoalMet } from "@/lib/streak-calculator";
import { getDayMood, getMoodDisplay } from "@/lib/mood-calculator";
import { formatDuration } from "@/lib/format";
import { formatDayHeader, formatTimeRange } from "@/lib/calendar-utils";
import MoodSelector from "@/components/MoodSelector";
import type { Session } from "@/lib/types";

interface DayDetailSheetProps {
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export default function DayDetailSheet({ date, onClose }: DayDetailSheetProps) {
  const router = useRouter();
  const sessions = getSessions(date);
  const dayTotal = getDayTotal(date);
  const goalMet = isGoalMet(date);
  const dayMood = getDayMood(date);
  const [showMoodOverride, setShowMoodOverride] = useState(false);
  const [overrideMood, setOverrideMood] = useState<number | null>(dayMood);

  function handleOverrideSave() {
    if (overrideMood !== null) {
      saveDayOverride({
        date,
        overrideMood,
        updatedAt: new Date().toISOString(),
      });
    }
    setShowMoodOverride(false);
  }

  function handleEdit(sessionId: string) {
    onClose();
    router.push(`/log?edit=${sessionId}`);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-cream rounded-t-[24px] shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-forest/20" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <h2 className="text-lg font-bold text-forest mb-1">
            {formatDayHeader(date)}
          </h2>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-forest/60">
              {formatDuration(dayTotal)} offline
            </span>
            {goalMet && (
              <span className="text-xs px-2 py-1 rounded-pill bg-forest/10 text-forest font-medium">
                ✅ Goal met
              </span>
            )}
            {dayMood !== null && (
              <span className="text-sm">
                {getMoodDisplay(dayMood).emoji}
              </span>
            )}
          </div>

          {/* Sessions list */}
          {sessions.length === 0 ? (
            <p className="text-forest/40 text-sm text-center py-8">
              No sessions this day
            </p>
          ) : (
            <div className="space-y-4 mb-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={() => handleEdit(session.id)}
                />
              ))}
            </div>
          )}

          {/* Override mood (multi-session days) */}
          {sessions.length >= 2 && (
            <div className="border-t border-forest/10 pt-4">
              {showMoodOverride ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-forest/70 text-center">
                    How did this day feel overall?
                  </p>
                  <MoodSelector
                    selected={overrideMood}
                    onSelect={setOverrideMood}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowMoodOverride(false)}
                      className="flex-1 py-3 rounded-pill bg-cream-dark text-forest font-medium text-sm min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleOverrideSave}
                      className="flex-1 py-3 rounded-pill bg-forest text-cream font-medium text-sm min-h-[44px]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMoodOverride(true)}
                  className="w-full py-3 text-forest/60 text-sm font-medium hover:text-forest transition-colors min-h-[44px]"
                >
                  Override day mood
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onEdit,
}: {
  session: Session;
  onEdit: () => void;
}) {
  const moodDisplay = session.moodRating
    ? getMoodDisplay(session.moodRating)
    : null;

  return (
    <div className="bg-white/60 rounded-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-forest">
            {formatTimeRange(session.startTime, session.endTime)}
          </p>
          <p className="text-xs text-forest/50">
            {formatDuration(session.durationMinutes)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {moodDisplay && (
            <span
              className="text-sm px-2 py-1 rounded-pill"
              style={{ backgroundColor: moodDisplay.bg, color: moodDisplay.color }}
            >
              {moodDisplay.emoji}
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-forest/40 hover:text-forest font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Activities */}
      {(session.activities.length > 0 || session.customActivity) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {session.activities.map((a) => (
            <span
              key={a}
              className="text-xs px-2 py-1 rounded-pill bg-cream-dark text-forest/70"
            >
              {a}
            </span>
          ))}
          {session.customActivity && (
            <span className="text-xs px-2 py-1 rounded-pill bg-gold/20 text-forest/70">
              {session.customActivity}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <p className="text-xs text-forest/50 italic mt-1">
          &ldquo;{session.notes}&rdquo;
        </p>
      )}
    </div>
  );
}
