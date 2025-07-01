import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
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
} from "recharts";
import "../../styles/Dashboard_module_css/Dashboard.css";

function isPass(candidate, cutOffs) {
  // If cutOffs is a number (old single cutoff), convert to object
  if (typeof cutOffs === 'number') {
    return (
      candidate.score >= cutOffs &&
      candidate.aptitude >= cutOffs &&
      candidate.technical >= cutOffs
    );
  }
  
  // New section-wise cutoff logic
  return (
    candidate.aptitude >= (cutOffs.aptitude || 0) &&
    candidate.technical >= (cutOffs.technical || 0) &&
    (candidate.reasoning || 0) >= (cutOffs.reasoning || 0)
  );
}

const COLORS = ["#38A169", "#E53E3E"];

const HiringTest_Dashboard = () => {
  // State management
  const [hiringTestData, setHiringTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [showExamDetails, setShowExamDetails] = useState(false);
  const [customCutOff, setCustomCutOff] = useState(null);
  const [sectionCutOffs, setSectionCutOffs] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch hiring test data from API
  useEffect(() => {
    const fetchHiringTestData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/evaluation/hiring-test-data/");
        
        if (response.data.success) {
          setHiringTestData(response.data.data);
        } else {
          setError("Failed to fetch hiring test data");
        }
      } catch (err) {
        console.error("API fetch error:", err);
        setError("Error fetching hiring test data");
      } finally {
        setLoading(false);
      }
    };

    fetchHiringTestData();
  }, []);

  const closeModal = () => {
    setPopupData(null);
    setShowExamDetails(false);
    setCustomCutOff(null);
    setSectionCutOffs({});
    setSelectedCandidate(null);
  };

  // Create consolidated exam data
  const getExamData = () => {
    if (!hiringTestData || hiringTestData.length === 0) return null;
    
    // Assuming all students took the same exam, use the first entry for exam details
    const firstEntry = hiringTestData[0];
    
    // Convert all individual test records to candidates
    const candidates = hiringTestData.map(test => ({
      name: test.name,
      score: test.total_score,
      aptitude: test.aptitude,
      technical: test.technical,
      reasoning: test.reasoning || 0
    }));

    // Calculate summary statistics
    const totalStudents = candidates.length;
    const averageScore = candidates.reduce((sum, c) => sum + c.score, 0) / totalStudents;
    const averageAptitude = candidates.reduce((sum, c) => sum + c.aptitude, 0) / totalStudents;
    const averageTechnical = candidates.reduce((sum, c) => sum + c.technical, 0) / totalStudents;

    return {
      name: hiringTestData.name || "Hiring Test",
      test_date: firstEntry.test_date,
      candidates: candidates,
      totalStudents: totalStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      averageAptitude: Math.round(averageAptitude * 100) / 100,
      averageTechnical: Math.round(averageTechnical * 100) / 100
    };
  };

  const examData = getExamData();

  const getPieData = (exam) => {
    const cutOffs = Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                   (customCutOff !== null ? customCutOff : 50);
    let pass = 0;
    let fail = 0;
    
    if (exam && exam.candidates && exam.candidates.length > 0) {
      exam.candidates.forEach((c) => {
        if (isPass(c, cutOffs)) pass++;
        else fail++;
      });
    }
    
    return [
      { name: "Pass", value: pass },
      { name: "Fail", value: fail },
    ];
  };

  const getBarChartData = (exam) => {
    if (selectedCandidate) {
      return [
        {
          name: selectedCandidate.name,
          Aptitude: selectedCandidate.aptitude,
          Technical: selectedCandidate.technical,
          Reasoning: selectedCandidate.reasoning || 0,
        },
      ];
    }
    return [];
  };

  const exportToPDF = (exam) => {
    if (!exam || !exam.candidates) {
      alert("Exam data is missing");
      return;
    }

    const cutOffsUsed = Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                       (customCutOff !== null ? customCutOff : 50);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${exam.name} - Hiring Test Results`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${exam.test_date}`, 20, 30);
    doc.text(`Total Students: ${exam.totalStudents}`, 20, 40);
    
    // Display cutoff information
    if (typeof cutOffsUsed === 'object') {
      doc.text(`Cutoff Scores - Aptitude: ${cutOffsUsed.aptitude || 0}, Technical: ${cutOffsUsed.technical || 0}, Reasoning: ${cutOffsUsed.reasoning || 0}`, 20, 50);
    } else {
      doc.text(`Cut-off Score (applied to all subjects): ${cutOffsUsed}`, 20, 50);
    }

    // Sort candidates for PDF
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = isPass(a, cutOffsUsed) ? 1 : 0;
      const bStatus = isPass(b, cutOffsUsed) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });

    const tableData = sortedCandidates.map((c) => [
      c.name,
      c.score,
      c.aptitude,
      c.technical,
      c.reasoning || 0,
      isPass(c, cutOffsUsed) ? "Pass" : "Fail",
    ]);

    autoTable(doc, {
      head: [
        ["Name", "Total Score", "Aptitude", "Technical", "Reasoning", "Status"],
      ],
      body: tableData,
      startY: 60,
    });

    doc.save(`${exam.name.replace(/\s+/g, "_")}_Hiring_Test_Report.pdf`);
  };

  // Candidate Table Component
  const CandidateTable = ({ exam, cutOffs }) => {
    if (!exam || !exam.candidates) return null;

    // Sort candidates: Pass first, then Fail, then by score descending
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = isPass(a, cutOffs) ? 1 : 0;
      const bStatus = isPass(b, cutOffs) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });

    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #333",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #333", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>
              Total Score
            </th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>
              Aptitude
            </th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>
              Technical
            </th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>
              Reasoning
            </th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((c, idx) => (
            <tr
              key={idx}
              onClick={() => setSelectedCandidate(c)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  selectedCandidate && selectedCandidate.name === c.name
                    ? "#e6f7ff"
                    : "inherit",
              }}
            >
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {c.name}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {c.score}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {c.aptitude}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {c.technical}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {c.reasoning || 0}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {isPass(c, cutOffs) ? (
                  <span style={{ color: "#38A169", fontWeight: "bold" }}>
                    Pass
                  </span>
                ) : (
                  <span style={{ color: "#E53E3E", fontWeight: "bold" }}>
                    Fail
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Hiring Test Dashboard</h1>
        <p>Loading hiring test data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Hiring Test Dashboard</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Hiring Test Dashboard</h1>
        <p>No test data available.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Hiring Test Dashboard</h1>

      {/* Single Card for the Exam */}
      <div className="card-grid">
        <div
          className="card"
          onClick={() => {
            setShowExamDetails(true);
            setCustomCutOff(null);
            setSectionCutOffs({});
            setSelectedCandidate(null);
          }}
          style={{ cursor: "pointer" }}
        >
          <h2>{'previous History'}</h2>
          <p>Date: {examData.test_date}</p>
          <p>Total Students: {examData.totalStudents}</p>
          <p>Average Score: {examData.averageScore}</p>
          <p>Avg Aptitude: {examData.averageAptitude} | Avg Technical: {examData.averageTechnical}</p>
        </div>
      </div>

      {/* Modal for Exam Details */}
      {(popupData || showExamDetails) && (
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

            {showExamDetails && examData && (
              <>
                <h2>{'Hiring Test Results'}</h2>
                <p>Test Date: {'may-2025'}</p>
                <p>Total Students: {examData.totalStudents}</p>
                
                {/* Cutoff Configuration Section */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '20px' 
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Set Cutoff Scores</h4>
                  
                  {/* Toggle between single and section-wise cutoff */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ marginRight: '20px', fontSize: '14px' }}>
                      <input
                        type="radio"
                        name="cutoffType"
                        checked={Object.keys(sectionCutOffs).length === 0}
                        onChange={() => {
                          setSectionCutOffs({});
                          setCustomCutOff(50);
                        }}
                        style={{ marginRight: '5px' }}
                      />
                      Same cutoff for all sections
                    </label>
                    <label style={{ fontSize: '14px' }}>
                      <input
                        type="radio"
                        name="cutoffType"
                        checked={Object.keys(sectionCutOffs).length > 0}
                        onChange={() => {
                          setCustomCutOff(null);
                          setSectionCutOffs({
                            aptitude: 50,
                            technical: 50,
                            reasoning: 50
                          });
                        }}
                        style={{ marginRight: '5px' }}
                      />
                      Different cutoff for each section
                    </label>
                  </div>

                  {/* Single cutoff input */}
                  {Object.keys(sectionCutOffs).length === 0 && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>
                        Overall Cut-off Score:&nbsp;
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={customCutOff !== null ? customCutOff : 50}
                          onChange={(e) => setCustomCutOff(Number(e.target.value))}
                          style={{ 
                            padding: '4px 8px', 
                            width: '80px', 
                            marginLeft: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Section-wise cutoff inputs */}
                  {Object.keys(sectionCutOffs).length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '15px' 
                    }}>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>
                        Aptitude:
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sectionCutOffs.aptitude || 0}
                          onChange={(e) => setSectionCutOffs(prev => ({
                            ...prev,
                            aptitude: Number(e.target.value)
                          }))}
                          style={{ 
                            padding: '4px 8px', 
                            width: '60px', 
                            minWidth: '0',
                            marginLeft: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </label>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>
                        Technical:
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sectionCutOffs.technical || 0}
                          onChange={(e) => setSectionCutOffs(prev => ({
                            ...prev,
                            technical: Number(e.target.value)
                          }))}
                          style={{ 
                            padding: '4px 8px', 
                            width: '60px', 
                            minWidth: '0',
                            marginLeft: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </label>
                      <label style={{ fontSize: '14px', fontWeight: '500' }}>
                        Reasoning:
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sectionCutOffs.reasoning || 0}
                          onChange={(e) => setSectionCutOffs(prev => ({
                            ...prev,
                            reasoning: Number(e.target.value)
                          }))}
                          style={{ 
                            padding: '4px 8px', 
                            width: '60px', 
                            minWidth: '0',
                            marginLeft: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px'
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  <div style={{ width: "45%" }}>
                    <h3>Pass/Fail Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getPieData(examData)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {getPieData(examData).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ width: "50%" }}>
                    {selectedCandidate ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <h3>
                            Section-wise Scores
                            <span
                              style={{
                                fontSize: "0.9em",
                                color: "#888",
                                marginLeft: 10,
                              }}
                            >
                              ({selectedCandidate.name})
                            </span>
                          </h3>
                          <button
                            onClick={() => setSelectedCandidate(null)}
                            style={{
                              padding: "2px 10px",
                              fontSize: "0.9em",
                              background: "#eee",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Show All
                          </button>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={getBarChartData(examData)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Aptitude" fill="#8884d8" />
                            <Bar dataKey="Technical" fill="#82ca9d" />
                            <Bar dataKey="Reasoning" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    ) : (
                      <div
                        style={{
                          height: 250,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#888",
                        }}
                      >
                        <span>
                          Select a candidate to view section-wise scores
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <CandidateTable
                  exam={examData}
                  cutOffs={Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                          (customCutOff !== null ? customCutOff : 50)}
                />

                <button
                  className="download-button"
                  onClick={() => exportToPDF(examData)}
                >
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

export default HiringTest_Dashboard;