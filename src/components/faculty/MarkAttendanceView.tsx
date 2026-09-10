import React, { useState, useEffect } from 'react';
import { Lecture, Subject, Class, Student, AttendanceStatus } from '../../types.ts';
import { ClipboardList, CheckCircle2, XCircle, Clock, Save, ShieldCheck, Check } from 'lucide-react';

interface MarkAttendanceViewProps {
  lectures: Lecture[];
  subjects: Subject[];
  classes: Class[];
  students: Student[];
  onAttendanceSaved: () => void;
}

export const MarkAttendanceView: React.FC<MarkAttendanceViewProps> = ({
  lectures,
  subjects,
  classes,
  students,
  onAttendanceSaved,
}) => {
  const [selectedLectureId, setSelectedLectureId] = useState(
    lectures.length > 0 ? lectures[0].id : ''
  );
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<string>('Regular classroom session');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentLecture = lectures.find((l) => l.id === selectedLectureId);
  const currentSubject = subjects.find((s) => s.id === currentLecture?.subjectId);
  const currentClass = classes.find((c) => c.id === currentLecture?.classId);

  // Enrolled students in class
  const classStudents = students.filter((s) => s.classId === currentLecture?.classId);

  // Load existing records for lecture
  useEffect(() => {
    if (!selectedLectureId) return;
    fetch(`/api/faculty/lecture-attendance?lectureId=${selectedLectureId}`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const map: Record<string, AttendanceStatus> = {};
        data.forEach((item) => {
          map[item.studentId] = item.status;
        });
        // Default unrecorded students to 'present'
        classStudents.forEach((stu) => {
          if (!map[stu.id]) map[stu.id] = 'present';
        });
        setRecords(map);
      })
      .catch((err) => console.error(err));
  }, [selectedLectureId, classStudents.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((stu) => {
      updated[stu.id] = status;
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    if (!selectedLectureId) return;
    setSaving(true);
    setFeedback(null);

    const payload = classStudents.map((stu) => ({
      studentId: stu.id,
      status: records[stu.id] || 'present',
    }));

    try {
      const res = await fetch('/api/faculty/save-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: selectedLectureId,
          records: payload,
          remarks,
        }),
      });

      if (res.ok) {
        setFeedback('Attendance roster saved and intelligence metrics updated successfully.');
        onAttendanceSaved();
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(records).filter((s) => s === 'present').length;
  const absentCount = Object.values(records).filter((s) => s === 'absent').length;
  const leaveCount = Object.values(records).filter((s) => s === 'approved_leave').length;
  const total = classStudents.length;
  const currentPct = total > 0 ? Math.round((presentCount / (total - leaveCount || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Manual Attendance Roster & Audit Sheet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark or review student presence with role-based justifications and automatic audit tracking
          </p>
        </div>

        <button
          id="save-manual-attendance-button"
          disabled={saving || classStudents.length === 0}
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-xs self-start"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish Sheet'}
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {feedback}
        </div>
      )}

      {/* Selector & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Lecture
            </label>
            <select
              id="manual-lecture-select"
              value={selectedLectureId}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
            >
              {lectures.map((lec) => {
                const sub = subjects.find((s) => s.id === lec.subjectId);
                const cls = classes.find((c) => c.id === lec.classId);
                return (
                  <option key={lec.id} value={lec.id}>
                    {lec.date} • {sub?.name} ({cls?.name})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Faculty Audit Remark
            </label>
            <input
              id="faculty-audit-remark"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Regular class or Lab exercise 3"
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex gap-2">
              <button
                id="mark-all-present-btn"
                onClick={() => markAll('present')}
                className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
              >
                Mark All Present
              </button>
              <button
                id="mark-all-absent-btn"
                onClick={() => markAll('absent')}
                className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Counter Bar */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">
              Total Enrolled: <strong className="text-slate-900">{total}</strong>
            </span>
            <span className="font-semibold text-emerald-700">
              Present: <strong>{presentCount}</strong>
            </span>
            <span className="font-semibold text-rose-700">
              Absent: <strong>{absentCount}</strong>
            </span>
            <span className="font-semibold text-blue-700">
              Excused: <strong>{leaveCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Session Rate:</span>
            <span className="font-bold text-sm text-slate-900">{currentPct}%</span>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Roll Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Class Standing</th>
              <th className="py-3 px-4 text-right">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.map((stu) => {
              const currentStatus = records[stu.id] || 'present';
              return (
                <tr key={stu.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {stu.rollNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{stu.name}</div>
                    <div className="text-[11px] text-slate-400">{stu.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {currentClass?.name || 'Class A'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        onClick={() => handleStatusChange(stu.id, 'present')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(stu.id, 'absent')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(stu.id, 'approved_leave')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                          currentStatus === 'approved_leave'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
