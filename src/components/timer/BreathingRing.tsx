"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TimerStatus } from "@/lib/types";

interface BreathingRingProps {
    size?: number;
    strokeWidth?: number;
    status: TimerStatus;
    progress: number; // 0 to 1
    children?: React.ReactNode;
}

export default function BreathingRing({
    size = 280,
    strokeWidth = 6,
    status,
    progress,
    children,
}: BreathingRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);


    return (
        <div
            className="relative inline-flex items-center justify-center transition-all duration-700 ease-in-out"
            style={{ width: size, height: size }}
        >
            {/* Container for the specific breathing animation */}
            <div className={cn(
                "absolute inset-0 rounded-full border-2 border-blue-300/20 transition-all duration-[4000ms]",
                status === "running" && "animate-breathing-glow"
            )} />

            <svg width={size} height={size} className="transform -rotate-90 relative z-10">
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-200"
                />
                {/* Progress Indicator */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className={cn(
                        "text-blue-500 transition-all duration-1000 ease-linear",
                        status === "completed" && "text-white"
                    )}
                />
            </svg>

            {/* Content (Timer Display) */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                {children}
            </div>
        </div>
    );
}
