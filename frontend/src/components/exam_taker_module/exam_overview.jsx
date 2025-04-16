// src/components/ExamOverview.jsx
import React from 'react';
import "../../styles/exam_taker_module_css/exam_overview.css";

const ExamOverview = ({ onStart }) => {
  return (
    <div className="exam-overview-container">
      <div className="exam-overview-card">
        <h2> Elogixa Examination 2025</h2>
        <table className="exam-table" role="table">
          <tbody>
            <tr role="row"><td><strong>Date:</strong></td><td>April 20, 2025</td></tr>
            <tr role="row"><td><strong>Time:</strong></td><td>2 Hours</td></tr>
            <tr role="row"><td><strong>Sections:</strong></td><td>2 (MCQ & Fill in the Blanks)</td></tr>
            <tr role="row"><td><strong>Total Questions:</strong></td><td>40</td></tr>
            <tr role="row"><td><strong>Mode:</strong></td><td>Online, Fullscreen Enabled</td></tr>
          </tbody>
        </table>

        <div className="exam-instructions">
          <h3> Instructions:</h3>
          <ul>
            <li>Do not refresh or close the window.</li>
            <li>Each section is timed separately.</li>
            <li>Once submitted, answers cannot be changed.</li>
            <li>Use the navigation panel to jump between questions.</li>
          </ul>
        </div>

        <button 
          className="proceed-btn" 
          onClick={onStart}
          aria-label="Start the exam"
        >
           Proceed to Exam
        </button>
      </div>
    </div>
  );
};

export default ExamOverview;
