"use client";

import { useState, useEffect } from "react";
import { getSessions, getDismissedPrompts, dismissPrompt, saveDayOverride } from "@/lib/storage";
import { getDayMood, getMoodDisplay } from "@/lib/mood-calculator";
import MoodSelector from "@/components/MoodSelector";

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default function ReflectionPrompt() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [yesterdayDate, setYesterdayDate] = useState("");
  const [sessionCount, setSessionCount] = useState(0);
  const [bestMood, setBestMood] = useState<number | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const yesterday = getYesterdayDate();
    setYesterdayDate(yesterday);
    const sessions = getSessions(yesterday);
    const dismissed = getDismissedPrompts();
    if (sessions.length >= 2 && !dismissed.includes(yesterday)) {
      setSessionCount(sessions.length);
      const mood = getDayMood(yesterday);
      setBestMood(mood);
      setSelectedMood(mood);
      setShow(true);
    }
  }, []);

  if (!mounted || !show) return null;

  const moodDisplay = bestMood ? getMoodDisplay(bestMood) : null;

  function handleKeep() {
    dismissPrompt(yesterdayDate);
    setShow(false);
  }

  function handleChange() {
    setShowMoodPicker(true);
  }

  function handleSaveMood() {
    if (selectedMood !== null) {
      saveDayOverride({
        date: yesterdayDate,
        overrideMood: selectedMood,
        updatedAt: new Date().toISOString(),
      });
    }
    dismissPrompt(yesterdayDate);
    setShow(false);
  }

  function handleSkip() {
    dismissPrompt(yesterdayDate);
    setShow(false);
  }

  function handleBackdropClick() {
    dismissPrompt(yesterdayDate);
    setShow(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-lg p-6 w-full max-w-[320px] shadow-medium animate-fade_in_up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-heading text-forest mb-2 text-center">
          Yesterday&apos;s offline time
        </h2>
        <p className="text-body text-secondary text-center mb-2">
          {sessionCount} sessions
          {moodDisplay && <> · best: {moodDisplay.emoji}</>}
        </p>
        <p className="text-body text-secondary text-center mb-6">
          Does this represent your day?
        </p>

        {showMoodPicker ? (
          <div className="space-y-4">
            <MoodSelector
              selected={selectedMood}
              onSelect={setSelectedMood}
            />
            <button
              type="button"
              onClick={handleSaveMood}
              className="w-full py-3 rounded-pill bg-forest text-white font-medium min-h-[44px] transition-all duration-200"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleKeep}
              className="w-full py-3 rounded-pill bg-forest text-white font-medium min-h-[44px] transition-all duration-200"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={handleChange}
              className="w-full py-3 rounded-pill text-forest font-medium min-h-[44px] transition-all duration-200"
              style={{ border: "1.5px solid rgba(27, 67, 50, 0.15)" }}
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-3 text-muted text-sm font-medium hover:text-secondary transition-colors min-h-[44px]"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
