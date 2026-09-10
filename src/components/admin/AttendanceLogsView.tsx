import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AttendanceLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/attendance-logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      l.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
      l.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Institutional Attendance Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete historical registry of all recorded classroom presences, absences, and excused leaves
          </p>
        </div>
        <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
          {logs.length} Total Records
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, subject or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {log.date}
                      <span className="text-[10px] text-slate-400 block">{log.markedAt ? new Date(log.markedAt).toLocaleTimeString() : ''}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Roll: {log.rollNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.subjectName} ({log.subjectCode})
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                      {log.method}
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'present' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </span>
                      )}
                      {log.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold text-[10px]">
                          <XCircle className="w-3 h-3" /> Absent
                        </span>
                      )}
                      {log.status === 'approved_leave' && (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold text-[10px]">
                          <Clock className="w-3 h-3" /> Excused Leave
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-xs">
                      {log.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
