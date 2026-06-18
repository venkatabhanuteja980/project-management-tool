import React from "react";

export const Card = ({
  children,
  className = "",
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-xl p-5 shadow-sm ${
        hover ? "glass-card-hover" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-slate-50 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold text-slate-800 text-lg leading-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export default Card;
