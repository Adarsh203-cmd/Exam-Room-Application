import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserForm from './UserForm';

const SignupForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e, formData) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/candidate/send-otp/', {
        email: formData.email,
      });

      if (response.status === 200) {
        // Store the form data temporarily (optional: in localStorage or context)
        localStorage.setItem("userData", JSON.stringify(formData));
        navigate('/otp-verification');
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
<<<<<<< HEAD
      showAddress = {true}
      showPincodeCity = {true}
      showDesignation={false}
=======
>>>>>>> main
      buttonLabel="Signup"
      handleSubmit={handleSubmit}
    />
  );
};

export default SignupForm;
