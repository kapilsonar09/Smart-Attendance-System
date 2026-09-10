import React, { useState } from 'react';
import { StudentOverallStats, Subject, Class } from '../../types.ts';
import { RiskBadge } from '../common/RiskBadge.tsx';
import {
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Award,
} from 'lucide-react';

interface FacultyAnalyticsViewProps {
  students: StudentOverallStats[];
  subjects: Subject[];
  classes: Class[];
}

export const FacultyAnalyticsView: React.FC<FacultyAnalyticsViewProps> = ({
  students,
  subjects,
  classes,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertSentMap, setAlertSentMap] = useState<Record<string, boolean>>({});

  const filteredStudents = students.filter((stu) => {
    if (filterRisk !== 'all' && stu.overallRiskLevel !== filterRisk) return false;
    if (
      searchQuery &&
      !stu.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !stu.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSendAlert = async (stu: StudentOverallStats) => {
    try {
      await fetch('/api/faculty/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: stu.studentId,
          type: 'risk_warning',
          message: `Official Academic Notice: Your attendance has dropped to ${stu.overallPercentage}%, which is below the mandatory 75% threshold. Please meet your course coordinator immediately.`,
        }),
      });
      setAlertSentMap((prev) => ({ ...prev, [stu.studentId]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const criticalCount = students.filter((s) => s.overallRiskLevel === 'critical').length;
  const atRiskCount = students.filter((s) => s.overallRiskLevel === 'at_risk').length;
  const safeCount = students.filter((s) => s.overallRiskLevel === 'safe').length;
  const avgClassPct = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.overallPercentage, 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Class Attendance Intelligence & Risk Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify chronically absent students, evaluate threshold violations, and dispatch automated intervention warnings
          </p>
        </div>

        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center gap-4 self-start">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Mean</span>
            <div className="text-xl font-bold">{avgClassPct}%</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Under 75%</span>
            <div className="text-xl font-bold text-rose-400">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-700">
            <span>Critical Violation (&lt; 75%)</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{criticalCount} Students</div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional parent alerts dispatched. Immediate faculty intervention required.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
            <span>Borderline At-Risk (75% - 79.9%)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{atRiskCount} Students</div>
          <p className="text-xs text-slate-500 mt-1">
            Single upcoming absence will drop attendance below minimum requirement.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span>Safe Standing (&ge; 80%)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{safeCount} Students</div>
          <p className="text-xs text-slate-500 mt-1">
            Meeting and exceeding academic benchmarks with positive attendance buffer.
          </p>
        </div>
      </div>

      {/* Cohort Roster with Filter and Alert Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Risk:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Cohort ({students.length})</option>
              <option value="critical">Critical Only ({criticalCount})</option>
              <option value="at_risk">At Risk Only ({atRiskCount})</option>
              <option value="safe">Safe Standing ({safeCount})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4">Safe Buffer / Recovery</th>
                <th className="py-3 px-4 text-right">Intervention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((stu) => {
                const isSent = alertSentMap[stu.studentId];
                return (
                  <tr key={stu.studentId} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{stu.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Roll: {stu.rollNumber} • {stu.className}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-slate-900">
                        {stu.overallPercentage}%
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stu.attendedLectures}/{stu.totalLectures} sessions
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={stu.overallRiskLevel} size="sm" />
                      <div className="text-[10px] text-slate-500 mt-1 max-w-xs leading-snug">
                        {stu.riskReason}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {stu.overallRiskLevel === 'safe' ? (
                        <span className="text-emerald-700 font-medium">
                          Can miss up to <strong>{stu.canMissOverall}</strong> lectures
                        </span>
                      ) : (
                        <span className="text-rose-700 font-medium">
                          Must attend next <strong>{stu.recoverOverall}</strong> consecutive
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notice Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendAlert(stu)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-500" /> Dispatch Warning
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
