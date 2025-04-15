import React from 'react';
import UserForm from './UserForm';

const SignupForm = () => {
  return (
    <UserForm
      formTitle="Register Here"
      showDOB={true}
      showAadhar={true}
      showQualification={true}
      showDesignation={false}
      buttonLabel="Signup"
    />
  );
};

export default SignupForm;
