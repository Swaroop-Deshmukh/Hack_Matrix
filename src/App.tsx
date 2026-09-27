import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { MaterialPassportPage } from './pages/MaterialPassportPage';
import { FeasibilityPage } from './pages/FeasibilityPage';
import { NetworkPage } from './pages/NetworkPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Default Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Core Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialPassportPage />} />
          <Route path="/feasibility" element={<FeasibilityPage />} />
          <Route path="/network" element={<NetworkPage />} />

          {/* Phase 2 Placeholder Routes */}
          <Route 
            path="/optimize" 
            element={
              <PlaceholderPage 
                title="Linear Programming Allocation Engine" 
                moduleName="LP Optimization"
                description="Simplex / Interior-Point multi-objective optimization solver for optimal waste routing."
              />
            } 
          />
          <Route 
            path="/impact" 
            element={
              <PlaceholderPage 
                title="LCA Environmental Impact Analytics" 
                moduleName="Life-Cycle Assessment"
                description="Real-time CO2e, water footprint, and embodied energy calculation engine."
              />
            } 
          />
          <Route 
            path="/resilience" 
            element={
              <PlaceholderPage 
                title="Supply Chain & Disruption Resilience" 
                moduleName="Risk Analysis"
                description="Scenario testing for monsoon transport disruptions and seasonal plant shutdowns."
              />
            } 
          />
          <Route 
            path="/decide" 
            element={
              <PlaceholderPage 
                title="Circular Decision Recommendation Matrix" 
                moduleName="MCDA Engine"
                description="Multi-criteria decision analysis prioritizing ROI, environmental impact, and speed."
              />
            } 
          />

          {/* System Routes */}
          <Route 
            path="/methodology" 
            element={
              <PlaceholderPage 
                title="Scientific Screening Methodology" 
                moduleName="ISO 14040 / IS 3812"
                description="Standards reference documentation and technical screening algorithm specifications."
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PlaceholderPage 
                title="System & Cluster Configuration" 
                moduleName="Platform Admin"
                description="Configure cluster threshold limits, freight rates, and lab certification parameters."
              />
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
