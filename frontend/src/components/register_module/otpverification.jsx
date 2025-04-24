import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner';
import "../../styles/register_module_css/App.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (!storedData) {
      alert("Missing registration details.");
      return;
    }

    const payload = {
      ...storedData,
      otp: otp,
      user_type: storedData.user_type,
    };

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/api/candidate/verify-otp-register/", payload);
      if (res.status === 201 || res.status === 200) {
        alert("Registration successful!");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      alert("Invalid OTP or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>Welcome to <br /><span>Elogixa Technology India Pvt Ltd</span></h1>
      </div>

      <div className="signup-form outlined-form">
        <h2>OTP Verification</h2>
        <p>Please enter the OTP sent to your email.</p>

        <form onSubmit={handleVerifyOtp}>
          <div className="input-row">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? (
              <ThreeDots
                height="20"
                width="60"
                radius="9"
                color="#ffffff"
                ariaLabel="three-dots-loading"
                wrapperStyle={{ display: "flex", justifyContent: "center" }}
                visible={true}
              />
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
