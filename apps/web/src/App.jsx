import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { TaskBoardPage } from './pages/TaskBoardPage.jsx';
import { EvidencePage } from './pages/EvidencePage.jsx';
import { SubmitContributionPage } from './pages/SubmitContributionPage.jsx';
import { GitHubActivityPage } from './pages/GitHubActivityPage.jsx';
import { FacultyWorkspacePage } from './pages/FacultyWorkspacePage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] dark:bg-[#101A15]">
        <div className="w-8 h-8 rounded-full border-2 border-[#15966A] dark:border-[#35B982] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Screens */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Authenticated Workspace Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TaskBoardPage />} />
                <Route path="evidence" element={<EvidencePage />} />
                <Route path="evidence/new" element={<SubmitContributionPage />} />
                <Route path="github" element={<GitHubActivityPage />} />
                <Route path="faculty" element={<FacultyWorkspacePage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
