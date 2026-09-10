import fs from 'fs';
import path from 'path';
import {
  User,
  AcademicClass,
  Subject,
  Student,
  Faculty,
  Lecture,
  AttendanceRecord,
  QRSession,
  LeaveRequest,
  NotificationItem,
  AnomalyRecord,
  EngagementScore,
  Achievement,
  SystemSettings,
} from '../src/types.ts';
import { calculateAttendanceMetrics } from '../src/utils/attendanceCalculations.ts';

export interface DatabaseSchema {
  users: User[];
  classes: AcademicClass[];
  subjects: Subject[];
  faculty: Faculty[];
  students: Student[];
  lectures: Lecture[];
  attendance: AttendanceRecord[];
  qrSessions: QRSession[];
  leaveRequests: LeaveRequest[];
  notifications: NotificationItem[];
  anomalies: AnomalyRecord[];
  engagementScores: EngagementScore[];
  achievements: Achievement[];
  settings: SystemSettings;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let inMemoryDb: DatabaseSchema | null = null;

export function getInitialSeedData(): DatabaseSchema {
  const users: User[] = [
    {
      id: 'usr-admin-1',
      email: 'admin@college.edu',
      role: 'admin',
      name: 'Dr. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-10T08:00:00Z',
    },
    {
      id: 'usr-fac-1',
      email: 'prof.sharma@college.edu',
      role: 'faculty',
      name: 'Prof. Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-12T09:00:00Z',
    },
    {
      id: 'usr-fac-2',
      email: 'prof.iyer@college.edu',
      role: 'faculty',
      name: 'Prof. Ananya Iyer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-12T09:30:00Z',
    },
    {
      id: 'usr-stu-1',
      email: 'alex.chen@student.edu',
      role: 'student',
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'usr-stu-2',
      email: 'priya.patel@student.edu',
      role: 'student',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-15T10:15:00Z',
    },
    {
      id: 'usr-stu-3',
      email: 'marcus.johnson@student.edu',
      role: 'student',
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
    },
  ];

  const classes: AcademicClass[] = [
    {
      id: 'cls-1',
      name: 'B.E. Information Technology',
      code: 'BE-IT-V',
      semester: 5,
      division: 'A',
      department: 'Information Technology',
      academicYear: '2024-2025',
      totalStudents: 8,
    },
    {
      id: 'cls-2',
      name: 'B.E. Computer Engineering',
      code: 'BE-CS-III',
      semester: 3,
      division: 'B',
      department: 'Computer Engineering',
      academicYear: '2024-2025',
      totalStudents: 6,
    },
    {
      id: 'cls-3',
      name: 'B.E. Artificial Intelligence & Data Science',
      code: 'BE-AIDS-V',
      semester: 5,
      division: 'A',
      department: 'Data Science',
      academicYear: '2024-2025',
      totalStudents: 5,
    },
  ];

  const faculty: Faculty[] = [
    {
      id: 'fac-1',
      userId: 'usr-fac-1',
      facultyId: 'FAC-IT-101',
      name: 'Prof. Rajesh Sharma',
      email: 'prof.sharma@college.edu',
      phone: '+1 (555) 234-5678',
      department: 'Information Technology',
      designation: 'Associate Professor',
    },
    {
      id: 'fac-2',
      userId: 'usr-fac-2',
      facultyId: 'FAC-IT-102',
      name: 'Prof. Ananya Iyer',
      email: 'prof.iyer@college.edu',
      phone: '+1 (555) 876-5432',
      department: 'Information Technology',
      designation: 'Assistant Professor',
    },
  ];

  const subjects: Subject[] = [
    {
      id: 'sub-1',
      subjectCode: 'IT501',
      subjectName: 'Database Management Systems',
      classId: 'cls-1',
      facultyId: 'fac-1',
      facultyName: 'Prof. Rajesh Sharma',
      requiredPercentage: 75,
      totalLecturesConducted: 20,
    },
    {
      id: 'sub-2',
      subjectCode: 'IT502',
      subjectName: 'Computer Networks & Security',
      classId: 'cls-1',
      facultyId: 'fac-1',
      facultyName: 'Prof. Rajesh Sharma',
      requiredPercentage: 75,
      totalLecturesConducted: 18,
    },
    {
      id: 'sub-3',
      subjectCode: 'IT503',
      subjectName: 'Web & Cloud Technologies',
      classId: 'cls-1',
      facultyId: 'fac-2',
      facultyName: 'Prof. Ananya Iyer',
      requiredPercentage: 75,
      totalLecturesConducted: 16,
    },
    {
      id: 'sub-4',
      subjectCode: 'IT504',
      subjectName: 'Software Engineering & Agile',
      classId: 'cls-1',
      facultyId: 'fac-2',
      facultyName: 'Prof. Ananya Iyer',
      requiredPercentage: 75,
      totalLecturesConducted: 15,
    },
  ];

  const students: Student[] = [
    {
      id: 'stu-1',
      userId: 'usr-stu-1',
      studentId: 'STU-2024-001',
      name: 'Alex Chen',
      email: 'alex.chen@student.edu',
      phone: '+1 (555) 123-4567',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'David Chen',
      parentContact: '+1 (555) 987-6541',
      parentEmail: 'david.chen@parent.com',
      requiredPercentage: 75,
      rollNumber: '01',
    },
    {
      id: 'stu-2',
      userId: 'usr-stu-2',
      studentId: 'STU-2024-002',
      name: 'Priya Patel',
      email: 'priya.patel@student.edu',
      phone: '+1 (555) 234-5678',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'Sanjay Patel',
      parentContact: '+1 (555) 876-5432',
      parentEmail: 'sanjay.patel@parent.com',
      requiredPercentage: 75,
      rollNumber: '02',
    },
    {
      id: 'stu-3',
      userId: 'usr-stu-3',
      studentId: 'STU-2024-003',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@student.edu',
      phone: '+1 (555) 345-6789',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'Clarissa Johnson',
      parentContact: '+1 (555) 765-4321',
      parentEmail: 'c.johnson@parent.com',
      requiredPercentage: 75,
      rollNumber: '03',
    },
    {
      id: 'stu-4',
      userId: 'usr-stu-4',
      studentId: 'STU-2024-004',
      name: 'Sophia Rodriguez',
      email: 'sophia.r@student.edu',
      phone: '+1 (555) 456-7890',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'Carlos Rodriguez',
      parentContact: '+1 (555) 654-3210',
      parentEmail: 'carlos.r@parent.com',
      requiredPercentage: 75,
      rollNumber: '04',
    },
    {
      id: 'stu-5',
      userId: 'usr-stu-5',
      studentId: 'STU-2024-005',
      name: 'David Kim',
      email: 'david.kim@student.edu',
      phone: '+1 (555) 567-8901',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'Grace Kim',
      parentContact: '+1 (555) 543-2109',
      parentEmail: 'grace.kim@parent.com',
      requiredPercentage: 75,
      rollNumber: '05',
    },
    {
      id: 'stu-6',
      userId: 'usr-stu-6',
      studentId: 'STU-2024-006',
      name: 'Aisha Khan',
      email: 'aisha.khan@student.edu',
      phone: '+1 (555) 678-9012',
      classId: 'cls-1',
      className: 'B.E. Information Technology - Sem 5 Div A',
      division: 'A',
      parentName: 'Imran Khan',
      parentContact: '+1 (555) 432-1098',
      parentEmail: 'imran.khan@parent.com',
      requiredPercentage: 75,
      rollNumber: '06',
    },
  ];

  // Generate realistic lectures over recent 4 weeks
  const lectures: Lecture[] = [];
  const attendance: AttendanceRecord[] = [];

  const lecturePlan = [
    // IT501 - DBMS (Prof. Sharma)
    { subjectId: 'sub-1', topic: 'Relational Model & Normal Forms', date: '2024-09-02', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'B+ Tree Indexing & Query Plans', date: '2024-09-04', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'ACID Properties & Transaction Isolation', date: '2024-09-06', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'Two-Phase Locking Protocol', date: '2024-09-09', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'NoSQL Databases & MongoDB Schema', date: '2024-09-11', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'Distributed Transactions & 2PC', date: '2024-09-13', time: '09:00', end: '10:00', room: 'Lab 301' },
    { subjectId: 'sub-1', topic: 'Database Recovery: ARIES Algorithm', date: '2024-09-16', time: '09:00', end: '10:00', room: 'Lab 301' },

    // IT502 - Networks (Prof. Sharma)
    { subjectId: 'sub-2', topic: 'TCP Sliding Window & Flow Control', date: '2024-09-03', time: '11:00', end: '12:00', room: 'Hall B' },
    { subjectId: 'sub-2', topic: 'BGP Routing & Autonomous Systems', date: '2024-09-05', time: '11:00', end: '12:00', room: 'Hall B' },
    { subjectId: 'sub-2', topic: 'TLS 1.3 Handshake Architecture', date: '2024-09-10', time: '11:00', end: '12:00', room: 'Hall B' },
    { subjectId: 'sub-2', topic: 'IPSec Tunneling & Key Exchange', date: '2024-09-12', time: '11:00', end: '12:00', room: 'Hall B' },
    { subjectId: 'sub-2', topic: 'Software Defined Networking (SDN)', date: '2024-09-17', time: '11:00', end: '12:00', room: 'Hall B' },

    // IT503 - Cloud (Prof. Iyer)
    { subjectId: 'sub-3', topic: 'Docker Containerization Fundamentals', date: '2024-09-02', time: '14:00', end: '15:00', room: 'Cloud Lab' },
    { subjectId: 'sub-3', topic: 'Kubernetes Pods & ReplicaSets', date: '2024-09-04', time: '14:00', end: '15:00', room: 'Cloud Lab' },
    { subjectId: 'sub-3', topic: 'Microservice API Gateways', date: '2024-09-09', time: '14:00', end: '15:00', room: 'Cloud Lab' },
    { subjectId: 'sub-3', topic: 'Serverless Functions & Event Sourcing', date: '2024-09-11', time: '14:00', end: '15:00', room: 'Cloud Lab' },
    { subjectId: 'sub-3', topic: 'Cloud Storage & CDN Edge Caching', date: '2024-09-16', time: '14:00', end: '15:00', room: 'Cloud Lab' },

    // IT504 - Agile (Prof. Iyer)
    { subjectId: 'sub-4', topic: 'Scrum Sprints & Backlog Grooming', date: '2024-09-03', time: '15:00', end: '16:00', room: 'Room 204' },
    { subjectId: 'sub-4', topic: 'CI/CD Pipelines & Automated Testing', date: '2024-09-05', time: '15:00', end: '16:00', room: 'Room 204' },
    { subjectId: 'sub-4', topic: 'Test-Driven Development (TDD) Lab', date: '2024-09-10', time: '15:00', end: '16:00', room: 'Room 204' },
    { subjectId: 'sub-4', topic: 'Refactoring Patterns & Code Smells', date: '2024-09-12', time: '15:00', end: '16:00', room: 'Room 204' },
  ];

  // Map student attendance profiles:
  // Alex: ~86% (rare absences)
  // Priya: ~76% (at risk)
  // Marcus: ~63% (critical)
  // Sophia: ~95% (safe)
  // David: ~77% (at risk)
  // Aisha: ~68% (critical)
  const studentProfiles: Record<string, { presentOdds: number; leaveLecs: number[] }> = {
    'stu-1': { presentOdds: 0.88, leaveLecs: [2] }, // Alex: 1 approved leave
    'stu-2': { presentOdds: 0.76, leaveLecs: [] }, // Priya: ~76%
    'stu-3': { presentOdds: 0.61, leaveLecs: [4] }, // Marcus: low attendance
    'stu-4': { presentOdds: 0.95, leaveLecs: [] }, // Sophia: very high
    'stu-5': { presentOdds: 0.77, leaveLecs: [1] }, // David: borderline
    'stu-6': { presentOdds: 0.67, leaveLecs: [] }, // Aisha: critical
  };

  lecturePlan.forEach((lp, lIdx) => {
    const sub = subjects.find((s) => s.id === lp.subjectId)!;
    const lecId = `lec-${lIdx + 1}`;
    lectures.push({
      id: lecId,
      subjectId: sub.id,
      subjectName: sub.subjectName,
      subjectCode: sub.subjectCode,
      facultyId: sub.facultyId,
      facultyName: sub.facultyName,
      classId: 'cls-1',
      className: 'B.E. Information Technology',
      lectureDate: lp.date,
      startTime: lp.time,
      endTime: lp.end,
      room: lp.room,
      status: 'completed',
      topic: lp.topic,
      attendanceCount: 0,
      totalStudents: students.length,
      createdAt: `${lp.date}T08:30:00Z`,
    });

    // Mark attendance for all students
    let presentInLec = 0;
    students.forEach((stu) => {
      const profile = studentProfiles[stu.id];
      let status: 'present' | 'absent' | 'approved_leave' = 'absent';
      if (profile.leaveLecs.includes(lIdx)) {
        status = 'approved_leave';
      } else {
        // pseudo-random deterministic based on ids
        const hash = (stu.id.charCodeAt(4) * 31 + lIdx * 17) % 100;
        status = hash < profile.presentOdds * 100 ? 'present' : 'absent';
      }

      if (status === 'present') presentInLec++;

      const isManual = lIdx % 3 === 0;
      attendance.push({
        id: `att-${lecId}-${stu.id}`,
        lectureId: lecId,
        studentId: stu.id,
        studentName: stu.name,
        studentRoll: stu.rollNumber,
        status,
        method: isManual ? 'manual' : 'qr',
        markedAt: `${lp.date}T${lp.time}:15Z`,
        ...(isManual && { modifiedBy: 'Prof. Rajesh Sharma', modifiedAt: `${lp.date}T${lp.time}:45Z` }),
      });
    });

    lectures[lectures.length - 1].attendanceCount = presentInLec;
  });

  // Add 1 active lecture for testing live QR code generation & live attendance marking right now!
  const todayStr = '2024-09-18';
  const liveLecId = 'lec-live-today';
  lectures.push({
    id: liveLecId,
    subjectId: 'sub-1',
    subjectName: 'Database Management Systems',
    subjectCode: 'IT501',
    facultyId: 'fac-1',
    facultyName: 'Prof. Rajesh Sharma',
    classId: 'cls-1',
    className: 'B.E. Information Technology',
    lectureDate: todayStr,
    startTime: '10:00',
    endTime: '11:00',
    room: 'Auditorium 2',
    status: 'active',
    topic: 'Graph Databases & Neo4j Query Syntax',
    attendanceCount: 2,
    totalStudents: students.length,
    createdAt: `${todayStr}T09:45:00Z`,
  });

  // Add already marked attendance for 2 students in live lecture
  attendance.push({
    id: `att-${liveLecId}-stu-4`,
    lectureId: liveLecId,
    studentId: 'stu-4',
    studentName: 'Sophia Rodriguez',
    studentRoll: '04',
    status: 'present',
    method: 'qr',
    markedAt: `${todayStr}T10:02:10Z`,
  });
  attendance.push({
    id: `att-${liveLecId}-stu-5`,
    lectureId: liveLecId,
    studentId: 'stu-5',
    studentName: 'David Kim',
    studentRoll: '05',
    status: 'present',
    method: 'qr',
    markedAt: `${todayStr}T10:03:45Z`,
  });

  // Active QR Session
  const qrSessions: QRSession[] = [
    {
      id: 'qr-sess-live-1',
      lectureId: liveLecId,
      token: 'QR-IT501-SESSION-9482',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 180 * 1000).toISOString(), // 3 mins from now
      status: 'active',
      durationSeconds: 180,
      scannedCount: 2,
    },
  ];

