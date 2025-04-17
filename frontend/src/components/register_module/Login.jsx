// src/components/register_module/Login.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/register_module_css/App.css'; // Existing styling

const LoginForm = () => {
  const navigate = useNavigate();

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
        <form>
          <input type="text" placeholder="UserID" required />
          <input type="password" placeholder="Password" required />

          {/* Forgot password link */}
          <div className="forgot-password-container">
            <span
              className="forgot-password-link"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
