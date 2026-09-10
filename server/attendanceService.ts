import {
  getDb,
  saveDb,
} from './db.ts';
import {
  StudentOverallStats,
  SubjectAttendanceSummary,
  HeatmapDayCell,
  RiskLevel,
  AnomalyRecord,
  AttendanceRecord,
} from '../src/types.ts';
import { calculateAttendanceMetrics, simulateMissNextLecture } from '../src/utils/attendanceCalculations.ts';
import { GoogleGenAI } from '@google/genai';

export function getStudentOverallStats(studentId: string): StudentOverallStats | null {
  const db = getDb();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return null;

  const studentClass = db.classes.find((c) => c.id === student.classId);
  const classSubjects = db.subjects.filter((sub) => sub.classId === student.classId);

  // Get all lectures for this class
  const classLectures = db.lectures.filter((l) => l.classId === student.classId && l.status === 'completed');

  // Compute subject breakdown
  const subjectsSummary: SubjectAttendanceSummary[] = classSubjects.map((sub) => {
    const subLectures = classLectures.filter((l) => l.subjectId === sub.id);
    const subAttendance = db.attendance.filter(
      (a) => a.studentId === student.id && subLectures.some((l) => l.id === a.lectureId)
    );

    let attended = 0;
    let missed = 0;
    let approvedLeave = 0;

    const history: Array<{
      date: string;
      status: 'present' | 'absent' | 'approved_leave';
      method: 'qr' | 'manual';
      topic?: string;
    }> = [];

    subLectures.forEach((lec) => {
      const rec = subAttendance.find((a) => a.lectureId === lec.id);
      const status = rec ? rec.status : 'absent';
      const method = rec ? rec.method : 'manual';

      if (status === 'present') attended++;
      else if (status === 'approved_leave') approvedLeave++;
      else missed++;

      history.push({
        date: lec.lectureDate,
        status,
        method,
        topic: lec.topic,
      });
    });

    const metrics = calculateAttendanceMetrics(
      attended,
      subLectures.length,
      approvedLeave,
      sub.requiredPercentage || student.requiredPercentage,
      db.settings.riskBufferPercentage
    );

    return {
      subjectId: sub.id,
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      facultyName: sub.facultyName || 'Faculty',
      attended,
      missed,
      approvedLeave,
      totalApplicable: Math.max(0, subLectures.length - approvedLeave),
      percentage: metrics.percentage,
      requiredPercentage: sub.requiredPercentage || student.requiredPercentage,
      riskLevel: metrics.riskLevel,
      riskReason: metrics.riskReason,
      canMissCount: metrics.canMissCount,
      recoverConsecutiveCount: metrics.recoverConsecutiveCount,
      history: history.sort((a, b) => b.date.localeCompare(a.date)),
    };
  });

  // Overall totals
  let totalAttended = 0;
  let totalMissed = 0;
  let totalApprovedLeave = 0;
  let totalConducted = 0;

  subjectsSummary.forEach((s) => {
    totalAttended += s.attended;
    totalMissed += s.missed;
    totalApprovedLeave += s.approvedLeave;
    totalConducted += s.attended + s.missed + s.approvedLeave;
  });

  const overallMetrics = calculateAttendanceMetrics(
    totalAttended,
    totalConducted,
    totalApprovedLeave,
    student.requiredPercentage,
    db.settings.riskBufferPercentage
  );

  const engagement = db.engagementScores.find((e) => e.studentId === student.id);
  const achievements = db.achievements.filter((a) => a.studentId === student.id);

  return {
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    className: studentClass ? `${studentClass.name} - Sem ${studentClass.semester} Div ${studentClass.division}` : 'Class',
    totalLectures: totalConducted,
    attendedLectures: totalAttended,
    missedLectures: totalMissed,
    approvedLeaveLectures: totalApprovedLeave,
    overallPercentage: overallMetrics.percentage,
    requiredPercentage: student.requiredPercentage,
    overallRiskLevel: overallMetrics.riskLevel,
    riskReason: overallMetrics.riskReason,
    canMissOverall: overallMetrics.canMissCount,
    recoverOverall: overallMetrics.recoverConsecutiveCount,
    subjects: subjectsSummary,
    engagement,
    achievements,
  };
}

