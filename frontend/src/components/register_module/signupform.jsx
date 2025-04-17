import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import UserForm from './UserForm';

const SignupForm = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload

    // Redirect to OTP verification page
    navigate('/otp-verification'); // Navigate to OTP page
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
      handleSubmit={handleSubmit} // Pass the handleSubmit function as a prop
    />
  );
};

export default SignupForm;


