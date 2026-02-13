"use client";

import { ACTIVITIES } from "@/lib/constants";

interface ActivityChipsProps {
  selected: string[];
  onToggle: (activity: string) => void;
}

export default function ActivityChips({ selected, onToggle }: ActivityChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ACTIVITIES.map((activity) => {
        const isSelected = selected.includes(activity);
        return (
          <button
            key={activity}
            type="button"
            onClick={() => onToggle(activity)}
            className={`px-4 py-2.5 rounded-pill text-sm font-medium transition-all duration-200 min-h-[44px] ${
              isSelected
                ? "bg-forest text-white shadow-medium"
                : "bg-white text-forest shadow-soft hover:shadow-medium"
            }`}
          >
            {activity}
          </button>
        );
      })}
    </div>
  );
}
