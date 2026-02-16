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
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="font-sans text-[4rem] leading-none font-thin tracking-tighter text-text-primary tabular-nums">
                {hours > 0 && (
                    <>
                        {hours}
                        <span className="text-slate-300">:</span>
                    </>
                )}
                {formattedMinutes}
                <span className="text-slate-300">:</span>
                {formattedSeconds}
            </div>
            <div className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
                Offline Session
            </div>
        </div>
    );
}
