"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getActiveSession,
  saveSession,
  updateSession,
  getSessions,
} from "@/lib/storage";
import { endSession } from "@/lib/session-manager";
import { formatDuration } from "@/lib/format";
import { ChevronLeft } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
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

type LogPhase = "celebration" | "form";

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReturning = searchParams.get("returning") === "true";
  const editId = searchParams.get("edit");

  const [mounted, setMounted] = useState(false);
  const [sessionStub, setSessionStub] = useState<Partial<Session> | null>(
    null
  );
  const [activities, setActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState("");
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [isEdit, setIsEdit] = useState(false);

  const [phase, setPhase] = useState<LogPhase>("celebration");
  const [celebrationFading, setCelebrationFading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const hasProcessedRef = useRef(false);

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
        setPhase("form");
        setFormVisible(true);
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
          setPhase("celebration");
        }
        return;
      }
    }

    const stub = endSession();
    if (stub) {
      setSessionStub(stub);
      setDurationMinutes(stub.durationMinutes);
      setPhase("celebration");
    } else {
      router.replace("/");
    }
  }, [editId, isReturning, router]);

  if (!mounted || (!sessionStub && !isEdit)) return null;

  function toggleActivity(label: string) {
    setActivities((prev) =>
      prev.includes(label)
        ? prev.filter((a) => a !== label)
        : [...prev, label]
    );
  }

  function handleLogYourWin() {
    setCelebrationFading(true);
    setTimeout(() => {
      setPhase("form");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFormVisible(true);
        });
      });
    }, 400);
  }

  function handleSaveJustTime() {
    if (sessionStub) {
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

    router.push("/calendar");
  }

  // --- Celebration Screen ---
  if (phase === "celebration") {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden transition-opacity duration-[400ms] ${
          celebrationFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Ripple rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 animate-ripple-expand"
            style={{
              animationDelay: `${i * 0.4}s`,
              width: "100px",
              height: "100px",
            }}
          />
        ))}

        {/* Central glow */}
        <div className="absolute w-32 h-32 bg-[#3B82F6]/20 blur-3xl rounded-full animate-pulse-slow" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
          <h1
            className="text-2xl font-bold text-[#0F172A] opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            Nice work!
          </h1>
          <p
            className="text-4xl font-bold text-[#0F172A] mt-2 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.7s" }}
          >
            {formatDuration(durationMinutes)} offline
          </p>

          <div className="h-12" />

          <button
            type="button"
            onClick={handleLogYourWin}
            className="w-full py-4 bg-[#0F172A] text-white text-lg font-semibold rounded-2xl shadow-lg active:scale-[0.98] transition-transform duration-200 min-h-[56px] opacity-0 animate-fade-in-up"
            style={{ animationDelay: "1.2s" }}
          >
            Log your win
          </button>
          <button
            type="button"
            onClick={handleSaveJustTime}
            className="mt-4 text-sm font-medium text-[#94A3B8] hover:text-[#475569] transition-colors min-h-[44px] opacity-0 animate-fade-in-up"
            style={{ animationDelay: "1.4s" }}
          >
            Save just the time
          </button>
        </div>
      </div>
    );
  }

  // --- Log Form ---
  return (
    <div
      className={`min-h-screen flex flex-col px-6 py-8 transition-all duration-500 ease-out ${
        formVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-5"
      }`}
    >
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

      {/* Duration card — only in edit mode (user didn't see the ripple screen) */}
      {isEdit && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-8">
          <p className="text-xs uppercase tracking-wider text-[#94A3B8] mb-1">
            Session duration
          </p>
          <div className="text-5xl font-bold text-[#0F172A] tabular-nums">
            {formatDuration(durationMinutes)}
          </div>
        </div>
      )}

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

      {/* Save Button */}
      <div className="mt-auto pb-8">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 bg-[#0F172A] text-white text-lg font-semibold rounded-2xl shadow-lg active:scale-[0.98] transition-all duration-200 min-h-[56px]"
        >
          {isEdit ? "Save Changes" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[#94A3B8]">Loading...</div>
        </div>
      }
    >
      <LogContent />
    </Suspense>
  );
}
