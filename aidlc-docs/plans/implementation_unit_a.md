# Implementation Plan: Unit A (Core Design System)

- [x] **Step 1: Clean Slate & Config**
  - Reset `globals.css` to only include Tailwind directives and new CSS variables.
  - Update `tailwind.config.ts` with "Focus" theme colors (`slate-900`, `slate-50`, `indigo-500`, etc.).
  - Configure `next/font` for `Inter`.

- [x] **Step 2: Base Components**
  - Create `src/components/ui/LayoutShell.tsx`: The maximized, centered container.
  - Create `src/components/ui/Typography.tsx`: Reusable `H1`, `H2`, `P`, `Caption` with correct classes.
  - Update `src/components/ui/Button.tsx`: Remove "ghost" vs "default" complexity if not needed, or align with new "Ghost/Outline" spec.

- [x] **Step 3: Verification**
  - Create a temporary `src/app/design-test/page.tsx` to display all components and colors.
  - Verify accessibility (contrast) and responsiveness.

- [ ] **Step 4: Cleanup**
  - Remove unused legacy components (old `ActivityChips`, `TimerRing` if they exist and are incompatible).
