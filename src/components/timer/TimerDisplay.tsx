"use client";

import { cn } from "@/lib/utils";

interface TimerDisplayProps {
    secondsRemaining: number;
    totalDuration?: number;
    className?: string;
}

export default function TimerDisplay({
    secondsRemaining,
    className,
}: TimerDisplayProps) {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="font-sans text-[4rem] leading-none font-thin tracking-tighter text-text-primary tabular-nums">
                {formattedMinutes}
                <span className="text-[#94A3B8]">:</span>
                {formattedSeconds}
            </div>
            <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
                Offline Session
            </div>
        </div>
    );
}
