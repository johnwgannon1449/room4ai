import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClassSetup from './pages/ClassSetup';
import TemplatePicker from './pages/TemplatePicker';
import LessonWizard from './pages/LessonWizard';
import QuickLesson from './pages/QuickLesson';
import TpeExplorer from './pages/TpeExplorer';
import TpeAnalysis from './pages/TpeAnalysis';
import { api } from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('room4ai_token');
    if (token) {
      api.getMe()
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem('room4ai_token'))
        .finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, []);

  function handleLogin(userData) { setUser(userData); }
  function handleLogout() { localStorage.removeItem('room4ai_token'); setUser(null); }
  function handleUserUpdate(userData) { setUser(userData); }

  if (initializing) return <SplashScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/class-setup/:id"
          element={user ? <ClassSetup user={user} onUpdate={handleUserUpdate} /> : <Navigate to="/login" replace />}
        />
        {/* Legacy /class-setup → /class-setup/new */}
        <Route path="/class-setup" element={<Navigate to="/class-setup/new" replace />} />
        <Route
          path="/templates"
          element={user ? <TemplatePicker user={user} onUpdate={handleUserUpdate} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/lesson/:id"
          element={user ? <LessonWizard user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/quick-lesson"
          element={user ? <QuickLesson user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tpe-explorer"
          element={user ? <TpeExplorer user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tpe-analysis"
          element={user ? <TpeAnalysis user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* Defaults */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
