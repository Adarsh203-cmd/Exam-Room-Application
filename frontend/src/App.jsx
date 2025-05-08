// frontend/src/App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ExamOverview from './components/exam_taker_module/exam_overview';
import CandidateProfileWrapper from './components/register_module/CandidateProfileWrapper';
import Dashboard from './components/register_module/Dashboard';
import EmployeeForm from './components/register_module/employeeform';
import ForgotPassword from './components/register_module/forgotpassword';
import LoginForm from './components/register_module/Login';
import Navbar from './components/register_module/navbar';
import OtpVerification from './components/register_module/otpverification';
import SignupForm from './components/register_module/signupform';

// ProtectedRoute wrapper
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Exam Content Module
import FillInTheBlankCreatePage from './components/exam_content_module/FillInTheBlankCreatePage';
import MCQCreatePage from './components/exam_content_module/MCQCreatePage';

// Exam Allotment Module
import CreateExamForm from './components/exam_allotment_module/CreateExamForm';
import CandidateSelectionPage from './components/exam_allotment_module/CandidateSelectionPage';


const App = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ marginLeft: '240px', padding: '20px' }}>
        <Routes>
          {/* Public / Authentication */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/login/:token" element={<LoginForm />} />    
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Candidate Profile (protected) */}
          <Route
            path="/candidate-profile"
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

          {/* Exam Taker Overview */}
          <Route path="/exam-overview/:token" element={<ExamOverview />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
