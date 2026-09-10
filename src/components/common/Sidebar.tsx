import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  AlertOctagon,
  QrCode,
  ClipboardList,
  BarChart3,
  Calculator,
  HelpCircle,
  Flame,
  Bot,
  Award,
  Calendar,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentRole: 'admin' | 'faculty' | 'student';
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const adminItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'faculty', label: 'Faculty Management', icon: GraduationCap },
    { id: 'classes', label: 'Class Management', icon: Building2 },
    { id: 'subjects', label: 'Subject Management', icon: BookOpen },
    { id: 'attendance-logs', label: 'Attendance Records', icon: CalendarCheck },
    { id: 'anomalies', label: 'Anomalies & Audits', icon: AlertOctagon },
  ];

  const facultyItems = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'classes-subjects', label: 'My Classes & Subjects', icon: Building2 },
    { id: 'lectures', label: 'Lectures & Schedule', icon: Calendar },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'qr-attendance', label: 'Live QR Attendance', icon: QrCode },
    { id: 'leave-requests', label: 'Leave Requests', icon: ClipboardList },
    { id: 'analytics', label: 'Class Analytics & Roster', icon: BarChart3 },
    { id: 'anomalies', label: 'Anomaly Review', icon: AlertOctagon },
  ];

  const studentItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'my-attendance', label: 'My Attendance & Subjects', icon: BarChart3 },
    { id: 'calculator', label: 'Smart Calculator', icon: Calculator },
    { id: 'can-miss', label: '"Can I Miss a Class?"', icon: HelpCircle },
    { id: 'heatmap', label: 'Attendance Heatmap', icon: Calendar },
    { id: 'scan-qr', label: 'Scan / Submit QR', icon: QrCode },
    { id: 'leave-requests', label: 'Submit Leave Request', icon: ClipboardList },
    { id: 'engagement', label: 'Engagement Score', icon: Flame },
    { id: 'achievements', label: 'Achievements & Streaks', icon: Award },
    { id: 'assistant', label: 'Attendance Assistant', icon: Bot },
  ];

  const items = {
    admin: adminItems,
    faculty: facultyItems,
    student: studentItems,
  }[currentRole];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Role Tag & Close Button for mobile */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Navigation Role
          </span>
          <span className="text-xs font-semibold text-slate-800 capitalize">
            {currentRole} Portal
          </span>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[11px] text-slate-500 flex flex-col gap-0.5">
          <span className="font-semibold text-slate-700">Academic Intelligence</span>
          <span>Transparent calculation v2.4</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">{content}</div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
