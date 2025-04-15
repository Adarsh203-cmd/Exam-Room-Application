// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../../styles/register_module_css/Nav.css";// Custom styles for vertical navbar

const Navbar = () => {
  return (
    <nav className="sidebar">
      <h2 className="logo">Elogixa</h2>
      <div className="nav-links">
        <Link to="/employee">Employee</Link>
        <Link to="/signup">Student</Link>
        <Link to="/candidate-profile">Candidate</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
