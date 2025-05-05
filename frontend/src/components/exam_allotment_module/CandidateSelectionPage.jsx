import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // <-- Import useParams
import axios from 'axios';

const CandidateSelectionPage = () => {
  const { examToken } = useParams(); // <-- Get exam_token dynamically from URL

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch candidates data from the API
  useEffect(() => {
    axios.get("/api/exam_allotment/select-candidates/")
      .then(res => setCandidates(res.data))
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  // Handle checkbox state change
  const handleCheckboxChange = candidateId => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedCandidates.length === 0) {
      return alert("Please select candidates.");
    }

    axios.post("/api/exam_allotment/select-candidates/", {
      exam_token: examToken, // <-- Send exam_token properly
      selected_candidates: selectedCandidates
    })
      .then(() => alert("Emails sent successfully"))
      .catch((err) => {
        console.error("Error sending emails:", err);
        alert("Failed to send emails. Please try again.");
      });
  };

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate =>
    candidate.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h2>Select Candidates</h2>

      {/* Search Bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by User ID, Name, or Email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* Internal Candidates Section */}
      <div style={{ marginBottom: 16 }}>
        <h3>Internal Candidates</h3>
        {filteredCandidates
          .filter(c => c.type === 'internal')
          .map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={selectedCandidates.includes(c.id)}
                onChange={() => handleCheckboxChange(c.id)}
              />
              <span style={{ marginLeft: 8 }}>
                <strong>{c.user_id}</strong> — {c.first_name} {c.last_name} ({c.email})
              </span>
            </div>
          ))
        }
      </div>

      {/* External Candidates Section */}
      <div style={{ marginBottom: 16 }}>
        <h3>External Candidates</h3>
        {filteredCandidates
          .filter(c => c.type === 'external')
          .map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={selectedCandidates.includes(c.id)}
                onChange={() => handleCheckboxChange(c.id)}
              />
              <span style={{ marginLeft: 8 }}>
                <strong>{c.user_id}</strong> — {c.first_name} {c.last_name} ({c.email})
              </span>
            </div>
          ))
        }
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} style={{ padding: '8px 16px' }}>
        Send Exam URL to Selected Candidates
      </button>
    </div>
  );
};

export default CandidateSelectionPage;
