import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MediaManagerPage from './pages/MediaManagerPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MediaManagerPage />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <AppContent />
    </>
  );
}

export default App;