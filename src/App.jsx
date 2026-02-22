import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import RegisterPage from './pages/RegisterPage';
import ActivatePage from './pages/ActivatePage';
import LoginPage from './pages/LoginPage';
import UserSessionsPage from './pages/UserSessionPage';
import './App.css'; // Globalni stilovi
import TestPage from './pages/TestPage';
import AdminRegisterCAUserPage from './pages/RegisterCAPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CertificateViewPage from './pages/CertificateViewPage';
import CsrFormPAge from './pages/CsrFormPage';
import CertificateIssuePage from './pages/CertificateIssuePage';
import CsrViewPage from './pages/CsrViewPage';
import PasswordManagerPage from './pages/PasswordManagerPage';

function App() {
  return (
    <Router>
      <div className="app-content">
        {/* Navbar je uvek prisutan */}
        <Navbar />

        {/* Ovde se menjaju stranice */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/subjects" element={<SubjectPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/activate" element={<ActivatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-sessions" element={<UserSessionsPage />} /> {/* Dodana ruta */}
          <Route path='/tests' element={<TestPage />} />
          <Route path='/register-ca' element={<AdminRegisterCAUserPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/certificates" element={<CertificateViewPage />} />
          <Route path="/csr-form" element={<CsrFormPAge />} />
          <Route path="/issue-certificate" element={<CertificateIssuePage />} />
          <Route path="/csr" element={<CsrViewPage />} />
          <Route path="/password-manager" element={<PasswordManagerPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;