import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/exam_allotment_module_css/CandidateSelectionPage.css';

const CandidateSelectionPage = () => {
  const { examToken } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    axios.get("/api/exam_allotment/select-candidates/")
      .then(res => setCandidates(res.data))
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  const handleCheckboxChange = candidateId => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSubmit = () => {
    // Prevent multiple clicks while sending
    if (isSending) return;

    if (selectedCandidates.length === 0) {
      alert("Please select candidates.");
      return;
    }

    setIsSending(true);

    axios.post("/api/exam_allotment/select-candidates/", {
      exam_token: examToken,
      selected_candidates: selectedCandidates
    })
    .then(() => {
      alert("Emails sent successfully");
    })
    .catch(err => {
      console.error("Error sending emails:", err);
      alert("Failed to send emails. Please try again.");
    })
    .finally(() => {
      setIsSending(false);
    });
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCandidateCard = c => (
    <div key={c.id} className="candidate-card">
      <div
        className="candidate-details"
        title={`${c.user_id} — ${c.first_name} ${c.last_name} (${c.email})`}
      >
        <strong>{c.user_id}</strong> — {c.first_name} {c.last_name} ({c.email})
      </div>
      <div className="checkbox-container">
        <input
          type="checkbox"
          checked={selectedCandidates.includes(c.id)}
          onChange={() => handleCheckboxChange(c.id)}
        />
      </div>
    </div>
  );

  return (
    <div className="selection-wrapper">
      <div className="selection-container">
        <h2>Select Candidates</h2>

        <input
          type="text"
          className="search-input"
          placeholder="Search by User ID, Name, or Email"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="card-stack">
          <div className="card-section">
            <h3>Internal Candidates</h3>
            {filteredCandidates
              .filter(c => c.type === 'internal')
              .map(renderCandidateCard)}
          </div>

          <div className="card-section">
            <h3>External Candidates</h3>
            {filteredCandidates
              .filter(c => c.type === 'external')
              .map(renderCandidateCard)}
          </div>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSending}
        >
          {isSending ? 'Sending…' : 'Send Exam URL to Selected Candidates'}
        </button>
      </div>
    </div>
  );
};

export default CandidateSelectionPage;
