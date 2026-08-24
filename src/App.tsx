import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ConfigBanner } from './components/common/ConfigBanner';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { FinancePage } from './pages/FinancePage';
import { PastoralPage } from './pages/PastoralPage';
import { TrainingPage } from './pages/TrainingPage';
import { MediaPage } from './pages/MediaPage';
import { EventsPage } from './pages/EventsPage';
import { AuditPage } from './pages/AuditPage';
import { SupabaseConfigPage } from './pages/SupabaseConfigPage';
import { AuthPage } from './pages/AuthPage';

// Modals
import { RegisterChurchModal } from './components/modals/RegisterChurchModal';
import { MemberModal } from './components/modals/MemberModal';
import { FinanceTransactionModal } from './components/modals/FinanceTransactionModal';
import { AttendanceModal } from './components/modals/AttendanceModal';
import { PastoralRecordModal } from './components/modals/PastoralRecordModal';
import { SqlScriptModal } from './components/modals/SqlScriptModal';
import { QuickActionFloatingButton } from './components/layout/QuickActionFloatingButton';
import { Member } from './types';

const MainAppContent: React.FC = () => {
  const { user, isDemoMode, churchId } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [showRegisterChurchModal, setShowRegisterChurchModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPastoralModal, setShowPastoralModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Key to force refresh after save
  const [refreshKey, setRefreshKey] = useState(0);
  const handleDataSaved = () => setRefreshKey(prev => prev + 1);

  // If user is not authenticated and not in demo mode, show AuthPage
  if (!user && !isDemoMode) {
    return <AuthPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleEditMember = (member: Member) => {
    setMemberToEdit(member);
    setShowMemberModal(true);
  };

  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setShowMemberModal(true);
  };

  const handleOpenPastoralForMember = (member: Member) => {
    setShowPastoralModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Supabase Live/Demo Status Banner */}
      <ConfigBanner onOpenSqlModal={() => setShowSqlModal(true)} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegisterChurch={() => setShowRegisterChurchModal(true)}
        onOpenSqlModal={() => setShowSqlModal(true)}
      />

      {/* Body Layout: Sidebar + Main Views */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              setActiveTab={setActiveTab}
              onOpenAddMember={handleOpenAddMember}
              onOpenAddFinance={() => setShowFinanceModal(true)}
              onOpenAddAttendance={() => setShowAttendanceModal(true)}
              onOpenAddPastoral={() => setShowPastoralModal(true)}
            />
          )}

          {activeTab === 'members' && (
            <MembersPage
              key={refreshKey}
              onOpenAddMember={handleOpenAddMember}
              onEditMember={handleEditMember}
              onOpenPastoralForMember={handleOpenPastoralForMember}
            />
          )}

          {activeTab === 'departments' && <DepartmentsPage key={refreshKey} />}

          {activeTab === 'attendance' && (
            <AttendancePage
              key={refreshKey}
              onOpenAddAttendance={() => setShowAttendanceModal(true)}
            />
          )}

          {activeTab === 'finance' && (
            <FinancePage
              key={refreshKey}
              onOpenAddFinance={() => setShowFinanceModal(true)}
            />
          )}

          {activeTab === 'pastoral' && (
            <PastoralPage
              key={refreshKey}
              onOpenAddPastoral={() => setShowPastoralModal(true)}
            />
          )}

          {activeTab === 'training' && <TrainingPage key={refreshKey} />}

          {activeTab === 'media' && <MediaPage key={refreshKey} />}

          {activeTab === 'events' && <EventsPage key={refreshKey} />}

          {activeTab === 'audit' && <AuditPage key={refreshKey} />}

          {activeTab === 'config' && (
            <SupabaseConfigPage onOpenSqlModal={() => setShowSqlModal(true)} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <RegisterChurchModal
        isOpen={showRegisterChurchModal}
        onClose={() => setShowRegisterChurchModal(false)}
      />

      <MemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        memberToEdit={memberToEdit}
        onMemberSaved={handleDataSaved}
      />

      <FinanceTransactionModal
        isOpen={showFinanceModal}
        onClose={() => setShowFinanceModal(false)}
        onTransactionSaved={handleDataSaved}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onSessionSaved={handleDataSaved}
      />

      <PastoralRecordModal
        isOpen={showPastoralModal}
        onClose={() => setShowPastoralModal(false)}
        onRecordSaved={handleDataSaved}
      />

      <SqlScriptModal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
      />

      {/* Global Quick Action Floating Button */}
      <QuickActionFloatingButton
        onOpenAddAttendance={() => setShowAttendanceModal(true)}
        onOpenAddPastoral={() => setShowPastoralModal(true)}
        onOpenAddMember={handleOpenAddMember}
        onOpenAddFinance={() => setShowFinanceModal(true)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