export function getStudentHeatmapData(studentId: string): HeatmapDayCell[] {
  const db = getDb();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return [];

  const studentLectures = db.lectures.filter(
    (l) => l.classId === student.classId && l.status === 'completed'
  );

  // Group lectures by date
  const dateMap = new Map<string, typeof studentLectures>();
  studentLectures.forEach((lec) => {
    const existing = dateMap.get(lec.lectureDate) || [];
    existing.push(lec);
    dateMap.set(lec.lectureDate, existing);
  });

  const cells: HeatmapDayCell[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  dateMap.forEach((lecs, dateStr) => {
    let attended = 0;
    let missed = 0;
    let leave = 0;
    const lectureDetails: HeatmapDayCell['lectures'] = [];

    lecs.forEach((lec) => {
      const rec = db.attendance.find((a) => a.lectureId === lec.id && a.studentId === student.id);
      const status = rec ? rec.status : 'absent';
      if (status === 'present') attended++;
      else if (status === 'approved_leave') leave++;
      else missed++;

      const sub = db.subjects.find((s) => s.id === lec.subjectId);
      lectureDetails.push({
        subjectCode: sub?.subjectCode || 'LEC',
        subjectName: sub?.subjectName || 'Lecture',
        time: `${lec.startTime} - ${lec.endTime}`,
        status,
      });
    });

    const applicable = Math.max(0, lecs.length - leave);
    const pct = applicable > 0 ? Math.round((attended / applicable) * 1000) / 10 : 100;
    let riskLevel: RiskLevel = 'safe';
    if (pct < student.requiredPercentage) {
      riskLevel = 'critical';
    } else if (pct < student.requiredPercentage + db.settings.riskBufferPercentage) {
      riskLevel = 'at_risk';
    }

    const dateObj = new Date(dateStr);
    cells.push({
      date: dateStr,
      dayOfWeek: days[dateObj.getUTCDay()],
      totalLectures: lecs.length,
      attendedLectures: attended,
      missedLectures: missed,
      leaveLectures: leave,
      percentage: pct,
      riskLevel,
      lectures: lectureDetails,
    });
  });

  return cells.sort((a, b) => a.date.localeCompare(b.date));
}

export function getClassFacultyAnalytics(classId: string, facultyId?: string) {
  const db = getDb();
  const cls = db.classes.find((c) => c.id === classId);
  const students = db.students.filter((s) => s.classId === classId);
  const subjects = facultyId
    ? db.subjects.filter((s) => s.classId === classId && s.facultyId === facultyId)
    : db.subjects.filter((s) => s.classId === classId);

  let totalPossible = 0;
  let totalAttended = 0;
  let safeCount = 0;
  let atRiskCount = 0;
  let criticalCount = 0;

  const studentsList = students.map((stu) => {
    const stats = getStudentOverallStats(stu.id);
    if (!stats) return null;

    if (stats.overallRiskLevel === 'safe') safeCount++;
    else if (stats.overallRiskLevel === 'at_risk') atRiskCount++;
    else criticalCount++;

    totalPossible += stats.totalLectures;
    totalAttended += stats.attendedLectures;

    // find lowest subject
    let lowestSub = stats.subjects[0];
    stats.subjects.forEach((sub) => {
      if (!lowestSub || sub.percentage < lowestSub.percentage) {
        lowestSub = sub;
      }
    });

    let recommendedAction = 'Maintain current academic consistency.';
    if (stats.overallRiskLevel === 'critical') {
      recommendedAction = `Immediate academic counseling recommended. Urgent recovery in ${lowestSub?.subjectName || 'core subjects'} (${stats.recoverOverall} consecutive classes required). Dispatch parent advisory.`;
    } else if (stats.overallRiskLevel === 'at_risk') {
      recommendedAction = `Caution student regarding attendance margin (+${Math.round((stats.overallPercentage - stats.requiredPercentage) * 10) / 10}%). Monitor ${lowestSub?.subjectName || 'subject'} sessions closely.`;
    }

    return {
      studentId: stu.id,
      studentCode: stu.studentId,
      name: stu.name,
      rollNumber: stu.rollNumber,
      attendancePercentage: stats.overallPercentage,
      requiredPercentage: stats.requiredPercentage,
      riskLevel: stats.overallRiskLevel,
      lowestSubject: lowestSub ? `${lowestSub.subjectCode} (${lowestSub.percentage}%)` : 'N/A',
      recommendedAction,
      attended: stats.attendedLectures,
      total: stats.totalLectures,
      missed: stats.missedLectures,
      parentName: stu.parentName,
      parentContact: stu.parentContact,
    };
  }).filter(Boolean);

  const overallClassPct = totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 1000) / 10 : 0;

  // Subject-wise attendance
  const subjectAnalytics = subjects.map((sub) => {
    const subLectures = db.lectures.filter((l) => l.subjectId === sub.id && l.status === 'completed');
    const subAttendance = db.attendance.filter(
      (a) => subLectures.some((l) => l.id === a.lectureId) && a.status === 'present'
    );
    const applicableRecords = db.attendance.filter(
      (a) => subLectures.some((l) => l.id === a.lectureId) && a.status !== 'approved_leave'
    );

    const pct = applicableRecords.length > 0 ? Math.round((subAttendance.length / applicableRecords.length) * 1000) / 10 : 0;
    return {
      subjectId: sub.id,
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      facultyName: sub.facultyName,
      lecturesConducted: subLectures.length,
      attendancePercentage: pct,
    };
  });

  return {
    class: cls,
    totalStudents: students.length,
    overallClassAttendance: overallClassPct,
    riskDistribution: {
      safe: safeCount,
      atRisk: atRiskCount,
      critical: criticalCount,
    },
    subjectAnalytics,
    studentsRequiringAttention: studentsList.filter((s) => s?.riskLevel !== 'safe'),
    allStudents: studentsList,
  };
}

