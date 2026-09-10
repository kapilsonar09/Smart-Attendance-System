import React, { useState } from 'react';
import { StudentOverallStats } from '../../types.ts';
import { QrCode, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanQRViewProps {
  stats: StudentOverallStats;
  onAttendanceMarked: () => void;
}

export const ScanQRView: React.FC<ScanQRViewProps> = ({
  stats,
  onAttendanceMarked,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (tokenToUse?: string) => {
    const token = (tokenToUse || tokenInput).trim();
    if (!token) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/student/qr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          studentId: stats.studentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to record attendance.' });
      } else {
        setStatusMessage({ type: 'success', text: data.message || 'Attendance recorded successfully!' });
        setTokenInput('');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onAttendanceMarked();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Network connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Scan Attendance QR Code
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Faculty projects a secure, short-lived QR code during lecture. Scan using your camera or enter the temporary session token.
        </p>
      </div>

      {/* QR Input Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Session Security Token
          </label>
          <div className="flex gap-2">
            <input
              id="qr-token-input"
              type="text"
              placeholder="e.g. QR-IT501-SESSION-9482"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              id="submit-qr-token-btn"
              disabled={loading || !tokenInput.trim()}
              onClick={() => handleSubmit()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Validating...' : 'Confirm'}
            </button>
          </div>
        </div>

        {/* Quick Demo Simulator Buttons */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Demo Classroom Simulation Tokens:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              id="quick-scan-valid-btn"
              onClick={() => {
                setTokenInput('QR-IT501-SESSION-9482');
                handleSubmit('QR-IT501-SESSION-9482');
              }}
              className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold border border-indigo-200 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Simulate: Active Session (DBMS IT501)
            </button>

            <button
              id="quick-scan-expired-btn"
              onClick={() => {
                setTokenInput('QR-EXPIRED-TOKEN-001');
                handleSubmit('QR-EXPIRED-TOKEN-001');
              }}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Test Invalid / Expired Token
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            id="qr-result-alert"
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {statusMessage.type === 'success' ? 'Verified & Recorded' : 'Verification Rejected'}
              </p>
              <p className="mt-0.5">{statusMessage.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          🔒 Anti-Proxy & Fraud Prevention Rules
        </h4>
        <p>• QR tokens automatically invalidate after 120 seconds.</p>
        <p>• Duplicate scans for the same student/lecture are rejected server-side and recorded in the audit anomaly log.</p>
        <p>• Only students enrolled in the class can record attendance.</p>
      </div>
    </div>
  );
};
