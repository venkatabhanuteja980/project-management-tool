import React from "react";

export const Badge = ({
  children,
  variant = "gray",
  className = "",
  ...props
}) => {
  const styles = {
    // Priorities
    Low: "bg-slate-100 text-slate-700 border border-slate-200",
    Medium: "bg-blue-50 text-blue-700 border border-blue-100",
    High: "bg-amber-50 text-amber-700 border border-amber-100",
    Critical: "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse",
    
    // Statuses
    "To Do": "bg-slate-100 text-slate-700 border border-slate-200",
    "In Progress": "bg-indigo-50 text-indigo-700 border border-indigo-100",
    Review: "bg-purple-50 text-purple-700 border border-purple-100",
    Done: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Planning: "bg-sky-50 text-sky-700 border border-sky-100",
    "On Hold": "bg-amber-50 text-amber-700 border border-amber-100",

    // General Colors
    gray: "bg-slate-100 text-slate-700 border border-slate-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    yellow: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-rose-50 text-rose-700 border border-rose-100",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
  };

  const selectedStyle = styles[variant] || styles.gray;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${selectedStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
