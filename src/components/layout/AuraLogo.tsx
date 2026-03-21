import React from 'react';

export const AuraLogo = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="aura-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="0.5" stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <path d="M16 2L3 28H10.5L16 16L21.5 28H29L16 2Z" fill="url(#aura-grad)" />
    <path d="M16 16L10.5 28H21.5L16 16Z" fill="#ffffff" opacity="0.2" />
    <circle cx="16" cy="24" r="2.5" fill="#ffffff" />
  </svg>
);
