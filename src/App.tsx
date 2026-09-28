import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { MaterialPassportPage } from './pages/MaterialPassportPage';
import { FeasibilityPage } from './pages/FeasibilityPage';
import { CandidateRoutesPage } from './pages/CandidateRoutesPage';
import { NetworkPage } from './pages/NetworkPage';
import { OptimizePage } from './pages/OptimizePage';
import { ImpactPage } from './pages/ImpactPage';
import { ResiliencePage } from './pages/ResiliencePage';
import { DecisionCenterPage } from './pages/DecisionCenterPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Landing / Login Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Core Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialPassportPage />} />
          <Route path="/feasibility" element={<FeasibilityPage />} />
          <Route path="/routes" element={<CandidateRoutesPage />} />
          <Route path="/network" element={<NetworkPage />} />

          {/* Decision & Optimization Modules */}
          <Route path="/optimize" element={<OptimizePage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/resilience" element={<ResiliencePage />} />
          <Route path="/decide" element={<DecisionCenterPage />} />

          {/* Reports & System */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
