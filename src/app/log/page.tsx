"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveSession, saveSession, updateSession, getSessions } from "@/lib/storage";
import { endSession } from "@/lib/session-manager";
import { formatDuration } from "@/lib/format";
import MoodSelector from "@/components/MoodSelector";
import ActivityChips from "@/components/ActivityChips";
import type { Session } from "@/lib/types";
import confetti from "canvas-confetti";

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReturning = searchParams.get("returning") === "true";
  const editId = searchParams.get("edit");

  const [mounted, setMounted] = useState(false);
  const [sessionStub, setSessionStub] = useState<Partial<Session> | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState("");
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ["#1B4332", "#F2A93B", "#E76F51", "#FEFAE0"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#1B4332", "#F2A93B", "#E76F51"],
      });
    }, 200);
  }, []);

  useEffect(() => {
    setMounted(true);

    // Edit mode
    if (editId) {
      const sessions = getSessions();
      const session = sessions.find((s) => s.id === editId);
      if (session) {
        setIsEdit(true);
        setSessionStub(session);
        setDurationMinutes(session.durationMinutes);
        setActivities(session.activities || []);
        setCustomActivity(session.customActivity || "");
        setMoodRating(session.moodRating);
        setNotes(session.notes || "");
      }
      return;
    }

    // Returning user with active session
    if (isReturning) {
      const active = getActiveSession();
      if (active) {
        // End the session
        const stub = endSession();
        if (stub) {
          setSessionStub(stub);
          setDurationMinutes(stub.durationMinutes);
        }
        setTimeout(fireConfetti, 300);
        return;
      }
    }

    // Normal flow: session was just ended from Home page
    const stub = endSession();
    if (stub) {
      setSessionStub(stub);
      setDurationMinutes(stub.durationMinutes);
      setTimeout(fireConfetti, 300);
    } else {
      // No active session to end, redirect home
      router.replace("/");
    }
  }, [editId, isReturning, router, fireConfetti]);

  if (!mounted || (!sessionStub && !isEdit)) return null;

  function toggleActivity(activity: string) {
    setActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  }

  function handleSave() {
    if (isEdit && editId) {
      updateSession(editId, {
        activities,
        customActivity: customActivity.trim() || null,
        moodRating,
        notes: notes.trim() || null,
      });
    } else if (sessionStub) {
      const fullSession: Session = {
        id: sessionStub.id || crypto.randomUUID(),
        date: sessionStub.date || new Date().toISOString().split("T")[0],
        startTime: sessionStub.startTime || new Date().toISOString(),
        endTime: sessionStub.endTime || new Date().toISOString(),
        durationMinutes,
        activities,
        customActivity: customActivity.trim() || null,
        moodRating,
        notes: notes.trim() || null,
        createdAt: sessionStub.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSession(fullSession);
    }

    // Brief celebration
    setShowCelebration(true);
    fireConfetti();
    setTimeout(() => {
      router.push(isEdit ? "/calendar" : "/calendar");
    }, 1200);
  }

  function handleSkip() {
    if (sessionStub && !isEdit) {
      const fullSession: Session = {
        id: sessionStub.id || crypto.randomUUID(),
        date: sessionStub.date || new Date().toISOString().split("T")[0],
        startTime: sessionStub.startTime || new Date().toISOString(),
        endTime: sessionStub.endTime || new Date().toISOString(),
        durationMinutes,
        activities: [],
        customActivity: null,
        moodRating: null,
        notes: null,
        createdAt: sessionStub.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSession(fullSession);
    }
    router.push("/calendar");
  }

  // Celebration overlay
  if (showCelebration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 page-transition">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-2xl font-bold text-forest">
          {isEdit ? "Updated!" : "Saved!"}
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 page-transition">
      {/* Back button for edit mode */}
      {isEdit && (
        <button
          type="button"
          onClick={() => router.back()}
          className="self-start mb-4 text-forest/60 text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Back
        </button>
      )}

      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-forest mb-1">
          {isReturning
            ? `Welcome back! You were offline for ${formatDuration(durationMinutes)}!`
            : isEdit
            ? "Edit Session"
            : `You were offline for ${formatDuration(durationMinutes)}!`}
        </h1>
        {!isEdit && (
          <p className="text-forest/60 text-sm">
            That&apos;s awesome. What did you get up to?
          </p>
        )}
      </div>

      {/* Activities */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-forest/70 mb-3">
          What did you do?
        </h2>
        <ActivityChips selected={activities} onToggle={toggleActivity} />
        <input
          type="text"
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          placeholder="Or describe what you did..."
          className="mt-3 w-full px-4 py-3 rounded-card bg-white/80 text-forest placeholder:text-forest/30 outline-none focus:ring-2 focus:ring-forest/30 shadow-sm text-sm"
        />
      </div>

      {/* Mood */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-forest/70 mb-3">
          How do you feel?
        </h2>
        <MoodSelector selected={moodRating} onSelect={setMoodRating} />
      </div>

      {/* Notes */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-forest/70 mb-3">
          Any thoughts?
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What made this time special?"
          rows={3}
          className="w-full px-4 py-3 rounded-card bg-white/80 text-forest placeholder:text-forest/30 outline-none focus:ring-2 focus:ring-forest/30 shadow-sm text-sm resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-3 pb-8">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 px-8 bg-forest text-cream text-lg font-semibold rounded-pill shadow-lg hover:bg-forest-light active:scale-[0.98] transition-all min-h-[56px]"
        >
          {isEdit ? "Save Changes" : "Save 🎉"}
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-forest/50 text-sm font-medium hover:text-forest/70 transition-colors min-h-[44px]"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-forest/40">Loading...</div>
      </div>
    }>
      <LogContent />
    </Suspense>
  );
}
