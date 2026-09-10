export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AcademicClass {
  id: string;
  name: string; // e.g., 'B.E. Computer Science'
  code: string; // e.g., 'BE-CS'
  semester: number; // e.g., 5
  division: string; // e.g., 'A'
  section?: string;
  department: string; // e.g., 'Computer Engineering'
  academicYear: string; // e.g., '2024-2025'
  totalStudents?: number;
}

export type Class = AcademicClass;

export interface Subject {
  id: string;
  subjectCode: string; // e.g., 'CS501'
  subjectName: string; // e.g., 'Database Management Systems'
  name?: string;
  code?: string;
  credits?: number;
  classId?: string;
  facultyId: string;
  facultyName?: string;
  department?: string;
  requiredPercentage: number; // e.g., 75
  totalLecturesConducted?: number;
}

export interface Student {
  id: string;
  userId?: string;
  studentId?: string; // e.g., 'STU-2024-001'
  name: string;
  email: string;
  phone?: string;
  classId: string;
  className?: string;
  division?: string;
  parentName?: string;
  parentContact?: string;
  parentEmail?: string;
  requiredPercentage?: number;
  rollNumber: string;
  overallPercentage?: number;
  overallRiskLevel?: RiskLevel;
}

export interface Faculty {
  id: string;
  userId?: string;
  facultyId?: string; // e.g., 'FAC-101'
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation?: string;
}

export type LectureStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Lecture {
  id: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  facultyId?: string;
  facultyName?: string;
  classId: string;
  className?: string;
  lectureDate?: string; // YYYY-MM-DD
  date?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string;
  status?: LectureStatus;
  isCompleted?: boolean;
  topic?: string;
  attendanceCount?: number;
  totalStudents?: number;
  createdAt?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'approved_leave';
export type AttendanceMethod = 'qr' | 'manual';

export interface AttendanceRecord {
  id: string;
  lectureId: string;
  studentId: string;
  studentName?: string;
  studentRoll?: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  markedAt: string;
  modifiedAt?: string;
  modifiedBy?: string;
  modificationReason?: string;
}

export interface QRSession {
  id: string;
  lectureId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'closed';
  durationSeconds: number;
  scannedCount?: number;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  classId?: string;
  subjectId?: string;
  subjectName?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  supportingNote?: string;
  status: LeaveStatus;
  facultyRemark?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'alert' | 'leave' | 'qr' | 'system' | 'parent_alert';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export type AnomalyType = 
  | 'duplicate_attempt'
  | 'manual_modification'
  | 'expired_qr_attempt'
  | 'unusual_timestamp'
  | 'conflicting_records'
  | 'frequent_absenteeism';

export type AnomalySeverity = 'low' | 'medium' | 'high';
export type AnomalyStatus = 'pending_review' | 'reviewed' | 'resolved';

export interface AnomalyRecord {
  id: string;
  attendanceId?: string;
  studentId: string;
  studentName: string;
  lectureId?: string;
  subjectName?: string;
  type: AnomalyType | string;
  description: string;
  severity: AnomalySeverity | string;
  status?: AnomalyStatus;
  isResolved?: boolean;
  detectedAt?: string;
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  resolutionNotes?: string;
}

export interface EngagementScore {
  id: string;
  studentId: string;
  attendanceScore: number; // 0-100 (weight 40%)
  assignmentScore: number; // 0-100 (weight 25%)
  quizScore: number; // 0-100 (weight 20%)
  participationScore: number; // 0-100 (weight 15%)
  totalScore: number; // 0-100
  calculatedAt: string;
}

export interface Achievement {
  id: string;
  studentId?: string;
  achievementType?: string;
  title: string;
  description: string;
  icon?: string;
  earnedAt?: string;
  unlockedAt?: string;
}

export type RiskLevel = 'safe' | 'at_risk' | 'critical';

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  attended: number;
  missed: number;
  approvedLeave: number;
  totalApplicable: number;
  percentage: number;
  requiredPercentage: number;
  riskLevel: RiskLevel;
  riskReason: string;
  canMissCount: number;
  recoverConsecutiveCount: number;
  history: Array<{
    date: string;
    status: AttendanceStatus;
    method: AttendanceMethod;
    topic?: string;
  }>;
}

export interface StudentOverallStats {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  totalLectures: number;
  attendedLectures: number;
  missedLectures: number;
  approvedLeaveLectures: number;
  overallPercentage: number;
  requiredPercentage: number;
  overallRiskLevel: RiskLevel;
  riskReason: string;
  canMissOverall: number;
  recoverOverall: number;
  currentStreak?: number;
  subjects: SubjectAttendanceSummary[];
  engagement?: EngagementScore;
  achievements: Achievement[];
  badges?: Achievement[];
}

export interface HeatmapDayCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  totalLectures: number;
  attendedLectures: number;
  missedLectures: number;
  leaveLectures: number;
  percentage: number;
  riskLevel: RiskLevel;
  lectures: Array<{
    subjectCode: string;
    subjectName: string;
    time: string;
    status: AttendanceStatus;
  }>;
}

export interface SystemSettings {
  riskBufferPercentage: number; // e.g. 5%
  defaultRequiredPercentage: number; // e.g. 75%
  engagementWeights: {
    attendance: number;
    assignments: number;
    quizzes: number;
    participation: number;
  };
  qrDefaultExpirySeconds: number; // e.g. 120s
  parentNotificationThreshold: number; // e.g. 75%
}
