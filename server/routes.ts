import { Router, Request, Response } from 'express';
import { getDb, saveDb, resetToSeedData } from './db.ts';
import {
  getStudentOverallStats,
  getStudentHeatmapData,
  getClassFacultyAnalytics,
  recordAttendanceViaQR,
  processAssistantQuery,
} from './attendanceService.ts';
import {
  calculateAttendanceMetrics,
  simulateMissNextLecture,
} from '../src/utils/attendanceCalculations.ts';
import QRCode from 'qrcode';

export const apiRouter = Router();

// ==========================================
// AUTH & DEMO ACCOUNT SWITCHER
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const db = getDb();

  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // If role is specified and does not match
  if (role && user.role !== role) {
    return res.status(403).json({ error: `User is registered as ${user.role}, not ${role}.` });
  }

  // Attach profile object
  let profile: any = null;
  if (user.role === 'student') {
    profile = db.students.find((s) => s.userId === user.id);
  } else if (user.role === 'faculty') {
    profile = db.faculty.find((f) => f.userId === user.id);
  }

  res.json({
    user,
    profile,
    token: `token-${user.id}-${Date.now()}`,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const db = getDb();
  const user = db.users.find((u) => u.id === userId) || db.users[3]; // default to Alex Chen if not specified

  let profile: any = null;
  if (user.role === 'student') {
    profile = db.students.find((s) => s.userId === user.id);
  } else if (user.role === 'faculty') {
    profile = db.faculty.find((f) => f.userId === user.id);
  }

  res.json({ user, profile });
});

apiRouter.get('/auth/demo-users', (req: Request, res: Response) => {
  const db = getDb();
  const demoAccounts = [
    {
      role: 'admin',
      label: 'Admin (Academic Director)',
      email: 'admin@college.edu',
      name: 'Dr. Sarah Jenkins',
      id: 'usr-admin-1',
      description: 'Full administrative access across faculty, students, classes, and college-wide analytics',
    },
    {
      role: 'faculty',
      label: 'Faculty (Prof. Sharma)',
      email: 'prof.sharma@college.edu',
      name: 'Prof. Rajesh Sharma',
      id: 'usr-fac-1',
      description: 'Department of IT - In charge of DBMS & Networks, QR attendance generation, and leave approvals',
    },
    {
      role: 'student',
      label: 'Student - Safe (Alex Chen - 88%)',
      email: 'alex.chen@student.edu',
      name: 'Alex Chen',
      id: 'usr-stu-1',
      studentId: 'stu-1',
      description: 'Maintains 88% attendance, well above the 75% threshold with positive safety buffer',
    },
    {
      role: 'student',
      label: 'Student - At Risk (Priya Patel - 76%)',
      email: 'priya.patel@student.edu',
      name: 'Priya Patel',
      id: 'usr-stu-2',
      studentId: 'stu-2',
      description: 'Borderline 76% attendance. Missing 1 lecture triggers Critical threshold',
    },
    {
      role: 'student',
      label: 'Student - Critical (Marcus Johnson - 61%)',
      email: 'marcus.johnson@student.edu',
      name: 'Marcus Johnson',
      id: 'usr-stu-3',
      studentId: 'stu-3',
      description: 'Critical 61% attendance. Urgent recovery required; parent alert triggered',
    },
  ];
  res.json(demoAccounts);
});

apiRouter.post(['/system/reset-demo-data', '/admin/reset-demo'], (req: Request, res: Response) => {
  const data = resetToSeedData();
  res.json({ success: true, message: 'Database reset to default seed data successfully.', counts: { students: data.students.length, lectures: data.lectures.length } });
});

// ==========================================
// ADMIN MODULE ENDPOINTS
// ==========================================

apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const db = getDb();

  // Calculate overall institution metrics
  let totalAttended = 0;
  let totalApplicable = 0;
  let safeCount = 0;
  let atRiskCount = 0;
  let criticalCount = 0;

  db.students.forEach((stu) => {
    const stats = getStudentOverallStats(stu.id);
    if (!stats) return;
    totalAttended += stats.attendedLectures;
    totalApplicable += stats.totalLectures;
    if (stats.overallRiskLevel === 'safe') safeCount++;
    else if (stats.overallRiskLevel === 'at_risk') atRiskCount++;
    else if (stats.overallRiskLevel === 'critical') criticalCount++;
  });

  const overallAttendance = totalApplicable > 0 ? Math.round((totalAttended / totalApplicable) * 1000) / 10 : 0;
  const pendingLeaves = db.leaveRequests.filter((l) => l.status === 'pending').length;
  const unresolvedAnomalies = db.anomalies.filter((a) => !a.isResolved && a.status !== 'resolved').length;

  // Subject-wise stats
  const subjectStats = db.subjects.map((sub) => {
    const lecs = db.lectures.filter((l) => l.subjectId === sub.id && l.status === 'completed');
    const att = db.attendance.filter((a) => lecs.some((l) => l.id === a.lectureId) && a.status === 'present');
    const total = lecs.length * (db.classes.find((c) => c.id === sub.classId)?.totalStudents || 8);
    const pct = total > 0 ? Math.round((att.length / total) * 1000) / 10 : 0;
    return {
      id: sub.id,
      code: sub.subjectCode,
      name: sub.subjectName,
      facultyName: sub.facultyName,
      lecturesConducted: lecs.length,
      averageAttendance: pct,
    };
  });

  res.json({
    totalStudents: db.students.length,
    totalFaculty: db.faculty.length,
    totalClasses: db.classes.length,
    totalSubjects: db.subjects.length,
    totalLectures: db.lectures.length,
    totalAnomalies: db.anomalies.length,
    unresolvedAnomalies,
    overallAttendanceAverage: overallAttendance,
    riskDistribution: {
      safe: safeCount,
      at_risk: atRiskCount,
      critical: criticalCount,
    },
    metrics: {
      totalStudents: db.students.length,
      totalFaculty: db.faculty.length,
      totalClasses: db.classes.length,
      totalSubjects: db.subjects.length,
      overallAttendance,
      studentsBelowReq: criticalCount,
      studentsAtRisk: atRiskCount,
      pendingLeaves,
      attendanceAnomalies: unresolvedAnomalies,
    },
    subjectStats,
    recentAnomalies: db.anomalies.slice(0, 5),
    recentLeaves: db.leaveRequests.slice(0, 5),
    classes: db.classes,
  });
});

apiRouter.get('/admin/anomalies', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.anomalies);
});

apiRouter.post('/admin/anomalies/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  const { resolutionNotes, reviewerName } = req.body;
  const anom = db.anomalies.find((a) => a.id === req.params.id);
  if (!anom) return res.status(404).json({ error: 'Anomaly record not found.' });

  anom.status = 'resolved';
  anom.isResolved = true;
  anom.resolutionNotes = resolutionNotes || 'Reviewed and verified by Administrator.';
  anom.reviewedAt = new Date().toISOString();
  anom.reviewedBy = reviewerName || 'Admin';

  saveDb(db);
  res.json({ success: true, anomaly: anom });
});

apiRouter.get('/admin/attendance-logs', (req: Request, res: Response) => {
  const db = getDb();
  const logs = db.attendance.map((att) => {
    const stu = db.students.find((s) => s.id === att.studentId);
    const lec = db.lectures.find((l) => l.id === att.lectureId);
    const sub = lec ? db.subjects.find((s) => s.id === lec.subjectId) : null;
    return {
      id: att.id,
      date: lec?.lectureDate || att.markedAt?.split('T')[0] || '2024-09-18',
      markedAt: att.markedAt,
      studentId: att.studentId,
      studentName: att.studentName || stu?.name || 'Student',
      rollNumber: att.studentRoll || stu?.rollNumber || '00',
      subjectName: sub?.subjectName || lec?.subjectName || 'Course',
      subjectCode: sub?.subjectCode || lec?.subjectCode || 'CODE',
      status: att.status,
      method: att.method,
      remarks: att.modificationReason || '',
    };
  });
  res.json(logs);
});

apiRouter.get('/faculty/at-risk-students', (req: Request, res: Response) => {
  const db = getDb();
  const statsList = db.students
    .map((stu) => getStudentOverallStats(stu.id))
    .filter(Boolean);
  res.json(statsList);
});

