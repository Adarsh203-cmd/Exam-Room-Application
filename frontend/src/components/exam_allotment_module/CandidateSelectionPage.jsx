import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/exam_allotment_module_css/CandidateSelectionPage.css';

const CandidateSelectionPage = () => {
  const { examToken } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('internal'); // New state for tab switching

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

  const internalCandidates = filteredCandidates.filter(c => c.type === 'internal');
  const externalCandidates = filteredCandidates.filter(c => c.type === 'external');

  const renderTable = (candidatesList, type) => (
    <div className="table-container">
      <table className="candidate-table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input
                type="checkbox"
                onChange={(e) => {
                  const candidateIds = candidatesList.map(c => c.id);
                  if (e.target.checked) {
                    setSelectedCandidates(prev => [...new Set([...prev, ...candidateIds])]);
                  } else {
                    setSelectedCandidates(prev => prev.filter(id => !candidateIds.includes(id)));
                  }
                }}
                checked={candidatesList.length > 0 && candidatesList.every(c => selectedCandidates.includes(c.id))}
              />
            </th>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {candidatesList.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">
                No {type} candidates found
              </td>
            </tr>
          ) : (
            candidatesList.map(c => (
              <tr key={c.id} className={selectedCandidates.includes(c.id) ? 'selected-row' : ''}>
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(c.id)}
                    onChange={() => handleCheckboxChange(c.id)}
                  />
                </td>
                <td className="user-id-column">{c.user_id}</td>
                <td>{c.first_name}</td>
                <td>{c.last_name}</td>
                <td className="email-column">{c.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="selection-wrapper">
      <div className="selection-container">
        <div className="header-section">
          <h2>Select Candidates for Exam</h2>
          <div className="selection-summary">
            <span className="selected-count">
              {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search by User ID, Name, or Email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tabs-container">
          <div className="tab-buttons">
            <button
              className={`tab-button ${activeTab === 'internal' ? 'active' : ''}`}
              onClick={() => setActiveTab('internal')}
            >
              Internal Candidates ({internalCandidates.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'external' ? 'active' : ''}`}
              onClick={() => setActiveTab('external')}
            >
              External Candidates ({externalCandidates.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Candidates ({filteredCandidates.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'internal' && renderTable(internalCandidates, 'internal')}
            {activeTab === 'external' && renderTable(externalCandidates, 'external')}
            {activeTab === 'all' && renderTable(filteredCandidates, 'all')}
          </div>
        </div>

        <div className="action-section">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSending || selectedCandidates.length === 0}
          >
            {isSending ? 'Sending Invitations...' : `Send Exam Invitations to ${selectedCandidates.length} Candidate${selectedCandidates.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSelectionPage;