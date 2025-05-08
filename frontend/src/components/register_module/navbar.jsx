// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/register_module_css/Nav.css"; // Custom styles for vertical navbar

const Navbar = () => {
  const navigate = useNavigate();
  const [showExamLinks, setShowExamLinks] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
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

        <Link to="/mcq-create">mcq page</Link>  
        <Link to="/fill-create">Fill blank page</Link> 
        <Link to="/exams/create">Create Exam</Link>

      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
