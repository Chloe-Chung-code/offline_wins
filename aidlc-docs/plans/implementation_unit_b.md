# Implementation Plan: Unit B (Tracking Engine)

- [x] **Step 1: Core Logic (Hook)**
  - Create `src/hooks/useTimer.ts`: Implements the State Machine (IDLE -> RUNNING -> COMPLETED).
  - Logic: Use `requestAnimationFrame` or `useEffect` interval for accurate ticking.
  - Handle background calibration (tab switching).

- [ ] **Step 2: Visual Components**
  - Create `src/components/timer/BreathingRing.tsx`: SVG based, CSS animation synced to 4s/4s rhythm.
  - Create `src/components/timer/RippleEffect.tsx`: The "Zen Ripple" animation (fullscreen overlay) using CSS animations/transforms.
  - Create `src/components/timer/TimerDisplay.tsx`: Large typography for the countdown.

- [ ] **Step 3: Integration (Home Page)**
  - Update `src/app/page.tsx` to use `TimerEngine` and components.
  - Remove legacy Home page content.

- [ ] **Step 4: Verification**
  - Test the full flow: Start -> Breathe -> Finish -> Ripple.
  - Verify "Focus Broken" (if implementing pause/stop).