export function recordAttendanceViaQR(token: string, studentId: string) {
  const db = getDb();
  const session = db.qrSessions.find((s) => s.token === token);
  if (!session) {
    return { success: false, error: 'Invalid QR session token.' };
  }

  const now = new Date();
  if (session.status !== 'active' || now > new Date(session.expiresAt)) {
    // Record anomaly for expired attempt
    const stu = db.students.find((s) => s.id === studentId);
    const lec = db.lectures.find((l) => l.id === session.lectureId);
    const anom: AnomalyRecord = {
      id: `anom-${Date.now()}`,
      studentId,
      studentName: stu?.name || 'Unknown Student',
      lectureId: session.lectureId,
      subjectName: lec?.subjectName || 'Unknown Subject',
      type: 'expired_qr_attempt',
      description: `Student attempted to scan QR code after session expired at ${session.expiresAt}.`,
      severity: 'low',
      status: 'pending_review',
      createdAt: now.toISOString(),
    };
    db.anomalies.unshift(anom);
    saveDb(db);
    return { success: false, error: 'This attendance QR has expired. Please ask faculty for an updated session.' };
  }

  const lecture = db.lectures.find((l) => l.id === session.lectureId);
  if (!lecture) {
    return { success: false, error: 'Associated lecture not found.' };
  }

  const student = db.students.find((s) => s.id === studentId);
  if (!student) {
    return { success: false, error: 'Student not found.' };
  }

  if (student.classId !== lecture.classId) {
    return { success: false, error: 'You are not enrolled in the class for this lecture.' };
  }

  // Check duplicate attendance
  const existing = db.attendance.find(
    (a) => a.lectureId === lecture.id && a.studentId === student.id
  );
  if (existing) {
    // Log duplicate attempt anomaly
    const anom: AnomalyRecord = {
      id: `anom-${Date.now()}`,
      attendanceId: existing.id,
      studentId: student.id,
      studentName: student.name,
      lectureId: lecture.id,
      subjectName: lecture.subjectName || 'Subject',
      type: 'duplicate_attempt',
      description: `Duplicate attendance scan recorded. Student was already marked ${existing.status} at ${existing.markedAt}.`,
      severity: 'medium',
      status: 'pending_review',
      createdAt: now.toISOString(),
    };
    db.anomalies.unshift(anom);
    saveDb(db);
    return { success: false, error: 'Attendance already recorded for this lecture.' };
  }

  // Record attendance
  const newAttendance: AttendanceRecord = {
    id: `att-${lecture.id}-${student.id}`,
    lectureId: lecture.id,
    studentId: student.id,
    studentName: student.name,
    studentRoll: student.rollNumber,
    status: 'present',
    method: 'qr',
    markedAt: now.toISOString(),
  };

  db.attendance.push(newAttendance);
  lecture.attendanceCount = (lecture.attendanceCount || 0) + 1;
  session.scannedCount = (session.scannedCount || 0) + 1;

  // Add confirmation notification
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: student.userId,
    type: 'qr',
    title: 'Attendance Recorded Successfully',
    message: `You have been marked Present for ${lecture.subjectName} (${lecture.subjectCode}) via QR Code.`,
    isRead: false,
    createdAt: now.toISOString(),
  });

  saveDb(db);

  return {
    success: true,
    message: `Attendance confirmed for ${lecture.subjectName}!`,
    attendance: newAttendance,
  };
}

