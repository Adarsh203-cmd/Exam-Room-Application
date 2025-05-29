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
import CandidateTable from "./ExamCandidateTable";
import { apiClient } from '../../config/api';

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

  // Fetch exam statistics when exam is selected
  useEffect(() => {
    const fetchExamStatistics = async () => {
      if (!selectedExam || !selectedExam.id) return;

      setLoading(true);
      try {
        const response = await apiClient.get(
          `/api/evaluation/exam-statistics/${selectedExam.id}/`
        );
        setExamStatistics(response.data);

        // Now fetch candidate subject scores
        try {
          const candidatesSubjectData = await apiClient.get(
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

    let cutOff = customCutOff !== null ? customCutOff : exam.cutOff;
    let pass = 0;
    let fail = 0;
    exam.candidates.forEach((c) => {
      if (isPass(c, cutOff)) pass++;
      else fail++;
    });
    return [
      { name: "Pass", value: pass },
      { name: "Fail", value: fail },
    ];
  };

  // Get data for the bar chart
  const getBarChartData = () => {
    if (!selectedCandidate) return [];

    // For dynamic subjects from API
    if (
      examStatistics &&
      examStatistics.subject_statistics &&
      selectedCandidate.subjectScores
    ) {
      const data = { name: selectedCandidate.name };

      // Add each subject to the data with the getSubjectScore helper function
      examStatistics.subject_statistics.forEach((statistic) => {
        const subject = statistic.subject;
        let score;

        // Use the same logic as in CandidateTable to get scores
        if (selectedCandidate.subjectScores[subject] !== undefined) {
          score = selectedCandidate.subjectScores[subject];
        } else {
          // Try case-insensitive search
          const subjectKey = Object.keys(selectedCandidate.subjectScores).find(
            (key) => key.toLowerCase() === subject.toLowerCase()
          );

          if (subjectKey) {
            score = selectedCandidate.subjectScores[subjectKey];
          } else {
            // Direct property fallback
            score = selectedCandidate[subject.toLowerCase()] || 0;
          }
        }

        data[subject] = score;
      });

      return [data];
    }

    // Fallback to hardcoded subjects
    return [
      {
        name: selectedCandidate.name,
        Aptitude: selectedCandidate.aptitude || 0,
        Reasoning: selectedCandidate.reasoning || 0,
        Networks: selectedCandidate.networks || 0,
      },
    ];
  };

  // Get bar colors for dynamic subjects
  const getBarColors = () => {
    if (!examStatistics || !examStatistics.subject_statistics) {
      // Fallback for hardcoded subjects
      return ["Aptitude", "Reasoning", "Networks"].map(
        (_, i) => BAR_COLORS[i % BAR_COLORS.length]
      );
    }

    // Get subject names from statistics or from selectedCandidate.subjectScores if available
    const subjects =
      selectedCandidate && selectedCandidate.subjectScores
        ? Object.keys(selectedCandidate.subjectScores)
        : examStatistics.subject_statistics.map((stat) => stat.subject);

    // Return colors for each subject
    return subjects.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]);
  };

  // Export exam results to PDF
  const exportToPDF = (exam) => {
    if (!exam || !exam.name) {
      alert("Exam data is missing");
      return;
    }

    const cutOffUsed = customCutOff !== null ? customCutOff : exam.cutOff;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${exam.name} - Results`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${exam.date}`, 20, 30);
    doc.text(`Cut-off Score (applied to all subjects): ${cutOffUsed}`, 20, 40);

    // Get subject headers from exam statistics or fallback to defaults
    let subjectHeaders = ["Aptitude", "Reasoning", "Networks"];

    if (examStatistics && examStatistics.subject_statistics) {
      subjectHeaders = examStatistics.subject_statistics.map(
        (stat) => stat.subject
      );
    }

    // Sort candidates for PDF
    const sortedCandidates = [...exam.candidates].sort((a, b) => {
      const aStatus = isPass(a, cutOffUsed) ? 1 : 0;
      const bStatus = isPass(b, cutOffUsed) ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;
      return b.score - a.score;
    });

    // Create table data with dynamic subject columns
    const tableData = sortedCandidates.map((c) => {
      const row = [c.name, c.score];

      // Add each subject score
      if (c.subjectScores) {
        subjectHeaders.forEach((subject) => {
          row.push(
            c.subjectScores[subject] !== undefined
              ? c.subjectScores[subject]
              : "N/A"
          );
        });
      } else {
        // Fallback to hardcoded subjects
        row.push(c.aptitude || "N/A");
        row.push(c.reasoning || "N/A");
        row.push(c.networks || "N/A");
      }

      // Add status column
      row.push(isPass(c, cutOffUsed) ? "Pass" : "Fail");

      return row;
    });

    // Create header row with dynamic subject columns
    const headerRow = ["Name", "Total Score", ...subjectHeaders, "Status"];

    autoTable(doc, {
      head: [headerRow],
      body: tableData,
      startY: 50,
    });

    doc.save(`${exam.name.replace(/\s+/g, "_")}_Report.pdf`);
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {popupData && popupData.current && (
          <>
            <h2>{popupData.current.title}</h2>
            <div className="modal-body">
              {popupData.current.content}
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
            <p>Total Candidates: {selectedExam.candidates.length}</p>

            {loading && <p>Loading subject data...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <label>
              Cut-off Score (applies to all subjects):&nbsp;
              <input
                type="number"
                min="0"
                max="100"
                value={
                  customCutOff !== null ? customCutOff : selectedExam.cutOff
                }
                onChange={(e) => setCustomCutOff(Number(e.target.value))}
                style={{ padding: "5px", width: "80px" }}
              />
            </label>

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
                      data={getPieData(selectedExam)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {getPieData(selectedExam).map((entry, index) => (
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
                      <h3>Candidate Performance</h3>
                      <button
                        onClick={() => setSelectedCandidate(null)}
                        style={{
                          background: "none",
                          border: "1px solid #007BFF",
                          color: "#007BFF",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Clear Selection
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={getBarChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {/* Dynamically generate Bars based on subjects */}
                        {examStatistics && examStatistics.subject_statistics ? (
                          examStatistics.subject_statistics.map(
                            (subject, index) => (
                              <Bar
                                key={subject.subject}
                                dataKey={subject.subject}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                              />
                            )
                          )
                        ) : (
                          // Fallback to hardcoded subjects
                          <>
                            <Bar dataKey="Aptitude" fill="#8884d8" />
                            <Bar dataKey="Reasoning" fill="#82ca9d" />
                            <Bar dataKey="Networks" fill="#ffc658" />
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <p>Select a candidate to view detailed performance</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>Candidate Breakdown</h3>
                <div>
                  <button
                    onClick={() => exportToPDF(selectedExam)}
                    style={{
                      background: "#00cc47",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <CandidateTable
                exam={selectedExam}
                examStatistics={examStatistics}
                cutOff={
                  customCutOff !== null ? customCutOff : selectedExam.cutOff
                }
                selectedCandidate={selectedCandidate}
                setSelectedCandidate={setSelectedCandidate}
                isPass={isPass}
              />
            </div>

            <button className="modal-back-button" onClick={closeModal}>
              BACK
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamDetailsModal;
