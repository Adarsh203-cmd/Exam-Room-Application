import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import "../../styles/register_module_css/App.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
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

    console.log("Sending Payload:", payload);

    try {
      setLoading(true);
      const res = await axios.post(
        "/api/candidate/verify-otp-register/",
        payload
      );
      if (res.status === 201 || res.status === 200) {
        alert("Registration successful!");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    } catch (err) {
  console.error("OTP verification failed:", err);

  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    if (status === 400 && data?.email?.[0]?.includes("already")) {
      alert("This email is already registered.");
    } else if (status === 409) {
      alert("This email or user is already registered.");
    } else {
      alert("Invalid OTP or error occurred.");
    }
  } else {
    alert("Network error or server not responding.");
  }
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-text">
        <h1>
          Welcome to <br />
          <span>Elogixa Technology India Pvt Ltd</span>
        </h1>
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
