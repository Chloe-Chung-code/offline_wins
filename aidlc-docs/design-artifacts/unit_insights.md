# Unit C: Insights & Persistence

## Scope
Long-term value retention. Saving session data securely and visualizing it to motivate the user.

## User Stories Mapped
1.  **Focus Chain**: "I want to see my 'Focus Chain' on a calendar."
2.  **Session Artifacts**: "My time is saved as a 'Solid Block'."

## Technical Deliverables
1.  **`StorageService` (Utility)**:
    -   Interface for `localStorage`.
    -   Schema: `Session { id, timestamp, duration, status }`.
2.  **`FocusCalendar` (Component)**:
    -   Monthly grid generation.
    -   Logic to determine "Chain" (consecutive days).
3.  **`DataArtifact` (Component)**:
    -   A visual representation of a completed session (e.g., a 3D-ish CSS block or simple square) to be displayed in lists/grids.

## Acceptance Criteria
- [ ] Data persists after page reload.
- [ ] Calendar correctly calculates "Streaks" based on consecutive dates.
- [ ] "Solid Block" visual is distinct from generic list items.
