# Domain Model: Unit B (Tracking Engine)

## 1. Context
The "Core Loop" of the application. Handles the passage of time and the immediate feedback (Reward).

## 2. Domain Entities

### 2.1 FocusSession (Aggregate Root)
*   **Attributes**:
    *   `id`: UUID
    *   `startTime`: Timestamp
    *   `targetDuration`: Integer (minutes)
    *   `status`: `SessionStatus`
*   **Invariants**:
    *   `targetDuration` must be >= 1 minutes.

### 2.2 Timer (Service/Entity)
*   **State Machine**:
    1.  `IDLE`: Waiting for user input. Ring is static or gently breathing (slow).
    2.  `RUNNING`: Countdown active. Ring "breathes" in sync with seconds (4s in, 4s out).
    3.  `PAUSED`: (Optional feature, explicit decision: **NO PAUSE** to encourage commitment? -> Decision: Allow Pause but show "Focus Broken" warning).
    4.  `COMPLETED`: Timer hits 0. Triggers `Reward`.

*   **Behaviors**:
    *   `start(duration)`: Transitions IDLE -> RUNNING.
    *   `tick()`: Decrements remaining time.
    *   `complete()`: Transitions RUNNING -> COMPLETED.

### 2.3 ZenRipple (Value Object / Event)
*   **Trigger**: `SessionStatus` transitions to `COMPLETED`.
*   **Properties**:
    *   `Origin`: Center of screen.
    *   `Color`: `Success` token (#10B981).
    *   `Duration`: 1.5s (Slow expansion).
    *   `Effect`: Clears all UI elements temporarily, leaving only a blank, calm screen for a moment before showing summary.

## 3. Domain Events
*   `SessionStarted`: Emitted when timer begins.
*   `SessionCompleted`: Emitted when timer hits 0. Triggers Persistence (Unit C).
*   `SessionAbandoned`: Emitted if user leaves/cancels.
