import React, { useState, useEffect, useCallback } from 'react';
import { User, StudentOverallStats, Class, Subject, Faculty, Lecture, LeaveRequest, AnomalyRecord, NotificationItem } from './types.ts';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { StudentManagement } from './components/admin/StudentManagement.tsx';
import { FacultyManagement } from './components/admin/FacultyManagement.tsx';
import { ClassManagement } from './components/admin/ClassManagement.tsx';
import { SubjectManagement } from './components/admin/SubjectManagement.tsx';
import { AnomaliesView } from './components/admin/AnomaliesView.tsx';
import { AttendanceLogsView } from './components/admin/AttendanceLogsView.tsx';

// Faculty Views
import { FacultyDashboard } from './components/faculty/FacultyDashboard.tsx';
import { LectureManagement } from './components/faculty/LectureManagement.tsx';
import { MarkAttendanceView } from './components/faculty/MarkAttendanceView.tsx';
import { QRAttendanceView } from './components/faculty/QRAttendanceView.tsx';
import { FacultyLeaveReview } from './components/faculty/FacultyLeaveReview.tsx';
import { FacultyAnalyticsView } from './components/faculty/FacultyAnalyticsView.tsx';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { AttendanceCalculatorView } from './components/student/AttendanceCalculatorView.tsx';
import { CanIMissClassView } from './components/student/CanIMissClassView.tsx';
import { HeatmapView } from './components/student/HeatmapView.tsx';
import { ScanQRView } from './components/student/ScanQRView.tsx';
import { StudentLeaveView } from './components/student/StudentLeaveView.tsx';
import { EngagementScoreView } from './components/student/EngagementScoreView.tsx';
import { AchievementsView } from './components/student/AchievementsView.tsx';
import { AttendanceAssistantView } from './components/student/AttendanceAssistantView.tsx';

