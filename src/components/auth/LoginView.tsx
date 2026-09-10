import React, { useState } from 'react';
import { GraduationCap, Shield, BookOpen, UserCheck, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, role?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  const demoAccounts = [
    {
      role: 'admin',
      name: 'Dr. Sarah Jenkins',
      title: 'Academic Director / Dean',
      email: 'admin@university.edu',
      description: 'Full administrative access, audits, and institutional analytics',
      icon: Shield,
      badge: 'Admin',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      role: 'faculty',
      name: 'Prof. Rajesh Sharma',
      title: 'Course Lead - Computer Science',
      email: 'rajesh.sharma@univ.edu',
      description: 'Host live QR sessions, manual sheets, and review leaves',
      icon: BookOpen,
      badge: 'Faculty',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      role: 'student',
      name: 'Alex Chen (88% Safe)',
      title: 'Student • Consistent Performer',
      email: 'alex.chen@univ.edu',
      description: 'Safe attendance standing with positive miss cushion',
      icon: GraduationCap,
      badge: 'Safe (88%)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      role: 'student',
      name: 'Priya Patel (76% At Risk)',
      title: 'Student • Borderline Status',
      email: 'priya.patel@univ.edu',
      description: 'Missing next class will drop student into critical',
      icon: GraduationCap,
      badge: 'At Risk (76%)',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      role: 'student',
      name: 'Marcus Johnson (61% Critical)',
      title: 'Student • Critical Deficit',
      email: 'marcus.johnson@univ.edu',
      description: 'Below 75% requirement, needs consecutive recovery plan',
      icon: GraduationCap,
      badge: 'Critical (61%)',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Smart Online Attendance Management System
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Record attendance, analyze risk, predict thresholds, and guide academic recovery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Quick 1-Click Demo Login Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              One-Click Role Authentication (Demo)
            </h2>
            <span className="text-[11px] text-indigo-600 font-semibold">Ready to test</span>
          </div>

          <div className="space-y-2.5">
            {demoAccounts.map((acc, i) => {
              const Icon = acc.icon;
              return (
                <button
                  key={i}
                  id={`demo-login-${acc.role}-${i}`}
                  onClick={() => onLogin(acc.email, acc.role)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        {acc.name}
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${acc.badgeColor}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{acc.description}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <form onSubmit={handleManualLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
