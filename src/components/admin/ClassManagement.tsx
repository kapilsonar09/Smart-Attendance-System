import React, { useState } from 'react';
import { Class } from '../../types.ts';
import { Building2, Plus, Users, Calendar } from 'lucide-react';

interface ClassManagementProps {
  classes: Class[];
  onRefresh: () => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [section, setSection] = useState('A');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(5);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          section,
          department,
          semester: Number(semester),
          academicYear,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setName('');
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
            Academic Cohort & Class Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure semesters, class sections, and enrollment cohorts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Add Academic Class
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Create New Class Cohort</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="A, B, or C"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
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
                  {submitting ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">
                  Sec {c.section}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{c.department}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Semester {c.semester}</span>
                <span>Year: {c.academicYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
