import React from 'react';
import { StudentOverallStats } from '../../types.ts';
import { Flame, CheckCircle, Award, BarChart2 } from 'lucide-react';

interface EngagementScoreViewProps {
  stats: StudentOverallStats;
}

export const EngagementScoreView: React.FC<EngagementScoreViewProps> = ({ stats }) => {
  const eng = stats.engagement || {
    id: 'eng-default',
    studentId: stats.studentId,
    attendanceScore: Math.round(stats.overallPercentage),
    assignmentScore: 88,
    quizScore: 82,
    participationScore: 80,
    totalScore: Math.round(stats.overallPercentage * 0.4 + 88 * 0.25 + 82 * 0.2 + 80 * 0.15),
    calculatedAt: new Date().toISOString(),
  };

  const components = [
    {
      name: 'Attendance & Presence',
      weight: '40%',
      rawScore: eng.attendanceScore,
      weightedValue: (eng.attendanceScore * 0.4).toFixed(1),
      description: 'Calculated directly from real-time classroom lecture attendance records.',
      color: 'bg-emerald-500',
    },
    {
      name: 'Laboratory & Homework Assignments',
      weight: '25%',
      rawScore: eng.assignmentScore,
      weightedValue: (eng.assignmentScore * 0.25).toFixed(1),
      description: 'Submission timeliness and technical grading on course practicals.',
      color: 'bg-indigo-500',
    },
    {
      name: 'Mid-term & Chapter Quizzes',
      weight: '20%',
      rawScore: eng.quizScore,
      weightedValue: (eng.quizScore * 0.2).toFixed(1),
      description: 'Continuous assessment and knowledge checks throughout the semester.',
      color: 'bg-blue-500',
    },
    {
      name: 'Classroom & Forum Participation',
      weight: '15%',
      rawScore: eng.participationScore,
      weightedValue: (eng.participationScore * 0.15).toFixed(1),
      description: 'Active discussion contributions and seminar presentations.',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Multi-Factor Class Engagement Index
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic academic activity indicator combining attendance, assignments, and continuous assessments
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl shadow-xs self-start">
          <Flame className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Composite Engagement Score
            </div>
            <div className="text-2xl font-bold leading-tight">
              {eng.totalScore} <span className="text-sm font-normal text-slate-300">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Component Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((comp, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{comp.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  Weight: {comp.weight}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {comp.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Score: {comp.rawScore} / 100</span>
                <span className="text-slate-900 font-bold">Contribution: +{comp.weightedValue} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${comp.color}`}
                  style={{ width: `${comp.rawScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
        <strong>Academic Policy Disclaimer: </strong>
        This score is generated as an academic participation and activity indicator to assist student self-regulation.
        It is not an objective assessment of a student’s innate personality or intellect.
      </div>
    </div>
  );
};
