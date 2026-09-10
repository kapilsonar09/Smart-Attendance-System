import React from 'react';
import { RiskLevel } from '../../types.ts';

interface CircularProgressProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  riskLevel?: RiskLevel;
  subtitle?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 140,
  strokeWidth = 12,
  riskLevel = 'safe',
  subtitle = 'Attendance',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  const colorMap = {
    safe: {
      stroke: 'stroke-emerald-600',
      bgStroke: 'stroke-emerald-100',
      text: 'text-emerald-700',
    },
    at_risk: {
      stroke: 'stroke-amber-500',
      bgStroke: 'stroke-amber-100',
      text: 'text-amber-700',
    },
    critical: {
      stroke: 'stroke-rose-600',
      bgStroke: 'stroke-rose-100',
      text: 'text-rose-700',
    },
  }[riskLevel];

  return (
    <div id="circular-attendance-progress" className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorMap.bgStroke} fill-transparent`}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorMap.stroke} fill-transparent transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-bold tracking-tight ${colorMap.text}`}>
          {clamped}%
        </span>
        {subtitle && (
          <span className="text-xs font-medium text-slate-500 mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
