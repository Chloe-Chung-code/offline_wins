import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "outline" | "solid";
    size?: "sm" | "md" | "lg";
    className?: string;
    loading?: boolean;
}

export default function Button({
    children,
    variant = "ghost",
    size = "md",
    className = "",
    loading = false,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-slate-800",
        outline: "bg-transparent border border-slate-700 text-gray-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/50",
        solid: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="animate-spin mr-2">
                    <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            ) : null}
            {children}
        </button>
    );
}