apiRouter.post('/faculty/send-alert', (req: Request, res: Response) => {
  const db = getDb();
  const { studentId, message, type } = req.body;
  const stu = db.students.find((s) => s.id === studentId);
  if (!stu) return res.status(404).json({ error: 'Student not found' });

  db.notifications.unshift({
    id: `notif-alert-${Date.now()}`,
    userId: stu.userId,
    type: type || 'alert',
    title: 'Academic Risk Notification',
    message: message || 'Your attendance requires attention.',
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
  res.json({ success: true });
});

// Admin Student CRUD
apiRouter.get('/admin/students', (req: Request, res: Response) => {
  const db = getDb();
  const list = db.students.map((stu) => {
    const stats = getStudentOverallStats(stu.id);
    return {
      ...stu,
      stats: {
        percentage: stats?.overallPercentage ?? 0,
        riskLevel: stats?.overallRiskLevel ?? 'safe',
        attended: stats?.attendedLectures ?? 0,
        total: stats?.totalLectures ?? 0,
      },
    };
  });
  res.json(list);
});

apiRouter.post('/admin/students', (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, phone, classId, parentName, parentContact, rollNumber } = req.body;

  if (!name || !email || !classId) {
    return res.status(400).json({ error: 'Name, email, and class are required.' });
  }

  const newId = `stu-${Date.now()}`;
  const newUserId = `usr-stu-${Date.now()}`;
  const cls = db.classes.find((c) => c.id === classId);

  const newStudent: any = {
    id: newId,
    userId: newUserId,
    studentId: `STU-2024-${String(db.students.length + 1).padStart(3, '0')}`,
    name,
    email,
    phone: phone || '+1 (555) 000-0000',
    classId,
    className: cls ? cls.name : 'General',
    division: cls ? cls.division : 'A',
    parentName: parentName || 'Guardian',
    parentContact: parentContact || phone || '+1 (555) 000-0000',
    requiredPercentage: 75,
    rollNumber: rollNumber || String(db.students.length + 1).padStart(2, '0'),
  };

  db.students.push(newStudent);
  db.users.push({
    id: newUserId,
    email,
    role: 'student',
    name,
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  saveDb(db);
  res.json(newStudent);
});

apiRouter.put('/admin/students/:id', (req: Request, res: Response) => {
  const db = getDb();
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found.' });

  db.students[idx] = { ...db.students[idx], ...req.body };
  saveDb(db);
  res.json(db.students[idx]);
});

apiRouter.delete('/admin/students/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.students = db.students.filter((s) => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// Admin Faculty CRUD
apiRouter.get('/admin/faculty', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.faculty);
});

apiRouter.post('/admin/faculty', (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, phone, department, designation } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newFaculty: any = {
    id: `fac-${Date.now()}`,
    userId: `usr-fac-${Date.now()}`,
    facultyId: `FAC-${department?.substring(0, 2).toUpperCase() || 'GEN'}-${db.faculty.length + 101}`,
    name,
    email,
    phone: phone || '+1 (555) 111-2222',
    department: department || 'Information Technology',
    designation: designation || 'Assistant Professor',
  };

  db.faculty.push(newFaculty);
  db.users.push({
    id: newFaculty.userId,
    email,
    name,
    role: 'faculty',
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  saveDb(db);
  res.json(newFaculty);
});

// Admin Classes & Subjects
apiRouter.get('/admin/classes', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.classes);
});

apiRouter.post('/admin/classes', (req: Request, res: Response) => {
  const db = getDb();
  const { name, code, semester, division, department } = req.body;
  const newClass: any = {
    id: `cls-${Date.now()}`,
    name,
    code,
    semester: Number(semester) || 1,
    division: division || 'A',
    department: department || 'General',
    academicYear: '2024-2025',
    totalStudents: 0,
  };
  db.classes.push(newClass);
  saveDb(db);
  res.json(newClass);
});

apiRouter.get('/admin/subjects', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.subjects);
});

