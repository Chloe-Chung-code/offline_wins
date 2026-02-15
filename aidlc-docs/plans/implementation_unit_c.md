# Unit C: Insights Implementation Plan

## Components
1. **CalendarHeatmap**: Visualizes daily activity.
   - Props: `data: DayRecord[]`
   - Logic: Map dates to intensity levels.
2. **StatsOverview**: Summary metrics.
3. **SessionList**: Chronological history.

## Logic
- Update `streak-calculator` to return full user stats.
- Ensure `storage.ts` efficiently retrieves range queries.
