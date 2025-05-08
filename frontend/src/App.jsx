import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/register_module/navbar';
import SignupForm from './components/register_module/signupform';
import EmployeeForm from './components/register_module/employeeform';
import LoginForm from './components/register_module/Login';
import CandidateProfileForm from './components/register_module/candidateprofileform';
import OtpVerification from './components/register_module/otpverification';
import ForgotPassword from './components/register_module/forgotpassword';
import CreateExam from './components/create_exam_module/CreateExam';
import ExamScreen from './components/exam_taker_module/Examscreen';
import Dashboard from './components/Dashboard_module/Dashboard';
import Popup from './components/Dashboard_module/Popup';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/exam-overview', '/exam-window', '/exam-screen'];

  return (
    <>
      {/* Navbar only visible on specified routes */}
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      
      {/* Apply margin if Navbar is visible */}
      <div style={!hideNavbarRoutes.includes(location.pathname) ? { marginLeft: '240px', padding: '20px' } : {}}>
        <Routes>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/employee" element={<EmployeeForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/candidate-profile" element={<CandidateProfileForm />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/exam-screen" element={<ExamScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />

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
