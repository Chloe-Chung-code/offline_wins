import React, { ReactNode } from "react";

interface TypographyProps {
    children: ReactNode;
    className?: string;
}

export function H1({ children, className = "" }: TypographyProps) {
    return (
        <h1 className={`text-3xl font-bold tracking-tight text-text-primary mb-4 ${className}`}>
            {children}
        </h1>
    );
}

export function H2({ children, className = "" }: TypographyProps) {
    return (
        <h2 className={`text-2xl font-semibold tracking-normal text-text-primary mb-3 ${className}`}>
            {children}
        </h2>
    );
}

export function Body({ children, className = "" }: TypographyProps) {
    return (
        <p className={`text-base text-text-secondary leading-relaxed mb-4 ${className}`}>
            {children}
        </p>
    );
}

export function Caption({ children, className = "" }: TypographyProps) {
    return (
        <p className={`text-xs font-medium text-text-secondary uppercase tracking-widest ${className}`}>
            {children}
        </p>
    );
}

export function Label({ children, className = "" }: TypographyProps) {
    return (
        <span className={`text-sm font-medium text-text-secondary ${className}`}>
            {children}
        </span>
    );
}