apiRouter.post('/admin/subjects', (req: Request, res: Response) => {
  const db = getDb();
  const { subjectCode, subjectName, classId, facultyId, requiredPercentage } = req.body;
  const fac = db.faculty.find((f) => f.id === facultyId);

  const newSubject: any = {
    id: `sub-${Date.now()}`,
    subjectCode,
    subjectName,
    classId,
    facultyId,
    facultyName: fac?.name || 'Assigned Faculty',
    requiredPercentage: Number(requiredPercentage) || 75,
    totalLecturesConducted: 0,
  };
  db.subjects.push(newSubject);
  saveDb(db);
  res.json(newSubject);
});

// ==========================================
// FACULTY MODULE ENDPOINTS
// ==========================================

apiRouter.get('/faculty/overview', (req: Request, res: Response) => {
  const db = getDb();
  const facultyId = (req.query.facultyId as string) || 'fac-1';

  const mySubjects = db.subjects.filter((s) => s.facultyId === facultyId);
  const myClasses = db.classes.filter((c) => mySubjects.some((s) => s.classId === c.id));
  const myLectures = db.lectures.filter((l) => l.facultyId === facultyId);

  // Today's lectures
  const todayStr = '2024-09-18';
  const todayLectures = myLectures.filter((l) => l.lectureDate === todayStr || l.status === 'active');

  // Pending leave requests for faculty's subjects/classes
  const pendingLeaves = db.leaveRequests.filter(
    (lr) => lr.status === 'pending' && (!lr.subjectId || mySubjects.some((s) => s.id === lr.subjectId))
  );

  // Class analytics for primary class
  const primaryClass = myClasses[0] || db.classes[0];
  const analytics = primaryClass ? getClassFacultyAnalytics(primaryClass.id, facultyId) : null;

  res.json({
    classes: myClasses,
    subjects: mySubjects,
    todayLectures,
    allLectures: myLectures,
    pendingLeaves,
    analytics,
    activeQRSessions: db.qrSessions.filter((q) => q.status === 'active'),
  });
});

apiRouter.get('/faculty/lectures', (req: Request, res: Response) => {
  const db = getDb();
  const facultyId = (req.query.facultyId as string) || 'fac-1';
  const lectures = db.lectures.filter((l) => !facultyId || l.facultyId === facultyId);
  res.json(lectures.sort((a, b) => b.lectureDate.localeCompare(a.lectureDate)));
});

apiRouter.post('/faculty/lectures', (req: Request, res: Response) => {
  const db = getDb();
  const { subjectId, classId, facultyId, lectureDate, startTime, endTime, room, topic } = req.body;

  const sub = db.subjects.find((s) => s.id === subjectId);
  const cls = db.classes.find((c) => c.id === classId);
  const fac = db.faculty.find((f) => f.id === facultyId) || db.faculty[0];

  const newLecture: any = {
    id: `lec-${Date.now()}`,
    subjectId,
    subjectName: sub?.subjectName || 'Subject',
    subjectCode: sub?.subjectCode || 'CODE',
    facultyId: fac.id,
    facultyName: fac.name,
    classId,
    className: cls?.name || 'Class',
    lectureDate: lectureDate || new Date().toISOString().split('T')[0],
    startTime: startTime || '10:00',
    endTime: endTime || '11:00',
    room: room || 'Room 101',
    topic: topic || 'Lecture Discussion',
    status: 'upcoming',
    attendanceCount: 0,
    totalStudents: db.students.filter((s) => s.classId === classId).length,
    createdAt: new Date().toISOString(),
  };

  db.lectures.unshift(newLecture);
  saveDb(db);
  res.json(newLecture);
});

// Lecture Attendance Details & Manual Mark
apiRouter.get('/faculty/lectures/:id/attendance', (req: Request, res: Response) => {
  const db = getDb();
  const lecture = db.lectures.find((l) => l.id === req.params.id);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found.' });

  const classStudents = db.students.filter((s) => s.classId === lecture.classId);
  const attendanceRecords = db.attendance.filter((a) => a.lectureId === lecture.id);

  const studentAttendanceList = classStudents.map((stu) => {
    const rec = attendanceRecords.find((a) => a.studentId === stu.id);
    return {
      studentId: stu.id,
      rollNumber: stu.rollNumber,
      name: stu.name,
      studentCode: stu.studentId,
      status: rec ? rec.status : 'absent',
      method: rec ? rec.method : 'manual',
      markedAt: rec?.markedAt,
      modifiedAt: rec?.modifiedAt,
      modifiedBy: rec?.modifiedBy,
      modificationReason: rec?.modificationReason,
    };
  });

  res.json({
    lecture,
    attendance: studentAttendanceList,
  });
});

