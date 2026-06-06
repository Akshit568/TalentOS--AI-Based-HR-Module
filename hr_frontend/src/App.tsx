import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import HRLayout from './pages/hr/HRLayout';
import Dashboard from './pages/hr/Dashboard';
import Jobs from './pages/hr/Jobs';
import ApplicationsForJob from './pages/hr/ApplicationsForJob';
import BulkScreening from './pages/hr/BulkScreening';
import CandidateLayout from './pages/candidate/CandidateLayout';
import MyApplications from './pages/candidate/MyApplications';
import UploadVideo from './pages/candidate/UploadVideo';
import Onboarding from './pages/candidate/Onboarding';
import BrowseJobs from './pages/candidate/BrowseJobs';

function ToastWrapper() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: dark ? '#1a1a1a' : '#ffffff',
          color:      dark ? '#eeeeee' : '#111111',
          border:     `1px solid ${dark ? '#2a2a2a' : '#e0e0e0'}`,
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: dark
            ? '0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(0,0,0,0.08)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: dark ? '#1a1a1a' : '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: dark ? '#1a1a1a' : '#fff' } },
      }}
    />
  );
}

function AppRoutes() {
  return (
    <>
      <ToastWrapper />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/hr"
          element={
            <PrivateRoute role="HR">
              <HRLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/hr/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId/applications" element={<ApplicationsForJob />} />
          <Route path="bulk-screening" element={<BulkScreening />} />
        </Route>

        <Route
          path="/candidate"
          element={
            <PrivateRoute role="Candidate">
              <CandidateLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/candidate/browse" replace />} />
          <Route path="browse" element={<BrowseJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="upload-video/:applicationId" element={<UploadVideo />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
