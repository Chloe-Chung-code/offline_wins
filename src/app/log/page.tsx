"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getActiveSession, saveSession, updateSession, getSessions } from "@/lib/storage";
import { endSession } from "@/lib/session-manager";
import { formatDuration } from "@/lib/format";
import { ChevronLeft } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import RippleEffect from "@/components/timer/RippleEffect";
import type { Session } from "@/lib/types";

const ACTIVITY_PRESETS = [
  { emoji: "📚", label: "Reading" },
  { emoji: "🚶", label: "Walking" },
  { emoji: "🏋️", label: "Exercise" },
  { emoji: "🍳", label: "Cooking" },
  { emoji: "👥", label: "Socializing" },
  { emoji: "🧘", label: "Meditation" },
  { emoji: "🌿", label: "Nature" },
  { emoji: "🎨", label: "Creating" },
  { emoji: "🎮", label: "Playing" },
];

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
  const [isEdit, setIsEdit] = useState(false);

  // Ripple states
  const [showEntryRipple, setShowEntryRipple] = useState(false);
  const [showSaveRipple, setShowSaveRipple] = useState(false);
  const [formReady, setFormReady] = useState(false);

  const hasProcessedRef = useRef(false);

  const handleEntryRippleComplete = useCallback(() => {
    setShowEntryRipple(false);
    setFormReady(true);
  }, []);

  const handleSaveRippleComplete = useCallback(() => {
    router.push("/calendar");
  }, [router]);

  useEffect(() => {
    setMounted(true);

    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

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
        setFormReady(true);
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
          setShowEntryRipple(true);
        }
        return;
      }
    }

    const stub = endSession();
    if (stub) {
      setSessionStub(stub);
      setDurationMinutes(stub.durationMinutes);
      setShowEntryRipple(true);
    } else {
      router.replace("/");
    }
  }, [editId, isReturning, router]);

  if (!mounted || (!sessionStub && !isEdit)) return null;

  function toggleActivity(label: string) {
    setActivities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
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

    setShowSaveRipple(true);
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

  // Entry ripple overlay
  if (showEntryRipple) {
    return (
      <RippleEffect
        active={true}
        onComplete={handleEntryRippleComplete}
        duration={2000}
        title="Nice work!"
        subtitle="Let&rsquo;s log your win."
      />
    );
  }

  // Save ripple overlay
  if (showSaveRipple) {
    return (
      <RippleEffect
        active={true}
        onComplete={handleSaveRippleComplete}
        duration={1500}
        title={isEdit ? "Updated!" : "Saved!"}
        subtitle=""
      />
    );
  }

  // Wait for entry ripple to finish before showing form
  if (!formReady && !isEdit) return null;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Back button for edit mode */}
      {isEdit && (
        <button
          type="button"
          onClick={() => router.back()}
          className="self-start mb-4 text-[#475569] text-sm font-medium min-h-[44px] flex items-center gap-1 transition-colors hover:text-[#0F172A]"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      )}

      {/* Duration card */}
      <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-8">
        <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
          {isEdit ? "Session duration" : "You were offline for"}
        </p>
        <div className="text-5xl font-bold text-[#0F172A] tabular-nums">
          {formatDuration(durationMinutes)}
        </div>
        {!isEdit && (
          <p className="text-sm text-[#94A3B8] mt-1">
            That&apos;s awesome. What did you get up to?
          </p>
        )}
      </div>

      {/* Activities */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
          What did you do?
        </h2>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_PRESETS.map((preset) => {
            const isSelected = activities.includes(preset.label);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => toggleActivity(preset.label)}
                className={`px-3 py-2 rounded-full text-sm font-medium min-h-[40px] transition-all duration-150 ${
                  isSelected
                    ? "bg-[#0F172A] text-white border border-transparent"
                    : "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                }`}
              >
                {preset.emoji} {preset.label}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          placeholder="Something else..."
          className="mt-4 w-full py-3 bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] outline-none text-base border-b-2 border-[#E2E8F0] focus:border-[#3B82F6] transition-colors"
        />
      </div>

      {/* Mood */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
          How did it feel?
        </h2>
        <MoodSelector selected={moodRating} onSelect={setMoodRating} />
      </div>

      {/* Notes */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
          Any thoughts?
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What made this time special?"
          rows={3}
          className="w-full px-4 py-4 rounded-xl bg-white text-[#0F172A] placeholder:text-[#94A3B8] outline-none shadow-sm text-base resize-none transition-shadow focus:shadow-md"
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-4 pb-8">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 bg-[#0F172A] text-white text-lg font-semibold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-200 min-h-[56px]"
        >
          {isEdit ? "Save Changes" : "Save"}
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-sm font-medium text-[#94A3B8] hover:text-[#475569] transition-colors min-h-[44px]"
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
        <div className="text-[#94A3B8]">Loading...</div>
      </div>
    }>
      <LogContent />
    </Suspense>
  );
}
