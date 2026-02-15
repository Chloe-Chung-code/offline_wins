# Unit A: Core Design System (Focus Edition)

## Scope
Implementation of the visual foundation for the "Focus" edition. This unit defines the design tokens, typography, and base layout components that other units will build upon.

## User Stories Mapped
1.  **Visual Identity**: "I want a 'Focus' aesthetic that is clean, minimal, and tech-forward."

## Technical Deliverables
1.  **Design Tokens (`globals.css`)**:
    -   **Colors**: Slate-900 (Background), Slate-800 (Surface), Slate-50 (Foreground/Text), Indigo-500 (Accent - subtle).
    -   **Typography**: `Inter` font integration. H1/H2 tracking tight.
2.  **Base Components**:
    -   `LayoutShell`: Maximized center container, mobile-first but responsive.
    -   `Button`: "Ghost" and "Outline" variants preferred over solid blocks.
    -   `Typography`: Reusable `Heading`, `Text`, `Caption` components to enforce hierarchy.

## Acceptance Criteria
- [ ] App defaults to "Focus" theme (Dark mode by default/preference).
- [ ] No layout shift during loading.
- [ ] Text is legible with high contrast (AAA standard).
