import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import "../../styles/header_module_css/header.css";

const Header = () => {
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('examToken');
    localStorage.removeItem('candidateId');
    
    // Show logout message
    alert("Logged out successfully!");
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="header-wrapper">
      {/* Floating Buttons */}
      <div className="floating-buttons">
        <button
          className="floating-btn back-btn"
          onClick={() => navigate("/admin-dash")}
          title="Back to Dashboard"
        >
          <FaArrowLeft style={{ marginRight: 6 }} />
          Back
        </button>
        <button
          className="floating-btn logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt style={{ marginRight: 6 }} />
          Logout
        </button>
      </div>

      {/* Main Header */}
      <header className="admin-header">
        <div className="logo-and-name">
          <img
            src="/src/assets/elogixa_logo.png"
            alt="Elogixa Technology Logo"
            className="company-logo"
          />
          <div className="company-name">
            <h2>Elogixa Technology India Pvt Ltd</h2>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;