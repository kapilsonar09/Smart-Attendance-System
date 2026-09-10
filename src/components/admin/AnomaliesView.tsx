import React, { useState } from 'react';
import { AnomalyRecord } from '../../types.ts';
import { AlertOctagon, CheckCircle2, ShieldAlert, FileText, Check } from 'lucide-react';

interface AnomaliesViewProps {
  anomalies: AnomalyRecord[];
  onRefresh: () => void;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  anomalies,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResolve = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/anomalies/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionNotes: resolveNote || 'Reviewed and verified by Administrator.',
        }),
      });
      if (res.ok) {
        setResolvingId(null);
        setResolveNote('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = anomalies.filter((a) => {
    if (filter === 'unresolved') return !a.isResolved;
    if (filter === 'resolved') return a.isResolved;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Security Anomaly Detection & Audit Logging
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated intelligence tracking proxy patterns, sudden absenteeism drops, and administrative roster overrides
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Events ({anomalies.length})
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'unresolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Open Audits ({anomalies.filter((a) => !a.isResolved).length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Resolved ({anomalies.filter((a) => a.isResolved).length})
          </button>
        </div>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
            No audit records matching current filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-3 ${
                item.isResolved ? 'border-slate-200 opacity-80' : 'border-rose-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      item.severity === 'high'
                        ? 'bg-rose-50 text-rose-700'
                        : item.severity === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 capitalize">
                      {item.type.replace('_', ' ')}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Detected: {new Date(item.detectedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Severity: {item.severity}
                  </span>
                  {item.isResolved ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Open Audit
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {item.description}
              </div>

              {item.isResolved && item.resolutionNotes && (
                <div className="text-xs text-emerald-800 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
                  <strong>Resolution: </strong> {item.resolutionNotes}
                </div>
              )}

              {/* Action */}
              {!item.isResolved && (
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  {resolvingId === item.id ? (
                    <div className="flex-1 flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="Resolution justification notes..."
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                      />
                      <button
                        disabled={submitting}
                        onClick={() => handleResolve(item.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        {submitting ? 'Saving...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setResolvingId(null)}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolvingId(item.id)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Resolve & Close Audit
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
