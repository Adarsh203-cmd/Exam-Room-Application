// src/EmployeeForm.jsx
import React from 'react';
import "../../styles/register_module_css/App.css";
 // Keep your existing styling

const LoginForm = () => {
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
         

          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Phone Number" required />

          

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
