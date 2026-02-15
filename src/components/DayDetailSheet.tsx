"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { getSessions, saveDayOverride } from "@/lib/storage";
import { getDayTotal } from "@/lib/streak-calculator";
import { isGoalMet } from "@/lib/streak-calculator";
import { getDayMood, getMoodDisplay } from "@/lib/mood-calculator";
import { formatDuration } from "@/lib/format";
import { formatDayHeader, formatTimeRange } from "@/lib/calendar-utils";
import MoodSelector from "@/components/MoodSelector";
import * as Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import type { Session } from "@/lib/types";

interface DayDetailSheetProps {
  date: string;
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      <div
        className="relative w-full max-w-md bg-surface border-t border-white/10 rounded-t-xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-6 pb-8">
          {/* Header */}
          <Typography.H2 className="mb-1 text-center">
            {formatDayHeader(date)}
          </Typography.H2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Typography.Body className="!mb-0 text-text-secondary">
              {formatDuration(dayTotal)} offline
            </Typography.Body>
            {goalMet && (
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-medium border border-accent/20">
                Goal met
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
            <Typography.Body className="text-center py-8 opacity-50">
              No sessions this day
            </Typography.Body>
          ) : (
            <div className="space-y-3 mb-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={() => handleEdit(session.id)}
                />
              ))}
            </div>
          )}

          {/* Override mood */}
          {sessions.length >= 2 && (
            <div className="pt-4 border-t border-white/10">
              {showMoodOverride ? (
                <div className="space-y-4">
                  <Typography.Body className="text-center">
                    How did this day feel overall?
                  </Typography.Body>
                  <MoodSelector
                    selected={overrideMood}
                    onSelect={setOverrideMood}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowMoodOverride(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="solid"
                      onClick={handleOverrideSave}
                      className="flex-1"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowMoodOverride(true)}
                  className="w-full text-text-secondary hover:text-white"
                >
                  Override day mood
                </Button>
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
    <div className="bg-surface-light rounded-xl p-4 border border-white/5 shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-white">
            {formatTimeRange(session.startTime, session.endTime)}
          </p>
          <Typography.Caption className="!mb-0 uppercase tracking-wider">
            {formatDuration(session.durationMinutes)}
          </Typography.Caption>
        </div>
        <div className="flex items-center gap-2">
          {moodDisplay && (
            <span
              className="text-sm px-2 py-1 rounded-full border border-current opacity-80"
              style={{ backgroundColor: `${moodDisplay.color}20`, color: moodDisplay.color, borderColor: `${moodDisplay.color}40` }}
            >
              {moodDisplay.emoji}
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-text-secondary hover:text-white"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {(session.activities.length > 0 || session.customActivity) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {session.activities.map((a) => (
            <span
              key={a}
              className="text-xs px-2 py-1 rounded-full bg-surface border border-white/10 text-text-secondary"
            >
              {a}
            </span>
          ))}
          {session.customActivity && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light">
              {session.customActivity}
            </span>
          )}
        </div>
      )}

      {session.notes && (
        <p className="text-xs text-text-secondary italic mt-1 border-l-2 border-white/10 pl-2">
          &ldquo;{session.notes}&rdquo;
        </p>
      )}
    </div>
  );
}
