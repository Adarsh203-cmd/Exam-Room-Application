// src/EmployeeProfileForm.jsx
import React from 'react';
import "../../styles/register_module_css/App.css";

const CandidateProfileForm = () => {
  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>Profile</h1>
        <p>
          Manage your employee profile here. Only selected fields are editable.
        </p>
      </div>

      <div className="signup-form outlined-form">
        <h2>Employee Profile</h2>
        <form>
          <div className="input-row">
            <label>Employee ID:</label>
            <input type="text" value="EMP12345" readOnly />
          </div>

          <div className="input-row ">
            <label>First Name:</label>
            <input type="text" value="John" readOnly />
         </div> 
         <div className="input-row ">
            <label>Last Name:</label>
            <input type="text" value="Doe" readOnly />
          </div>

          <div className="input-row">
            <label>Phone Number:</label>
            <input type="text" value="9876543210" readOnly />
          </div>

          <div className="input-row">
            <label>Email:</label>
            <input type="email" defaultValue="john.doe@example.com" />
          </div>

          <div className="input-row">
            <label>Gender:</label>
            <input type="text" value="Male" readOnly />
          </div>

          <div className="input-row">
            <label>Date of Birth:</label>
            <input type="text" value="1990-01-01" readOnly />
          </div>

          <div className="input-row">
            <label>Address:</label>
            <textarea defaultValue="123 Main Street, City" rows="3" />
          </div>

          <div className="input-row">
            <label>Pincode:</label>
            <input type="text" value="123456" readOnly />
          </div>  
          <div className="input-row ">
            <label>City:</label>
            <input type="text" value="New York" readOnly />
          </div>

          <div className="input-row">
            <label>Aadhar Card No.:</label>
            <input type="text" value="1234-5678-9012" readOnly />
          </div>

          <div className="input-row">
            <label>Designation:</label>
            <input type="text" value="Software Engineer" readOnly />
          </div>

          <div className="input-row">
            <label>Qualification:</label>
            <input type="text" value="B.Tech" readOnly />
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="submit">Modify</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateProfileForm;
