import React from 'react';
import { StudentOverallStats } from '../../types.ts';
import { Award, Zap, CheckCircle2, Lock, Flame, Trophy } from 'lucide-react';

interface AchievementsViewProps {
  stats: StudentOverallStats;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ stats }) => {
  const badges = stats.badges || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Attendance Streaks & Academic Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Positive reinforcement tracking your consistency, recovery sprints, and punctual presence
          </p>
        </div>

        {/* Current Active Streak Card */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl shadow-xs self-start">
          <Flame className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <div className="text-[10px] text-amber-700 uppercase tracking-wider font-bold">
              Current Consecutive Streak
            </div>
            <div className="text-2xl font-bold leading-tight text-amber-950">
              {stats.currentStreak} <span className="text-xs font-semibold text-amber-800">Lectures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const isUnlocked = Boolean(badge.unlockedAt);
          return (
            <div
              key={badge.id}
              className={`border rounded-xl p-5 shadow-xs transition-all ${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 text-sm">{badge.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {isUnlocked && badge.unlockedAt && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400">
                  Achieved on: {badge.unlockedAt}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
