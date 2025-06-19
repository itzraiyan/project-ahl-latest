import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-700/60 rounded-md ${className}`}
    style={{ minHeight: "100%", minWidth: "100%" }}
  >
    <div className="absolute inset-0 shimmer-bg" />
  </div>
);
