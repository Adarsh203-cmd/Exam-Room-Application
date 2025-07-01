import React, { useEffect, useState } from "react";
import "../../styles/register_module_css/App.css";
import axios from "axios";

const CandidateProfileForm = ({ userId }) => {
  const [candidate, setCandidate] = useState(null);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem("accessToken");

      axios
        .get(`/api/candidate/candidateList/?user_id=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const internal = res.data.internal_candidates.find(
            (c) => c.user_id === userId
          );
          const external = res.data.external_candidates.find(
            (c) => c.user_id === userId
          );
          const data = internal || external;

          if (data) {
            setCandidate(data);
            setEmail(data.email || "");
            setAddress(data.address || "");
          }
        })
        .catch((err) => {
          console.error("Error fetching candidate profile:", err);
          if (err.response && err.response.status === 401) {
            alert("Session expired or unauthorized. Please log in again.");
            localStorage.removeItem("candidate_token");
            localStorage.removeItem("userId");
            window.location.href = "/login";
          }
        });
    }
  }, [userId]);

  if (!candidate) return <div>Loading profile...</div>;

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
          {candidate.user_id && (
            <div className="input-row">
              <label>Employee ID:</label>
              <input type="text" value={candidate.user_id} readOnly />
            </div>
          )}

          {candidate.first_name && (
            <div className="input-row">
              <label>First Name:</label>
              <input type="text" value={candidate.first_name} readOnly />
            </div>
          )}

          {candidate.last_name && (
            <div className="input-row">
              <label>Last Name:</label>
              <input type="text" value={candidate.last_name} readOnly />
            </div>
          )}

          {candidate.phone_number && (
            <div className="input-row">
              <label>Phone Number:</label>
              <input type="text" value={candidate.phone_number} readOnly />
            </div>
          )}

          {email && (
            <div className="input-row">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {candidate.gender && (
            <div className="input-row">
              <label>Gender:</label>
              <input type="text" value={candidate.gender} readOnly />
            </div>
          )}

          {candidate.dob && (
            <div className="input-row">
              <label>Date of Birth:</label>
              <input type="text" value={candidate.dob} readOnly />
            </div>
          )}

          {address && (
            <div className="input-row">
              <label>Address:</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
              />
            </div>
          )}

          {candidate.pin_code && (
            <div className="input-row">
              <label>Pincode:</label>
              <input type="text" value={candidate.pin_code} readOnly />
            </div>
          )}

          {candidate.city && (
            <div className="input-row">
              <label>City:</label>
              <input type="text" value={candidate.city} readOnly />
            </div>
          )}

          {candidate.aadhar_number && (
            <div className="input-row">
              <label>Aadhar Card No.:</label>
              <input type="text" value={candidate.aadhar_number} readOnly />
            </div>
          )}

          {candidate.designation && (
            <div className="input-row">
              <label>Designation:</label>
              <input type="text" value={candidate.designation} readOnly />
            </div>
          )}

          {candidate.highest_qualification && (
            <div className="input-row">
              <label>Qualification:</label>
              <input
                type="text"
                value={candidate.highest_qualification}
                readOnly
              />
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <button type="submit">Modify</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateProfileForm;
