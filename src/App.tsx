import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';

import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ReportFormScreen } from './components/screens/ReportFormScreen';
import { MyReportsScreen } from './components/screens/MyReportsScreen';
import { NearbyScreen } from './components/screens/NearbyScreen';
import { VolunteerDashboard } from './components/screens/VolunteerDashboard';
import { CoordinatorDashboard } from './components/screens/CoordinatorDashboard';
import { ReportDetailsScreen } from './components/screens/ReportDetailsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { MapFallbackScreen } from './components/screens/MapFallbackScreen';

const MainContent: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean>(() => {
    return localStorage.getItem('dcb_onboarding_completed') === 'true';
  });

  if (!isOnboardingDone) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem('dcb_onboarding_completed', 'true');
          setIsOnboardingDone(true);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      <Header />
      
      <main>
        {activeScreen === 'home' && <HomeScreen />}
        {activeScreen === 'report_form' && <ReportFormScreen />}
        {activeScreen === 'my_reports' && <MyReportsScreen />}
        {activeScreen === 'nearby' && <NearbyScreen />}
        {activeScreen === 'volunteer_dash' && <VolunteerDashboard />}
        {activeScreen === 'coordinator_dash' && <CoordinatorDashboard />}
        {activeScreen === 'report_details' && <ReportDetailsScreen onBack={() => setActiveScreen('my_reports')} />}
        {activeScreen === 'map_fallback' && <MapFallbackScreen />}
        {activeScreen === 'settings' && <SettingsScreen />}
      </main>

      <Navigation />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
