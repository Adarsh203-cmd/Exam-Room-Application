// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/register_module_css/Nav.css"; // Custom styles for vertical navbar

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication tokens and role
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    // Redirect to login page
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sidebar">
      <h2 className="logo">Elogixa</h2>
      <div className="nav-links">
        <Link to="/employee">Internal Registration</Link>
        <Link to="/signup">External Registration</Link>
        <Link to="/candidate-profile">Manage Profile</Link>
        <Link to="/exam-overview">Exam Overview</Link>
        <Link to="/login">Login</Link>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
