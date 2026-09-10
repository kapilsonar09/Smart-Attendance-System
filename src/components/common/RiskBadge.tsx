import React from 'react';
import { RiskLevel } from '../../types.ts';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  percentage?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  percentage,
  showIcon = true,
  size = 'md',
}) => {
  const configs = {
    safe: {
      label: 'Safe',
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    at_risk: {
      label: 'At Risk',
      icon: AlertTriangle,
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    },
    critical: {
      label: 'Critical',
      icon: AlertCircle,
      classes: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const current = configs[level] || configs.safe;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      id={`risk-badge-${level}`}
      className={`inline-flex items-center rounded-full border ${current.classes} ${sizeClasses} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
      {percentage !== undefined && (
        <span className="font-bold opacity-90">({percentage}%)</span>
      )}
    </span>
  );
};
