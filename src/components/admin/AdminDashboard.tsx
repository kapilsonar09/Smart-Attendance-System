import React from 'react';
import { StatCard } from '../common/StatCard.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  AlertOctagon,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  overview: {
    totalStudents: number;
    totalFaculty: number;
    totalClasses: number;
    totalSubjects: number;
    totalLectures: number;
    totalAnomalies: number;
    unresolvedAnomalies: number;
    overallAttendanceAverage: number;
    riskDistribution: {
      safe: number;
      at_risk: number;
      critical: number;
    };
    recentAnomalies: any[];
  };
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  overview,
  onNavigateTab,
}) => {
  const riskDist = overview?.riskDistribution || {
    safe: 0,
    at_risk: 0,
    critical: 0,
  };
  const totalStudents = overview?.totalStudents ?? 0;
  const totalFaculty = overview?.totalFaculty ?? 0;
  const totalClasses = overview?.totalClasses ?? 0;
  const unresolvedAnomalies = overview?.unresolvedAnomalies ?? 0;
  const totalAnomalies = overview?.totalAnomalies ?? unresolvedAnomalies;
  const overallAvg = overview?.overallAttendanceAverage ?? 0;
  const recentAnomalies = overview?.recentAnomalies || [];

  const totalRoster = totalStudents || 1;
  const safePct = Math.round(((riskDist.safe || 0) / totalRoster) * 100);
  const atRiskPct = Math.round(((riskDist.at_risk || 0) / totalRoster) * 100);
  const criticalPct = Math.round(((riskDist.critical || 0) / totalRoster) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Institutional Attendance Intelligence Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-semibold">
              Dean Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global monitoring of academic presence, risk forecasting, faculty logs, and fraud detection audits
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <div className="p-3 bg-slate-900 text-white rounded-xl text-center shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Institution Mean
            </div>
            <div className="text-2xl font-bold">{overallAvg}%</div>
          </div>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="admin-stat-students"
          title="Total Enrolled Students"
          value={totalStudents}
          subtitle="Across all departments"
          icon={Users}
          onClick={() => onNavigateTab('students')}
        />
        <StatCard
          id="admin-stat-faculty"
          title="Active Faculty"
          value={totalFaculty}
          subtitle="Teaching staff"
          icon={GraduationCap}
          onClick={() => onNavigateTab('faculty')}
        />
        <StatCard
          id="admin-stat-classes"
          title="Academic Cohorts"
          value={totalClasses}
          subtitle="Active sections"
          icon={Building2}
          onClick={() => onNavigateTab('classes')}
        />
        <StatCard
          id="admin-stat-anomalies"
          title="Security Anomalies"
          value={unresolvedAnomalies}
          subtitle={`${totalAnomalies} recorded events`}
          icon={AlertOctagon}
          badge={{
            text: unresolvedAnomalies > 0 ? 'Requires Audit' : 'Clear',
            variant: unresolvedAnomalies > 0 ? 'rose' : 'emerald',
          }}
          onClick={() => onNavigateTab('anomalies')}
        />
      </div>

      {/* Risk Distribution & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Risk Breakdown */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Student Body Attendance Risk Profile
          </h2>

          {/* Segmented Bar */}
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${safePct}%` }}
              title={`Safe: ${safePct}%`}
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${atRiskPct}%` }}
              title={`At Risk: ${atRiskPct}%`}
            />
            <div
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${criticalPct}%` }}
              title={`Critical: ${criticalPct}%`}
            />
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Safe (&ge; 80%)</span>
              <div className="text-xl font-bold text-emerald-950 mt-1">
                {riskDist.safe}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">{safePct}% of cohort</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase">At Risk (75-80%)</span>
              <div className="text-xl font-bold text-amber-950 mt-1">
                {riskDist.at_risk}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">{atRiskPct}% of cohort</span>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Critical (&lt; 75%)</span>
              <div className="text-xl font-bold text-rose-950 mt-1">
                {riskDist.critical}
              </div>
              <span className="text-[11px] text-rose-700 font-semibold">{criticalPct}% of cohort</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            Institutional policy automatically flags students below 75% for mandatory academic counseling and dispatches automated notices to enrolled guardians.
          </p>
        </div>

        {/* Right: Security & Anomaly Audit Stream */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" /> Recent Security & Proxy Anomalies
              </h2>
              <button
                onClick={() => onNavigateTab('anomalies')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                Audit Log <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAnomalies.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent audit anomalies detected.
                </div>
              ) : (
                recentAnomalies.map((anom: any) => (
                  <div
                    key={anom.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 capitalize">
                        {anom.type?.replace('_', ' ')}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                        {anom.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {anom.detectedAt || anom.createdAt ? new Date(anom.detectedAt || anom.createdAt).toLocaleString() : ''}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase self-start shrink-0 ${
                        anom.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {anom.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Automated anti-fraud engine active</span>
            <button
              onClick={() => onNavigateTab('anomalies')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Resolve open cases &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
