"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveSession, saveSession, updateSession, getSessions } from "@/lib/storage";
import { endSession } from "@/lib/session-manager";
import { formatDuration } from "@/lib/format";
import { ChevronLeft } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
// import ActivityChips from "@/components/ActivityChips";
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
      particleCount: 80,
      spread: 70,
      origin: { y: 0.3 },
      colors: ["#F2A93B", "#95D5B2", "#1B4332", "#FEFAE0"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#F2A93B", "#95D5B2"],
      });
    }, 200);
  }, []);

  useEffect(() => {
    setMounted(true);

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

    if (isReturning) {
      const active = getActiveSession();
      if (active) {
        const stub = endSession();
        if (stub) {
          setSessionStub(stub);
          setDurationMinutes(stub.durationMinutes);
        }
        setTimeout(fireConfetti, 300);
        return;
      }
    }

    const stub = endSession();
    if (stub) {
      setSessionStub(stub);
      setDurationMinutes(stub.durationMinutes);
      setTimeout(fireConfetti, 300);
    } else {
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

    setShowCelebration(true);
    fireConfetti();
    setTimeout(() => {
      router.push("/calendar");
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

  if (showCelebration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 page-transition">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-heading text-forest">
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
          className="self-start mb-4 text-secondary text-sm font-medium min-h-[44px] flex items-center gap-1 transition-colors hover:text-forest"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      )}

      {/* Duration card */}
      <div className="bg-white rounded-lg p-6 shadow-soft text-center mb-8">
        <p className="text-caption mb-1">
          {isEdit ? "Session duration" : "You were offline for"}
        </p>
        <div className="text-number text-forest">
          {formatDuration(durationMinutes)}
        </div>
        {!isEdit && (
          <p className="text-secondary text-body mt-1">
            That&apos;s awesome. What did you get up to?
          </p>
        )}
      </div>

      {/* Activities */}
      <div className="mb-8">
        <h2 className="text-heading text-forest mb-4">
          What did you do?
        </h2>
        {/* <ActivityChips selected={activities} onToggle={toggleActivity} /> */}
        <input
          type="text"
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          placeholder="Something else..."
          className="mt-4 w-full py-3 bg-transparent text-forest placeholder:text-muted outline-none text-body border-b-2 border-forest/10 focus:border-forest/40 transition-colors"
        />
      </div>

      {/* Mood */}
      <div className="mb-8">
        <h2 className="text-heading text-forest mb-4">
          How did it feel?
        </h2>
        <MoodSelector selected={moodRating} onSelect={setMoodRating} />
      </div>

      {/* Notes */}
      <div className="mb-10">
        <h2 className="text-heading text-forest mb-4">
          Any thoughts?
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What made this time special?"
          rows={3}
          className="w-full px-4 py-4 rounded-card bg-white text-forest placeholder:text-muted outline-none shadow-soft text-body resize-none transition-shadow focus:shadow-medium"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-4 pb-8">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 bg-forest text-white text-lg font-semibold rounded-pill shadow-button active:scale-[0.98] transition-all duration-200 min-h-[56px]"
        >
          {isEdit ? "Save Changes" : "Save"}
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-muted text-sm font-medium hover:text-secondary transition-colors min-h-[44px]"
          >
            Just save the time
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
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <LogContent />
    </Suspense>
  );
}
