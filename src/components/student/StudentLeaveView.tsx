import React, { useState } from 'react';
import { StudentOverallStats, LeaveRequest } from '../../types.ts';
import { ClipboardList, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StudentLeaveViewProps {
  stats: StudentOverallStats;
  leaveRequests: LeaveRequest[];
  onLeaveSubmitted: () => void;
}

export const StudentLeaveView: React.FC<StudentLeaveViewProps> = ({
  stats,
  leaveRequests,
  onLeaveSubmitted,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [supportingNote, setSupportingNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/student/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: stats.studentId,
          subjectId: subjectId || null,
          fromDate,
          toDate,
          reason,
          supportingNote,
        }),
      });

      if (res.ok) {
        setFeedback('Leave request submitted successfully for faculty review.');
        setShowForm(false);
        setReason('');
        setSupportingNote('');
        onLeaveSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Student Academic Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit medical or duty leaves. Approved leaves are excused from attendance penalty calculations.
          </p>
        </div>
        <button
          id="open-leave-form-btn"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel Request' : 'New Leave Request'}
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {feedback}
        </div>
      )}

      {/* Leave Application Form */}
      {showForm && (
        <form
          id="student-leave-form"
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 animate-in fade-in"
        >
          <h2 className="text-sm font-bold text-slate-900">Submit New Leave Request</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Scope
              </label>
              <select
                id="leave-subject-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value="">All Subjects (Full Day / Semester)</option>
                {stats.subjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectName} ({sub.subjectCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Date *
              </label>
              <input
                id="leave-from-date"
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Date *
              </label>
              <input
                id="leave-to-date"
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Absence *
            </label>
            <input
              id="leave-reason-input"
              type="text"
              required
              placeholder="e.g. Representing university at Inter-college robotics symposium"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting Notes / Medical Certificate Ref (Optional)
            </label>
            <textarea
              id="leave-supporting-notes"
              rows={2}
              placeholder="e.g. Official invitation letter submitted to HOD office; Certificate #MC-4821"
              value={supportingNote}
              onChange={(e) => setSupportingNote(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-leave-button"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Submitted Requests ({leaveRequests.length})
        </h2>

        {leaveRequests.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No leave requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Date Range</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((lr) => (
                  <tr key={lr.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {lr.subjectName || 'All Subjects'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {lr.fromDate} to {lr.toDate}
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs">
                      <div>{lr.reason}</div>
                      {lr.supportingNote && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{lr.supportingNote}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {lr.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-semibold text-[10px]">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {lr.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {lr.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-semibold text-[10px]">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {lr.facultyRemark || <span className="text-slate-400 italic">No remarks</span>}
                      {lr.reviewedBy && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">by {lr.reviewedBy}</span>
                      )}
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
