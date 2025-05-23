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
          navigate(`/candidate-profile/${userID}`); // adjust route as needed
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2>Login to your Account</h2>
          <form onSubmit={handleLogin}>
            {/* Floating label select */}
            <div className="floating-label-group">
              <select
                id="loginType"
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
                required
                className="floating-label-input"
              >
                <option value="candidate">Candidate</option>
                <option value="admin">Admin</option>
              </select>
              <label htmlFor="loginType" className="floating-label">Login as</label>
            </div>

            {/* Floating label input for User ID / Email */}
            <div className="floating-label-group">
              <input
                id="userID"
                type="text"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                required
                className="floating-label-input"
                placeholder=" "
              />
              <label htmlFor="userID" className="floating-label">
                {loginType === "admin" ? "Admin Email" : "User ID"}
              </label>
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
              />
              <label htmlFor="password" className="floating-label">Password</label>
            </div>

            <div className="forgot-password-container">
              <span
                className="forgot-password-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <ThreeDots color="#00BFFF" height={50} width={50} />
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>    
  );
};
export default LoginForm;
