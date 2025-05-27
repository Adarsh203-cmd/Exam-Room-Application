import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCards from './DashboardCards';
import ExamReporting from './ExamReporting';
import ExamDetailsModal from './ExamDetailsModal';
import '../../styles/Exam_evaluation/Report_dashboard.css';

const Report_Dashboard = () => {
  // States for main data
  const [examReports, setExamReports] = useState([]);
  const [uniqueEvaluatedExams, setUniqueEvaluatedExams] = useState([]);
  const [successRateData, setSuccessRateData] = useState([
    { name: 'Success', value: 0 },
    { name: 'Failure', value: 100 }
  ]);
  const [totalExams, setTotalExams] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState(0);
  const [allExams, setAllExams] = useState([]);
  const [upcomingExamsList, setUpcomingExamsList] = useState([]);
  
  // States for modal and UI interaction
  const [popupData, setPopupData] = useState({
    success: null,
    examStats: null,
    upcoming: null,
    current: null
  });
  const [selectedExam, setSelectedExam] = useState(null);
  const [customCutOff, setCustomCutOff] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API endpoints
  const API_BASE_URL = 'http://localhost:8000/api';
  const EXAMS_URL = `${API_BASE_URL}/evaluation/exams`;
  const STATS_URL = `${API_BASE_URL}/evaluation/dashboard-stats`;
  const ALL_EXAMS_URL = `${API_BASE_URL}/evaluation/all-exams`;
  const UPCOMING_EXAMS_URL = `${API_BASE_URL}/evaluation/upcoming-exams`;

  // Function to navigate to select-candidates page
  const handleAssignCandidates = (examToken) => {
    if (!examToken) {
      console.error("No exam token provided for candidate assignment");
      return;
    }
    window.location.href = `/select-candidates/${examToken}`;
  };

  // Function to determine if a candidate passes based on cutoff
  const isPass = (candidate, cutOff) => {
    if (!candidate) return false;
    
    // Check if candidate meets the overall score requirement
    if (candidate.score < cutOff) return false;
    
    // If we have subject scores, check each subject against the cutoff
    if (candidate.subjectScores) {
      const subjectScores = Object.values(candidate.subjectScores);
      // Candidate fails if any subject score is below cutoff
      if (subjectScores.some(score => score < cutOff)) return false;
    }
    
    // Check traditional subject properties
    const traditionalSubjects = ['aptitude', 'reasoning', 'networks'];
    for (const subject of traditionalSubjects) {
      if (candidate[subject] !== undefined && candidate[subject] < cutOff) {
        return false;
      }
    }
    
    // If we get here, candidate passes
    return true;
  };

  // Initialize popup data for the dashboard cards
  const initializePopupData = (successRate, totalExamsCount, allExamsData, upcomingExamsList) => {
    if (!upcomingExamsList || !Array.isArray(upcomingExamsList)) {
      console.error("upcomingExamsList is not an array:", upcomingExamsList);
      upcomingExamsList = [];
    }

    setPopupData({
      success: {
        title: 'Success Rate Details',
        content: (
          <>
            <p>Overall Success Rate: {successRate}%</p>
          </>
        ),
      },
      examStats: {
        title: 'Exam Stats',
        content: (
          <>
            <p>Total Exams: {totalExamsCount}</p>
            <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <h3>All Exams</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Exam Name</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allExamsData.map((exam, index) => {
                    const examDate = new Date(exam.exam_start_time || exam.date);
                    const now = new Date();
                    let status = "Completed";
                    if (examDate > now) {
                      status = "Upcoming";
                    } else if (examDate.toDateString() === now.toDateString()) {
                      status = "Today";
                    }
                    
                    return (
                      <tr key={index}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{exam.name || exam.title || "Unnamed Exam"}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{examDate.toLocaleDateString()}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ),
      },
      upcoming: {
        title: 'Upcoming Exams',
        content: (
          <>
            <p>Upcoming Exams: {upcomingExamsList.length}</p>
            <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <h3>Upcoming Exam Schedule</h3>
              {upcomingExamsList && upcomingExamsList.length > 0 ? (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Exam Name</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Time</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Candidates</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Details</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Assign</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingExamsList.map((exam, index) => {
                        const examDate = new Date(exam.exam_start_time || exam.date);
                        const candidatesCount = exam.candidates ? exam.candidates.length : 0;
                        return (
                          <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{exam.name || exam.title || "Unnamed Exam"}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{examDate.toLocaleDateString()}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{examDate.toLocaleTimeString()}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{candidatesCount}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showCandidatesPopup(exam, examDate);
                                }}
                                style={{
                                  background: '#007BFF',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                View Candidates
                              </button>
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignCandidates(exam.exam_token);
                                }}
                                style={{
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Assign Candidates
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No upcoming exams scheduled</p>
              )}
            </div>
          </>
        ),
      },
      current: null
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch exam reports for evaluated exams
        const examsResponse = await axios.get(EXAMS_URL);

        // Process exam reports to consolidate by exam ID
        const examsMap = {};
        examsResponse.data.forEach(exam => {
          if (!examsMap[exam.id]) {
            examsMap[exam.id] = {
              ...exam,
              candidates: [exam.candidates[0]]
            };
          } else {
            examsMap[exam.id].candidates.push(exam.candidates[0]);
          }
        });

        // Convert the map back to an array
        const uniqueExams = Object.values(examsMap);
        
        // Fetch detailed information for each exam including subject scores
        const processedExams = [];
        for (const exam of uniqueExams) {
          try {
            // Try to fetch detailed exam information with subject scores
            const detailsResponse = await axios.get(`${API_BASE_URL}/evaluation/exam-details/${exam.id}/`);
            
            if (detailsResponse.data) {
              // We have detailed data with subject scores
              processedExams.push({
                ...exam,
                candidates: detailsResponse.data.candidates || exam.candidates,
                subject_statistics: detailsResponse.data.subject_statistics || []
              });
            } else {
              // Fall back to the original exam data
              processedExams.push(exam);
            }
          } catch (err) {
            console.error(`Error fetching details for exam ${exam.id}:`, err);
            // Keep the original exam data
            processedExams.push(exam);
          }
        }
        
        setUniqueEvaluatedExams(processedExams);
        
        // For backward compatibility, keep the original reports in state too
        setExamReports(examsResponse.data);
          
        // Fetch all exams from exam_creation table
        let allExamsResponse;
        try {
          allExamsResponse = await axios.get(ALL_EXAMS_URL);
          setAllExams(allExamsResponse.data);
        } catch (err) {
          console.error("Error fetching all exams:", err);
          // Fallback to using EXAMS_URL data if the new endpoint isn't available yet
          setAllExams(examsResponse.data);
        }

        // Fetch upcoming exams (future start_time)
        // Now includes candidates directly in the response
        let upcomingExamsData = [];
        try {
          const upcomingExamsResponse = await axios.get(UPCOMING_EXAMS_URL);
          
          // Debug output to check the structure of the response
          console.log("Upcoming exams response:", upcomingExamsResponse.data);
          
          // Ensure we have an array of upcoming exams
          upcomingExamsData = Array.isArray(upcomingExamsResponse.data) ? upcomingExamsResponse.data : [];
          
          // Log each exam to check if candidates are included
          upcomingExamsData.forEach((exam, index) => {
            console.log(`Exam ${index}:`, exam);
            console.log(`Candidates for exam ${index}:`, exam.candidates || []);
          });
          
        } catch (err) {
          console.error("Error fetching upcoming exams:", err);
          // If endpoint isn't available, calculate upcoming exams from all exams
          const now = new Date();
          upcomingExamsData = allExamsResponse?.data?.filter(exam => 
            new Date(exam.exam_start_time || exam.date) > now
          ) || [];
        }
        
        // Store upcoming exams in state
        setUpcomingExamsList(upcomingExamsData);
        setUpcomingExams(upcomingExamsData.length);

        // Fetch dashboard statistics
        const statsResponse = await axios.get(STATS_URL);
        const { success_rate, total_exams } = statsResponse.data;
        
        // If we have allExams, use that count instead
        const actualTotalExams = allExamsResponse?.data?.length || total_exams;
        setTotalExams(actualTotalExams);

        // Set success rate data for pie chart
        setSuccessRateData([
          { name: 'Success', value: success_rate },
          { name: 'Failure', value: 100 - success_rate }
        ]);

        // Prepare popup content for dashboard cards - do this after setting all state
        initializePopupData(
          success_rate, 
          actualTotalExams, 
          allExamsResponse?.data || [],
          upcomingExamsData
        );
          
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data when component mounts
    fetchDashboardData();
    
    // Add cleanup function to prevent state updates on unmounted component
    return () => {
      // This will run when the component unmounts
    };
  }, []); // Empty dependency array means this only runs on mount

  // Handle showing the candidates popup for an upcoming exam
  const showCandidatesPopup = (exam, examDate) => {
    // Get the candidates array from the exam object
    const candidates = exam.candidates || [];
    
    console.log("Showing candidates for exam:", exam);
    console.log("Candidates:", candidates);
    
    setPopupData(prev => ({
      ...prev,
      current: {
        title: `Candidates for ${exam.name || exam.title}`,
        content: (
          <>
            <p>Exam Date: {examDate.toLocaleDateString()} at {examDate.toLocaleTimeString()}</p>
            <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <h3>Assigned Candidates</h3>
              {candidates && candidates.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {candidate.name}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{candidate.email}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{candidate.user_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No candidates assigned to this exam yet.</p>
              )}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="modal-back-button" onClick={() => 
                setPopupData(prev => ({ ...prev, current: prev.upcoming }))
              }>
                BACK TO EXAMS
              </button>
              <button 
                onClick={() => handleAssignCandidates(exam.exam_token)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ASSIGN MORE CANDIDATES
              </button>
            </div>
          </>
        )
      }
    }));
  };

  // Handle popup display
  const handlePopup = (type) => {
    console.log("Handling popup:", type);
    console.log("Current upcomingExamsList:", upcomingExamsList);
    
    switch (type) {
      case 'success':
        setPopupData(prev => ({ ...prev, current: prev.success }));
        break;
      case 'examStats':
        setPopupData(prev => ({ ...prev, current: prev.examStats }));
        break;
      case 'upcoming':
        // Re-initialize the upcoming popup data before showing
        initializePopupData(
          successRateData[0].value,
          totalExams,
          allExams,
          upcomingExamsList
        );
        setPopupData(prev => ({ ...prev, current: prev.upcoming }));
        break;
      default:
        break;
    }
  };

  // Close modal
  const closeModal = () => {
    setPopupData(prev => ({ ...prev, current: null }));
    setSelectedExam(null);
    setCustomCutOff(null);
    setSelectedCandidate(null);
  };

  // When an exam is selected, prepare and fetch additional data
  const prepareExamSelection = (exam) => {
    if (!exam) return;
    
    // Make sure we fetch the exam statistics and subject data if not done already
    setSelectedExam({
      ...exam,
      // Ensure consistent data structures
      candidates: exam.candidates.map(candidate => {
        // Make sure candidate has a subjectScores object
        return {
          ...candidate,
          subjectScores: candidate.subjectScores || {}
        };
      })
    });
    
    // Reset customCutOff and selectedCandidate when selecting a new exam
    setCustomCutOff(exam.cutOff);
    setSelectedCandidate(null);
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Dashboard Cards Component */}
      <DashboardCards 
        successRateData={successRateData}
        totalExams={totalExams}
        upcomingExams={upcomingExams}
        handlePopup={handlePopup}
      />

      <h1 className="dashboard-title">Reporting</h1>
      
      {/* Exam Reporting Component */}
      <ExamReporting 
        examReports={uniqueEvaluatedExams}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setSelectedExam={prepareExamSelection}
        setCustomCutOff={setCustomCutOff}
        setSelectedCandidate={setSelectedCandidate}
        isPass={isPass}
      />

      {/* Modal Component */}
      {((popupData && popupData.current) || selectedExam) && (
        <ExamDetailsModal
          popupData={popupData}
          selectedExam={selectedExam}
          customCutOff={customCutOff}
          setCustomCutOff={setCustomCutOff}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          closeModal={closeModal}
          isPass={isPass}
        />
      )}
    </div>
  );
};

export default Report_Dashboard;