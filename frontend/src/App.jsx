// src/App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ExamOverview from './components/exam_taker_module/exam_overview';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import EmployeeForm from './components/register_module/employeeform';
import ForgotPassword from './components/register_module/forgotpassword'; //
import LoginForm from './components/register_module/Login';
import Navbar from './components/register_module/navbar';
import OtpVerification from './components/register_module/otpverification'; // 🔹 Import the OTP component
import SignupForm from './components/register_module/signupform';


// Exam Content Module
import FillInTheBlankCreatePage from './components/exam_content_module/FillInTheBlankCreatePage';
import MCQCreatePage from './components/exam_content_module/MCQCreatePage';
// ✅ MCQ Create Page




// New exam content components


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

          {/* Exam Content Routes */}
          <Route path="/mcq-create" element={<MCQCreatePage/> }/>
         
          <Route path="/fill-create" element={<FillInTheBlankCreatePage/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
