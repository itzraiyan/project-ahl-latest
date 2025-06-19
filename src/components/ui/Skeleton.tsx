import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-gray-700/60 rounded-md ${className}`}
  >
    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gray-600/50 to-transparent" />
  </div>
);

// Make sure you have the following CSS (e.g. in src/index.css):
// .animate-shimmer {
//   animation: shimmer 1.2s infinite linear;
//   background: linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent);
//   background-size: 200% 100%;
//   background-position-x: -150%;
// }
// @keyframes shimmer {
//   100% {
//     background-position-x: 150%;
//   }
// }
