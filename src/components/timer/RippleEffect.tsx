"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RippleEffectProps {
    active: boolean;
    onComplete?: () => void;
}

export default function RippleEffect({ active, onComplete }: RippleEffectProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setVisible(true);
            // Duration of the full ripple sequence
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
                // Keep visible for a bit or fade out?
                // For now, let parent handle unmounting/resetting via 'active' prop
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setVisible(false), 500); // fade out
            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    if (!visible && !active) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden transition-opacity duration-1000",
                active ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Multiple expanding rings */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="absolute rounded-full border border-accent/20 bg-accent/5 animate-ripple-expand"
                    style={{
                        animationDelay: `${i * 0.4}s`,
                        width: '100px',
                        height: '100px',
                    }}
                />
            ))}

            {/* Central glow */}
            <div className="absolute w-32 h-32 bg-accent/20 blur-3xl rounded-full animate-pulse-slow" />

            {/* Success Message inside the ripple */}
            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Focus Complete</h1>
                <p className="text-text-secondary">Session recorded.</p>
            </div>
        </div>
    );
}
