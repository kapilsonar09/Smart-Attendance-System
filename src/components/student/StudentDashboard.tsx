import React, { useState } from 'react';
import { StudentOverallStats, SubjectAttendanceSummary } from '../../types.ts';
import { CircularProgress } from '../common/CircularProgress.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import { StatCard } from '../common/StatCard.tsx';
import { SubjectDetailModal } from './SubjectDetailModal.tsx';
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calculator,
  HelpCircle,
  QrCode,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface StudentDashboardProps {
  stats: StudentOverallStats;
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  onNavigateTab,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendanceSummary | null>(null);

  const getRiskBannerStyle = () => {
    switch (stats.overallRiskLevel) {
      case 'safe':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'at_risk':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'critical':
        return 'bg-rose-50 border-rose-200 text-rose-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Risk Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Welcome, {stats.studentName}
              </h1>
              <RiskBadge level={stats.overallRiskLevel} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roll No: <span className="font-semibold text-slate-700">{stats.rollNumber}</span> • {stats.className}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="student-quick-scan-button"
              onClick={() => onNavigateTab('scan-qr')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              Scan Class QR
            </button>
            <button
              id="student-quick-can-miss-button"
              onClick={() => onNavigateTab('can-miss')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-600" />
              Can I Miss?
            </button>
          </div>
        </div>

        {/* Dynamic Transparent Risk Explanation */}
        <div className={`mt-5 p-4 rounded-xl border ${getRiskBannerStyle()} flex items-start gap-3`}>
          <div className="p-1.5 rounded-lg bg-white/70 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm">
              Attendance Status: {stats.overallRiskLevel.toUpperCase()}
            </p>
            <p className="mt-0.5">{stats.riskReason}</p>
            {stats.overallRiskLevel === 'safe' && (
              <p className="mt-1 font-medium">
                ✨ You currently have a safety cushion and can afford to miss up to{' '}
                <strong>{stats.canMissOverall}</strong> lecture(s) while maintaining &ge; {stats.requiredPercentage}%.
              </p>
            )}
            {stats.overallRiskLevel !== 'safe' && (
              <p className="mt-1 font-medium">
                🎯 Recovery Target: You need to attend the next{' '}
                <strong>{stats.recoverOverall}</strong> consecutive lecture(s) without absence to restore your standing.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Circular Progress Gauge */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Overall Attendance
          </p>
          <CircularProgress
            value={stats.overallPercentage}
            riskLevel={stats.overallRiskLevel}
            size={150}
            strokeWidth={14}
            subtitle={`Req: ${stats.requiredPercentage}%`}
          />
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.attendedLectures} Attended
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-rose-700">
              <XCircle className="w-3.5 h-3.5" /> {stats.missedLectures} Missed
            </span>
          </div>
        </div>

        {/* Key Numerical Stat Cards */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            id="stat-required-pct"
            title="Required Percentage"
            value={`${stats.requiredPercentage}%`}
            subtitle="University Minimum"
            icon={BookOpen}
          />
          <StatCard
            id="stat-total-conducted"
            title="Total Conducted"
            value={stats.totalLectures}
            subtitle="Applicable sessions"
            icon={Clock}
          />
          <StatCard
            id="stat-approved-leave"
            title="Approved Leave"
            value={stats.approvedLeaveLectures}
            subtitle="Excused from penalty"
            icon={CheckCircle2}
            badge={{ text: 'Excused', variant: 'indigo' }}
          />
          <StatCard
            id="stat-can-miss"
            title="Can Safely Miss"
            value={`${stats.canMissOverall} Lecs`}
            subtitle={`Above ${stats.requiredPercentage}% requirement`}
            icon={HelpCircle}
            badge={{ text: stats.canMissOverall > 0 ? 'Buffer' : 'Zero', variant: stats.canMissOverall > 0 ? 'emerald' : 'rose' }}
            onClick={() => onNavigateTab('can-miss')}
          />
          <StatCard
            id="stat-consecutive-needed"
            title="Recovery Needed"
            value={`${stats.recoverOverall} Lecs`}
            subtitle="Consecutive attendance"
            icon={Calculator}
            badge={{ text: stats.recoverOverall === 0 ? 'On Track' : 'Urgent', variant: stats.recoverOverall === 0 ? 'emerald' : 'amber' }}
            onClick={() => onNavigateTab('calculator')}
          />
          <StatCard
            id="stat-engagement-score"
            title="Engagement Score"
            value={stats.engagement ? `${stats.engagement.totalScore}/100` : '85/100'}
            subtitle="Academic activity index"
            icon={Flame}
            badge={{ text: 'Multi-factor', variant: 'indigo' }}
            onClick={() => onNavigateTab('engagement')}
          />
        </div>
      </div>

      {/* Subject-Wise Attendance Intelligence Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Subject-Wise Attendance Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Click any subject to view full lecture history, safe miss limits, and recovery paths
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('calculator')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            Launch Smart Calculator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Attended / Total</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.subjects.map((sub) => (
                <tr
                  key={sub.subjectId}
                  id={`subject-row-${sub.subjectCode}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{sub.subjectName}</div>
                    <div className="text-[11px] text-slate-500">
                      Code: {sub.subjectCode} • {sub.facultyName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <span className="text-emerald-700 font-bold">{sub.attended}</span> /{' '}
                    <span>{sub.totalApplicable}</span>
                    {sub.approvedLeave > 0 && (
                      <span className="text-[10px] text-blue-600 ml-1">
                        (+{sub.approvedLeave} leave)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-slate-900">
                      {sub.percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Target: {sub.requiredPercentage}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[120px]">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.riskLevel === 'safe'
                            ? 'bg-emerald-500'
                            : sub.riskLevel === 'at_risk'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={sub.riskLevel} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      id={`view-subject-${sub.subjectCode}`}
                      onClick={() => setSelectedSubject(sub)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs transition-colors"
                    >
                      Details & History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Subject Drilldown */}
      <SubjectDetailModal
        subject={selectedSubject}
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  );
};
