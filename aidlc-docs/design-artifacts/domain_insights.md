# Domain Model: Unit C (Insights & Persistence)

## 1. Context
The "Memory" of the application. Responsible for long-term storage and visualization of effort.

## 2. Domain Entities

### 2.1 FocusBlock (Entity)
*   **Definition**: A finalized, immutable record of a successful session.
*   **Attributes**:
    *   `id`: UUID
    *   `completedAt`: ISO Date String
    *   `durationMinutes`: Integer
    *   `theme`: "Focus" (For future proofing)
*   **Significance**: Represents a "brick" in the user's wall of focus.

### 2.2 DailyLog (Aggregate)
*   **Attributes**:
    *   `date`: YYYY-MM-DD
    *   `blocks`: List<FocusBlock>
    *   `totalMinutes`: Computed Sum
*   **Behaviors**:
    *   `addBlock(block)`: Appends block, updates total.
    *   `isGoalMet(dailyGoal)`: Returns true if `totalMinutes` >= `dailyGoal`.

### 2.3 FocusChain (Aggregate)
*   **Definition**: A sequence of consecutive days where `isGoalMet` was true.
*   **Attributes**:
    *   `currentStreak`: Integer (Days)
    *   `bestStreak`: Integer (Days)
    *   `lastLogDate`: YYYY-MM-DD
*   **Logic**:
    *   IF `today` is consecutive to `lastLogDate` AND `today.isGoalMet`: Increment Streak.
    *   IF `today` is NOT consecutive (gap > 1 day): Reset Streak to 1.

## 3. Repository interfaces
*   `IBlockRepository`:
    *   `save(block)`: Persist to localStorage.
    *   `getAll()`: Retrieve all blocks.
    *   `getByDate(date)`: Retrieve blocks for specific day.
