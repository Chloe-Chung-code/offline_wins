import React, { ReactNode } from "react";

interface LayoutShellProps {
    children: ReactNode;
    className?: string;
}

export default function LayoutShell({ children, className = "" }: LayoutShellProps) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full px-6 ${className}`}>
            <div className="w-full max-w-[480px] space-y-8">
                {children}
            </div>
        </div>
    );
}
