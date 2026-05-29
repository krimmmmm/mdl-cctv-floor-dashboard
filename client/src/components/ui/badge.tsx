import React from "react";

export function Badge({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
