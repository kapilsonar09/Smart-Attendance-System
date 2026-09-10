import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
}) => {
  const badgeColors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-md border font-medium ${badgeColors[badge.variant]}`}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
