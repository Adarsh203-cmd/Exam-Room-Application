import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ExamComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any remaining exam-related data from localStorage
    localStorage.removeItem('examToken');
  }, []);

  const handleReturn = () => {
    navigate('/');
  };

  return (
    <div className="exam-complete-container">
      <div className="exam-complete-card">
        <h1>Exam Submitted</h1>
        <div className="success-icon">✅</div>
        <p>Your exam has been successfully submitted.</p>
        <p>Thank you for completing the exam.</p>
        
        <div className="next-steps">
          <h3>Next Steps</h3>
          <p>Your exam results will be processed and made available according to the institution's policy.</p>
          <p>You will be notified once the results are ready.</p>
        </div>
        
        <button className="return-btn" onClick={handleReturn}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ExamComplete;