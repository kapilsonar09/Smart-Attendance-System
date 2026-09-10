import React, { useState } from 'react';
import { LeaveRequest, Faculty } from '../../types.ts';
import { ClipboardList, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface FacultyLeaveReviewProps {
  faculty: Faculty;
  leaveRequests: LeaveRequest[];
  onReviewCompleted: () => void;
}

export const FacultyLeaveReview: React.FC<FacultyLeaveReviewProps> = ({
  faculty,
  leaveRequests,
  onReviewCompleted,
}) => {
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/faculty/leave-requests/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          facultyRemark: remarksMap[id] || (status === 'approved' ? 'Approved as per academic policy' : 'Insufficient justification'),
          reviewedBy: faculty.name,
        }),
      });

      if (res.ok) {
        onReviewCompleted();
      }
    } catch (err) {
      console.error('Failed to review leave:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const pending = leaveRequests.filter((r) => r.status === 'pending');
  const past = leaveRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">
          Student Leave Request Approvals
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve or reject student medical / institutional leaves. Approved requests excuse students from absence penalties.
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Student Applications ({pending.length})
          </h2>
        </div>

        {pending.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No pending leave applications requiring your review.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {req.studentName} <span className="font-mono text-xs text-slate-500 font-normal">({req.rollNumber})</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Scope: <strong className="text-slate-800">{req.subjectName || 'All Class Subjects'}</strong> • Dates: {req.fromDate} to {req.toDate}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full self-start">
                    Pending Action
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Reason: </span>
                  {req.reason}
                  {req.supportingNote && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      Note: {req.supportingNote}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter faculty review remark (e.g. Medical certificate verified)"
                    value={remarksMap[req.id] || ''}
                    onChange={(e) =>
                      setRemarksMap({ ...remarksMap, [req.id]: e.target.value })
                    }
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  />
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleReview(req.id, 'approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Excuse
                    </button>
                    <button
                      disabled={processingId === req.id}
                      onClick={() => handleReview(req.id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Decisions Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Decision History ({past.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Scope & Dates</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Verdict</th>
                <th className="py-2.5 px-3">Faculty Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {past.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {p.studentName} ({p.rollNumber})
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {p.subjectName || 'All Subjects'} • {p.fromDate} to {p.toDate}
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs">{p.reason}</td>
                  <td className="py-3 px-3">
                    {p.status === 'approved' ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        Approved
                      </span>
                    ) : (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {p.facultyRemark || 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
