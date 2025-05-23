import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaArrowLeft } from "react-icons/fa"; // <-- Import FaArrowLeft!
import "../../styles/header_module_css/header.css";

const Header = ({ handleLogout }) => {
  const navigate = useNavigate();

  return (
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

      <div className="header-actions">
        <button
          className="back-btn"
          onClick={() => navigate("/admin-dash")}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <FaArrowLeft />
        </button>
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
};

export default Header;
