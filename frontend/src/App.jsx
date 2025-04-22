import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExamAllotmentForm from './components/exam_allotment_module/ExamAllotmentForm';
import ExamDashboard from './components/exam_allotment_module/ExamDashboard';
import CreateExamForm from './components/exam_allotment_module/CreateExamForm';
import './styles/exam_allotment_css/App.css';
import './styles/exam_allotment_css/index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExamAllotmentForm />} />
        <Route path="/dashboard" element={<ExamDashboard />} />
        <Route path="/create-exam" element={<CreateExamForm />} />
      </Routes>
    </Router>
  );
};

export default App;