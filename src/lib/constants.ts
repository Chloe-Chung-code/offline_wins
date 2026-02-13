export const MOODS = {
  1: { emoji: "😫", label: "Terrible", color: "#DC2626", bg: "#FEE2E2" },
  2: { emoji: "😕", label: "Bad", color: "#EA580C", bg: "#FFEDD5" },
  3: { emoji: "😐", label: "Okay", color: "#CA8A04", bg: "#FEF9C3" },
  4: { emoji: "😊", label: "Good", color: "#65A30D", bg: "#ECFCCB" },
  5: { emoji: "🤩", label: "Amazing", color: "#16A34A", bg: "#DCFCE7" },
} as const;

export const ACTIVITIES = [
  "📚 Reading",
  "🚶 Walking",
  "🏋️ Exercise",
  "🍳 Cooking",
  "👥 Socializing",
  "🧘 Meditation",
  "🌿 Nature",
  "🎨 Creating",
  "🎮 Playing",
  "✏️ Other",
] as const;

export const STORAGE_KEYS = {
  SETTINGS: "offlinewins_settings",
  ACTIVE_SESSION: "offlinewins_active_session",
  SESSIONS: "offlinewins_sessions",
  DAY_OVERRIDES: "offlinewins_day_overrides",
  PROMPT_DISMISSED: "offlinewins_prompt_dismissed",
} as const;

export const DEFAULT_DAILY_GOAL_MINUTES = 60;
