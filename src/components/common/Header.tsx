import React, { useState } from 'react';
import { User, NotificationItem } from '../../types.ts';
import {
  GraduationCap,
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown,
  Menu,
  Shield,
  BookOpen,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentRole: 'admin' | 'faculty' | 'student';
  onSwitchRole: (role: 'admin' | 'faculty' | 'student', studentId?: string) => void;
  onLogout: () => void;
  onResetData: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onSwitchRole,
  onLogout,
  onResetData,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onToggleMobileSidebar,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleConfigs = {
    admin: { label: 'Administrator', icon: Shield, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    faculty: { label: 'Faculty Member', icon: BookOpen, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    student: { label: 'Student', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  };

  const currentConfig = roleConfigs[currentRole];
  const RoleIcon = currentConfig.icon;

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-toggle-button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight block leading-tight">
                  Smart Attendance
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none">
                  Attendance Intelligence & Risk Engine
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                id="role-switcher-button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${currentConfig.color} hover:opacity-90 transition-all`}
              >
                <RoleIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{currentUser?.name || currentConfig.label}</span>
                <span className="capitalize sm:hidden">{currentRole}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleDropdown && (
                <div
                  id="role-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona (Demo)
                  </div>

                  <button
                    id="switch-admin-button"
                    onClick={() => {
                      onSwitchRole('admin');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Admin: Dr. Sarah Jenkins</div>
                      <div className="text-[11px] text-slate-500">Academic Director • Full oversight</div>
                    </div>
                    {currentRole === 'admin' && <UserCheck className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    id="switch-faculty-button"
                    onClick={() => {
                      onSwitchRole('faculty');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">Faculty: Prof. Rajesh Sharma</div>
                      <div className="text-[11px] text-slate-500">IT Dept • QR Attendance & Approvals</div>
                    </div>
                    {currentRole === 'faculty' && <UserCheck className="w-4 h-4 text-blue-600" />}
                  </button>

                  <div className="my-1 border-t border-slate-100" />
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Student Profiles (Risk Categories)
                  </div>

                  <button
                    id="switch-student-safe-button"
                    onClick={() => {
                      onSwitchRole('student', 'stu-1');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Alex Chen (88% Safe)
                      </div>
                      <div className="text-[11px] text-slate-500">Consistent performer • Safe buffer</div>
                    </div>
                  </button>

                  <button
                    id="switch-student-atrisk-button"
                    onClick={() => {
                      onSwitchRole('student', 'stu-2');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-amber-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Priya Patel (76% At Risk)
                      </div>
                      <div className="text-[11px] text-slate-500">Borderline • Missing 1 triggers alert</div>
                    </div>
                  </button>

                  <button
                    id="switch-student-critical-button"
                    onClick={() => {
                      onSwitchRole('student', 'stu-3');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Marcus Johnson (61% Critical)
                      </div>
                      <div className="text-[11px] text-slate-500">Below 75% • Parent alert dispatched</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-bell-button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notifications-dropdown"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50"
                >
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-500">{unreadCount} unread messages</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()} •{' '}
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={() => onMarkNotificationRead(notif.id)}
                                className="text-slate-400 hover:text-indigo-600 p-1"
                                title="Mark read"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              id="reset-demo-database-button"
              onClick={onResetData}
              title="Reset application to default seed database"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline-flex"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              id="logout-button"
              onClick={onLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