apiRouter.post('/faculty/lectures/:id/attendance/update', (req: Request, res: Response) => {
  const db = getDb();
  const { studentId, status, facultyName, reason } = req.body;
  const lectureId = req.params.id;

  const lecture = db.lectures.find((l) => l.id === lectureId);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found.' });

  const student = db.students.find((s) => s.id === studentId);
  let record = db.attendance.find((a) => a.lectureId === lectureId && a.studentId === studentId);

  const now = new Date().toISOString();
  const previousStatus = record ? record.status : 'absent';

  if (record) {
    record.status = status;
    record.modifiedAt = now;
    record.modifiedBy = facultyName || 'Faculty';
    record.modificationReason = reason || 'Manual faculty override';
  } else {
    record = {
      id: `att-${lectureId}-${studentId}`,
      lectureId,
      studentId,
      studentName: student?.name,
      studentRoll: student?.rollNumber,
      status,
      method: 'manual',
      markedAt: now,
      modifiedAt: now,
      modifiedBy: facultyName || 'Faculty',
      modificationReason: reason || 'Manual roll-call entry',
    };
    db.attendance.push(record);
  }

  // Update lecture attendance count
  const presentCount = db.attendance.filter((a) => a.lectureId === lectureId && a.status === 'present').length;
  lecture.attendanceCount = presentCount;

  // Track Anomaly for manual modification after initial submission if changing existing record
  if (previousStatus !== status) {
    const anom: any = {
      id: `anom-${Date.now()}`,
      attendanceId: record.id,
      studentId,
      studentName: student?.name || 'Student',
      lectureId,
      subjectName: lecture.subjectName || 'Subject',
      type: 'manual_modification',
      description: `Status changed from ${previousStatus.toUpperCase()} to ${status.toUpperCase()} by ${facultyName || 'Faculty'}. Reason: ${reason || 'Manual correction'}.`,
      severity: 'low',
      status: 'reviewed',
      createdAt: now,
      reviewedAt: now,
      reviewedBy: facultyName || 'Faculty',
      resolutionNotes: reason || 'Authorized manual modification',
    };
    db.anomalies.unshift(anom);
  }

  saveDb(db);
  res.json({ success: true, record });
});

