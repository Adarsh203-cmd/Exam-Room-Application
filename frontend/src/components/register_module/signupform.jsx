import React from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from '../../config/api';
import UserForm from "./UserForm";

const SignupForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e, formData) => {
    e.preventDefault();

    try {
      const response = await apiClient.post("/api/candidate/send-otp/", {
        email: formData.email,
      });

      if (response.status === 200) {
        // Store the data temporarily
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...formData,
            user_type: "external", // Differentiate from internal
          })
        );
        navigate("/otp-verification");
      }
    } catch (error) {
      console.error("OTP sending failed", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <UserForm
      formTitle="Register Here"
      showDOB={true}
      showAddress={true}
      showPincodeCity={true}
      showAadhar={true}
      showQualification={true}
      showDesignation={false}
      buttonLabel="Signup"
      handleSubmit={handleSubmit}
    />
  );
};

export default SignupForm;
