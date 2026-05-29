import React from "react";

export function Button({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border bg-white hover:bg-gray-100 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
