# Domain Model: Unit A (Core Design System)

## 1. Context
The "Physical Layer" of the application. It defines the visual language (Focus Theme) and the fundamental building blocks.

## 2. Domain Entities (Design Tokens)

### 2.1 Theme: "Focus" (Singleton)
*   **Purpose**: Enforce a distraction-free environment.
*   **Color Palette**:
    *   `Background`: `#0F172A` (Slate-900) - Deep, receding.
    *   `Surface`: `#1E293B` (Slate-800) - Subtle separation.
    *   `Text-Primary`: `#F8FAFC` (Slate-50) - High contrast, legible.
    *   `Text-Secondary`: `#94A3B8` (Slate-400) - De-emphasized meta-data.
    *   `Accent`: `#6366F1` (Indigo-500) - Used *sparingly* for primary actions/active states.
    *   `Success`: `#10B981` (Emerald-500) - Used *only* for the Ripple effect.

### 2.2 Typography: "Precision"
*   **Font Family**: `Inter` (sans-serif) or `Geist Mono` (for numbers/timers).
*   **Scale**:
    *   `Display`: 32px / Bold / Tight tracking (Timer)
    *   `Heading`: 24px / Semibold / Normal tracking (Page Titles)
    *   `Body`: 16px / Regular / Relaxed tracking (Content)
    *   `Caption`: 12px / Medium / Wide tracking (Labels)

## 3. Component Contracts

### 3.1 Button (`IButton`)
*   **Variants**:
    *   `Ghost` (Default): Transparent background, text only. Highly minimal.
    *   `Outline`: 1px border. For secondary actions.
    *   `Solid`: **Avoid** unless critical (e.g., "Start Focus").
*   **Behavior**:
    *   `Hover`: Subtle brightness increase (opacity 90% -> 100%).
    *   `Active`: Scale down 0.98.

### 3.2 LayoutShell (`ILayout`)
*   **Behavior**:
    *   `MaxWidth`: 480px (Mobile-first focused).
    *   `Centering`: Always vertically and horizontally centered content.
    *   `Padding`: 24px (consistent breathing room).
