import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import '../../styles/register_module_css/App.css';

const ExamLogin = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [examToken, setExamToken] = useState('');
  const [examDetails, setExamDetails] = useState(null);
  const [timeValidationError, setTimeValidationError] = useState('');
  const [isValidatingTime, setIsValidatingTime] = useState(true);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      setExamToken(token);
      console.log("Exam token from URL:", token);
      validateExamTiming(token);
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const validateExamTiming = async (examToken) => {
    try {
      setIsValidatingTime(true);
      
      // Fetch exam details by token
      const response = await axios.get(
        `http://localhost:8000/api/exam_allotment/exams/get_by_token/?token=${examToken}`
      );
      
      const exam = response.data;
      setExamDetails(exam);
      
      // Get current time in IST
      const now = new Date();
      
      // Parse exam times - ensure they're treated as IST
      const examStartTime = parseISTDateTime(exam.exam_start_time);
      const examEndTime = parseISTDateTime(exam.exam_end_time);
      
      // Calculate 15 minutes before exam start time
      const fifteenMinutesBeforeStart = new Date(examStartTime.getTime() - 15 * 60 * 1000);
      
      console.log('Time validation:', {
        now: now.toISOString(),
        nowIST: formatExamTimeIST(now.toISOString()),
        examStart: examStartTime.toISOString(),
        examStartIST: formatExamTimeIST(exam.exam_start_time),
        examEnd: examEndTime.toISOString(),
        examEndIST: formatExamTimeIST(exam.exam_end_time),
        fifteenMinsBefore: fifteenMinutesBeforeStart.toISOString()
      });
      
      // Check if current time is before the allowed login window (15 minutes before exam start)
      if (now < fifteenMinutesBeforeStart) {
        const timeUntilLogin = Math.ceil((fifteenMinutesBeforeStart - now) / (1000 * 60));
        setTimeValidationError(
          `Exam login is not yet available. You can login in ${timeUntilLogin} minutes.\n ` +
          `Exam starts at: ${formatExamTimeIST(exam.exam_start_time)}`
        );
        return;
      }
      
      // Check if current time is after exam end time
      if (now > examEndTime) {
        setTimeValidationError(
          `This exam has already ended. Exam ended at: ${formatExamTimeIST(exam.exam_end_time)}. ` +
          `Please contact the recruitment team if you believe this is an error.`
        );
        return;
      }
      
      // If we reach here, timing is valid
      setTimeValidationError('');
      
    } catch (error) {
      console.error("Error validating exam timing:", error);
      
      if (error.response?.status === 404) {
        setTimeValidationError("Invalid exam code. Please check your exam URL and try again.");
      } else {
        setTimeValidationError("Unable to verify exam timing. Please try again or contact support.");
      }
    } finally {
      setIsValidatingTime(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Re-validate timing before login attempt
    if (timeValidationError) {
      alert("Please resolve the timing issue before attempting to login.");
      return;
    }
    
    setIsLoading(true);

    if (!examToken) {
      alert("Invalid exam link. Please check your exam URL.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Exam login payload:", {
        user_id: userID,
        password: password,
        exam_token: examToken,
      });

      const response = await axios.post('http://127.0.0.1:8000/api/exam-view/exam-login/', {
        user_id: userID,
        password: password,
        exam_token: examToken,
      });

      if (response.status === 200) {
        const { access, refresh, candidate_id, role } = response.data;
        
        console.log("Exam login successful:", response.data);
        
        // Store authentication tokens and exam info
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("examToken", examToken);
        localStorage.setItem("candidateId", candidate_id);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userID);

        alert("Login successful! Redirecting to exam overview...");
        
        // Redirect to exam overview page
        navigate('/exam-overview');
      }
    } catch (error) {
      console.error("Exam login error:", error);
      const errorMessage = error.response?.data?.error || "Login failed. Please check your credentials and try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeValidationClass = () => {
    if (timeValidationError) {
      if (timeValidationError.includes('not yet available')) {
        return 'time-validation-early';
      } else if (timeValidationError.includes('already ended')) {
        return 'time-validation-expired';
      }
      return 'time-validation-error';
    }
    return '';
  };

  // ✅ FIXED: Handle IST datetime strings properly
  const parseISTDateTime = (dateTimeString) => {
    if (!dateTimeString) return new Date();
    
    console.log('Original datetime string:', dateTimeString);
    
    // Parse the datetime string directly - Django should be sending it with timezone info
    const date = new Date(dateTimeString);
    
    console.log('Parsed date object:', date);
    console.log('Date in UTC:', date.toISOString());
    console.log('Date in IST:', date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    
    return date;
  };

  // ✅ FIXED: Format datetime in IST without additional conversion
  const formatExamTimeIST = (dateTimeString) => {
  if (!dateTimeString) return '';

  // Get the correct time in IST from the UTC datetime
  const utcDate = new Date(dateTimeString);

  const istDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(utcDate);

  return istDate;
};

  // Keep the old function for backward compatibility
  const formatExamTime = (dateTimeString) => {
    return formatExamTimeIST(dateTimeString);
  };

  // Show loading while validating time
  if (isValidatingTime) {
    return (
      <div className="elogixa-signup-wrapper">
        <div className="elogixa-signup-container">
          <div className="elogixa-signup-left">
            <img src="/src/assets/elogixa_logo1.png" alt="Elogixa Logo" className="elogixa-logo" />
            <div className="elogixa-welcome-center">
              <h1>
                Welcome to <br />
                <span className="elogixa-company">Elogixa Technology India Pvt Ltd</span>
              </h1>
              <div className="elogixa-tagline">
                Your trusted partner in technology solutions.
              </div>
            </div>
          </div>
          <div className="elogixa-signup-right">
            <div className="signup-form outlined-form">
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <ThreeDots color="#00BFFF" height={50} width={50} />
                <h3 style={{ marginTop: '1rem', color: '#666' }}>Validating Exam Schedule...</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Please wait while we verify the exam timing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="elogixa-signup-wrapper">
      <div className="elogixa-signup-container">
        <div className="elogixa-signup-left">
          <img src="/src/assets/elogixa_logo1.png" alt="Elogixa Logo" className="elogixa-logo" />
          <div className="elogixa-welcome-center">
            <h1>
              Welcome to <br />
              <span className="elogixa-company">Elogixa Technology India Pvt Ltd</span>
            </h1>
            <div className="elogixa-tagline">
              Your trusted partner in technology solutions.
            </div>
          </div>
        </div>

        <div className="elogixa-signup-right">
          <div className="signup-form outlined-form">
            <h2>Exam Access Portal</h2>
            <p className="exam-login-subtitle">Please login to access your assigned exam</p>
            
            {/* Exam Details Display
            {examDetails && (
              <div className="exam-details-display" style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{examDetails.exam_title}</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#666' }}>
                  <strong>Start:</strong> {formatExamTime(examDetails.exam_start_time)}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#666' }}>
                  <strong>End:</strong> {formatExamTime(examDetails.exam_end_time)}
                </p>
                {examDetails.location && (
                  <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#666' }}>
                    <strong>Location:</strong> {examDetails.location}
                  </p>
                )}
              </div>
            )} */}
            
            {/* Time Validation Error Display */}
            {timeValidationError && (
              <div className={`time-validation-message ${getTimeValidationClass()}`} style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                backgroundColor: timeValidationError.includes('not yet available') ? '#fff3cd' : 
                                timeValidationError.includes('already ended') ? '#f8d7da' : '#f8d7da',
                border: timeValidationError.includes('not yet available') ? '1px solid #ffeaa7' : '1px solid #f5c6cb',
                color: timeValidationError.includes('not yet available') ? '#856404' : '#721c24'
              }}>
                <strong>
                  {timeValidationError.includes('not yet available') ? '⏰ Too Early' : 
                   timeValidationError.includes('already ended') ? '⏰ Exam Expired' : '❌ Access Denied'}
                </strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px' }}>{timeValidationError}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              {/* Display exam token for reference */}
              <div className="exam-token-display">
                <small>Exam Code: <strong>{examToken}</strong></small>
              </div>

              {/* Floating label input for User ID */}
              <div className="floating-label-group">
                <input
                  id="userID"
                  type="text"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  required
                  className="floating-label-input"
                  placeholder=" "
                  disabled={!!timeValidationError}
                />
                <label htmlFor="userID" className="floating-label">User ID</label>
              </div>

              {/* Floating label input for Password */}
              <div className="floating-label-group">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="floating-label-input"
                  placeholder=" "
                  disabled={!!timeValidationError}
                />
                <label htmlFor="password" className="floating-label">Password</label>
              </div>

              <div className="exam-login-info">
                <small>
                  <strong>Note:</strong> This login is specifically for your assigned exam. 
                  Use the credentials provided to you by the recruitment team.
                  {!timeValidationError && (
                    <span style={{ color: '#28a745', display: 'block', marginTop: '0.5rem' }}>
                      ✅ You can now access this exam.
                    </span>
                  )}
                </small>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !!timeValidationError}
                style={{
                  opacity: (isLoading || timeValidationError) ? 0.6 : 1,
                  cursor: (isLoading || timeValidationError) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <ThreeDots color="#00BFFF" height={50} width={50} />
                ) : (
                  timeValidationError ? 'Access Restricted' : 'Access Exam'
                )}
              </button>
            </form>

            <div className="exam-login-footer">
              <small>
                Having trouble accessing your exam? Please contact the recruitment team for assistance.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamLogin;