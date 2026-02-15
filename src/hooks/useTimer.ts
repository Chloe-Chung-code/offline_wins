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
            if (status === "running") {
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
        setTimeLeft(seconds);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const pause = useCallback(() => {
        if (status !== "running") return;
        setStatus("paused");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        endTimeRef.current = null;
    }, [status]);

    const resume = useCallback(() => {
        if (status !== "paused") return;
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

    return {
        status,
        timeLeft,
        duration,
        start,
        pause,
        resume,
        reset,
        progress: 1 - (timeLeft / duration)
    };
}