// Auth View
import { LoginView } from './components/auth/LoginView.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-admin',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@university.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });
  const [currentRole, setCurrentRole] = useState<'admin' | 'faculty' | 'student'>('admin');
  const [activeStudentId, setActiveStudentId] = useState<string>('stu-1');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Application Data States
  const [adminOverview, setAdminOverview] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [classesList, setClassesList] = useState<Class[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [lecturesList, setLecturesList] = useState<Lecture[]>([]);
  const [studentStats, setStudentStats] = useState<StudentOverallStats | null>(null);
  const [facultyAtRisk, setFacultyAtRisk] = useState<StudentOverallStats[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Safe JSON Fetcher helper to prevent any HTML/string parse errors
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return null;
      return await res.json();
    } catch (e) {
      console.warn(`Fetch error for ${url}:`, e);
      return null;
    }
  };

  // Load Data based on role
  const refreshData = useCallback(async () => {
    try {
      // 1. Notifications
      if (currentUser) {
        const notifData = await safeFetchJson(`/api/notifications?userId=${currentUser.id}`);
        if (Array.isArray(notifData)) {
          setNotifications(notifData);
        }
      }

      // 2. Role-specific data
      if (currentRole === 'admin') {
        const [overview, stu, fac, cls, sub, anom] = await Promise.all([
          safeFetchJson('/api/admin/overview'),
          safeFetchJson('/api/admin/students'),
          safeFetchJson('/api/admin/faculty'),
          safeFetchJson('/api/admin/classes'),
          safeFetchJson('/api/admin/subjects'),
          safeFetchJson('/api/admin/anomalies'),
        ]);

        if (overview) setAdminOverview(overview);
        if (Array.isArray(stu)) setStudents(stu);
        if (Array.isArray(fac)) setFacultyList(fac);
        if (Array.isArray(cls)) setClassesList(cls);
        if (Array.isArray(sub)) setSubjectsList(sub);
        if (Array.isArray(anom)) setAnomalies(anom);
      } else if (currentRole === 'faculty') {
        const [lec, sub, cls, stuRisk, leaves, anom, allStu] = await Promise.all([
          safeFetchJson('/api/faculty/lectures'),
          safeFetchJson('/api/admin/subjects'),
          safeFetchJson('/api/admin/classes'),
          safeFetchJson('/api/faculty/at-risk-students'),
          safeFetchJson('/api/faculty/leave-requests'),
          safeFetchJson('/api/admin/anomalies'),
          safeFetchJson('/api/admin/students'),
        ]);

        if (Array.isArray(lec)) setLecturesList(lec);
        if (Array.isArray(sub)) setSubjectsList(sub);
        if (Array.isArray(cls)) setClassesList(cls);
        if (Array.isArray(stuRisk)) setFacultyAtRisk(stuRisk);
        if (Array.isArray(leaves)) setLeaveRequests(leaves);
        if (Array.isArray(anom)) setAnomalies(anom);
        if (Array.isArray(allStu)) setStudents(allStu);
      } else if (currentRole === 'student') {
        const [sData, leaves] = await Promise.all([
          safeFetchJson(`/api/student/dashboard?studentId=${activeStudentId}`),
          safeFetchJson(`/api/student/leave-requests?studentId=${activeStudentId}`),
        ]);

        if (sData) {
          setStudentStats(sData.stats || sData);
          if (Array.isArray(sData.leaveRequests)) {
            setLeaveRequests(sData.leaveRequests);
          }
        }
        if (Array.isArray(leaves)) setLeaveRequests(leaves);
      }
    } catch (err) {
      console.error('Failed loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentRole, currentUser, activeStudentId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Persona switch handler
  const handleSwitchRole = (newRole: 'admin' | 'faculty' | 'student', studentId?: string) => {
    setCurrentRole(newRole);
    setActiveTab('dashboard');

    if (newRole === 'admin') {
      setCurrentUser({
        id: 'user-admin',
        name: 'Dr. Sarah Jenkins',
        email: 'admin@university.edu',
        role: 'admin',
      });
    } else if (newRole === 'faculty') {
      setCurrentUser({
        id: 'user-fac-1',
        name: 'Prof. Rajesh Sharma',
        email: 'rajesh.sharma@univ.edu',
        role: 'faculty',
      });
    } else if (newRole === 'student') {
      const sId = studentId || 'stu-1';
      setActiveStudentId(sId);
      const studentMap: Record<string, { name: string; email: string }> = {
        'stu-1': { name: 'Alex Chen', email: 'alex.chen@univ.edu' },
        'stu-2': { name: 'Priya Patel', email: 'priya.patel@univ.edu' },
        'stu-3': { name: 'Marcus Johnson', email: 'marcus.johnson@univ.edu' },
      };
      const info = studentMap[sId] || studentMap['stu-1'];
      setCurrentUser({
        id: `user-${sId}`,
        name: info.name,
        email: info.email,
        role: 'student',
      });
    }
  };

  const handleLogin = async (email: string, roleHint?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'demo' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        if (data.studentId) setActiveStudentId(data.studentId);
        setActiveTab('dashboard');
      } else {
        // Fallback demo switch
        if (roleHint === 'admin') handleSwitchRole('admin');
        else if (roleHint === 'faculty') handleSwitchRole('faculty');
        else if (roleHint === 'student') {
          if (email.includes('alex')) handleSwitchRole('student', 'stu-1');
          else if (email.includes('priya')) handleSwitchRole('student', 'stu-2');
          else handleSwitchRole('student', 'stu-3');
        }
      }
    } catch {
      if (roleHint) handleSwitchRole(roleHint as any);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleResetDemoData = async () => {
    if (!confirm('Reset entire system database to initial seed data?')) return;
    try {
      await fetch('/api/admin/reset-demo', { method: 'POST' });
      alert('Database restored to default demo state.');
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    await fetch(`/api/notifications/read-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onResetData={handleResetDemoData}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onToggleMobileSidebar={() => setIsOpenMobile(true)}
      />

      {/* Main Structural Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* ================= ADMIN VIEWS ================= */}
          {currentRole === 'admin' && (
            <>
              {activeTab === 'dashboard' && adminOverview && (
                <AdminDashboard
                  overview={adminOverview}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'students' && (
                <StudentManagement
                  students={students}
                  classes={classesList}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'faculty' && (
                <FacultyManagement
                  faculty={facultyList}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'classes' && (
                <ClassManagement
                  classes={classesList}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'subjects' && (
                <SubjectManagement
                  subjects={subjectsList}
                  faculty={facultyList}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'attendance-logs' && <AttendanceLogsView />}
              {activeTab === 'anomalies' && (
                <AnomaliesView
                  anomalies={anomalies}
                  onRefresh={refreshData}
                />
              )}
            </>
          )}

          {/* ================= FACULTY VIEWS ================= */}
          {currentRole === 'faculty' && (
            <>
              {activeTab === 'dashboard' && (
                <FacultyDashboard
                  faculty={{
                    id: 'fac-1',
                    name: 'Prof. Rajesh Sharma',
                    employeeId: 'FAC-IT-101',
                    department: 'Computer Science & IT',
                    email: 'rajesh.sharma@univ.edu',
                  }}
                  classes={classesList}
                  subjects={subjectsList}
                  lectures={lecturesList}
                  studentsAtRisk={facultyAtRisk}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'classes-subjects' && (
                <SubjectManagement
                  subjects={subjectsList}
                  faculty={facultyList}
                  onRefresh={refreshData}
                />
              )}
              {activeTab === 'lectures' && (
                <LectureManagement
                  lectures={lecturesList}
                  subjects={subjectsList}
                  classes={classesList}
                  onLectureCreated={refreshData}
                />
              )}
              {activeTab === 'mark-attendance' && (
                <MarkAttendanceView
                  lectures={lecturesList}
                  subjects={subjectsList}
                  classes={classesList}
                  students={students}
                  onAttendanceSaved={refreshData}
                />
              )}
              {activeTab === 'qr-attendance' && (
                <QRAttendanceView
                  lectures={lecturesList}
                  subjects={subjectsList}
                  classes={classesList}
                  onAttendanceSessionClosed={refreshData}
                />
              )}
              {activeTab === 'leave-requests' && (
                <FacultyLeaveReview
                  faculty={{
                    id: 'fac-1',
                    name: 'Prof. Rajesh Sharma',
                    employeeId: 'FAC-IT-101',
                    department: 'Computer Science & IT',
                    email: 'rajesh.sharma@univ.edu',
                  }}
                  leaveRequests={leaveRequests}
                  onReviewCompleted={refreshData}
                />
              )}
              {activeTab === 'analytics' && (
                <FacultyAnalyticsView
                  students={facultyAtRisk}
                  subjects={subjectsList}
                  classes={classesList}
                />
              )}
              {activeTab === 'anomalies' && (
                <AnomaliesView
                  anomalies={anomalies}
                  onRefresh={refreshData}
                />
              )}
            </>
          )}

          {/* ================= STUDENT VIEWS ================= */}
          {currentRole === 'student' && studentStats && (
            <>
              {activeTab === 'dashboard' && (
                <StudentDashboard
                  stats={studentStats}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'my-attendance' && (
                <StudentDashboard
                  stats={studentStats}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'calculator' && (
                <AttendanceCalculatorView stats={studentStats} />
              )}
              {activeTab === 'can-miss' && (
                <CanIMissClassView stats={studentStats} />
              )}
              {activeTab === 'heatmap' && (
                <HeatmapView stats={studentStats} />
              )}
              {activeTab === 'scan-qr' && (
                <ScanQRView
                  stats={studentStats}
                  onAttendanceMarked={refreshData}
                />
              )}
              {activeTab === 'leave-requests' && (
                <StudentLeaveView
                  stats={studentStats}
                  leaveRequests={leaveRequests}
                  onLeaveSubmitted={refreshData}
                />
              )}
              {activeTab === 'engagement' && (
                <EngagementScoreView stats={studentStats} />
              )}
              {activeTab === 'achievements' && (
                <AchievementsView stats={studentStats} />
              )}
              {activeTab === 'assistant' && (
                <AttendanceAssistantView stats={studentStats} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
