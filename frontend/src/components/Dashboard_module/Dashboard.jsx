import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../styles/Dashboard_module_css/Dashboard.css';

// Sample Data for Success Rate and Exam Reports
const successData = [
  { name: 'Success', value: 75 },
  { name: 'Failure', value: 25 },
];
const COLORS = ['#38A169', '#E53E3E'];

const examReports = [
  {
    id: 1,
    name: 'React Basics Exam',
    date: '2025-04-20',
    cutOff: 50,
    candidates: [
      { name: 'Alice', score: 78, aptitude: 22, reasoning: 28, networks: 28 },
      { name: 'Bob', score: 45, aptitude: 15, reasoning: 10, networks: 20 },
      { name: 'Charlie', score: 60, aptitude: 20, reasoning: 20, networks: 20 },
      { name: 'David', score: 30, aptitude: 10, reasoning: 5, networks: 15 },
      { name: 'Eva', score: 55, aptitude: 18, reasoning: 17, networks: 20 },
      { name: 'Frank', score: 35, aptitude: 12, reasoning: 8, networks: 15 },
      { name: 'Grace', score: 48, aptitude: 16, reasoning: 12, networks: 20 },
      { name: 'Helen', score: 20, aptitude: 5, reasoning: 5, networks: 10 },
    ],
  },
  {
    id: 2,
    name: 'Java Fundamentals Exam',
    date: '2025-04-22',
    cutOff: 40,
    candidates: [
      { name: 'Eva', score: 55, aptitude: 18, reasoning: 17, networks: 20 },
      { name: 'Frank', score: 35, aptitude: 12, reasoning: 8, networks: 15 },
      { name: 'Grace', score: 48, aptitude: 16, reasoning: 12, networks: 20 },
      { name: 'Helen', score: 20, aptitude: 5, reasoning: 5, networks: 10 },
      { name: 'Alice', score: 78, aptitude: 22, reasoning: 28, networks: 28 },
      { name: 'Bob', score: 45, aptitude: 15, reasoning: 10, networks: 20 },
      { name: 'Charlie', score: 60, aptitude: 20, reasoning: 20, networks: 20 },
      { name: 'David', score: 30, aptitude: 10, reasoning: 5, networks: 15 },
    ],
  },
];

function isPass(candidate, cutOff) {
  // Pass only if total and all sections >= cutOff
  return (
    candidate.score >= cutOff &&
    candidate.aptitude >= cutOff &&
    candidate.reasoning >= cutOff &&
    candidate.networks >= cutOff
  );
}

const Dashboard = () => {
  const [popupData, setPopupData] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [customCutOff, setCustomCutOff] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handlePopup = (type) => {
    switch (type) {
      case 'success':
        setPopupData({
          title: 'Success Rate Details',
          content: (
            <>
              <p>Internal Avg: 78%</p>
              <p>External Avg: 72%</p>
            </>
          ),
        });
        break;
      case 'examStats':
        setPopupData({
          title: 'Exam Stats',
          content: (
            <>
              <p>Internal Completed: 120</p>
              <p>External Completed: 90</p>
            </>
          ),
        });
        break;
      case 'upcoming':
        setPopupData({
          title: 'Upcoming Exams',
          content: (
            <>
              <p>Internal Upcoming: 12</p>
              <p>External Upcoming: 15</p>
            </>
          ),
        });
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setPopupData(null);
    setSelectedExam(null);
    setCustomCutOff(null);
    setSelectedCandidate(null);
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

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="card-grid">
        <div className="card" onClick={() => handlePopup('success')}>
          <h2>Success Rate</h2>
          <div className="pie-chart-container">
            <PieChart width={200} height={200}>
              <Pie
                data={successData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {successData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        <div className="card" onClick={() => handlePopup('examStats')}>
          <div className="stat">
            <p className="stat-label">Total Exams</p>
            <p className="stat-number">210</p>
          </div>
          <p className="card-subtext">Click for breakdown</p>
        </div>

        <div className="card" onClick={() => handlePopup('upcoming')}>
          <div className="stat">
            <p className="stat-label">Upcoming Exams</p>
            <p className="stat-number">27</p>
          </div>
          <p className="card-subtext">Click for details</p>
        </div>
      </div>

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

export default Dashboard;
