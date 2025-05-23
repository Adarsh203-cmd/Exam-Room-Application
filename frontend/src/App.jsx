// frontend/src/App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Navbar from './components/register_module/navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// === Authentication & Public Pages ===
import LoginForm from './components/register_module/Login';
import SignupForm from './components/register_module/signupform';
import EmployeeForm from './components/register_module/employeeform';
import ForgotPassword from './components/register_module/forgotpassword';
import OtpVerification from './components/register_module/otpverification';

// === Exam Taker Module ===
import ExamOverview from './components/exam_taker_module/exam_overview';
import ExamScreen from './components/exam_taker_module/Examscreen';
import ExamComplete from './components/exam_taker_module/ExamComplete';
import CandidateProfileWrapper from './components/register_module/CandidateProfileWrapper';

// === Exam Content Module ===
import MCQCreatePage from './components/exam_content_module/MCQCreatePage';
import FillInTheBlankCreatePage from './components/exam_content_module/FillInTheBlankCreatePage';

// === Exam Allotment Module ===
import CreateExamForm from './components/exam_allotment_module/CreateExamForm';
import CandidateSelectionPage from './components/exam_allotment_module/CandidateSelectionPage';
import ScheduledExams from './components/exam_allotment_module/ScheduledExams';
import CompletedExams from './components/exam_allotment_module/CompletedExams';

// === Exam Evaluation Module ===
import Report_Dashboard from './components/exam_evaluation/Report_dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Exam route (Full screen without navbar) */}
        <Route
          path="/exam"
          element={
            <ProtectedRoute allowedRole={['internal', 'external']}>
              <ExamScreen />
            </ProtectedRoute>
          }
        />
        
        {/* All other routes include the navbar and padding */}
        <Route path="*" element={
          <>
            <Navbar />
            <div style={{ marginLeft: '240px', padding: '20px' }}>
              <Routes>
                {/* === Public Routes === */}
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/login/:examToken" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/employee" element={<EmployeeForm />} />
                <Route path="/otp-verification" element={<OtpVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/Result" element={<Report_Dashboard />} />

                {/* === Candidate Routes (Protected) === */}
                <Route
                  path="/candidate-profile"
                  element={
                    <ProtectedRoute allowedRole={['internal', 'external']}>
                      <CandidateProfileWrapper />
                    </ProtectedRoute>
                  }
                />
                
                {/* === Exam Taker Flow === */}
                <Route
                  path="/instructions"
                  element={
                    <ProtectedRoute allowedRole={['internal', 'external']}>
                      <ExamOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exam-complete"
                  element={
                    <ProtectedRoute allowedRole={['internal','external']}>
                      <ExamComplete />
                    </ProtectedRoute>
                  }
                />

                {/* === Exam Content Creation === */}
                <Route 
                  path="/mcq-create" 
                  element={
                    <ProtectedRoute allowedRole={['admin', 'staff']}>
                      <MCQCreatePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fill-create" 
                  element={
                    <ProtectedRoute allowedRole={['admin', 'staff']}>
                      <FillInTheBlankCreatePage />
                    </ProtectedRoute>
                  } 
                />

                {/* === Exam Allotment === */}
                <Route path="/exams/create" element={<CreateExamForm />} />
                <Route path="/select-candidates/:examToken" element={<CandidateSelectionPage />} />
                <Route path="/exams/scheduled" element={<ScheduledExams />} />
                <Route 
                  path="/exams/completed" 
                  element={
                    <ProtectedRoute allowedRole={['admin', 'staff']}>
                      <CompletedExams />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;