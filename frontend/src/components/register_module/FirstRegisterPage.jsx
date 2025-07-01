import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';

const FirstRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: '',
    dob: '',
    user_type: 'external'  
  });

  const handleSubmit = (e, formData) => {
    e.preventDefault();
    localStorage.setItem("userData", JSON.stringify(formData));
    navigate('/second-page');
  };

  

  return (
    <UserForm
      formTitle="Register Here"
      showDOB={true}
      showAddress={false}
      showPincodeCity={false}
      showAadhar={false}
      showQualification={false}
      showDesignation={false}
      buttonLabel="Next"
      handleSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
    />
  );
};

export default FirstRegisterPage;
