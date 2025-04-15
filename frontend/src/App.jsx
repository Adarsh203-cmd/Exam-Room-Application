// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/register_module/navbar';
import SignupForm from './components/register_module/signupform';
import EmployeeForm from './components/register_module/employeeform';
import LoginForm from './components/register_module/Login';
import CandidateProfileForm from './components/register_module/candidateprofileform';

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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
