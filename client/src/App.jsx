import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Chatbot } from './components/common/Chatbot';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkersPage } from './pages/WorkersPage';
import { SkillMatrixPage } from './pages/SkillMatrixPage';
import { AssignmentApprovalPage } from './pages/AssignmentApprovalPage';
import { SkillIntelligencePage } from './pages/SkillIntelligencePage';
import { FairnessReviewPage } from './pages/FairnessReviewPage';
import { LearningMobilityPage } from './pages/LearningMobilityPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditSettingsPage } from './pages/AuditSettingsPage';

// Access Denied Page Component
const AccessDenied = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
    <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400 mb-4 shadow-lg">
      <ShieldAlert className="w-12 h-12" />
    </div>
    <h2 className="text-2xl font-black text-white tracking-tight">Access Restricted</h2>
    <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
      Your current role does not have administrative permissions to view or modify this area. Please contact your HR Admin or Workforce Planner if you require access.
    </p>
    <Link
      to="/dashboard"
      className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 transition-all"
    >
      <ArrowLeft className="w-4 h-4" /> Return to Capacity Dashboard
    </Link>
  </div>
);

// Role Guard Wrapper Component
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }
  return children;
};

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400 font-semibold text-xs">
        Authenticating session state...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/skill-matrix" element={<SkillMatrixPage />} />
            <Route
              path="/assignment-approval"
              element={
                <RoleGuard allowedRoles={['Team Lead', 'Workforce Planner', 'HR Admin']}>
                  <AssignmentApprovalPage />
                </RoleGuard>
              }
            />
            <Route
              path="/skill-intelligence"
              element={
                <RoleGuard allowedRoles={['Team Lead', 'Workforce Planner', 'HR Admin']}>
                  <SkillIntelligencePage />
                </RoleGuard>
              }
            />
            <Route
              path="/fairness-review"
              element={
                <RoleGuard allowedRoles={['Team Lead', 'Workforce Planner', 'HR Admin']}>
                  <FairnessReviewPage />
                </RoleGuard>
              }
            />
            <Route path="/learning-mobility" element={<LearningMobilityPage />} />
            <Route
              path="/reports"
              element={
                <RoleGuard allowedRoles={['Team Lead', 'Workforce Planner', 'HR Admin']}>
                  <ReportsPage />
                </RoleGuard>
              }
            />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/users"
              element={
                <RoleGuard allowedRoles={['HR Admin', 'Workforce Planner']}>
                  <UsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/audit-settings"
              element={
                <RoleGuard allowedRoles={['HR Admin', 'Team Lead']}>
                  <AuditSettingsPage />
                </RoleGuard>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
