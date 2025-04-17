import React from 'react';
import "../../styles/register_module_css/App.css";

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
  handleSubmit // Add handleSubmit here
}) => {
  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>
          Welcome to <br />
          <span>Elogixa Technology India Pvt Ltd</span>
        </h1>
      </div>

      <div className="signup-form outlined-form">
        <h2>{formTitle}</h2>
        <form onSubmit={handleSubmit}> {/* Attach the handleSubmit function to form submission */}
          <div className="input-row">
            <input type="text" placeholder="First Name" required />
            <input type="text" placeholder="Last Name" required />
          </div>

          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Phone Number" required />

          <div className="gender-row">
            <label>Gender:</label>
            <div className="radio-group">
              <label><input type="radio" name="gender" value="male" /> Male</label>
              <label><input type="radio" name="gender" value="female" /> Female</label>
              <label><input type="radio" name="gender" value="other" /> Other</label>
            </div>
          </div>

          {showDOB && (
            <>
              <label>Date of Birth:</label>
              <input type="date" required />
            </>
          )}

          {showAddress && (
            <textarea placeholder="Address" rows="3" required></textarea>
          )}

          {showPincodeCity && (
            <div className="input-row">
              <input type="text" placeholder="Pincode" required />
              <input type="text" placeholder="City" required />
            </div>
          )}

          {showAadhar && <input type="text" placeholder="Aadhar Card Number" required />}
          {showEmployeeId && <input type="text" placeholder="Employee ID" required />}
          {showDesignation && <input type="text" placeholder="Designation" required />}

          {showQualification && (
            <>
              <label>Highest Qualification:</label>
              <select required>
                <option value="">-- Select --</option>
                <option value="bca">BCA</option>
                <option value="mca">MCA</option>
                <option value="btech">B.Tech</option>
                <option value="be">BE</option>
                <option value="mtech">M.Tech</option>
              </select>
            </>
          )}

          <button type="submit">{buttonLabel}</button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
