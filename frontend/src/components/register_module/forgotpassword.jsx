import React, { useState, useEffect } from 'react';
import '../../styles/register_module_css/App.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newPassError, setNewPassError] = useState('');
  const [confirmPassError, setConfirmPassError] = useState('');

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (newPassword && !passwordRegex.test(newPassword)) {
      setNewPassError('Password must be at least 8 characters and alphanumeric');
    } else {
      setNewPassError('');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPassError('Passwords do not match');
    } else {
      setConfirmPassError('');
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showOtpFields) {
      // Send email to backend to generate OTP
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/candidate/reset/send-otp/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.message === "OTP sent to your email.") {
          setShowOtpFields(true); // Show OTP fields if email is valid and OTP sent
        } else {
          alert(data.error || "Something went wrong!"); // Show error if something goes wrong
        }
      } catch (error) {
        alert('Error sending OTP!');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (newPassError || confirmPassError) {
      return;
    }

    // When OTP and new password are entered, reset the password
    try {
      setLoading(true);
      const resetResponse = await fetch('http://localhost:8000/api/candidate/reset/password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const resetData = await resetResponse.json();
      if (resetResponse.status === 200) {
        alert(resetData.message); // This will be "Password reset successful."
        // Reset form state
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOtpFields(false);
      } else {
        alert(resetData.error || "Password reset failed!");
      }
    } catch (error) {
      alert('Error resetting password!');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="elogixa-signup-wrapper">
    <div className="signup-container">
      <div className="elogixa-signup-left">
        <h1>
          Forgot Your <br />
          <span>Password?</span>
        </h1>
        <p>Please follow the steps to reset your password securely.</p>
      </div>

      <div className="elogixa-signup-right ">
        
        <form onSubmit={handleSubmit}>
        <div className="floating-label-group">
          <input
            type="email"
            id="reset-email"
            className="floating-label-input"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={showOtpFields}
            autoComplete="email"
          />
            <label htmlFor="reset-email" className="floating-label">Enter your email</label>
        </div>  

          {showOtpFields && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ borderColor: newPassError ? 'red' : '' }}
                />
                <span
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#0077cc'
                  }}
                >
                  {showNewPass ? 'Hide' : 'Show'}
                </span>
              </div>
              {newPassError && <p style={{ color: 'red', marginTop: '-10px' }}>{newPassError}</p>}

              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ borderColor: confirmPassError ? 'red' : '' }}
                />
                <span
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#0077cc'
                  }}
                >
                  {showConfirmPass ? 'Hide' : 'Show'}
                </span>
              </div>
              {confirmPassError && <p style={{ color: 'red', marginTop: '-10px' }}>{confirmPassError}</p>}
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : showOtpFields ? 'Submit' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  </div>    
  );
};

export default ForgotPassword;
