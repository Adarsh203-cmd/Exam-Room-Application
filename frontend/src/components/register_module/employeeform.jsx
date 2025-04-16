import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserForm from './UserForm';

const EmployeeForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e, formData) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/candidate/send-otp/', {
        email: formData.email,
      });

      if (response.status === 200) {
        // Store the data temporarily
        localStorage.setItem("userData", JSON.stringify({
          ...formData,
          user_type: "internal", // Differentiate from external
        }));
        navigate('/otp-verification');
      }
    } catch (error) {
      console.error("OTP sending failed", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <UserForm
      formTitle="Employee Registration"
      showEmployeeId={true}
      showDesignation={true}
      buttonLabel="Register"
      handleSubmit={handleSubmit}
    />
  );
};

export default EmployeeForm;
