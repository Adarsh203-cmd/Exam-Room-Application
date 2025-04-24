import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner'; // Import the loader
import '../../styles/register_module_css/App.css';

const LoginForm = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('candidate'); // default
  const [isLoading, setIsLoading] = useState(false); // state to control loading spinner
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loading spinner while processing

    try {
      console.log("Login payload:", {
        login_type: loginType,
        user_id: userID,
        password: password,
      });
      const response = await axios.post('http://127.0.0.1:8000/api/candidate/login/', {
        login_type: loginType,    // 'internal' or 'external'
        user_id: userID,          // NOT email
        password: password,
      });

      if (response.status === 200) {
        const { access, refresh, role } = response.data;
        // Log to verify
        console.log("Access Token:", access);
        console.log("Role:", role);
        // Store role in localStorage
        // Save tokens and role
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userID);

        if (role === 'admin') {
          alert("Admin login successful!");
          navigate('/dashboard');
        } else {
          alert("Candidate login successful!");
          navigate('/candidate-profile'); // adjust route as needed
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Try again.");
    } finally {
      setIsLoading(false); // Hide loading spinner after processing
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>
          Welcome to <br />
          <span>Elogixa Technology India Pvt Ltd</span>
        </h1>
      </div>

      <div className="signup-form outlined-form">
        <h2>Login to your Account</h2>
        <form onSubmit={handleLogin}>
          <select
            value={loginType}
            onChange={(e) => setLoginType(e.target.value)}
            style={{ marginBottom: '10px', padding: '8px', borderRadius: '5px' }}
          >
            <option value="candidate">Candidate</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="text"
            placeholder={loginType === "admin" ? "Admin Email" : "User ID"}
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
  );
};

export default LoginForm;
