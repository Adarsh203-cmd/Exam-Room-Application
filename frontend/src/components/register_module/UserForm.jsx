import React, { useState } from 'react';
import "../../styles/register_module_css/App.css";
import { ThreeDots } from 'react-loader-spinner';

const UserForm = ({
  formTitle,
  showDOB = false,
  showAadhar = false,
  showDesignation = false,
  showQualification = false,
  showEmployeeId = false,
  showAddress = false,
  showPincodeCity = false,
  buttonLabel = "Register",
  handleSubmit
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    gender: '',
    dob: '',
    address: '',
    pin_code: '',
    city: '',
    aadhar_number: '',
    highest_qualification: '',
    employee_id: '',
    designation: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(e, formData);
    } catch (error) {
      console.error("Error during form submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>Welcome to <br /><span>Elogixa Technology India Pvt Ltd</span></h1>
      </div>

      <div className="signup-form outlined-form">
        <h2>{formTitle}</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="input-row">
            <input name="first_name" type="text" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
            <input name="last_name" type="text" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
          </div>

          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="phone_number" type="text" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required />

          <div className="gender-row">
            <label>Gender:</label>
            <div className="radio-group">
              <label><input type="radio" name="gender" value="Male" onChange={handleChange} /> Male</label>
              <label><input type="radio" name="gender" value="Female" onChange={handleChange} /> Female</label>
              <label><input type="radio" name="gender" value="Other" onChange={handleChange} /> Other</label>
            </div>
          </div>

          {showDOB && (
            <>
              <label>Date of Birth:</label>
              <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
            </>
          )}

          {showAddress && <textarea name="address" placeholder="Address" rows="3" value={formData.address} onChange={handleChange} required />}
          
          {showPincodeCity && (
            <div className="input-row">
              <input name="pin_code" type="text" placeholder="Pincode" value={formData.pin_code} onChange={handleChange} required />
              <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} required />
            </div>
          )}

          {showAadhar && <input name="aadhar_number" type="text" placeholder="Aadhar Card Number" value={formData.aadhar_number} onChange={handleChange} required />}
          {showEmployeeId && <input name="employee_id" type="text" placeholder="Employee ID" value={formData.employee_id} onChange={handleChange} required />}
          {showDesignation && <input name="designation" type="text" placeholder="Designation" value={formData.designation} onChange={handleChange} required />}

          {showQualification && (
            <>
              <label>Highest Qualification:</label>
              <select name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} required>
                <option value="">-- Select --</option>
                <option value="bca">BCA</option>
                <option value="mca">MCA</option>
                <option value="btech">B.Tech</option>
                <option value="be">BE</option>
                <option value="mtech">M.Tech</option>
              </select>
            </>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <ThreeDots color="#ffffff" height={20} width={40} />
            ) : (
              buttonLabel
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
