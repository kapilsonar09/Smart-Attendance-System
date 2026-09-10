import React from 'react';
import { Faculty, Class, Subject, Lecture, StudentOverallStats } from '../../types.ts';
import { StatCard } from '../common/StatCard.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import {
  Calendar,
  Users,
  BookOpen,
  QrCode,
  ClipboardList,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface FacultyDashboardProps {
  faculty: Faculty;
  classes: Class[];
  subjects: Subject[];
  lectures: Lecture[];
  studentsAtRisk: StudentOverallStats[];
  onNavigateTab: (tab: string, extra?: any) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  faculty,
  classes,
  subjects,
  lectures,
  studentsAtRisk,
  onNavigateTab,
}) => {
  const mySubjects = subjects.filter((s) => s.facultyId === faculty.id);
  const myLectures = lectures.filter((l) =>
    mySubjects.some((s) => s.id === l.subjectId)
  );
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLectures = myLectures.filter((l) => l.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Welcome, {faculty.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
                {faculty.department}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Faculty ID: <span className="font-semibold text-slate-700">{faculty.employeeId}</span> • {faculty.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="faculty-quick-qr-button"
              onClick={() => onNavigateTab('qr-attendance')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              Live QR Session
            </button>
            <button
              id="faculty-quick-mark-button"
              onClick={() => onNavigateTab('mark-attendance')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-slate-600" />
              Manual Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-faculty-subjects"
          title="Subjects Taught"
          value={mySubjects.length}
          subtitle="Assigned curriculum"
          icon={BookOpen}
        />
        <StatCard
          id="stat-faculty-classes"
          title="Assigned Classes"
          value={classes.length}
          subtitle="Class cohorts"
          icon={Users}
        />
        <StatCard
          id="stat-faculty-today-lectures"
          title="Today's Sessions"
          value={todayLectures.length}
          subtitle="Scheduled lectures"
          icon={Calendar}
          badge={{ text: `${todayLectures.length} today`, variant: 'indigo' }}
        />
        <StatCard
          id="stat-faculty-at-risk"
          title="At-Risk Students"
          value={studentsAtRisk.length}
          subtitle="Need academic attention"
          icon={AlertTriangle}
          badge={{
            text: studentsAtRisk.length > 0 ? 'Requires action' : 'All clear',
            variant: studentsAtRisk.length > 0 ? 'amber' : 'emerald',
          }}
          onClick={() => onNavigateTab('analytics')}
        />
      </div>

      {/* Two Column Layout: Upcoming Session & At-Risk Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Next Lecture & Schedule */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" /> Recent & Upcoming Lectures
            </h2>
            <button
              onClick={() => onNavigateTab('lectures')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myLectures.slice(0, 4).map((lec) => {
              const sub = subjects.find((s) => s.id === lec.subjectId);
              const cls = classes.find((c) => c.id === lec.classId);
              return (
                <div
                  key={lec.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {sub?.name || 'Class Lecture'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lec.date} • {lec.startTime} - {lec.endTime} • {cls?.name} (Room {lec.room})
                    </div>
                    {lec.topic && (
                      <div className="text-[10px] text-slate-400 mt-0.5 italic truncate max-w-xs">
                        Topic: {lec.topic}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {lec.isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Conducted
                      </span>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('qr-attendance', { lectureId: lec.id })}
                        className="text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded transition-colors"
                      >
                        Start QR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Students Needing Attention (At-Risk / Critical) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                At-Risk Student Intervention Roster
              </h2>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded-full">
                {studentsAtRisk.length}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              Analyze All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Faculty advisory engine highlights students falling below 75% or with negative attendance trajectories.
          </p>

          <div className="space-y-2.5">
            {studentsAtRisk.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No students currently in critical or at-risk standing!
              </div>
            ) : (
              studentsAtRisk.map((stu) => (
                <div
                  key={stu.studentId}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {stu.studentName}
                      </span>
                      <RiskBadge level={stu.overallRiskLevel} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Roll: {stu.rollNumber} • Standing: <strong className="text-slate-800">{stu.overallPercentage}%</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Needs: <strong className="text-indigo-700">{stu.recoverOverall}</strong> consecutive classes to recover
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('analytics')}
                    className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 shadow-2xs"
                  >
                    Review Profile
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