  // Leave Requests
  const leaveRequests: LeaveRequest[] = [
    {
      id: 'lr-1',
      studentId: 'stu-1',
      studentName: 'Alex Chen',
      classId: 'cls-1',
      subjectId: 'sub-1',
      subjectName: 'Database Management Systems',
      fromDate: '2024-09-06',
      toDate: '2024-09-06',
      reason: 'Representing university at Inter-College Hackathon finals.',
      supportingNote: 'Official invitation letter submitted to HOD office.',
      status: 'approved',
      facultyRemark: 'Approved duty leave. Hackathon certificate verified.',
      createdAt: '2024-09-04T11:00:00Z',
      reviewedAt: '2024-09-05T09:00:00Z',
      reviewedBy: 'Prof. Rajesh Sharma',
    },
    {
      id: 'lr-2',
      studentId: 'stu-3',
      studentName: 'Marcus Johnson',
      classId: 'cls-1',
      subjectId: 'sub-2',
      subjectName: 'Computer Networks & Security',
      fromDate: '2024-09-18',
      toDate: '2024-09-20',
      reason: 'Severe viral fever and respiratory infection.',
      supportingNote: 'Doctor medical prescription attached.',
      status: 'pending',
      createdAt: '2024-09-17T16:00:00Z',
    },
    {
      id: 'lr-3',
      studentId: 'stu-2',
      studentName: 'Priya Patel',
      classId: 'cls-1',
      subjectId: 'sub-3',
      subjectName: 'Web & Cloud Technologies',
      fromDate: '2024-09-22',
      toDate: '2024-09-23',
      reason: 'Attending elder sister wedding ceremony out of town.',
      status: 'pending',
      createdAt: '2024-09-17T14:30:00Z',
    },
  ];

