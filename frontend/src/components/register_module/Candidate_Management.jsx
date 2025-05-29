import axios from 'axios';
import { useEffect, useState } from 'react';

const CandidateTable = ({ candidates, onUpdate, onDelete }) => (
  <div style={{ width: '100%', padding: '1rem', overflowY: 'auto', maxHeight: '90vh' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f3f3' }}>
          <th style={thStyle}>First Name</th>
          <th style={thStyle}>Last Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Phone</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidates.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ padding: '0.5rem', textAlign: 'center' }}>No records found</td>
          </tr>
        ) : (
          candidates.map((cand) => (
            <tr key={cand.id}>
              <td style={tdStyle}>{cand.first_name}</td>
              <td style={tdStyle}>{cand.last_name}</td>
              <td style={tdStyle}>{cand.email}</td>
              <td style={tdStyle}>{cand.phone_number}</td>
              <td style={{ ...tdStyle, display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => onUpdate(cand)} style={updateBtnStyle}>Update</button>
                <button onClick={() => onDelete(cand.id)} style={deleteBtnStyle}>Delete</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const Candidate_Management = () => {
  const [candidateType, setCandidateType] = useState('internal');
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [editCandidate, setEditCandidate] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // State for delete confirmation dialog
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchCandidates = async () => {
    const url = `/api/candidate/${candidateType}-candidates/?search=${search}`;
    try {
      const res = await axios.get(url);
      setCandidates(res.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [candidateType, search]);

  // Show delete confirmation dialog
  const confirmDeleteCandidate = (id) => {
    setDeleteCandidateId(id);
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteCandidateId(null);
    setShowDeleteConfirm(false);
  };

  // Delete candidate after confirmation
  const deleteCandidate = async () => {
    if (!deleteCandidateId) return;
    const url = `/api/candidate/${candidateType}-candidates/${deleteCandidateId}/`;
    try {
      await axios.delete(url);
      setShowDeleteConfirm(false);
      setDeleteCandidateId(null);
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  // Updated email validation: must have @, domain, and end with .com
  const validateUpdate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/; // username@domain.com
    if (!editCandidate.first_name) newErrors.first_name = "First name is required.";
    if (!editCandidate.last_name) newErrors.last_name = "Last name is required.";
    if (!editCandidate.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(editCandidate.email)) {
      newErrors.email = "Email must be in the format username@domain.com";
    }
    if (!editCandidate.phone_number) {
      newErrors.phone_number = "Phone number is required.";
    } else if (!/^\d{10}$/.test(editCandidate.phone_number)) {
      newErrors.phone_number = "Phone number must be a 10-digit number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateUpdate()) return;
    const url = `/api/candidate/${candidateType}-candidates/${editCandidate.id}/`;
    try {
      await axios.put(url, editCandidate);
      setEditCandidate(null);
      fetchCandidates();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Candidate Type:
          <select
            value={candidateType}
            onChange={(e) => setCandidateType(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="internal">Internal Candidates</option>
            <option value="external">External Candidates</option>
          </select>
        </label>
        <input
          type="text"
          placeholder={`Search ${candidateType} candidates`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {showSuccess && (
        <div style={{ marginBottom: '1rem', color: 'green', fontWeight: 'bold' }}>
          Candidate updated successfully!
        </div>
      )}

      <CandidateTable
        candidates={candidates}
        onDelete={confirmDeleteCandidate}
        onUpdate={setEditCandidate}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={popupOverlayStyle}>
          <div style={popupBoxStyle}>
            <h3 style={{ marginBottom: '1rem' }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this candidate?</p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={cancelDelete} style={cancelBtnStyle}>Cancel</button>
              <button onClick={deleteCandidate} style={deleteBtnStyle}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Candidate Dialog */}
      {editCandidate && (
        <div style={popupOverlayStyle}>
          <div style={popupBoxStyle}>
            <h3 style={{ marginBottom: '1rem' }}>Update Candidate</h3>

            <label>First Name:</label>
            <input
              value={editCandidate.first_name}
              onChange={(e) => setEditCandidate({ ...editCandidate, first_name: e.target.value })}
              style={popupInputStyle}
            />
            {errors.first_name && <div style={errorTextStyle}>{errors.first_name}</div>}

            <label>Last Name:</label>
            <input
              value={editCandidate.last_name}
              onChange={(e) => setEditCandidate({ ...editCandidate, last_name: e.target.value })}
              style={popupInputStyle}
            />
            {errors.last_name && <div style={errorTextStyle}>{errors.last_name}</div>}

            <label>Email:</label>
            <input
              value={editCandidate.email}
              onChange={(e) => setEditCandidate({ ...editCandidate, email: e.target.value })}
              style={popupInputStyle}
            />
            {errors.email && <div style={errorTextStyle}>{errors.email}</div>}

            <label>Phone Number:</label>
            <input
              value={editCandidate.phone_number}
              onChange={(e) => setEditCandidate({ ...editCandidate, phone_number: e.target.value.replace(/\D/g, '') })}
              style={popupInputStyle}
              maxLength={10}
            />
            {errors.phone_number && <div style={errorTextStyle}>{errors.phone_number}</div>}

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setEditCandidate(null)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleUpdate} style={updateBtnStyle}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles
const thStyle = {
  border: '1px solid #ddd',
  padding: '0.5rem',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '0.5rem',
};

const updateBtnStyle = {
  backgroundColor: 'green',
  border: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'white',
};

const deleteBtnStyle = {
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
  cursor: 'pointer',
};

const cancelBtnStyle = {
  backgroundColor: 'grey',
  border: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'white',
};

const popupOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const popupBoxStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  width: '400px',
  boxShadow: '0 0 10px rgba(0,0,0,0.25)',
};

const popupInputStyle = {
  display: 'block',
  width: '100%',
  marginBottom: '0.75rem',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const errorTextStyle = {
  color: '#dc3545',
  fontSize: '12px',
  marginBottom: '5px',
  marginTop: '-10px',
};

export default Candidate_Management;
