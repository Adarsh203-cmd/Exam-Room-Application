//ExamDetailsModal.jsx
import React, { useState, useEffect } from "react";
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
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import CandidateTable from "./ExamCandidateTable";

const ExamDetailsModal = ({
  popupData,
  selectedExam,
  customCutOff,
  setCustomCutOff,
  selectedCandidate,
  setSelectedCandidate,
  closeModal,
  isPass,
}) => {
  const COLORS = ["#38A169", "#E53E3E"];
  const BAR_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
  ];

  const [examStatistics, setExamStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionCutOffs, setSectionCutOffs] = useState({});
  const [processedSubjects, setProcessedSubjects] = useState({
    aptitudeSubjects: [],
    technicalSubjects: [],
    generalSubjects: [],
    displayColumns: []
  });

  // Process subjects to group them by prefix
  useEffect(() => {
    if (examStatistics && examStatistics.subject_statistics) {
      const subjects = examStatistics.subject_statistics.map(stat => stat.subject);
      
      const aptitudeSubjects = subjects.filter(subject => subject.startsWith('APT'));
      const technicalSubjects = subjects.filter(subject => subject.startsWith('TECH'));
      const generalSubjects = subjects.filter(subject => 
        !subject.startsWith('APT') && !subject.startsWith('TECH')
      );
      
      // Create display columns array
      const displayColumns = [];
      if (aptitudeSubjects.length > 0) displayColumns.push('APTITUDE');
      if (technicalSubjects.length > 0) displayColumns.push('TECHNICAL');
      displayColumns.push(...generalSubjects);
      
      setProcessedSubjects({
        aptitudeSubjects,
        technicalSubjects,
        generalSubjects,
        displayColumns
      });
    }
  }, [examStatistics]);

  // Helper function to get subject score
  const getSubjectScore = (candidate, subject) => {
    if (!candidate) return 0;
    
    // First try the new standardized subjectScores object
    if (candidate.subjectScores && candidate.subjectScores[subject] !== undefined) {
      return candidate.subjectScores[subject];
    }
    
    // Case-insensitive search in subjectScores
    if (candidate.subjectScores) {
      const subjectKey = Object.keys(candidate.subjectScores).find(key => 
        key.toLowerCase() === subject.toLowerCase()
      );
      
      if (subjectKey !== undefined) {
        return candidate.subjectScores[subjectKey];
      }
    }
    
    // Fall back to direct property access for backward compatibility
    if (candidate[subject.toLowerCase()] !== undefined) {
      return candidate[subject.toLowerCase()];
    }
    
    return 0;
  };

  // Helper function to get grouped score (sum of all subjects in a group)
  const getGroupedScore = (candidate, subjectList) => {
    if (!candidate || !subjectList || subjectList.length === 0) return 0;
    
    let totalScore = 0;
    subjectList.forEach(subject => {
      const score = getSubjectScore(candidate, subject);
      totalScore += parseFloat(score) || 0;
    });
    
    return totalScore;
  };

  // Updated isPass function to handle grouped subjects
  const checkIsPass = (candidate, cutOffs) => {
    // If cutOffs is a number (old single cutoff), apply to all grouped subjects
    if (typeof cutOffs === 'number') {
      let allSubjectsPassed = candidate.score >= cutOffs;
      
      // Check APTITUDE group
      if (processedSubjects.aptitudeSubjects.length > 0) {
        const aptitudeScore = getGroupedScore(candidate, processedSubjects.aptitudeSubjects);
        if (aptitudeScore < cutOffs) {
          allSubjectsPassed = false;
        }
      }
      
      // Check TECHNICAL group
      if (processedSubjects.technicalSubjects.length > 0) {
        const technicalScore = getGroupedScore(candidate, processedSubjects.technicalSubjects);
        if (technicalScore < cutOffs) {
          allSubjectsPassed = false;
        }
      }
      
      // Check individual general subjects
      processedSubjects.generalSubjects.forEach((subject) => {
        const score = getSubjectScore(candidate, subject);
        if (score < cutOffs) {
          allSubjectsPassed = false;
        }
      });
      
      return allSubjectsPassed;
    }
    
    // New section-wise cutoff logic for grouped subjects
    if (!processedSubjects.displayColumns || processedSubjects.displayColumns.length === 0) {
      return false;
    }
    
    let allSubjectsPassed = true;
    
    // Check APTITUDE group
    if (processedSubjects.aptitudeSubjects.length > 0) {
      const cutoffValue = cutOffs['APTITUDE'] || 0;
      const aptitudeScore = getGroupedScore(candidate, processedSubjects.aptitudeSubjects);
      if (aptitudeScore < cutoffValue) {
        allSubjectsPassed = false;
      }
    }
    
    // Check TECHNICAL group
    if (processedSubjects.technicalSubjects.length > 0) {
      const cutoffValue = cutOffs['TECHNICAL'] || 0;
      const technicalScore = getGroupedScore(candidate, processedSubjects.technicalSubjects);
      if (technicalScore < cutoffValue) {
        allSubjectsPassed = false;
      }
    }
    
    // Check individual general subjects
    processedSubjects.generalSubjects.forEach((subject) => {
      const cutoffValue = cutOffs[subject] || 0;
      const score = getSubjectScore(candidate, subject);
      if (score < cutoffValue) {
        allSubjectsPassed = false;
      }
    });
    
    return allSubjectsPassed;
  };

  // Fetch exam statistics when exam is selected
  useEffect(() => {
    const fetchExamStatistics = async () => {
      if (!selectedExam || !selectedExam.id) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `/api/evaluation/exam-statistics/${selectedExam.id}/`
        );
        setExamStatistics(response.data);

        // Now fetch candidate subject scores
        try {
          const candidatesSubjectData = await axios.get(
            `/api/evaluation/exam-candidates-subjects/${selectedExam.id}/`
          );
          if (
            candidatesSubjectData.data &&
            Array.isArray(candidatesSubjectData.data)
          ) {
            // Map the subject scores to candidates
            updateCandidatesWithSubjectScores(candidatesSubjectData.data);
          }
        } catch (subjectErr) {
          console.warn("Could not fetch detailed subject scores:", subjectErr);
        }
      } catch (err) {
        console.error("Error fetching exam statistics:", err);
        setError("Failed to load subject data");
      } finally {
        setLoading(false);
      }
    };

    fetchExamStatistics();
  }, [selectedExam]);

  // Update candidates with subject scores from API
  const updateCandidatesWithSubjectScores = (subjectData) => {
    if (
      !selectedExam ||
      !selectedExam.candidates ||
      !Array.isArray(subjectData)
    )
      return;

    // Create a map of candidate IDs to their subject scores
    const candidateScoreMap = {};

    subjectData.forEach((item) => {
      const candidateId = item.candidate_id;
      if (!candidateScoreMap[candidateId]) {
        candidateScoreMap[candidateId] = {};
      }

      // Store subject score
      candidateScoreMap[candidateId][item.subject] =
        item.percentage_score || item.marks_obtained;
    });

    // Update each candidate with their subject scores
    const updatedCandidates = selectedExam.candidates.map((candidate) => {
      const candidateId = candidate.id;
      let subjectScores = candidate.subjectScores || {};

      // If we have scores for this candidate in our map
      if (candidateScoreMap[candidateId]) {
        subjectScores = {
          ...subjectScores,
          ...candidateScoreMap[candidateId],
        };
      }

      // Special handling based on the API response subjects
      if (examStatistics && examStatistics.subject_statistics) {
        examStatistics.subject_statistics.forEach((stat) => {
          const subject = stat.subject;
          const subjectKey = subject.toLowerCase().replace(/\s+/g, "_");

          // If we don't already have this subject in subjectScores and it exists directly on the candidate
          if (
            subjectScores[subject] === undefined &&
            candidate[subjectKey] !== undefined
          ) {
            subjectScores[subject] = candidate[subjectKey];
          }
        });
      }

      return {
        ...candidate,
        subjectScores,
      };
    });

    // Update the exam object with the processed candidates
    selectedExam.candidates = updatedCandidates;
  };

  // Process candidate data with dynamic subjects
  useEffect(() => {
    if (!selectedExam || !examStatistics || !examStatistics.subject_statistics)
      return;

    // Update candidate data with subject scores structured properly
    const updatedCandidates = selectedExam.candidates.map((candidate) => {
      // Create a subjectScores object that will contain scores for all subjects
      const subjectScores = candidate.subjectScores || {};

      // Map the existing hard-coded subject scores if they exist and not already in subjectScores
      if (
        candidate.aptitude !== undefined &&
        subjectScores.Aptitude === undefined
      ) {
        subjectScores.Aptitude = candidate.aptitude;
      }
      if (
        candidate.reasoning !== undefined &&
        subjectScores.Reasoning === undefined
      ) {
        subjectScores.Reasoning = candidate.reasoning;
      }
      if (
        candidate.networks !== undefined &&
        subjectScores.Networks === undefined
      ) {
        subjectScores.Networks = candidate.networks;
      }

      // Add any additional subjects from the API that aren't already mapped
      examStatistics.subject_statistics.forEach((subjectStat) => {
        const subjectName = subjectStat.subject;

        // Only add if not already added
        if (subjectScores[subjectName] === undefined) {
          // Try to get the score from different possible formats
          const snakeCaseSubject = subjectName
            .toLowerCase()
            .replace(/\s+/g, "_");
          const noSpaceSubject = subjectName.toLowerCase().replace(/\s+/g, "");

          if (candidate[subjectName.toLowerCase()] !== undefined) {
            subjectScores[subjectName] = candidate[subjectName.toLowerCase()];
          } else if (candidate[snakeCaseSubject] !== undefined) {
            subjectScores[subjectName] = candidate[snakeCaseSubject];
          } else if (candidate[noSpaceSubject] !== undefined) {
            subjectScores[subjectName] = candidate[noSpaceSubject];
          }

          // Check if subject exists in subject_results array
          if (
            candidate.subject_results &&
            Array.isArray(candidate.subject_results)
          ) {
            const subjectResult = candidate.subject_results.find(
              (sr) =>
                sr.subject === subjectName ||
                sr.subject?.toLowerCase() === subjectName.toLowerCase()
            );

            if (subjectResult) {
              subjectScores[subjectName] =
                subjectResult.percentage_score || subjectResult.marks_obtained;
            }
          }

          // Check if subject exists in subject_wise_results array
          if (
            candidate.subject_wise_results &&
            Array.isArray(candidate.subject_wise_results)
          ) {
            const subjectResult = candidate.subject_wise_results.find(
              (sr) =>
                sr.subject === subjectName ||
                sr.subject?.toLowerCase() === subjectName.toLowerCase()
            );

            if (subjectResult) {
              subjectScores[subjectName] =
                subjectResult.percentage_score || subjectResult.marks_obtained;
            }
          }
        }
      });

      // Return updated candidate with the subjectScores object
      return {
        ...candidate,
        subjectScores,
      };
    });

    // Update the exam object with the processed candidates
    selectedExam.candidates = updatedCandidates;
  }, [selectedExam, examStatistics]);

  // Get data for the pie chart
  const getPieData = (exam) => {
    if (!exam) return [];

    const cutOffs = Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                   (customCutOff !== null ? customCutOff : exam.cutOff);
    let pass = 0;
    let fail = 0;
    exam.candidates.forEach((c) => {
      if (checkIsPass(c, cutOffs)) pass++;
      else fail++;
    });
    return [
      { name: "Pass", value: pass },
      { name: "Fail", value: fail },
    ];
  };

  // Get data for the bar chart with grouped subjects
  const getBarChartData = () => {
    if (!selectedCandidate) return [];

    const data = { name: selectedCandidate.name };

    // Add APTITUDE score if APT subjects exist
    if (processedSubjects.aptitudeSubjects.length > 0) {
      data['APTITUDE'] = getGroupedScore(selectedCandidate, processedSubjects.aptitudeSubjects);
    }

    // Add TECHNICAL score if TECH subjects exist
    if (processedSubjects.technicalSubjects.length > 0) {
      data['TECHNICAL'] = getGroupedScore(selectedCandidate, processedSubjects.technicalSubjects);
    }

    // Add individual general subjects
    processedSubjects.generalSubjects.forEach((subject) => {
      data[subject] = getSubjectScore(selectedCandidate, subject);
    });

    return [data];
  };

  // Export exam results to PDF with grouped subjects
  const exportToPDF = (exam) => {
    if (!exam || !exam.name) {
      alert("Exam data is missing");
      return;
    }

    const cutOffsUsed = Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                       (customCutOff !== null ? customCutOff : exam.cutOff);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${exam.name} - Results`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${exam.date}`, 20, 30);
    
    // Display cutoff information
    if (typeof cutOffsUsed === 'object') {
      let cutoffText = "Cutoff Scores - ";
      const cutoffParts = processedSubjects.displayColumns.map(column => 
        `${column}: ${cutOffsUsed[column] || 0}`
      );
      cutoffText += cutoffParts.join(", ");
      doc.text(cutoffText, 20, 40);
    } else {
      doc.text(`Cut-off Score (applied to all subjects): ${cutOffsUsed}`, 20, 40);
    }

    // Sort candidates for PDF
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = checkIsPass(a, cutOffsUsed) ? 1 : 0;
      const bStatus = checkIsPass(b, cutOffsUsed) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });

    // Create table data with grouped subject columns
    const tableData = sortedCandidates.map((c) => {
      const row = [c.name, c.score];

      // Add APTITUDE score
      if (processedSubjects.aptitudeSubjects.length > 0) {
        row.push(getGroupedScore(c, processedSubjects.aptitudeSubjects));
      }

      // Add TECHNICAL score
      if (processedSubjects.technicalSubjects.length > 0) {
        row.push(getGroupedScore(c, processedSubjects.technicalSubjects));
      }

      // Add individual general subjects
      processedSubjects.generalSubjects.forEach((subject) => {
        row.push(getSubjectScore(c, subject) || "N/A");
      });

      // Add status column
      row.push(checkIsPass(c, cutOffsUsed) ? "Pass" : "Fail");

      return row;
    });

    // Create header row with grouped subject columns
    const headerRow = ["Name", "Total Score", ...processedSubjects.displayColumns, "Status"];

    // Generate the table in PDF
    autoTable(doc, {
      head: [headerRow],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        [headerRow.length - 1]: { 
          cellWidth: 20,
          halign: 'center',
          fillColor: function(rowIndex, columnIndex, cellValue) {
            return cellValue === 'Pass' ? [76, 175, 80] : [244, 67, 54];
          }
        }
      },
      didParseCell: function(data) {
        // Color the status column cells
        if (data.column.index === headerRow.length - 1 && data.section === 'body') {
          if (data.cell.text[0] === 'Pass') {
            data.cell.styles.fillColor = [200, 255, 200];
            data.cell.styles.textColor = [0, 128, 0];
          } else if (data.cell.text[0] === 'Fail') {
            data.cell.styles.fillColor = [255, 200, 200];
            data.cell.styles.textColor = [128, 0, 0];
          }
        }
      }
    });

    // Add statistics
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text("Statistics:", 20, finalY);
    const passCount = sortedCandidates.filter(c => checkIsPass(c, cutOffsUsed)).length;
    const failCount = sortedCandidates.length - passCount;
    doc.text(`Total Candidates: ${sortedCandidates.length}`, 20, finalY + 10);
    doc.text(`Passed: ${passCount}`, 20, finalY + 20);
    doc.text(`Failed: ${failCount}`, 20, finalY + 30);
    doc.text(`Pass Rate: ${((passCount / sortedCandidates.length) * 100).toFixed(1)}%`, 20, finalY + 40);

    doc.save(`${exam.name}_Results.pdf`);
  };

  // Handle section-wise cutoff changes
  const handleSectionCutOffChange = (section, value) => {
    setSectionCutOffs(prev => ({
      ...prev,
      [section]: parseFloat(value) || 0
    }));
  };

  // Reset to single cutoff mode
  const resetToSingleCutoff = () => {
    setSectionCutOffs({});
  };

  // Enable section-wise cutoffs
  const enableSectionCutoffs = () => {
    const initialCutoffs = {};
    processedSubjects.displayColumns.forEach(column => {
      initialCutoffs[column] = customCutOff || selectedExam?.cutOff || 0;
    });
    setSectionCutOffs(initialCutoffs);
  };

  if (!selectedExam) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedExam.name}</h2>
          {/* <button className="close-button" onClick={closeModal} style={{ backgroundColor: '#0056b3' }}>close</button> */}
        </div>
        
        <div className="modal-body">
          {loading && <div>Loading subject data...</div>}
          {error && <div className="error-message">{error}</div>}
          
          <div className="exam-info">
            <p><strong>Date:</strong> {selectedExam.date}</p>
            <p><strong>Total Candidates:</strong> {selectedExam.candidates?.length || 0}</p>
          </div>

          {/* Cutoff Controls */}
          <div className="cutoff-controls">
            <h3>Cutoff Settings</h3>
            
            {Object.keys(sectionCutOffs).length === 0 ? (
              <div className="single-cutoff-mode">
                <label>
                  Single Cutoff for All Subjects:
                  <input
                    type="number"
                    value={customCutOff !== null ? customCutOff : selectedExam.cutOff}
                    onChange={(e) => setCustomCutOff(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                  />
                </label>
                <button onClick={enableSectionCutoffs} className="enable-section-btn" style={{ backgroundColor: '#0056b3' }}>
                  Enable Section-wise Cutoffs
                </button>
              </div>
            ) : (
              <div className="section-cutoff-mode">
                <h4>Section-wise Cutoffs:</h4>
                {processedSubjects.displayColumns.map(column => (
                  <div key={column} className="cutoff-input">
                    <label>
                      {column}:
                      <input
                        type="number"
                        value={sectionCutOffs[column] || 0}
                        onChange={(e) => handleSectionCutOffChange(column, e.target.value)}
                        step="0.1"
                        min="0"
                      />
                    </label>
                  </div>
                ))}
                <button onClick={resetToSingleCutoff} className="reset-cutoff-btn" style={{ backgroundColor: '#0056b3' }}>
                  Back to Single Cutoff
                </button>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="charts-container">
            <div className="chart-section">
              <h3>Pass/Fail Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieData(selectedExam)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
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

            {selectedCandidate && (
              <div className="chart-section">
                <h3>Subject Scores - {selectedCandidate.name}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getBarChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    {processedSubjects.displayColumns.map((column, index) => (
                      <Bar 
                        key={column} 
                        dataKey={column} 
                        fill={BAR_COLORS[index % BAR_COLORS.length]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Candidate Table */}
          <div className="table-section">
            <h3>Candidate Results</h3>
            <CandidateTable
              exam={selectedExam}
              examStatistics={examStatistics}
              cutOff={Object.keys(sectionCutOffs).length > 0 ? sectionCutOffs : 
                     (customCutOff !== null ? customCutOff : selectedExam.cutOff)}
              selectedCandidate={selectedCandidate}
              setSelectedCandidate={setSelectedCandidate}
              isPass={checkIsPass}
            />
            <div className="table-header">
              
              <button onClick={() => exportToPDF(selectedExam)} className="export-btn" style={{ backgroundColor: '#0056b3', width:'50%' }}>
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailsModal;