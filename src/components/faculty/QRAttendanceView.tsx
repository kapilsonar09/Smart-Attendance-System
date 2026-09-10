import React, { useState, useEffect } from 'react';
import { Lecture, Subject, Class } from '../../types.ts';
import { QrCode, RefreshCw, Clock, Users, CheckCircle2, AlertCircle, StopCircle } from 'lucide-react';

interface QRAttendanceViewProps {
  lectures: Lecture[];
  subjects: Subject[];
  classes: Class[];
  preselectedLectureId?: string;
  onAttendanceSessionClosed: () => void;
}

interface ScannedStudent {
  studentId: string;
  studentName: string;
  rollNumber: string;
  scannedAt: string;
}

export const QRAttendanceView: React.FC<QRAttendanceViewProps> = ({
  lectures,
  subjects,
  classes,
  preselectedLectureId,
  onAttendanceSessionClosed,
}) => {
  const [selectedLectureId, setSelectedLectureId] = useState(
    preselectedLectureId || (lectures.length > 0 ? lectures[0].id : '')
  );
  const [sessionActive, setSessionActive] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [loading, setLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!sessionActive || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, secondsRemaining]);

  // Periodic polling for newly scanned students while session is active
  useEffect(() => {
    if (!sessionActive || !selectedLectureId) return;
    const pollInterval = setInterval(() => {
      fetch(`/api/faculty/qr-scans?lectureId=${selectedLectureId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setScannedStudents(data);
        })
        .catch((err) => console.error(err));
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [sessionActive, selectedLectureId]);

  const handleGenerateQR = async () => {
    if (!selectedLectureId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/faculty/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: selectedLectureId,
          validitySeconds: 120,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setExpiresAt(data.expiresAt);
        setSecondsRemaining(120);
        setSessionActive(true);
        // Load existing scans
        if (Array.isArray(data.scannedStudents)) {
          setScannedStudents(data.scannedStudents);
        }
      }
    } catch (err) {
      console.error('Failed to generate QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setSessionActive(false);
    setQrCodeDataUrl(null);
    onAttendanceSessionClosed();
  };

  const currentLecture = lectures.find((l) => l.id === selectedLectureId);
  const currentSubject = subjects.find((s) => s.id === currentLecture?.subjectId);
  const currentClass = classes.find((c) => c.id === currentLecture?.classId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Live Dynamic QR Attendance Projector
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Project anti-proxy QR codes with dynamic short-lived token expiration and live scan synchronization
          </p>
        </div>

        {sessionActive && (
          <button
            id="end-qr-session-button"
            onClick={handleEndSession}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs self-start"
          >
            <StopCircle className="w-4 h-4" /> End Attendance Session
          </button>
        )}
      </div>

      {/* Control / Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Scheduled Lecture
            </label>
            <select
              id="qr-lecture-select"
              value={selectedLectureId}
              disabled={sessionActive}
              onChange={(e) => setSelectedLectureId(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 disabled:bg-slate-100"
            >
              {lectures.map((lec) => {
                const sub = subjects.find((s) => s.id === lec.subjectId);
                const cls = classes.find((c) => c.id === lec.classId);
                return (
                  <option key={lec.id} value={lec.id}>
                    {lec.date} • {sub?.name || 'Subject'} ({cls?.name}) - {lec.startTime}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs text-slate-600">
            {currentLecture && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">{currentSubject?.name}</span>
                <div className="text-[11px] text-slate-500">
                  Room: {currentLecture.room} • {currentClass?.name}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              id="generate-qr-button"
              disabled={loading || !selectedLectureId}
              onClick={handleGenerateQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              {sessionActive ? (
                <>
                  <RefreshCw className="w-4 h-4" /> Regenerate Fresh Token
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-indigo-400" /> Generate Classroom QR
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stage: QR Projector & Live Scanning Feed */}
      {sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left: Projector Screen */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-8 shadow-xs flex flex-col items-center justify-center text-center">
            {/* Expiration Pill */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  secondsRemaining > 30
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : secondsRemaining > 10
                    ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                    : 'bg-rose-50 text-rose-800 border-rose-200 animate-bounce'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {secondsRemaining > 0 ? (
                  <span>Token expires in: {secondsRemaining}s</span>
                ) : (
                  <span>Token Expired. Click regenerate!</span>
                )}
              </span>
            </div>

            {/* Rendered QR Code Image */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Live Attendance QR Code"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                  Rendering QR...
                </div>
              )}
            </div>

            {/* Token details */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Manual Entry Session Token
              </p>
              <div className="mt-1 font-mono font-bold text-sm bg-slate-100 px-4 py-1.5 rounded-lg border border-slate-200 text-slate-900 select-all">
                {token}
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 max-w-sm">
              Project this screen in your lecture hall. Students open their student dashboard and scan via camera or submit the token above.
            </p>
          </div>

          {/* Right: Live Scanned Students Feed */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Attendance Stream
                </h3>
              </div>
              <span className="text-xs font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {scannedStudents.length} Verified
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2">
              {scannedStudents.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  Waiting for student scans...
                </div>
              ) : (
                scannedStudents.map((stu, i) => (
                  <div key={i} className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{stu.studentName}</div>
                      <div className="text-[11px] text-slate-500">Roll: {stu.rollNumber}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Recorded
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(stu.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Automatic real-time polling active</span>
              <span className="font-medium text-indigo-600">3s sync</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
