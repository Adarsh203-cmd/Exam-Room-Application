// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../../styles/register_module_css/Nav.css";// Custom styles for vertical navbar

const Navbar = () => {
  return (
    <nav className="sidebar">
      <h2 className="logo">Elogixa</h2>
      <div className="nav-links">
        <Link to="/employee">Internal Registration</Link>
        <Link to="/signup">External Registration</Link>
        <Link to="/candidate-profile">Manage Profile</Link>
        <Link to="/login">Login</Link>
        <Link to="/exam-overview">Examoverview</Link>
        <Link to="/exam-window">Examoverview</Link>
        <Link to="/create-exam">Create Exam</Link>
        <Link to="/exam-screen">ExamScreen</Link>
        <Link to="/Dashboard">Dashboard</Link>
        
       
      </div>
    </nav>
  );
};

export default Navbar;
