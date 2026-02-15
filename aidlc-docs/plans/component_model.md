# Component Model Plan (Domain Design)

- [ ] **Step 1: Setup Branching**
  - Ensure we are on branch `design/domain-models`.

- [x] **Step 2: Model Unit A (Core Design System)**
  - Create `aidlc-docs/design-artifacts/domain_core.md`.
  - Define Design Tokens (Colors, Typography) as "Domain Entities" (even if visual, they are central to the domain of "Premium Calm").
  - Define Component Component hierarchies (`Layout`, `Button`, `Typography`).

- [x] **Step 3: Model Unit B (Tracking Engine)**
  - Create `aidlc-docs/design-artifacts/domain_tracking.md`.
  - Define `Session` entity (State Machine: IDLE, RUNNING, COMPLETED).
  - Define `Timer` behavior (Tick logic, Calibration).
  - Define `Reward` value object (The "Ripple" effect parameters).

- [x] **Step 4: Model Unit C (Insights & Persistence)**
  - Create `aidlc-docs/design-artifacts/domain_insights.md`.
  - Define `FocusBlock` entity (The persistent record).
  - Define `Streak` aggregate (Logic for calculating chains).
  - Define `CalendarGrid` view model.

- [ ] **Step 5: PR & Merge**
  - Commit all design artifacts.
  - Push to GitHub.
  - Create Pull Request for user review.
