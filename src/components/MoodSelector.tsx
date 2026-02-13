"use client";

import { MOODS } from "@/lib/constants";

interface MoodSelectorProps {
  selected: number | null;
  onSelect: (rating: number) => void;
}

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const moodEntries = Object.entries(MOODS).map(([key, val]) => ({
    rating: Number(key),
    ...val,
  }));

  return (
    <div className="flex justify-center gap-3">
      {moodEntries.map((mood) => {
        const isSelected = selected === mood.rating;
        return (
          <button
            key={mood.rating}
            onClick={() => onSelect(mood.rating)}
            className="flex flex-col items-center gap-1 transition-all duration-200"
            type="button"
          >
            <div
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                width: isSelected ? 56 : 44,
                height: isSelected ? 56 : 44,
                backgroundColor: mood.bg,
                border: `2px solid ${mood.color}`,
                boxShadow: isSelected ? `0 0 12px ${mood.color}40` : "none",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
              }}
            >
              <span className={`transition-all duration-200 ${isSelected ? "text-2xl" : "text-xl"}`}>
                {mood.emoji}
              </span>
            </div>
            <span
              className={`text-xs font-medium transition-all duration-200 ${isSelected ? "opacity-100" : "opacity-0 h-0"}`}
              style={{ color: mood.color }}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
