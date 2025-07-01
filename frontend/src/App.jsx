// frontend/src/App.jsx
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import CandidateProfileWrapper from './components/register_module/CandidateProfileWrapper';
import Dashboard from './components/register_module/Dashboard';

// Employee registration Form 
import CreateExam from './components/create_exam_module/CreateExam';
import Report_Dashboard from './components/exam_evaluation/Report_dashboard';
import ExamScreen from './components/exam_taker_module/Examscreen';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import EmployeeForm from './components/register_module/employeeform';
import ForgotPassword from './components/register_module/forgotpassword';
import LoginForm from './components/register_module/Login';
import OtpVerification from './components/register_module/otpverification';
import SignupForm from './components/register_module/signupform';
import Candidate_Management from './components/register_module/Candidate_Management';

import ExamLogin from './components/exam_taker_module/ExamLogin';
import ExamOverview from './components/exam_taker_module/exam_overview';
import ExamComplete from './components/exam_taker_module/ExamComplete';

// ProtectedRoute wrapper
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
// Admin ProtectedRoute wrapper
import AdminProtectedRoute from './components/ProtectedRoute/AdminProtectedRoute';

// === Exam Content Module ===
import MCQCreatePage from './components/exam_content_module/MCQCreatePage';
import Managequestion from './components/exam_content_module/QuestionManager';

// Exam Allotment Module
import CandidateSelectionPage from './components/exam_allotment_module/CandidateSelectionPage';
import CreateExamForm from './components/exam_allotment_module/CreateExamForm';

// 2-step register page 
import FirstRegisterPage from './components/register_module/FirstRegisterPage';
import SecondRegisterPage from './components/register_module/SeconRegisterPage';

// Admin dashboard
import AdminDash from './components/register_module/AdminDash';
import HiringTest_Dashboard from './components/Dashboard_module/HiringTest_Dashboard';

// ✅ Import your Header component
import Header from './components/header_module/header';

const AppContent = () => {
  const location = useLocation();
  
  // ✅ Define routes where Header should NOT be shown (exam taker module routes)
  const hideHeaderRoutes = [
    '/exam-overview',
    '/exam',
    '/exam-complete'
  ];
  
  // ✅ Check if current route should hide header
  // Also check for dynamic routes like /login/:token
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) || 
                          location.pathname.startsWith('/login/');

  return (
    <>
      {/* ✅ Conditionally show Header */}
      {!shouldHideHeader && <Header />}

      {/* ✅ Main Content Area */}
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Public / Authentication */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/candidate-profile" element={<CandidateProfileForm />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/first-page" element={<FirstRegisterPage />} />
          <Route path="/second-page" element={<SecondRegisterPage />} />
          
          {/* 🔒 PROTECTED: Admin Dashboard - Only accessible to authenticated admins */}
          <Route 
            path="/admin-dash" 
            element={
              <AdminProtectedRoute>
                <AdminDash />
              </AdminProtectedRoute>
            } 
          />

          {/* Candidate Profile (protected) */}
          <Route
            path="/candidate-profile/:userId"
            element={
              <ProtectedRoute allowedRole={['internal', 'external']}>
                <CandidateProfileWrapper />
              </ProtectedRoute>
            }
          />
          <Route path="/candidate-management" element={<Candidate_Management />} />

          {/* Exam Content Creation */}
          <Route path="/mcq-create" element={<MCQCreatePage />} />
          <Route path="/manage-question" element={<Managequestion />} />

          {/* Exam Allotment */}
          <Route path="/exams/create" element={<CreateExamForm />} />
          
          <Route path="/select-candidates/:examToken" element={<CandidateSelectionPage />} />

          {/* Exam Taker Module - Header will be hidden for these routes */}
          {/* Exam-specific login route */}
          <Route path="/login/:token" element={<ExamLogin />} />

          {/* Exam Overview - Protected route for exam takers */}
          <Route 
            path="/exam-overview" 
            element={
              <ProtectedRoute allowedRole={['internal', 'external']}>
                <ExamOverview />
              </ProtectedRoute>
            } 
          />

          {/* ✅ FIXED: Main Exam Screen - Protected route that uses ExamScreen instead of ExamPage */}
          <Route 
            path="/exam" 
            element={
              <ProtectedRoute allowedRole={['internal', 'external']}>
                <ExamScreen />
              </ProtectedRoute>
            } 
          />
          <Route path="/exam-complete" element={<ExamComplete />} />

          {/* Report and Dashboard */}
          <Route path="/report-dashboard" element={<Report_Dashboard />} />
          <Route path="/HiringTest_Dashboard" element={<HiringTest_Dashboard />} />

          {/* Fallback route for undefined paths */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: 'center', padding: '80px' }}>
                <h2 style={{ fontSize: '24px' }}>404 - Page Not Found</h2>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;