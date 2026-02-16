import React from "react";
import { getLifetimeStats } from "@/lib/streak-calculator";
import * as Typography from "@/components/ui/Typography";

export default function StatsOverview() {
    const stats = getLifetimeStats();

    return (
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-[#0F172A] mb-1">{stats.totalHours}</span>
                <Typography.Caption className="text-text-secondary">Total Hours</Typography.Caption>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-[#0F172A] mb-1">{stats.totalSessions}</span>
                <Typography.Caption className="text-text-secondary">Sessions</Typography.Caption>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-[#0F172A] mb-1">{stats.longestStreak}</span>
                <Typography.Caption className="text-text-secondary">Longest Streak</Typography.Caption>
            </div>
        </div>
    );
}
