import { useState, useEffect, useRef, useCallback } from "react";
import { TimerStatus } from "@/lib/types";

interface UseTimerProps {
    initialDuration?: number; // in seconds
    onComplete?: () => void;
}

export function useTimer({ initialDuration = 60, onComplete }: UseTimerProps = {}) {
    const [status, setStatus] = useState<TimerStatus>("idle");
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [duration, setDuration] = useState(initialDuration);

    const endTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const tick = useCallback(() => {
        if (!endTimeRef.current) return;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
            if (status === "running") { // Only complete if actually running
                setStatus("completed");
                if (onComplete) onComplete();
            }
            endTimeRef.current = null;
        } else {
            rafRef.current = requestAnimationFrame(tick);
        }
    }, [onComplete, status]);

    const start = useCallback((seconds: number) => {
        setDuration(seconds);
        const now = Date.now();
        endTimeRef.current = now + seconds * 1000;
        setStatus("running");
        setTimeLeft(seconds); // Update immediately

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const pause = useCallback(() => {
        if (status !== "running") return;
        setStatus("paused");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        endTimeRef.current = null; // Invalidate end time, we will recalc on resume if needed (not implemented yet)
        // For MVP Focus, "Pause" might just stop the loop. Resume would need to recalc endTime. 
        // Domain decision: "No Pause" or "Focus Broken". 
        // Attempting to resume from pause would require storing "remaining time" and setting new endTime.
    }, [status]);

    const resume = useCallback(() => {
        if (status !== "paused") return;
        // Recalculate end time based on timeLeft
        const now = Date.now();
        endTimeRef.current = now + timeLeft * 1000;
        setStatus("running");
        rafRef.current = requestAnimationFrame(tick);
    }, [status, timeLeft, tick]);

    const reset = useCallback(() => {
        setStatus("idle");
        setTimeLeft(duration);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        endTimeRef.current = null;
    }, [duration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Sync effect if status changes to running and we need to start/restart tick? 
    // No, start/resume handles it.

    return {
        status,
        timeLeft,
        duration,
        start,
        pause,
        resume,
        reset,
        progress: 1 - (timeLeft / duration) // 0 to 1
    };
}
