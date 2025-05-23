import React, { useState, useEffect } from 'react';
import "../../styles/register_module_css/App.css";
import { ThreeDots } from 'react-loader-spinner';
import FloatingInput from './FloatingInput';
import FloatingTextarea from './FloatingTextarea';

const initialFormData = {
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
};

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
  handleSubmit,
  formData,
  setFormData
}) => {
  // If formData/setFormData not provided, use internal state (for backward compatibility)
  const [internalFormData, setInternalFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Use external state if provided, otherwise internal
  const data = formData || internalFormData;
  const setData = setFormData || setInternalFormData;

  // Real-time validation function
  const validateField = (name, value) => {
    let error = "";
    if (!value) {
      error = "This field is required";
      return error;
    }
    switch (name) {
      case "first_name":
      case "last_name":
        if (!/^[A-Za-z]+$/.test(value)) {
          error = "Only alphabets are allowed";
        }
        break;
      case "email":
        if (!/^[\w.-]+@[\w.-]+\.(com)$/.test(value)) {
          error = "Enter a valid email (e.g. example@domain.com)";
        }
        break;
      case "phone_number":
        if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits";
        }
        break;
      case "pin_code":
        if (!/^\d{6}$/.test(value)) {
          error = "Pincode must be exactly 6 digits";
        }
        break;
      case "aadhar_number":
        if (!/^\d{12}$/.test(value)) {
          error = "Aadhar number must be exactly 12 digits";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Validate all fields (for submit)
  const validateAll = () => {
    const errors = {};
    Object.keys(data).forEach(field => {
      if (
        (field === "dob" && !showDOB) ||
        (field === "aadhar_number" && !showAadhar) ||
        (field === "designation" && !showDesignation) ||
        (field === "highest_qualification" && !showQualification) ||
        (field === "employee_id" && !showEmployeeId) ||
        (field === "address" && !showAddress) ||
        ((field === "pin_code" || field === "city") && !showPincodeCity)
      ) return;

      const error = validateField(field, data[field]);
      if (error) errors[field] = error;
    });
    setFormErrors(errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAll();
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      await handleSubmit(e, data);
    } catch (error) {
      console.error("Error during form submission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
<div className="elogixa-signup-wrapper">
  <div className="elogixa-signup-container">
    <div className="elogixa-signup-left">
      <img src="/src/assets/elogixa_logo1.png" alt="Elogixa Logo" className="elogixa-logo" />
      <div className="elogixa-welcome-center">
        <h1>
          Welcome to <br />
          <span className="elogixa-company">Elogixa Technology India Pvt Ltd</span>
        </h1>
        <p className="elogixa-tagline">Back to the roots</p>
      </div>
    </div>
        <div className="elogixa-signup-right">
      <div className="signup-form outlined-form">
        <h2>{formTitle}</h2>
        <form onSubmit={handleFormSubmit} noValidate>
          {("first_name" in data || "last_name" in data) && (
            <div className="input-row">
              {"first_name" in data && (
                <div style={{ flex: 1 }}>
                  <FloatingInput
                    label="First Name"
                    name="first_name"
                    value={data.first_name}
                    onChange={handleChange}
                    error={formErrors.first_name}
                    required
                  />
                </div>
              )}
              {"last_name" in data && (
                <div style={{ flex: 1 }}>
                  <FloatingInput
                    label="Last Name"
                    name="last_name"
                    value={data.last_name}
                    onChange={handleChange}
                    error={formErrors.last_name}
                    required
                  />
                </div>
              )}
            </div>
          )}
          {"email" in data && (
            <FloatingInput
              label="Email"
              name="email"
              value={data.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />
          )}
          {"phone_number" in data && (
            <FloatingInput
              label="Phone Number"
              name="phone_number"
              value={data.phone_number}
              onChange={handleChange}
              error={formErrors.phone_number}
              required
            />
          )}
          {"gender" in data && (
            <div className="gender-row">
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={data.gender === "Male"}
                    onChange={handleChange}
                    required
                  /> Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={data.gender === "Female"}
                    onChange={handleChange}
                    required
                  /> Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Other"
                    checked={data.gender === "Other"}
                    onChange={handleChange}
                    required
                  /> Other
                </label>
              </div>
              <div className="error-message">{formErrors.gender || "\u00A0"}</div>
            </div>
          )}
          {showDOB && (
            <FloatingInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={data.dob}
              onChange={handleChange}
              error={formErrors.dob}
              required
            />
          )}
          {showAddress && (
            <FloatingTextarea
              label="Address"
              name="address"
              value={data.address}
              onChange={handleChange}
              error={formErrors.address}
              required
            />
          )}
          {showPincodeCity && (
            <div className="input-row">
              <div style={{ flex: 1 }}>
                <FloatingInput
                  label="Pincode"
                  name="pin_code"
                  value={data.pin_code}
                  onChange={handleChange}
                  error={formErrors.pin_code}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FloatingInput
                  label="City"
                  name="city"
                  value={data.city}
                  onChange={handleChange}
                  error={formErrors.city}
                  required
                />
              </div>
            </div>
          )}
          {showAadhar && (
            <FloatingInput
              label="Aadhar Card Number"
              name="aadhar_number"
              value={data.aadhar_number}
              onChange={handleChange}
              error={formErrors.aadhar_number}
              required
            />
          )}
          {showEmployeeId && (
            <FloatingInput
              label="Employee ID"
              name="employee_id"
              value={data.employee_id}
              onChange={handleChange}
              error={formErrors.employee_id}
              required
            />
          )}
          {showDesignation && (
            <FloatingInput
              label="Designation"
              name="designation"
              value={data.designation}
              onChange={handleChange}
              error={formErrors.designation}
              required
            />
          )}
          {showQualification && (
            <div>
              <label>Highest Qualification:</label>
              <select
                name="highest_qualification"
                value={data.highest_qualification}
                onChange={handleChange}
                className={formErrors.highest_qualification ? "error" : ""}
                required
              >
                <option value="">-- Select --</option>
                <option value="bca">BCA</option>
                <option value="mca">MCA</option>
                <option value="btech">B.Tech</option>
                <option value="be">BE</option>
                <option value="mtech">M.Tech</option>
              </select>
              <div className="error-message">{formErrors.highest_qualification || "\u00A0"}</div>
            </div>
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
    </div>
   </div> 
  );
};

export default UserForm;
