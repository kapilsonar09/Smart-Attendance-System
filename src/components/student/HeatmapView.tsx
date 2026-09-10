import React, { useState, useEffect } from 'react';
import { HeatmapDayCell, StudentOverallStats } from '../../types.ts';
import { Calendar, Layers, Info, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface HeatmapViewProps {
  stats: StudentOverallStats;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ stats }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'subjects'>('calendar');
  const [cells, setCells] = useState<HeatmapDayCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapDayCell | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/heatmap?studentId=${stats.studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setCells(data);
        if (data.length > 0) setSelectedCell(data[data.length - 1]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load heatmap:', err);
        setLoading(false);
      });
  }, [stats.studentId]);

  // Compute day of week absenteeism insight
  const dayOfWeekStats: Record<string, { total: number; absent: number }> = {};
  cells.forEach((c) => {
    if (!dayOfWeekStats[c.dayOfWeek]) dayOfWeekStats[c.dayOfWeek] = { total: 0, absent: 0 };
    dayOfWeekStats[c.dayOfWeek].total += c.totalLectures;
    dayOfWeekStats[c.dayOfWeek].absent += c.missedLectures;
  });

  let worstDay = 'None';
  let highestAbsentRate = 0;
  Object.entries(dayOfWeekStats).forEach(([day, s]) => {
    if (s.total > 0) {
      const rate = s.absent / s.total;
      if (rate > highestAbsentRate) {
        highestAbsentRate = rate;
        worstDay = day;
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Attendance Heatmap & Pattern Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify behavioral absenteeism trends, day-of-week correlations, and subject hotspots
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start">
          <button
            id="heatmap-calendar-toggle"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Day-by-Day Calendar
          </button>
          <button
            id="heatmap-subjects-toggle"
            onClick={() => setViewMode('subjects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'subjects'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Subject Matrix
          </button>
        </div>
      </div>

      {/* Pattern Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Absence Day Correlation
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {worstDay !== 'None' ? `${worstDay}s` : 'Consistent'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {highestAbsentRate > 0
              ? `${Math.round(highestAbsentRate * 100)}% of your absences occurred on ${worstDay}s.`
              : 'No recurring weekday absenteeism identified.'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Lowest Subject Density
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {stats.subjects.reduce((prev, curr) => (curr.percentage < prev.percentage ? curr : prev)).subjectCode}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requires targeted recovery to prevent threshold failure.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Approved Leave Relief
          </span>
          <div className="text-lg font-bold text-blue-700 mt-1">
            {stats.approvedLeaveLectures} Sessions
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Excused from calculation via formal academic approval.
          </p>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Academic Days Timeline ({cells.length} Recorded Days)
              </h2>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> 100% Attended
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Partial / At Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Missed / Critical
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading heatmap...</div>
            ) : cells.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No lecture dates recorded yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {cells.map((cell) => {
                  const isSelected = selectedCell?.date === cell.date;
                  const bg =
                    cell.percentage >= 80
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : cell.percentage >= 70
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950';

                  const badge =
                    cell.percentage >= 80
                      ? 'bg-emerald-600 text-white'
                      : cell.percentage >= 70
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white';

                  return (
                    <button
                      key={cell.date}
                      id={`heatmap-cell-${cell.date}`}
                      onClick={() => setSelectedCell(cell)}
                      className={`p-3 rounded-xl border text-left transition-all ${bg} ${
                        isSelected ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {cell.dayOfWeek}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${badge}`}>
                          {cell.percentage}%
                        </span>
                      </div>
                      <div className="text-sm font-bold mt-1">{cell.date.substring(5)}</div>
                      <div className="text-[11px] opacity-80 mt-1 font-medium">
                        {cell.attendedLectures}/{cell.totalLectures} attended
                        {cell.leaveLectures > 0 && ` (${cell.leaveLectures} leave)`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Day Drilldown */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" /> Day Details: {selectedCell?.date || 'Select a day'}
            </h3>

            {selectedCell ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Day Standing:</span>
                    <span className="font-bold text-slate-900">{selectedCell.percentage}% Attendance</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Scheduled:</span>
                    <span className="font-medium text-slate-800">
                      {selectedCell.totalLectures} Lectures ({selectedCell.attendedLectures} Attended, {selectedCell.missedLectures} Absent)
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Lectures Conducted
                  </h4>
                  {selectedCell.lectures.map((lec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{lec.subjectName}</div>
                        <div className="text-[10px] text-slate-500">{lec.time}</div>
                      </div>
                      <div>
                        {lec.status === 'present' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        )}
                        {lec.status === 'absent' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        )}
                        {lec.status === 'approved_leave' && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Leave
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click a day block on the calendar to view lectures.</p>
            )}
          </div>
        </div>
      )}

      {/* Subjects View */}
      {viewMode === 'subjects' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Curriculum Subject Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.subjects.map((sub) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sub.subjectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sub.subjectCode} • {sub.facultyName}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                      sub.riskLevel === 'safe'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sub.riskLevel === 'at_risk'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>

                <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
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

                <div className="mt-3 flex justify-between text-xs text-slate-600 font-medium">
                  <span>Attended: {sub.attended}/{sub.totalApplicable}</span>
                  <span>Can Miss: <strong className="text-slate-900">{sub.canMissCount}</strong></span>
                  <span>Recover: <strong className="text-slate-900">{sub.recoverConsecutiveCount}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
