import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const role = localStorage.getItem("role");
      const examToken = localStorage.getItem("examToken");

      // No token, not authenticated
      if (!accessToken) {
        console.log("No access token found");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if role matches allowed role
      if (Array.isArray(allowedRole)) {
        if (!allowedRole.includes(role)) {
          console.log(
            `Access denied: User role ${role} not in allowed roles [${allowedRole.join(
              ", "
            )}]`
          );
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
      } else if (allowedRole !== role && allowedRole !== "*") {
        console.log(
          `Access denied: User role ${role} doesn't match required role ${allowedRole}`
        );
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Check if this is an exam session (both internal and external candidates can take exams)
        if (examToken && (role === "external" || role === "internal")) {
          // For exam takers, verify by fetching exam questions
          await apiClient.get(
            `/api/exam-view/fetch-questions/?exam_token=${examToken}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } else {
          // For other users or non-exam sessions, verify their profile
          await apiClient.get("/api/candidate/profile/", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        // If the request succeeded, token is valid
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.log("Authentication failed:", error.message);

        // Clear all authentication data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("examToken");
        localStorage.removeItem("attemptId");
        localStorage.removeItem("candidateId");

        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    verifyAuthentication();
  }, [allowedRole]);

  if (loading) {
    return <div className="loading-auth">Authenticating...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
