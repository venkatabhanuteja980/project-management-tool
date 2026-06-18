import React from "react";

export const Skeleton = ({
  className = "",
  variant = "text",
  ...props
}) => {
  const styles = {
    text: "h-4 w-full rounded",
    circle: "h-10 w-10 rounded-full",
    rectangle: "h-32 w-full rounded-lg",
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 ${styles[variant]} ${className}`}
      {...props}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rectangle" className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton variant="rectangle" className="h-80 lg:col-span-2" />
      <Skeleton variant="rectangle" className="h-80" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="border border-slate-100 rounded-lg p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex space-x-4 items-center">
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
