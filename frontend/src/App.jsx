// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/register_module/navbar';
import SignupForm from './components/register_module/signupform';
import EmployeeForm from './components/register_module/employeeform';
import LoginForm from './components/register_module/Login';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import OtpVerification from './components/register_module/otpverification'; // 🔹 Import the OTP component
import ForgotPassword from './components/register_module/forgotpassword'; //
import ExamOverview from './components/exam_taker_module/exam_overview';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ marginLeft: '240px', padding: '20px' }}>
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/candidate-profile" element={<CandidateProfileForm />} />
          <Route path="/otp-verification" element={<OtpVerification />} /> {/* 🔹 Add this line */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/exam-overview" element={<ExamOverview />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
