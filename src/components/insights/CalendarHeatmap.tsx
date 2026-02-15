import React from "react";
import { getSessions } from "@/lib/storage";
import { cn } from "@/lib/utils";
import * as Typography from "@/components/ui/Typography";

export default function CalendarHeatmap() {
    // Get last 365 days
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d);
    }

    // Get all sessions
    const sessions = getSessions();

    // Helper to get total minutes for a day
    const getMinutesForDay = (date: Date) => {
        // Local date string YYYY-MM-DD
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        const isoDate = localDate.toISOString().split('T')[0];

        return sessions
            .filter(s => s.date === isoDate)
            .reduce((acc, s) => acc + s.durationMinutes, 0);
    };

    const getIntensityClass = (minutes: number) => {
        if (minutes === 0) return "bg-white/5";
        if (minutes < 30) return "bg-accent/30";
        if (minutes < 60) return "bg-accent/60";
        return "bg-accent";
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[700px]"> {/* Ensure generic width for scroll */}
                <div className="flex justify-between mb-2">
                    <Typography.Label>Activity Log</Typography.Label>
                    <Typography.Caption className="text-text-secondary">Last 365 Days</Typography.Caption>
                </div>

                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {dates.map((date) => {
                        const minutes = getMinutesForDay(date);
                        return (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "w-3 h-3 rounded-sm transition-colors",
                                    getIntensityClass(minutes)
                                )}
                                title={`${date.toLocaleDateString()}: ${minutes} mins`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