export async function processAssistantQuery(studentId: string, query: string): Promise<string> {
  const db = getDb();
  const stats = getStudentOverallStats(studentId);
  if (!stats) return "Sorry, I could not find your student attendance profile.";

  const q = query.toLowerCase().trim();

  // Rule-based intent mapping as specified in Section 20
  if (q.includes('what is my attendance') || q.includes('overall attendance') || q.includes('my percentage')) {
    return `Your overall attendance is **${stats.overallPercentage}%** (${stats.attendedLectures}/${stats.totalLectures} lectures attended). Your current status is **${stats.overallRiskLevel.toUpperCase()}**. ${stats.riskReason}`;
  }

  if (q.includes('lowest attendance') || q.includes('lowest subject') || q.includes('worst subject')) {
    const sorted = [...stats.subjects].sort((a, b) => a.percentage - b.percentage);
    const lowest = sorted[0];
    if (!lowest) return "You do not have any registered subjects yet.";
    return `**${lowest.subjectName} (${lowest.subjectCode})** has your lowest attendance at **${lowest.percentage}%** (${lowest.attended}/${lowest.totalApplicable} attended, required: ${lowest.requiredPercentage}%). Status: ${lowest.riskLevel.toUpperCase()}.`;
  }

  if (q.includes('can i miss') || q.includes('miss tomorrow') || q.includes('miss next') || q.includes('miss class')) {
    // Check if user named a subject
    const matchedSubject = stats.subjects.find(
      (s) => q.includes(s.subjectCode.toLowerCase()) || q.includes(s.subjectName.toLowerCase()) || (s.subjectCode.toLowerCase().includes('it501') && q.includes('dbms'))
    );

    if (matchedSubject) {
      const sim = simulateMissNextLecture(
        matchedSubject.attended,
        matchedSubject.totalApplicable,
        0,
        matchedSubject.requiredPercentage
      );
      return `For **${matchedSubject.subjectName}**: Current attendance is ${sim.currentPercentage}%. If you miss the next lecture, your attendance will drop to **${sim.projectedPercentage}%** (required: ${matchedSubject.requiredPercentage}%). ${sim.canSafelyMiss ? '🟢 You can safely miss this lecture.' : '🔴 You should NOT miss this lecture.'}`;
    }

    // Otherwise simulate overall
    const sim = simulateMissNextLecture(
      stats.attendedLectures,
      stats.totalLectures,
      stats.approvedLeaveLectures,
      stats.requiredPercentage
    );
    return `Across all subjects, your current attendance is ${sim.currentPercentage}%. If you miss your next scheduled lecture, your overall attendance drops to **${sim.projectedPercentage}%** (required: ${stats.requiredPercentage}%). ${sim.canSafelyMiss ? `🟢 Safe: You can safely miss this lecture without dipping below ${stats.requiredPercentage}%.` : `🔴 Critical: Missing this lecture will cause your attendance to breach the mandatory threshold.`}`;
  }

  if (q.includes('how many lectures') || q.includes('how to reach') || q.includes('consecutive') || q.includes('recover')) {
    if (stats.overallRiskLevel === 'safe') {
      return `You are already safe with an overall attendance of **${stats.overallPercentage}%** (required: ${stats.requiredPercentage}%). You have a safety buffer and can safely miss up to **${stats.canMissOverall}** lectures while staying above ${stats.requiredPercentage}%.`;
    }
    return `Your overall attendance is **${stats.overallPercentage}%** (required: ${stats.requiredPercentage}%). You need to attend the next **${stats.recoverOverall}** consecutive lectures without missing any to reach the required ${stats.requiredPercentage}%.`;
  }

  if (q.includes('at risk') || q.includes('critical') || q.includes('which subjects')) {
    const atRiskList = stats.subjects.filter((s) => s.riskLevel !== 'safe');
    if (atRiskList.length === 0) {
      return `Great news! None of your subjects are currently at risk. All subjects meet or exceed the required +5% safety buffer.`;
    }
    const details = atRiskList.map((s) => `• **${s.subjectName}**: ${s.percentage}% (${s.riskLevel.toUpperCase()})`).join('\n');
    return `You have **${atRiskList.length}** subject(s) requiring immediate attention:\n${details}\n\nPlease prioritize attending upcoming sessions for these subjects.`;
  }

  // Fallback to Gemini if key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const context = `You are an academic attendance advisor assistant. Here is the student's real data:
Student: ${stats.studentName} (${stats.rollNumber})
Overall Attendance: ${stats.overallPercentage}% (Required: ${stats.requiredPercentage}%, Status: ${stats.overallRiskLevel})
Attended: ${stats.attendedLectures}, Missed: ${stats.missedLectures}, Leave: ${stats.approvedLeaveLectures}
Can miss overall: ${stats.canMissOverall}, Must attend to recover: ${stats.recoverOverall}
Subjects:
${stats.subjects.map((s) => `- ${s.subjectName} (${s.subjectCode}): ${s.percentage}% (${s.riskLevel})`).join('\n')}
Answer the student's question concisely and accurately based on their real numbers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${context}\n\nStudent question: "${query}"`,
      });
      if (response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn('Gemini query fallback error, returning rule-based default:', e);
    }
  }

  return `I can assist with:
• **"What is my attendance?"** - View overall metrics & risk status
• **"Which subject has my lowest attendance?"** - Identify your weakest subject
• **"Can I miss tomorrow's lecture?"** - Calculate projected drop before you take leave
• **"How many lectures do I need to attend to reach 75%?"** - Accurate recovery calculation
• **"Which subjects are at risk?"** - Overview of subjects needing urgent attention`;
}
