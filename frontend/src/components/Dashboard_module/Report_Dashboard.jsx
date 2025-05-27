import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import '../../styles/Dashboard_module_css/Dashboard.css';

// Sample Data for Exam Reports (keep as is)
const examReports = [
  // ... your sample data ...
];

function isPass(candidate, cutOff) {
  return (
    candidate.score >= cutOff &&
    candidate.aptitude >= cutOff &&
    candidate.reasoning >= cutOff &&
    candidate.networks >= cutOff
  );
}

const COLORS = ['#38A169', '#E53E3E'];

const Report_Dashboard = () => {
  // Dashboard state
  const [totalExams, setTotalExams] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [successRate, setSuccessRate] = useState('0%');
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // Reporting state
  const [popupData, setPopupData] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [customCutOff, setCustomCutOff] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Assigned people modal state
  const [showAssignedModal, setShowAssignedModal] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assignedError, setAssignedError] = useState(null);

    // All exams for "View Assignments" integration
    const [allExams, setAllExams] = useState([]);
    const [loadingAllExams, setLoadingAllExams] = useState(false);
    const [allExamsError, setAllExamsError] = useState(null);

  // Fetch dashboard stats from API
  useEffect(() => {
    axios.get("http://localhost:8000/api/dashboard/total-upcomingexams/")
      .then(response => {
        const data = response.data;
        setTotalExams(data.total_exams_count);
        setUpcomingExams(data.upcoming_exam_details || []);
        setSuccessRate(data.success_rate || '0%');
      })
      .catch(error => {
        console.error("API fetch error:", error);
      });
  }, []);

  useEffect(() => {
    setLoadingAllExams(true);
    fetch('/api/dashboard/exams/')
      .then((res) => res.json())
      .then((data) => {
        // If your API returns {exams: [...]}, use data.exams; else use data directly
        setAllExams(data.exams || data);
        setLoadingAllExams(false);
      })
      .catch((err) => {
        setAllExamsError('Failed to load exams.');
        setLoadingAllExams(false);
      });
  }, []);

  const closeModal = () => {
    setPopupData(null);
    setSelectedExam(null);
    setCustomCutOff(null);
    setSelectedCandidate(null);
    setShowUpcomingModal(false);
  };

  const sortedReports = [...examReports].sort((a, b) =>
    sortOrder === 'asc'
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  const getPieData = (exam) => {
    let cutOff = customCutOff !== null ? customCutOff : exam.cutOff;
    let pass = 0;
    let fail = 0;
    exam.candidates.forEach((c) => {
      if (isPass(c, cutOff)) pass++;
      else fail++;
    });
    return [
      { name: 'Pass', value: pass },
      { name: 'Fail', value: fail },
    ];
  };

  const getBarChartData = (exam) => {
    if (selectedCandidate) {
      return [
        {
          name: selectedCandidate.name,
          Aptitude: selectedCandidate.aptitude,
          Reasoning: selectedCandidate.reasoning,
          Networks: selectedCandidate.networks,
        },
      ];
    }
    return [];
  };

  const exportToPDF = (exam) => {
    if (!exam || !exam.name) {
      alert('Exam data is missing');
      return;
    }

    const cutOffUsed = customCutOff !== null ? customCutOff : exam.cutOff;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${exam.name} - Results`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${exam.date}`, 20, 30);
    doc.text(`Cut-off Score (applied to all subjects): ${cutOffUsed}`, 20, 40);

    // Sort candidates for PDF as well
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = isPass(a, cutOffUsed) ? 1 : 0;
      const bStatus = isPass(b, cutOffUsed) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });

    const tableData = sortedCandidates.map((c) => [
      c.name,
      c.score,
      c.aptitude,
      c.reasoning,
      c.networks,
      isPass(c, cutOffUsed) ? 'Pass' : 'Fail',
    ]);

    autoTable(doc, {
      head: [['Name', 'Total Score', 'Aptitude', 'Reasoning', 'Networks', 'Status']],
      body: tableData,
      startY: 50,
    });

    doc.save(`${exam.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // ---- Candidate Table Component ----
  const CandidateTable = ({ exam, cutOff }) => {
    // Sort candidates: Pass first, then Fail, then by score descending
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = isPass(a, cutOff) ? 1 : 0;
      const bStatus = isPass(b, cutOff) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });
    return (
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #333',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Total Score</th>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Aptitude</th>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Reasoning</th>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Networks</th>
            <th style={{ border: '1px solid #333', padding: '8px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((c, idx) => (
            <tr
              key={idx}
              onClick={() => setSelectedCandidate(c)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedCandidate && selectedCandidate.name === c.name
                    ? '#e6f7ff'
                    : 'inherit',
              }}
            >
              <td style={{ border: '1px solid #333', padding: '8px' }}>{c.name}</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>{c.score}</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>{c.aptitude}</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>{c.reasoning}</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>{c.networks}</td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>
                {isPass(c, cutOff) ? (
                  <span style={{ color: '#38A169', fontWeight: 'bold' }}>Pass</span>
                ) : (
                  <span style={{ color: '#E53E3E', fontWeight: 'bold' }}>Fail</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Assigned Users Modal Logic
  const [selectedExamId, setSelectedExamId] = useState(null);

  const handleExamRowClick = async (examId) => {
    setSelectedExamId(examId);
    setShowAssignedModal(true);
    setLoadingAssigned(true);
    setAssignedError(null);
    try {
      const resp = await axios.get(`/api/dashboard/assignments/exam/${examId}/`);
      setAssignedUsers(resp.data);
    } catch (err) {
      setAssignedError("Failed to load assigned users.");
      setAssignedUsers([]);
    }
    setLoadingAssigned(false);
  };

  const closeAssignedModal = () => {
    setShowAssignedModal(false);
    setAssignedUsers([]);
    setSelectedExamId(null);
    setAssignedError(null);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="card-grid">
        {/* Success Rate Card */}
        <div className="card">
          <h2>Success Rate</h2>
          <div className="stat-number" style={{ fontSize: '2.4rem', margin: '24px 0' }}>{successRate}</div>
        </div>

        {/* Total Exams Card */}
        <div className="card">
          <div className="stat">
            <p className="stat-label">Total Exams</p>
            <p className="stat-number">{totalExams}</p>
          </div>
          <p className="card-subtext">Fetched from API</p>
        </div>

        {/* Upcoming Exams Card */}
        <div className="card" onClick={() => setShowUpcomingModal(true)}>
          <div className="stat">
            <p className="stat-label">Upcoming Exams</p>
            <p className="stat-number">{upcomingExams.length}</p>
          </div>
          <p className="card-subtext">Click for details</p>
        </div>
      </div>

      {/* Upcoming Exams Modal */}
      {showUpcomingModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Upcoming Exam Details</h2>
            {upcomingExams.length === 0 ? (
              <p>No upcoming exams.</p>
            ) : (
              <table className="upcoming-exams-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExams.map((exam, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'even-row' : 'odd-row'}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleExamRowClick(exam.exam_id)}
                      title="Show assigned people"
                    >
                      <td>{exam.exam_title || '-'}</td>
                      <td>
                        {exam.exam_start_time
                          ? new Date(exam.exam_start_time).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        {exam.exam_start_time
                          ? new Date(exam.exam_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                        {" - "}
                        {exam.exam_end_time
                          ? new Date(exam.exam_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td>{exam.location || '-'}</td>
                      <td>
                        <button onClick={() => handleExamRowClick(exam.id)}>
                          View Assignments
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="modal-back-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

            {/* All Exams Table for Assignments */}
            <h2>Exam Dashboard</h2>
      {loadingAllExams ? (
        <p>Loading exams...</p>
      ) : allExamsError ? (
        <p style={{ color: 'red' }}>{allExamsError}</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginBottom: '20px', width: '100%' }}>
          <thead>
            <tr>
              <th>Exam ID</th>
              <th>Exam Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allExams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.id}</td>
                <td>{exam.exam_title || exam.name}</td>
                <td>
                  <button onClick={() => handleExamRowClick(exam.id)}>
                    View Assignments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {/* Assigned Users Modal */}
      {showAssignedModal && (
        <div className="modal-overlay" onClick={closeAssignedModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Assigned People</h2>
            {loadingAssigned ? (
              <p>Loading...</p>
            ) : assignedError ? (
              <p style={{ color: 'red' }}>{assignedError}</p>
            ) : assignedUsers.length === 0 ? (
              <p>No users assigned to this exam.</p>
            ) : (
              <table className="assigned-users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedUsers.map(user => (
                    <tr key={user.assignment_id}>
                      <td>{user.user_id}</td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="modal-back-button" onClick={closeAssignedModal} style={{marginTop: '20px'}}>
              Close
            </button>
          </div>
        </div>
      )}

      <h1 className="dashboard-title">Reporting</h1>
      <div className="report-filters">
        <label>Sort by Date:</label>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      <div className="card-grid">
        {sortedReports.map((exam) => (
          <div
            className="card"
            key={exam.id}
            onClick={() => {
              setSelectedExam(exam);
              setCustomCutOff(null);
              setSelectedCandidate(null);
            }}
          >
            <h2>{exam.name}</h2>
            <p>Date: {exam.date}</p>
          </div>
        ))}
      </div>

      {(popupData || selectedExam) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {popupData && (
              <>
                <h2>{popupData.title}</h2>
                <div className="modal-body">
                  {popupData.content}
                  <button className="modal-back-button" onClick={closeModal}>
                    BACK
                  </button>
                </div>
              </>
            )}

            {selectedExam && (
              <>
                <h2>{selectedExam.name} - Results</h2>
                <p>Exam Date: {selectedExam.date}</p>
                <label>
                  Cut-off Score (applies to all subjects):&nbsp;
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customCutOff !== null ? customCutOff : selectedExam.cutOff}
                    onChange={(e) => setCustomCutOff(Number(e.target.value))}
                    style={{ padding: '5px', width: '80px' }}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div style={{ width: '45%' }}>
                    <h3>Pass/Fail Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getPieData(selectedExam)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {getPieData(selectedExam).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ width: '50%' }}>
                    {selectedCandidate ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3>
                            Section-wise Scores
                            <span style={{ fontSize: '0.9em', color: '#888', marginLeft: 10 }}>
                              ({selectedCandidate.name})
                            </span>
                          </h3>
                          <button
                            onClick={() => setSelectedCandidate(null)}
                            style={{
                              padding: '2px 10px',
                              fontSize: '0.9em',
                              background: '#eee',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Show All
                          </button>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getBarChartData(selectedExam)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Aptitude" fill="#8884d8" />
                            <Bar dataKey="Reasoning" fill="#82ca9d" />
                            <Bar dataKey="Networks" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    ) : (
                      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        <span>Select a candidate to view section-wise scores</span>
                      </div>
                    )}
                  </div>
                </div>
                <CandidateTable
                  exam={selectedExam}
                  cutOff={customCutOff !== null ? customCutOff : selectedExam.cutOff}
                />

                <button className="download-button" onClick={() => exportToPDF(selectedExam)}>
                  Download PDF
                </button>
                <button className="modal-back-button" onClick={closeModal}>
                  BACK
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Report_Dashboard;
