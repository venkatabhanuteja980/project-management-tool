import React from "react";

const AVATAR_COLORS = [
  "bg-indigo-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-purple-500 text-white",
  "bg-teal-500 text-white",
  "bg-pink-500 text-white",
];

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorClass = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export const Avatar = ({
  name = "",
  size = "md",
  className = "",
  showName = false,
  ...props
}) => {
  const initials = getInitials(name);
  const colorClass = getColorClass(name);

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base font-semibold",
    xl: "h-16 w-16 text-xl font-semibold",
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full font-medium ${colorClass} ${sizes[size]} shrink-0 shadow-sm`}
        title={name}
        {...props}
      >
        {initials}
      </div>
      {showName && name && (
        <span className="text-sm font-medium text-slate-700">{name}</span>
      )}
    </div>
  );
};

export default Avatar;
