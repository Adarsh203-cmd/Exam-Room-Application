// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/register_module/navbar';
import SignupForm from './components/register_module/signupform';
import EmployeeForm from './components/register_module/employeeform';
import LoginForm from './components/register_module/Login';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import OtpVerification from './components/register_module/otpverification';
import ForgotPassword from './components/register_module/forgotpassword';
import ExamOverview from './components/exam_taker_module/exam_overview';
import Dashboard from './components/register_module/Dashboard';
import CandidateProfileWrapper from './components/register_module/CandidateProfileWrapper';

// ✅ Import the ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ marginLeft: '240px', padding: '20px' }}>
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/candidate-profile"
            element={
            <ProtectedRoute allowedRole={["internal", "external"]}>
          <CandidateProfileWrapper />
          </ProtectedRoute> } />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/exam-overview" element={<ExamOverview />} />

          {/* ✅ Secure dashboard for admin only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
