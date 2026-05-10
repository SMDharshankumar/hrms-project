import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Importing components
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register'; 
import Performance from './Performance'; // NEW: Performance Management
import Onboarding from './Onboarding';   // NEW: From your folder
import ProfileView from './ProfileView'; // NEW: From your folder

function App() {
  // 🔍 ENHANCED DEBUGGING: Check all imports
  const components = { Login, Dashboard, Register, Performance, Onboarding, ProfileView };
  const missing = Object.entries(components).filter(([name, comp]) => !comp);

  if (missing.length > 0) {
    console.error("CRITICAL: Missing exports for:", missing.map(m => m[0]).join(", "));
    return (
      <div className="bg-slate-900 h-screen text-red-500 p-10 font-bold">
        Component Import Error: {missing.map(m => m[0]).join(", ")} is missing 'export default'.
      </div>
    );
  }

  return (
    <Router>
      <div className="App font-sans antialiased text-slate-200">
        <Suspense fallback={<div className="bg-slate-900 h-screen" />}>
          <Routes>
            {/* 1. Auth Gateways */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 2. Main Dashboard & PMS */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/performance" element={<Performance />} />
            
            {/* 3. Workforce Modules */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<ProfileView />} />

            {/* 4. Navigation Logic */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