  // Anomaly records (transparent, rule-based)
  const anomalies: AnomalyRecord[] = [
    {
      id: 'anom-1',
      studentId: 'stu-3',
      studentName: 'Marcus Johnson',
      lectureId: 'lec-4',
      subjectName: 'Database Management Systems',
      type: 'manual_modification',
      description: 'Attendance manually changed from Absent to Present by faculty after lecture conclusion.',
      severity: 'low',
      status: 'reviewed',
      createdAt: '2024-09-09T14:20:00Z',
      reviewedAt: '2024-09-10T10:00:00Z',
      reviewedBy: 'Prof. Rajesh Sharma',
      resolutionNotes: 'Student was assisting in department server maintenance during roll call.',
    },
    {
      id: 'anom-2',
      studentId: 'stu-3',
      studentName: 'Marcus Johnson',
      lectureId: 'lec-8',
      subjectName: 'Computer Networks & Security',
      type: 'duplicate_attempt',
      description: 'Multiple QR scan attempts detected within 4 seconds from conflicting device signatures.',
      severity: 'medium',
      status: 'pending_review',
      createdAt: '2024-09-10T11:05:12Z',
    },
    {
      id: 'anom-3',
      studentId: 'stu-6',
      studentName: 'Aisha Khan',
      lectureId: 'lec-6',
      subjectName: 'Database Management Systems',
      type: 'expired_qr_attempt',
      description: 'QR scan received 45 seconds after session validity token had expired.',
      severity: 'low',
      status: 'pending_review',
      createdAt: '2024-09-13T10:02:45Z',
    },
  ];

  // Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-stu-3',
      type: 'parent_alert',
      title: 'Attendance Critical Alert',
      message: 'Your overall attendance has fallen to 63.2%, which is below the mandatory 75% requirement. Parent notification event dispatched.',
      isRead: false,
      createdAt: '2024-09-17T17:00:00Z',
      data: { percentage: 63.2, required: 75, parentContact: '+1 (555) 765-4321' },
    },
    {
      id: 'notif-2',
      userId: 'usr-stu-2',
      type: 'alert',
      title: 'Borderline Attendance Warning',
      message: 'Your attendance is at 76.2%. You are within 1.2% of the critical threshold. Missing 1 lecture will move you into Critical status.',
      isRead: false,
      createdAt: '2024-09-17T15:00:00Z',
    },
    {
      id: 'notif-3',
      userId: 'usr-fac-1',
      type: 'leave',
      title: 'New Leave Request from Marcus Johnson',
      message: 'Marcus Johnson submitted a leave request for Computer Networks (Sep 18 - Sep 20).',
      isRead: false,
      createdAt: '2024-09-17T16:05:00Z',
    },
    {
      id: 'notif-4',
      userId: 'usr-fac-1',
      type: 'alert',
      title: 'New Attendance Anomaly Detected',
      message: 'Suspicious duplicate QR attempt flagged for lecture IT502.',
      isRead: true,
      createdAt: '2024-09-10T11:06:00Z',
    },
  ];

  // Engagement scores
  const engagementScores: EngagementScore[] = [
    {
      id: 'eng-1',
      studentId: 'stu-1',
      attendanceScore: 86,
      assignmentScore: 92,
      quizScore: 88,
      participationScore: 85,
      totalScore: 88,
      calculatedAt: '2024-09-17T18:00:00Z',
    },
    {
      id: 'eng-2',
      studentId: 'stu-2',
      attendanceScore: 76,
      assignmentScore: 82,
      quizScore: 74,
      participationScore: 70,
      totalScore: 76,
      calculatedAt: '2024-09-17T18:00:00Z',
    },
    {
      id: 'eng-3',
      studentId: 'stu-3',
      attendanceScore: 63,
      assignmentScore: 68,
      quizScore: 58,
      participationScore: 60,
      totalScore: 63,
      calculatedAt: '2024-09-17T18:00:00Z',
    },
    {
      id: 'eng-4',
      studentId: 'stu-4',
      attendanceScore: 95,
      assignmentScore: 96,
      quizScore: 92,
      participationScore: 90,
      totalScore: 94,
      calculatedAt: '2024-09-17T18:00:00Z',
    },
  ];

  // Achievements
  const achievements: Achievement[] = [
    {
      id: 'ach-1',
      studentId: 'stu-1',
      achievementType: 'perfect_week',
      title: 'Perfect Week',
      description: 'Maintained 100% attendance across all scheduled lectures for a complete week.',
      icon: 'Trophy',
      earnedAt: '2024-09-08T18:00:00Z',
    },
    {
      id: 'ach-2',
      studentId: 'stu-1',
      achievementType: 'streak_7',
      title: '7-Day Attendance Streak',
      description: 'Attended all scheduled lectures for 7 consecutive academic days without absence.',
      icon: 'Flame',
      earnedAt: '2024-09-12T18:00:00Z',
    },
    {
      id: 'ach-3',
      studentId: 'stu-1',
      achievementType: 'consistent_student',
      title: 'Consistent Performer',
      description: 'Sustained overall attendance above 80% for the entire active month.',
      icon: 'Star',
      earnedAt: '2024-09-15T18:00:00Z',
    },
    {
      id: 'ach-4',
      studentId: 'stu-4',
      achievementType: 'perfect_week',
      title: 'Perfect Week',
      description: 'Maintained 100% attendance across all scheduled lectures for a complete week.',
      icon: 'Trophy',
      earnedAt: '2024-09-08T18:00:00Z',
    },
  ];

  const settings: SystemSettings = {
    riskBufferPercentage: 5,
    defaultRequiredPercentage: 75,
    engagementWeights: {
      attendance: 0.4,
      assignments: 0.25,
      quizzes: 0.2,
      participation: 0.15,
    },
    qrDefaultExpirySeconds: 120,
    parentNotificationThreshold: 75,
  };

  return {
    users,
    classes,
    subjects,
    faculty,
    students,
    lectures,
    attendance,
    qrSessions,
    leaveRequests,
    notifications,
    anomalies,
    engagementScores,
    achievements,
    settings,
  };
}

export function getDb(): DatabaseSchema {
  if (inMemoryDb) return inMemoryDb;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      return inMemoryDb!;
    }
  } catch (err) {
    console.warn('Could not read db.json, initializing from seed data:', err);
  }

  inMemoryDb = getInitialSeedData();
  saveDb(inMemoryDb);
  return inMemoryDb;
}

export function saveDb(data: DatabaseSchema) {
  inMemoryDb = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

export function resetToSeedData(): DatabaseSchema {
  inMemoryDb = getInitialSeedData();
  saveDb(inMemoryDb);
  return inMemoryDb;
}
