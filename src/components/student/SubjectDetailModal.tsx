import React from 'react';
import { SubjectAttendanceSummary } from '../../types.ts';
import { Modal } from '../common/Modal.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import { Calendar, CheckCircle2, XCircle, Clock, Award } from 'lucide-react';

interface SubjectDetailModalProps {
  subject: SubjectAttendanceSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
}) => {
  if (!subject) return null;

  return (
    <Modal
      id={`modal-subject-${subject.subjectId}`}
      isOpen={isOpen}
      onClose={onClose}
      title={`${subject.subjectName} (${subject.subjectCode})`}
      subtitle={`Faculty: ${subject.facultyName}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Status & Highlights */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs text-slate-500 font-medium">Current Attendance</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {subject.percentage}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Required: <span className="font-semibold text-slate-700">{subject.requiredPercentage}%</span>
            </div>
          </div>
          <RiskBadge level={subject.riskLevel} size="lg" />
        </div>

        {/* Intelligence Recovery & Buffer Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="text-[11px] font-semibold uppercase text-emerald-800 tracking-wider block">
              Can Safely Miss
            </span>
            <div className="text-xl font-bold text-emerald-900 mt-1">
              {subject.canMissCount} {subject.canMissCount === 1 ? 'lecture' : 'lectures'}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 leading-snug">
              without falling below the {subject.requiredPercentage}% required mark.
            </p>
          </div>

          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
            <span className="text-[11px] font-semibold uppercase text-indigo-800 tracking-wider block">
              Consecutive Needed
            </span>
            <div className="text-xl font-bold text-indigo-900 mt-1">
              {subject.recoverConsecutiveCount} {subject.recoverConsecutiveCount === 1 ? 'lecture' : 'lectures'}
            </div>
            <p className="text-[11px] text-indigo-700 mt-1 leading-snug">
              consecutive attendance required to meet or restore target.
            </p>
          </div>
        </div>

        {/* Explanation text */}
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
          <strong>Academic Assessment: </strong> {subject.riskReason}
        </div>

        {/* Lecture History Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Lecture Conducted History ({subject.history.length})
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Topic / Syllabus</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subject.history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {h.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">
                      {h.topic || 'General Lecture'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 uppercase text-[10px] font-semibold">
                      {h.method}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {h.status === 'present' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </span>
                      )}
                      {h.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold border border-rose-200 text-[11px]">
                          <XCircle className="w-3 h-3" /> Absent
                        </span>
                      )}
                      {h.status === 'approved_leave' && (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-semibold border border-blue-200 text-[11px]">
                          <Clock className="w-3 h-3" /> Excused Leave
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