// QR Session Generation for Faculty
apiRouter.post('/faculty/qr-sessions/create', async (req: Request, res: Response) => {
  const db = getDb();
  const { lectureId, durationSeconds = 120 } = req.body;

  const lecture = db.lectures.find((l) => l.id === lectureId);
  if (!lecture) return res.status(404).json({ error: 'Lecture not found.' });

  // Expire previous active sessions for this lecture
  db.qrSessions.forEach((s) => {
    if (s.lectureId === lectureId && s.status === 'active') {
      s.status = 'closed';
    }
  });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationSeconds * 1000);
  const token = `QR-${lecture.subjectCode || 'LEC'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const qrSession: any = {
    id: `qr-sess-${Date.now()}`,
    lectureId,
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    durationSeconds,
    scannedCount: 0,
  };

  db.qrSessions.unshift(qrSession);
  lecture.status = 'active';

  // Generate Data URL for the QR code
  try {
    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 320,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    saveDb(db);
    res.json({ qrSession, qrDataUrl, lecture });
  } catch (err) {
    saveDb(db);
    res.json({ qrSession, lecture });
  }
});

apiRouter.get('/faculty/qr-sessions/:id', async (req: Request, res: Response) => {
  const db = getDb();
  const session = db.qrSessions.find((s) => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'QR Session not found.' });

  // Check if expired
  if (session.status === 'active' && new Date() > new Date(session.expiresAt)) {
    session.status = 'expired';
    saveDb(db);
  }

  const lecture = db.lectures.find((l) => l.id === session.lectureId);
  const attendance = db.attendance.filter((a) => a.lectureId === session.lectureId);

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(session.token, {
      width: 320,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
  } catch {}

  res.json({
    session,
    lecture,
    attendance,
    qrDataUrl,
    remainingSeconds: Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)),
  });
});

apiRouter.post('/faculty/qr-sessions/:id/close', (req: Request, res: Response) => {
  const db = getDb();
  const session = db.qrSessions.find((s) => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  session.status = 'closed';
  saveDb(db);
  res.json({ success: true, session });
});

// Leave Requests Review
apiRouter.get('/faculty/leave-requests', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.leaveRequests);
});

apiRouter.post('/faculty/leave-requests/:id/review', (req: Request, res: Response) => {
  const db = getDb();
  const { status, facultyRemark, reviewerName } = req.body;
  const leave = db.leaveRequests.find((l) => l.id === req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

  leave.status = status;
  leave.facultyRemark = facultyRemark || '';
  leave.reviewedAt = new Date().toISOString();
  leave.reviewedBy = reviewerName || 'Faculty';

  // If approved, update existing attendance records on those dates to 'approved_leave'
  if (status === 'approved') {
    const student = db.students.find((s) => s.id === leave.studentId);
    if (student) {
      const affectedLectures = db.lectures.filter((l) => {
        return (
          l.classId === student.classId &&
          l.lectureDate >= leave.fromDate &&
          l.lectureDate <= leave.toDate &&
          (!leave.subjectId || l.subjectId === leave.subjectId)
        );
      });

      affectedLectures.forEach((lec) => {
        let att = db.attendance.find((a) => a.lectureId === lec.id && a.studentId === student.id);
        if (att) {
          att.status = 'approved_leave';
          att.modificationReason = `Approved leave granted: ${leave.reason}`;
          att.modifiedAt = new Date().toISOString();
        } else {
          db.attendance.push({
            id: `att-${lec.id}-${student.id}`,
            lectureId: lec.id,
            studentId: student.id,
            studentName: student.name,
            studentRoll: student.rollNumber,
            status: 'approved_leave',
            method: 'manual',
            markedAt: new Date().toISOString(),
            modificationReason: `Approved leave granted: ${leave.reason}`,
          });
        }
      });
    }

    // Send notification to student
    const studentUser = db.students.find((s) => s.id === leave.studentId);
    if (studentUser) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: studentUser.userId,
        type: 'leave',
        title: 'Leave Request Approved',
        message: `Your leave request for ${leave.fromDate} to ${leave.toDate} was approved by ${reviewerName || 'Faculty'}. Remarks: "${facultyRemark || 'None'}".`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDb(db);
  res.json({ success: true, leave });
});

// Faculty Analytics
apiRouter.get('/faculty/analytics', (req: Request, res: Response) => {
  const classId = (req.query.classId as string) || 'cls-1';
  const facultyId = req.query.facultyId as string;
  const analytics = getClassFacultyAnalytics(classId, facultyId);
  res.json(analytics);
});

// Anomalies Review
apiRouter.get('/faculty/anomalies', (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.anomalies);
});

apiRouter.post('/faculty/anomalies/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  const { resolutionNotes, reviewerName } = req.body;
  const anom = db.anomalies.find((a) => a.id === req.params.id);
  if (!anom) return res.status(404).json({ error: 'Anomaly record not found.' });

  anom.status = 'resolved';
  anom.resolutionNotes = resolutionNotes || 'Reviewed and verified by faculty.';
  anom.reviewedAt = new Date().toISOString();
  anom.reviewedBy = reviewerName || 'Faculty';

  saveDb(db);
  res.json({ success: true, anomaly: anom });
});

// ==========================================
// STUDENT MODULE ENDPOINTS
// ==========================================

apiRouter.get('/student/dashboard', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'stu-1';
  const stats = getStudentOverallStats(studentId);
  if (!stats) return res.status(404).json({ error: 'Student profile not found.' });

  const db = getDb();
  const studentUser = db.students.find((s) => s.id === studentId);
  const myNotifications = studentUser
    ? db.notifications.filter((n) => n.userId === studentUser.userId)
    : [];

  const myLeaves = db.leaveRequests.filter((l) => l.studentId === studentId);

  res.json({
    stats,
    notifications: myNotifications,
    leaveRequests: myLeaves,
  });
});

apiRouter.get('/student/heatmap', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'stu-1';
  const cells = getStudentHeatmapData(studentId);
  res.json(cells);
});

// Smart Attendance Calculator
apiRouter.post('/student/calculator', (req: Request, res: Response) => {
  const { attended, total, approvedLeave = 0, requiredPercentage = 75 } = req.body;
  const result = calculateAttendanceMetrics(
    Number(attended),
    Number(total),
    Number(approvedLeave),
    Number(requiredPercentage)
  );
  res.json(result);
});

// "Can I Miss a Class?" Calculator
apiRouter.post('/student/can-miss', (req: Request, res: Response) => {
  const { studentId, subjectId } = req.body;
  const stats = getStudentOverallStats(studentId || 'stu-1');
  if (!stats) return res.status(404).json({ error: 'Student not found.' });

  let result;
  if (subjectId) {
    const sub = stats.subjects.find((s) => s.subjectId === subjectId);
    if (!sub) return res.status(404).json({ error: 'Subject not found in student curriculum.' });
    result = simulateMissNextLecture(sub.attended, sub.totalApplicable, 0, sub.requiredPercentage);
    return res.json({
      subject: sub.subjectName,
      code: sub.subjectCode,
      ...result,
    });
  }

  // Overall
  result = simulateMissNextLecture(
    stats.attendedLectures,
    stats.totalLectures,
    stats.approvedLeaveLectures,
    stats.requiredPercentage
  );
  res.json({
    subject: 'All Subjects (Overall)',
    code: 'OVERALL',
    ...result,
  });
});

// QR Scan by Student
apiRouter.post('/student/qr-scan', (req: Request, res: Response) => {
  const { token, studentId } = req.body;
  if (!token || !studentId) {
    return res.status(400).json({ error: 'QR token and Student ID are required.' });
  }

  const result = recordAttendanceViaQR(token.trim(), studentId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

// Student Leave Submission & Retrieval
apiRouter.get('/student/leave-requests', (req: Request, res: Response) => {
  const db = getDb();
  const studentId = req.query.studentId as string;
  const list = studentId ? db.leaveRequests.filter((l) => l.studentId === studentId) : db.leaveRequests;
  res.json(list);
});

apiRouter.post('/student/leave-requests', (req: Request, res: Response) => {
  const db = getDb();
  const { studentId, subjectId, fromDate, toDate, reason, supportingNote } = req.body;

  if (!studentId || !fromDate || !toDate || !reason) {
    return res.status(400).json({ error: 'From date, to date, and reason are required.' });
  }

  const student = db.students.find((s) => s.id === studentId);
  const sub = db.subjects.find((s) => s.id === subjectId);

  const newLeave: any = {
    id: `lr-${Date.now()}`,
    studentId,
    studentName: student?.name || 'Student',
    classId: student?.classId,
    subjectId: subjectId || undefined,
    subjectName: sub ? `${sub.subjectName} (${sub.subjectCode})` : 'All Subjects / Semester',
    fromDate,
    toDate,
    reason,
    supportingNote: supportingNote || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.leaveRequests.unshift(newLeave);

  // Notify faculty
  const facultyUsers = db.faculty;
  facultyUsers.forEach((fac) => {
    db.notifications.unshift({
      id: `notif-${Date.now()}-${fac.id}`,
      userId: fac.userId,
      type: 'leave',
      title: `New Leave Request: ${student?.name}`,
      message: `${student?.name} requested leave from ${fromDate} to ${toDate} for "${reason}".`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  saveDb(db);
  res.json(newLeave);
});

// Personal Attendance Assistant
apiRouter.post('/student/assistant', async (req: Request, res: Response) => {
  const { studentId, query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  try {
    const answer = await processAssistantQuery(studentId || 'stu-1', query);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: 'Error processing query', details: err?.message });
  }
});

// Notifications
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const db = getDb();
  const userId = req.query.userId as string;
  const list = userId ? db.notifications.filter((n) => n.userId === userId) : db.notifications;
  res.json(list);
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  saveDb(db);
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (req: Request, res: Response) => {
  const db = getDb();
  const userId = req.body.userId as string;
  db.notifications.forEach((n) => {
    if (!userId || n.userId === userId) n.isRead = true;
  });
  saveDb(db);
  res.json({ success: true });
});
