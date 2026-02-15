# Unit B: Tracking Engine

## Scope
The core functional loop of the application: configuring a timer, running a session, and providing immediate feedback upon completion.

## User Stories Mapped
1.  **Breathing Ring**: "I want a breathing-style timer animation."
2.  **The Ripple**: "I want a rewarding experience that isn't 'gamified' (Zen Ripple)."

## Technical Deliverables
1.  **`TimerEngine` (Hook/Logic)**:
    -   State machine: `IDLE` -> `RUNNING` -> `COMPLETED`.
    -   Background calibration (handling tab switching).
2.  **`TimerRing` (Component)**:
    -   SVG-based ring.
    -   CSS animation for "breathing" (scale/opacity) mapped to 4s/4s rhythm.
3.  **`RippleEffect` (Component)**:
    -   Canvas or CSS overlay that triggers a radial gradient expansion from center to clear the screen.

## Acceptance Criteria
- [ ] Timer accurately tracks time even if screen dims.
- [ ] Breathing animation is smooth (60fps).
- [ ] "Ripple" animation triggers exactly when timer hits 00:00.
