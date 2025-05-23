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
    <nav className="sidebar"style={{ width: '180px' }}>
      <h2 className="logo">Elogixa</h2>
      <div className="nav-links">
        <Link to="/employee">Internal Registration</Link>
        <Link to="/signup">External Registration</Link>
        <Link to="/candidate-profile">Manage Profile</Link>
        <Link to="/exam-overview">Exam Overview</Link>
        <Link to="/login">Login</Link>
        <Link to="/exam-overview">Examoverview</Link>
        <Link to="/exam-window">Examoverview</Link>
        <Link to="/create-exam">Create Exam</Link>
        <Link to="/exam-screen">ExamScreen</Link>
        <Link to="/ExamScreen">Exam screen</Link>
        <Link to="/Result">Exam Report</Link>
        <Link to="/Dashboard">Dashboard</Link>
        
        <Link to="/exams/create">Create Exam</Link>

        <Link to="/mcq-create">mcq page</Link>  
        <Link to="/fill-create">Fill blank page</Link>   
        <Link to="/report-dashboard">Report and Dashboard</Link>
        <Link to="/first-page">registration</Link>  
        <Link to="/admin-dash">Navigations</Link>

      
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
