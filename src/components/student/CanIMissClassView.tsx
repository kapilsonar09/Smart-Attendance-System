import React, { useState } from 'react';
import { StudentOverallStats } from '../../types.ts';
import { simulateMissNextLecture } from '../../utils/attendanceCalculations.ts';
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface CanIMissClassViewProps {
  stats: StudentOverallStats;
}

export const CanIMissClassView: React.FC<CanIMissClassViewProps> = ({ stats }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');

  let currentAttended = stats.attendedLectures;
  let currentTotal = stats.totalLectures;
  let currentLeave = stats.approvedLeaveLectures;
  let requiredPct = stats.requiredPercentage;
  let subjectName = 'Overall Attendance (All Subjects)';

  if (selectedSubjectId !== 'overall') {
    const sub = stats.subjects.find((s) => s.subjectId === selectedSubjectId);
    if (sub) {
      currentAttended = sub.attended;
      currentTotal = sub.totalApplicable;
      currentLeave = sub.approvedLeave;
      requiredPct = sub.requiredPercentage;
      subjectName = `${sub.subjectName} (${sub.subjectCode})`;
    }
  }

  const simulation = simulateMissNextLecture(currentAttended, currentTotal, currentLeave, requiredPct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              "Can I Miss a Class?" Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate the mathematical impact of skipping your next scheduled session before taking action
            </p>
          </div>
        </div>
      </div>

      {/* Selector & Result */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Subject Selection */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Class to Simulate
          </h2>

          <div className="space-y-2">
            <button
              id="simulate-overall-btn"
              onClick={() => setSelectedSubjectId('overall')}
              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                selectedSubjectId === 'overall'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div>
                <div>All Subjects (Overall Average)</div>
                <div className={`text-[11px] font-normal ${selectedSubjectId === 'overall' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Current: {stats.overallPercentage}%
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${selectedSubjectId === 'overall' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                {stats.overallRiskLevel.toUpperCase()}
              </span>
            </button>

            {stats.subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.subjectId;
              return (
                <button
                  key={sub.subjectId}
                  id={`simulate-subject-${sub.subjectCode}`}
                  onClick={() => setSelectedSubjectId(sub.subjectId)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="truncate max-w-[200px]">{sub.subjectName}</div>
                    <div className={`text-[11px] font-normal ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {sub.subjectCode} • Current: {sub.percentage}%
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      sub.riskLevel === 'safe'
                        ? isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-700'
                        : sub.riskLevel === 'at_risk'
                        ? isSelected ? 'bg-amber-800 text-amber-100' : 'bg-amber-50 text-amber-700'
                        : isSelected ? 'bg-rose-800 text-rose-100' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {sub.riskLevel.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Projected Outcome Simulator */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Simulation Result: {subjectName}
            </h2>

            {/* Final Verdict Banner */}
            <div
              className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                simulation.canSafelyMiss
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="p-1 rounded bg-white/80 shrink-0">
                {simulation.canSafelyMiss ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {simulation.canSafelyMiss
                    ? '🟢 You Can Safely Miss This Lecture'
                    : '🔴 You Should NOT Miss This Lecture'}
                </h3>
                <p className="text-xs mt-1 leading-relaxed">{simulation.explanation}</p>
              </div>
            </div>

            {/* Before vs After Visual Comparison Cards */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Current Standing
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {simulation.currentPercentage}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {currentAttended} / {currentTotal} sessions attended
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                  Projected If Absent
                </span>
                <div className="text-3xl font-bold text-indigo-950 mt-1 flex items-baseline gap-1">
                  {simulation.projectedPercentage}%
                  <span className="text-xs font-bold text-rose-600">
                    (-{simulation.dropPercentage}%)
                  </span>
                </div>
                <div className="text-xs text-indigo-700 mt-1">
                  {currentAttended} / {currentTotal + 1} sessions attended
                </div>
              </div>
            </div>

            {/* Progress Delta Visualization */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Threshold: {requiredPct}%</span>
                <span>Drop: -{simulation.dropPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                {/* 75% target mark */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                  style={{ left: `${requiredPct}%` }}
                  title={`Requirement: ${requiredPct}%`}
                />
                {/* Projected bar */}
                <div
                  className={`h-full transition-all duration-500 ${
                    simulation.canSafelyMiss ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, simulation.projectedPercentage)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Vertical marker indicates {requiredPct}% required institutional minimum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
