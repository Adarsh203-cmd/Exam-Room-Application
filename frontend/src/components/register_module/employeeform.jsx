import React from 'react';
import UserForm from './UserForm';
import "../../styles/register_module_css/App.css";

const EmployeeForm = () => {
  return (
    <UserForm
      formTitle="Employee Registration"
      showDesignation={true}
      showEmployeeId={true}
      buttonLabel="Register Employee"
    />
  );
};

export default EmployeeForm;
