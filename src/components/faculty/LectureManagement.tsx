import React, { useState } from 'react';
import { Lecture, Subject, Class } from '../../types.ts';
import { Calendar, Plus, Clock, MapPin, BookOpen, CheckCircle2, Trash2 } from 'lucide-react';

interface LectureManagementProps {
  lectures: Lecture[];
  subjects: Subject[];
  classes: Class[];
  onLectureCreated: () => void;
}

export const LectureManagement: React.FC<LectureManagementProps> = ({
  lectures,
  subjects,
  classes,
  onLectureCreated,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [topic, setTopic] = useState('');
  const [room, setRoom] = useState('Hall B-201');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !date) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/faculty/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          subjectId,
          date,
          startTime,
          endTime,
          topic,
          room,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTopic('');
        onLectureCreated();
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
            Lecture Timetable & Schedule Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan upcoming academic sessions, record topics covered, and organize classroom venues
          </p>
        </div>
        <button
          id="schedule-new-lecture-btn"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start"
        >
          <Plus className="w-4 h-4" /> Schedule New Lecture
        </button>
      </div>

      {/* Schedule Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Schedule Academic Session</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.section})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Relational Transactions & 2PC"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Hall / Room</label>
                <input
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
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
                  {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lectures List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          All Scheduled & Conducted Sessions ({lectures.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lectures.map((lec) => {
            const sub = subjects.find((s) => s.id === lec.subjectId);
            const cls = classes.find((c) => c.id === lec.classId);
            return (
              <div
                key={lec.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sub?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cls?.name} • Room {lec.room}
                      </p>
                    </div>
                    {lec.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 mt-2 font-medium">
                    Topic: <span className="font-normal text-slate-600">{lec.topic || 'General Lecture'}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {lec.date}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {lec.startTime} - {lec.endTime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
