"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RippleEffectProps {
    active: boolean;
    onComplete?: () => void;
    duration?: number; // ms before onComplete fires
    title?: string;
    subtitle?: string;
}

export default function RippleEffect({
    active,
    onComplete,
    duration = 2000,
    title = "Nice work!",
    subtitle = "Let\u2019s log your win.",
}: RippleEffectProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setVisible(true);
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, duration);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [active, onComplete, duration]);

    if (!visible && !active) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden transition-opacity duration-700",
                active ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Multiple expanding rings — Ocean Calm blue */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 animate-ripple-expand"
                    style={{
                        animationDelay: `${i * 0.4}s`,
                        width: '100px',
                        height: '100px',
                    }}
                />
            ))}

            {/* Central glow */}
            <div className="absolute w-32 h-32 bg-[#3B82F6]/20 blur-3xl rounded-full animate-pulse-slow" />

            {/* Message */}
            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight mb-2">{title}</h1>
                <p className="text-[#94A3B8]">{subtitle}</p>
            </div>
        </div>
    );
}
