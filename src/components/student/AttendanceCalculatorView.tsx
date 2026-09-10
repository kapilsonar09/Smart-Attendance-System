import React, { useState } from 'react';
import { StudentOverallStats } from '../../types.ts';
import { calculateAttendanceMetrics } from '../../utils/attendanceCalculations.ts';
import { Calculator, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface AttendanceCalculatorViewProps {
  stats: StudentOverallStats;
}

export const AttendanceCalculatorView: React.FC<AttendanceCalculatorViewProps> = ({
  stats,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [attended, setAttended] = useState<number>(stats.attendedLectures);
  const [total, setTotal] = useState<number>(stats.totalLectures);
  const [leave, setLeave] = useState<number>(stats.approvedLeaveLectures);
  const [required, setRequired] = useState<number>(stats.requiredPercentage);

  // When subject changes, populate numbers
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (subjectId === 'overall') {
      setAttended(stats.attendedLectures);
      setTotal(stats.totalLectures);
      setLeave(stats.approvedLeaveLectures);
      setRequired(stats.requiredPercentage);
    } else {
      const sub = stats.subjects.find((s) => s.subjectId === subjectId);
      if (sub) {
        setAttended(sub.attended);
        setTotal(sub.totalApplicable);
        setLeave(sub.approvedLeave);
        setRequired(sub.requiredPercentage);
      }
    }
  };

  const calculation = calculateAttendanceMetrics(attended, total, leave, required);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Smart Attendance Intelligence Calculator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate mathematical modeling of attendance buffers, permissible absences, and recovery paths
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Attendance Inputs
          </h2>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Select Preset or Subject
            </label>
            <select
              id="calculator-subject-select"
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="overall">Overall All Subjects (Real Profile)</option>
              {stats.subjects.map((sub) => (
                <option key={sub.subjectId} value={sub.subjectId}>
                  {sub.subjectName} ({sub.subjectCode}) - Current {sub.percentage}%
                </option>
              ))}
            </select>
          </div>

          {/* Attended Lectures */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Lectures Attended</label>
              <span className="font-bold text-emerald-700">{attended}</span>
            </div>
            <input
              id="input-attended-lectures"
              type="number"
              min="0"
              max={total}
              value={attended}
              onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Total Conducted Lectures */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Total Lectures Conducted</label>
              <span className="font-bold text-slate-900">{total}</span>
            </div>
            <input
              id="input-total-lectures"
              type="number"
              min="1"
              value={total}
              onChange={(e) => setTotal(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Approved Leaves (Excused) */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Approved Medical / Duty Leave</label>
              <span className="font-bold text-blue-700">{leave}</span>
            </div>
            <input
              id="input-leave-lectures"
              type="number"
              min="0"
              max={total}
              value={leave}
              onChange={(e) => setLeave(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Approved leaves are excused from the denominator so students are not penalized.
            </p>
          </div>

          {/* Target Required Percentage */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Target Required Percentage (%)</label>
              <span className="font-bold text-indigo-700">{required}%</span>
            </div>
            <input
              id="input-required-percentage"
              type="range"
              min="50"
              max="95"
              step="1"
              value={required}
              onChange={(e) => setRequired(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50%</span>
              <span className="font-bold text-slate-700">75% (Std)</span>
              <span>85%</span>
              <span>95%</span>
            </div>
          </div>

          <button
            id="reset-calculator-inputs-button"
            onClick={() => handleSubjectChange(selectedSubjectId)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Real Data
          </button>
        </div>

        {/* Mathematical Output & Insights Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Calculated Score */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Calculated Standing
                </p>
                <div className="text-3xl font-bold text-slate-900 mt-1">
                  {calculation.percentage}%
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                  calculation.riskLevel === 'safe'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : calculation.riskLevel === 'at_risk'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {calculation.riskLevel.replace('_', ' ')}
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {calculation.riskReason}
            </p>
          </div>

          {/* Two Core Intelligence Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Calculation 1: Can Miss */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Permissible Misses
                  </h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {calculation.canMissCount} {calculation.canMissCount === 1 ? 'Lecture' : 'Lectures'}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Maximum upcoming classes you can miss while still maintaining &ge; {required}%.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                Formula: <code className="text-indigo-600 font-mono">floor((Attended / {required}%) - Total)</code>
              </div>
            </div>

            {/* Calculation 2: Must Attend to Recover */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-700">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Consecutive Recovery
                  </h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {calculation.recoverConsecutiveCount}{' '}
                  {calculation.recoverConsecutiveCount === 1 ? 'Lecture' : 'Lectures'}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Consecutive lectures you MUST attend in a row to reach or exceed {required}%.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                Formula: <code className="text-indigo-600 font-mono">ceil((Target * Total - Attended) / (1 - Target))</code>
              </div>
            </div>
          </div>

          {/* Academic Scenario Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              💡 Understanding Your Calculation
            </h4>
            <p className="leading-relaxed">
              Attendance management in our system is forward-looking. Rather than simply evaluating past events,
              the intelligence engine calculates your real-time risk buffer so you can plan academic leaves responsibly
              without violating institutional guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
