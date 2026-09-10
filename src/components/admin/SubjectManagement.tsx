import React, { useState } from 'react';
import { Subject, Faculty } from '../../types.ts';
import { BookOpen, Plus, Award, User } from 'lucide-react';

interface SubjectManagementProps {
  subjects: Subject[];
  faculty: Faculty[];
  onRefresh: () => void;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  faculty,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [credits, setCredits] = useState(4);
  const [requiredPercentage, setRequiredPercentage] = useState(75);
  const [facultyId, setFacultyId] = useState(faculty[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          department,
          credits: Number(credits),
          requiredPercentage: Number(requiredPercentage),
          facultyId,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
        setCode('');
        onRefresh();
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
            Course & Curriculum Subject Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic courses, attendance policy thresholds, and lead faculty instructors
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Add Academic Subject
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Add Academic Subject</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-501"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={requiredPercentage}
                  onChange={(e) => setRequiredPercentage(parseInt(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Faculty</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {submitting ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const fac = faculty.find((f) => f.id === sub.facultyId);
          return (
            <div
              key={sub.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sub.name}</h3>
                    <span className="font-mono text-xs text-indigo-700 font-semibold block mt-0.5">
                      {sub.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                    {sub.credits} Credits
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Faculty: {fac?.name || 'Unassigned'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Threshold: <strong className="text-slate-900">{sub.requiredPercentage}%</strong></span>
                <span className="text-[11px] text-slate-400">{sub.department}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
