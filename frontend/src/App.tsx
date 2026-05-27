import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Candidate
import CandidateDashboard from './pages/candidate/DashboardPage';
import CandidateRequestDetail from './pages/candidate/RequestDetailPage';
import CandidateProfile from './pages/candidate/ProfilePage';
import CandidateHistory from './pages/candidate/HistoryPage';
import CandidateDisputes from './pages/candidate/DisputesPage';
import CandidateBlocked from './pages/candidate/BlockedPage';
import CandidateDocuments from './pages/candidate/DocumentsPage';
import CandidateNotifications from './pages/candidate/NotificationsPage';

// Employer
import EmployerDashboard from './pages/employer/DashboardPage';
import EmployerRequestDetail from './pages/employer/RequestDetailPage';
import EmployerBulkVerify from './pages/employer/BulkVerifyPage';

// Admin
import AdminDashboard from './pages/admin/DashboardPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminCompanies from './pages/admin/CompaniesPage';
import AdminDisputes from './pages/admin/DisputesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Candidate */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route element={<AppLayout />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/request/:id" element={<CandidateRequestDetail />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/history" element={<CandidateHistory />} />
            <Route path="/candidate/disputes" element={<CandidateDisputes />} />
            <Route path="/candidate/blocked" element={<CandidateBlocked />} />
            <Route path="/candidate/documents" element={<CandidateDocuments />} />
            <Route path="/candidate/notifications" element={<CandidateNotifications />} />
          </Route>
        </Route>

        {/* Employer */}
        <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
          <Route element={<AppLayout />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/request/:id" element={<EmployerRequestDetail />} />
            <Route path="/employer/bulk-verify" element={<EmployerBulkVerify />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
