//Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import '../../styles/register_module_css/App.css';

const LoginForm = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [isExamTakerMode, setIsExamTakerMode] = useState(false);
  const [examToken, setExamToken] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract exam token from URL parameters
  useEffect(() => {
    // Check if URL contains exam token
    const pathParts = location.pathname.split('/');
    const tokenFromPath = pathParts[pathParts.length - 1];
    
    // Only set exam token mode if token looks valid (at least 6 chars)
    if (location.pathname.includes('/login/') && tokenFromPath.length >= 6) {
      console.log("Exam token detected:", tokenFromPath);
      setIsExamTakerMode(true);
      setExamToken(tokenFromPath);
      setLoginType('exam-taker');
    }
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isExamTakerMode) {
        console.log("Attempting exam login with token:", examToken);
        
        // Exam login
        const response = await axios.post('http://127.0.0.1:8000/api/exam-view/exam-login/', {
          user_id: userID,
          password: password,
          exam_token: examToken
        });

        const {
          access,
          refresh,
          role,
          exam_token,
          candidate_id,
          message
        } = response.data;

        // Store tokens and user data in localStorage
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userID);
        localStorage.setItem("examToken", exam_token);
        localStorage.setItem("candidateId", candidate_id);

        console.log("Login successful, redirecting to instructions");
        
        // Clear loading state
        setIsLoading(false);
        
        // Redirect to instructions page
        navigate('/instructions', { replace: true });
      } else {
        // General login
        const response = await axios.post('http://127.0.0.1:8000/api/candidate/login/', {
          login_type: loginType,
          user_id: userID,
          password: password,
        });

        const { access, refresh, role } = response.data;

        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userID);

        if (role === 'admin') {
          alert("Admin login successful!");
          navigate('/dashboard');
        } else {
          alert("Candidate login successful!");
          navigate('/candidate-profile');
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>{isExamTakerMode ? 'Exam Login' : 'Login'}</h2>
        
        {/* Show exam token if in exam mode */}
        {isExamTakerMode && (
          <div className="exam-token-display">
            Exam Token: <strong>{examToken}</strong>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="userID">User ID</label>
            <input
              type="text"
              id="userID"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isExamTakerMode && (
            <div className="form-group radio-group">
              <label>Login As:</label>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    value="candidate"
                    checked={loginType === 'candidate'}
                    onChange={() => setLoginType('candidate')}
                  />
                  Candidate
                </label>
                <label>
                  <input
                    type="radio"
                    value="admin"
                    checked={loginType === 'admin'}
                    onChange={() => setLoginType('admin')}
                  />
                  Admin
                </label>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          {!isExamTakerMode && (
            <div className="form-links">
              <a href="/forgot-password">Forgot Password?</a>
              <a href="/signup">Sign Up</a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default LoginForm;
