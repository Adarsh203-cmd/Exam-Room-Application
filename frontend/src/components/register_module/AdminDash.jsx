import {
  FaChartBar,
  FaClipboardList,
  FaCog,
  FaUsers,
  FaUserTie,
  FaUpload,
  FaTasks
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/register_module_css/AdminDashboard.css";

const modules = [
  {
    name: "Internal Registration",
    icon: <FaUserTie />,
    path: "/employee",
    color: "#4F8A8B"
  },
  {
    name: "External Registration",
    icon: <FaUsers />,
    path: "/first-page",
    color: "#F9B248"
  },
  {
    name: "Manage Profile",
    icon: <FaClipboardList />,
    path: "/candidate-management",
    color: "#FF5959"
  },
  {
    name: "Create Exam",
    icon: <FaCog />,
    path: "/exams/create",
    color: "#38A169"
  },
  {
    name: "Report & Dashboard",
    icon: <FaChartBar />,
    path: "/report-dashboard",
    color: "#9D50BB"
  }
  ,
  {
    name: "upload questions",
    icon: <FaUpload />,
    path: "/mcq-create",
    color: "#9D50BB"
  }
  ,
  {
    name: "Manage questions",
    icon: <FaTasks />,
    path: "/manage-question",
    color: "#9D50BB"
  }
  // {
  //   name: "previous exam history",
  //   icon: <FaTasks />,
  //   path: "/HiringTest_Dashboard",
  //   color: "#9D50BB"
  // }
  
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-dashboard-bg">
      {/*  Removed extra Header here */}
      
      <main className="dashboard-main">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="dashboard-card-grid">
          {modules.map((mod) => (
            <div
              className="dashboard-card"
              key={mod.name}
              style={{ borderTop: `4px solid ${mod.color}` }}
              onClick={() => navigate(mod.path)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(mod.path);
              }}
              role="button"
              aria-label={`Go to ${mod.name}`}
            >
              <div
                className="dashboard-card-icon"
                style={{ color: mod.color }}
              >
                {mod.icon}
              </div>
              <div className="dashboard-card-title">{mod.name}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
