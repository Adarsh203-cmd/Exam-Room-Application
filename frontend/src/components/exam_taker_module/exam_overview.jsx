import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExamOverview = () => {
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamInfo = async () => {
      const examToken = localStorage.getItem("examToken");
      const accessToken = localStorage.getItem("accessToken");

      if (!examToken || !accessToken) {
        setError("Authentication failed. Please login again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching exam data with token:", examToken);
        
        // First, get exam timing info which marks the exam as started
        const examResponse = await axios.get(
          `http://127.0.0.1:8000/api/exam-view/start-exam/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              // Include exam_token in headers since this is a GET request
            },
            params: {
              exam_token: examToken
            }
          }
        );
        
        console.log("Start exam response:", examResponse.data);

        // Then, fetch questions to get exam details
        const questionsResponse = await axios.get(
          `http://127.0.0.1:8000/api/exam-view/fetch-questions/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              exam_token: examToken
            }
          }
        );
        
        console.log("Questions response:", questionsResponse.data);

        // Calculate start and end time
        const startTime = new Date(examResponse.data.start_time);
        const durationMinutes = examResponse.data.duration_minutes;
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        // Format dates for display
        const formatDate = (date) => {
          return date.toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric',
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
          });
        };

        setExamInfo({
          title: questionsResponse.data.exam_title || 'Exam',
          instructions: questionsResponse.data.instructions || 'No specific instructions provided.',
          startTime: formatDate(startTime),
          endTime: formatDate(endTime),
          duration: `${durationMinutes} minutes`,
          totalQuestions: questionsResponse.data.questions.length,
          attemptId: examResponse.data.attempt_id || ""
        });
        
        // Store attempt ID in localStorage for exam submission
        if (examResponse.data.attempt_id) {
          localStorage.setItem("attemptId", examResponse.data.attempt_id);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch exam info:", err);
        setError("Failed to load exam information. " + 
                 (err.response?.data?.message || err.message));
        setLoading(false);
        
        // Redirect to login if unauthorized
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchExamInfo();
  }, [navigate]);

  const handleStartExam = () => {
    navigate('/exam');
  };

  // Button styles
  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '20px',
    width: '100%',
    maxWidth: '200px'
  };

  const buttonHoverStyle = {
    backgroundColor: '#0056b3'
  };

  if (loading) return <div className="exam-overview-container">Loading exam information...</div>;
  if (error) return <div className="exam-overview-container error">{error}</div>;

  return (
    <div className="exam-overview-container">
      <div className="exam-overview-card">
        <h1>Exam Overview</h1>
        <h2>{examInfo.title}</h2>
        
        <table className="exam-table">
          <tbody>
            <tr><td><strong>Start Time:</strong></td><td>{examInfo.startTime}</td></tr>
            <tr><td><strong>End Time:</strong></td><td>{examInfo.endTime}</td></tr>
            <tr><td><strong>Duration:</strong></td><td>{examInfo.duration}</td></tr>
            <tr><td><strong>Total Questions:</strong></td><td>{examInfo.totalQuestions}</td></tr>
          </tbody>
        </table>

        <div className="exam-instructions">
          <h3>Instructions:</h3>
          <div className="instruction-content">
            {examInfo.instructions}
          </div>
          
          <div className="general-instructions">
            <h4>General Guidelines:</h4>
            <ul>
              <li>Once you start the exam, the timer cannot be paused.</li>
              <li>Do not refresh or close the browser window during the exam.</li>
              <li>Your answers are saved automatically when you move to another question.</li>
              <li>You can flag questions to review them later.</li>
              <li>The exam will be automatically submitted when the time expires.</li>
            </ul>
          </div>
        </div>

        <button 
          style={buttonStyle}
          onClick={handleStartExam}
          onMouseOver={(e) => e.target.style.backgroundColor = buttonHoverStyle.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = buttonStyle.backgroundColor}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default ExamOverview;