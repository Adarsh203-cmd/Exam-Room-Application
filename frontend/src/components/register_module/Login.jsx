// src/Login.jsx
import React, { useState } from "react";
import "../../styles/register_module_css/App.css";
import axios from "axios";

const LoginForm = () => {
  const [loginType, setLoginType] = useState("candidate");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/candidate/login/", {
        login_type: loginType,
        identifier,
        password,
      });

      if (response.status === 200) {
        alert("Login successful!");

        // Redirect or store login info as needed
        console.log(response.data);
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data?.error || "Unknown error"));
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
            required
          >
            <option value="candidate">Candidate</option>
            <option value="admin">Admin</option>
          </select>

          {loginType === "admin" ? (
            <input
              type="email"
              placeholder="Admin Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          ) : (
            <input
              type="text"
              placeholder="Candidate User ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
