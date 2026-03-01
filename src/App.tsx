import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { LeavePlanning } from "./pages/LeavePlanning";
import { Documents } from "./pages/Documents";
import { Login } from "./pages/Login";
import { SplashScreen } from "./components/SplashScreen";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('drh_token'));
  const [showSplash, setShowSplash] = useState<boolean>(!!localStorage.getItem('drh_token'));

  useEffect(() => {
    if (!isAuthenticated) {
      setShowSplash(false);
    }
  }, [isAuthenticated]);

  const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <>
      <Toaster position="bottom-center" richColors />

      {/* Écran de démarrage animé (uniquement si connecté) */}
      {showSplash && isAuthenticated && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Login onLogin={() => {
                setIsAuthenticated(true);
                setShowSplash(true);
              }} />
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout onLogout={() => {
                  setIsAuthenticated(false);
                  setShowSplash(false);
                }} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="leaves" element={<LeavePlanning />} />
            <Route path="documents" element={<Documents />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
