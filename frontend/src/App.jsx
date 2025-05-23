// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CandidateProfileWrapper from './components/register_module/CandidateProfileWrapper';
import Dashboard from './components/register_module/Dashboard';

// Employee registration Form 
import EmployeeForm from './components/register_module/employeeform';
import ForgotPassword from './components/register_module/forgotpassword';
import LoginForm from './components/register_module/Login';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import OtpVerification from './components/register_module/otpverification';
import CreateExam from './components/create_exam_module/CreateExam';
import ExamScreen from './components/exam_taker_module/Examscreen';
import SignupForm from './components/register_module/signupform';
import Report_Dashboard from './components/Dashboard_module/Report_Dashboard';

// ProtectedRoute wrapper
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Exam Content Module
import FillInTheBlankCreatePage from './components/exam_content_module/FillInTheBlankCreatePage';
import MCQCreatePage from './components/exam_content_module/MCQCreatePage';

// Exam Allotment Module
import CreateExamForm from './components/exam_allotment_module/CreateExamForm';
import CandidateSelectionPage from './components/exam_allotment_module/CandidateSelectionPage';

// 2-step register page 
import FirstRegisterPage from './components/register_module/FirstRegisterPage';
import SecondRegisterPage from './components/register_module/SeconRegisterPage';

// Admin dashboard
import AdminDash from './components/register_module/AdminDash';

// ✅ Import your Header component
import Header from './components/header_module/header';

const AppContent = () => {
  return (
    <>
      {/* ✅ Always show Header */}
      <Header />

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
          <Route path="/exam-screen" element={<ExamScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/first-page" element={<FirstRegisterPage />} />
          <Route path="/second-page" element={<SecondRegisterPage />} />
          <Route path="/admin-dash" element={<AdminDash />} />

          {/* Candidate Profile (protected) */}
          <Route
            path="/candidate-profile/:userId"
            element={
              <ProtectedRoute allowedRole={['internal', 'external']}>
                <CandidateProfileWrapper />
              </ProtectedRoute>
            }
          />

          {/* Exam Content Creation */}
          <Route path="/mcq-create" element={<MCQCreatePage />} />
          <Route path="/fill-create" element={<FillInTheBlankCreatePage />} />

          {/* Exam Allotment */}
          <Route path="/exams/create" element={<CreateExamForm />} />
          <Route path="/select-candidates/:examToken" element={<CandidateSelectionPage />} />

          {/* Report and Dashboard */}
          <Route path="/report-dashboard" element={<Report_Dashboard />} />

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
