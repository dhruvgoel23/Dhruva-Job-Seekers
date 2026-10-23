import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/common/DeviceFrame';
import { HomeFeed } from './components/seeker/HomeFeed';
import { JobSearch } from './components/seeker/JobSearch';
import { ApplicationsTracker } from './components/seeker/ApplicationsTracker';
import { MessagesView } from './components/seeker/MessagesView';
import { ProfileView } from './components/seeker/ProfileView';
import { BottomTabBar } from './components/seeker/BottomTabBar';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { BiometricLivenessModal } from './components/verification/BiometricLivenessModal';
import { ResumeUploader } from './components/seeker/ResumeUploader';
import { ResumeBuilderModal } from './components/seeker/ResumeBuilderModal';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { CoverLetterModal } from './components/seeker/CoverLetterModal';
import { JobAlertModal } from './components/seeker/JobAlertModal';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

const AppContent: React.FC = () => {
  const { viewportMode, currentRole, activeTab } = useApp();
  
  // Enable system-wide keyboard navigation (1-5 for tabs, Space for JobSearch filter panel)
  useKeyboardNavigation();

  return (
    <DeviceFrame>
      {viewportMode === 'desktop_company' || currentRole === 'company' ? (
        <CompanyDashboard />
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Active mobile tab */}
          {activeTab === 'home' && <HomeFeed />}
          {activeTab === 'search' && <JobSearch />}
          {activeTab === 'applications' && <ApplicationsTracker />}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'profile' && <ProfileView />}

          {/* Sticky Apple Bottom Tab Bar */}
          <BottomTabBar />
        </div>
      )}

      {/* Global Modals */}
      <AuthModal />
      <BiometricLivenessModal />
      <ResumeUploader />
      <ResumeBuilderModal />
      <NotificationCenter />
      <CoverLetterModal />
      <JobAlertModal />
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
