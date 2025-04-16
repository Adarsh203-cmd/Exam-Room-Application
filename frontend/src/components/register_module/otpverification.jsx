import React, { useState } from 'react';
import "../../styles/register_module_css/App.css";  // Ensure this file is linked to your OTP page

const OTPVerification = () => {
  const [otp, setOtp] = useState('');

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // Logic to verify OTP
    console.log('OTP:', otp);
  };

  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>OTP Verification</h1>
        <p>Please enter the OTP sent to your registered mobile number or email.</p>
      </div>
      <div className="signup-form outlined-form">
        <form onSubmit={handleVerifyOtp}>
          <div className="input-row">
            <label htmlFor="otp">OTP:</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              required
            />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
