import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ActivatePage from './pages/ActivatePage';
import LoginPage from './pages/LoginPage';
import UserSessionsPage from './pages/UserSessionPage';
import './App.css';
import AdminRegisterCAUserPage from './pages/RegisterCAPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CertificateViewPage from './pages/CertificateViewPage';
import CsrFormPage from './pages/CsrFormPage';
import CertificateIssuePage from './pages/CertificateIssuePage';
import CsrViewPage from './pages/CsrViewPage';
import { isAuthenticated, mustChangePassword, hasRole } from './utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (mustChangePassword()) return <Navigate to="/change-password" replace />;
  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/" replace />;
  return children;
};

const MustChangePasswordRoute = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!mustChangePassword()) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-content">
        <Navbar />
        <Routes>
          {/* Guest only */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Must change password */}
          <Route path="/change-password" element={<MustChangePasswordRoute><ChangePasswordPage /></MustChangePasswordRoute>} />

          {/* Activate - dostupno svima */}
          <Route path="/activate" element={<ActivatePage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/my-sessions" element={<ProtectedRoute><UserSessionsPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><CertificateViewPage /></ProtectedRoute>} />
          <Route path="/csr-form" element={
            <ProtectedRoute requiredRole={["USER"]}>
              <CsrFormPage />
            </ProtectedRoute>
          } />

          <Route path="/issue-certificate" element={
            <ProtectedRoute requiredRoles={["CA_USER", "ADMIN"]}>
              <CertificateIssuePage />
            </ProtectedRoute>
          } />
          <Route path="/csr" element={
            <ProtectedRoute requiredRoles={["CA_USER", "ADMIN"]}>
              <CsrViewPage />
            </ProtectedRoute>
          } />
          <Route path="/register-ca" element={
            <ProtectedRoute requiredRoles={["ADMIN"]}>
              <AdminRegisterCAUserPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;