//CandidateTable.jsx
import React, { useState, useEffect } from 'react';

const CandidateTable = ({ 
  exam, 
  examStatistics,
  cutOff, 
  selectedCandidate, 
  setSelectedCandidate, 
  isPass 
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'score',
    direction: 'desc'
  });
  const [sortedCandidates, setSortedCandidates] = useState([]);
  const [processedSubjects, setProcessedSubjects] = useState({
    aptitudeSubjects: [],
    technicalSubjects: [],
    generalSubjects: [],
    allSubjects: []
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
      
      setProcessedSubjects({
        aptitudeSubjects,
        technicalSubjects,
        generalSubjects,
        allSubjects: subjects
      });
    }
  }, [examStatistics]);
  
  // Sort candidates function
  useEffect(() => {
    if (!exam || !exam.candidates) return;
    
    // Create a new array to avoid mutating the original
    const candidatesCopy = [...exam.candidates];
    
    // First sort by pass/fail status (pass first)
    candidatesCopy.sort((a, b) => {
      // First sort by pass/fail status
      const aStatus = isPass(a, cutOff) ? 1 : 0;
      const bStatus = isPass(b, cutOff) ? 1 : 0;
      
      if (aStatus !== bStatus) return bStatus - aStatus;
      
      // Then sort by the specified column
      // Handle sorting by grouped subjects
      if (sortConfig.key === 'APTITUDE') {
        const aScore = getGroupedScore(a, processedSubjects.aptitudeSubjects);
        const bScore = getGroupedScore(b, processedSubjects.aptitudeSubjects);
        
        if (aScore < bScore) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aScore > bScore) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      if (sortConfig.key === 'TECHNICAL') {
        const aScore = getGroupedScore(a, processedSubjects.technicalSubjects);
        const bScore = getGroupedScore(b, processedSubjects.technicalSubjects);
        
        if (aScore < bScore) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aScore > bScore) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle sorting by general subjects
      if (processedSubjects.generalSubjects.includes(sortConfig.key)) {
        const aScore = getSubjectScore(a, sortConfig.key);
        const bScore = getSubjectScore(b, sortConfig.key);
        
        const aScoreNum = aScore === 'N/A' ? -1 : parseFloat(aScore);
        const bScoreNum = bScore === 'N/A' ? -1 : parseFloat(bScore);
        
        if (aScoreNum < bScoreNum) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aScoreNum > bScoreNum) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Regular property sorting (name, score)
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setSortedCandidates(candidatesCopy);
  }, [exam, cutOff, sortConfig, isPass, processedSubjects]);
  
  // Handle sorting when a column header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Helper to get the sorting indicator
  const getSortIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };
  
  // Handle row selection
  const handleRowClick = (candidate) => {
    setSelectedCandidate(candidate);
  };
  
  // Get subject score with simplified logic to reduce console logs and improve performance
  const getSubjectScore = (candidate, subject) => {
    if (!candidate) return 'N/A';
    
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
    
    return 'N/A';
  };
  
  // Get grouped score (sum of all subjects in a group)
  const getGroupedScore = (candidate, subjectList) => {
    if (!candidate || !subjectList || subjectList.length === 0) return 0;
    
    let totalScore = 0;
    let hasValidScore = false;
    
    subjectList.forEach(subject => {
      const score = getSubjectScore(candidate, subject);
      if (score !== 'N/A') {
        totalScore += parseFloat(score) || 0;
        hasValidScore = true;
      }
    });
    
    return hasValidScore ? totalScore : 'N/A';
  };
  
  // Check if a specific grouped subject score is below the cutoff
  const isGroupedSubjectFailed = (candidate, subjectList, cutOff) => {
    const score = getGroupedScore(candidate, subjectList);
    return score !== 'N/A' && parseFloat(score) < cutOff;
  };
  
  // Check if a specific individual subject score is below the cutoff
  const isSubjectFailed = (candidate, subject, cutOff) => {
    const score = getSubjectScore(candidate, subject);
    return score !== 'N/A' && parseFloat(score) < cutOff;
  };
  
  if (!exam || !exam.candidates) {
    return <div>No candidate data available</div>;
  }
  
  return (
    <div className="candidate-table-container" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th 
              style={tableHeaderStyle} 
              onClick={() => requestSort('name')}
            >
              Name{getSortIndicator('name')}
            </th>
            <th 
              style={tableHeaderStyle} 
              onClick={() => requestSort('score')}
            >
              Total Score{getSortIndicator('score')}
            </th>
            
            {/* APTITUDE column (if APT subjects exist) */}
            {processedSubjects.aptitudeSubjects.length > 0 && (
              <th 
                style={tableHeaderStyle} 
                onClick={() => requestSort('APTITUDE')}
              >
                APTITUDE{getSortIndicator('APTITUDE')}
              </th>
            )}
            
            {/* TECHNICAL column (if TECH subjects exist) */}
            {processedSubjects.technicalSubjects.length > 0 && (
              <th 
                style={tableHeaderStyle} 
                onClick={() => requestSort('TECHNICAL')}
              >
                TECHNICAL{getSortIndicator('TECHNICAL')}
              </th>
            )}
            
            {/* Individual GENERAL subject columns */}
            {processedSubjects.generalSubjects.map((subject) => (
              <th 
                key={subject}
                style={tableHeaderStyle} 
                onClick={() => requestSort(subject)}
              >
                {subject}{getSortIndicator(subject)}
              </th>
            ))}
            
            <th style={tableHeaderStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((candidate, index) => {
            // Determine if candidate passes
            const pass = isPass(candidate, cutOff);
            
            // Determine row styling based on selection and pass/fail status
            const rowStyle = {
              ...tableRowStyle,
              backgroundColor: selectedCandidate && selectedCandidate.name === candidate.name
                ? '#e8f4ff'  // Selected row highlight
                : pass ? '#f0fff4' : '#fff5f5',  // Pass/fail background
              cursor: 'pointer'
            };
            
            return (
              <tr 
                key={index} 
                style={rowStyle} 
                onClick={() => handleRowClick(candidate)}
              >
                <td style={tableCellStyle}>{candidate.name}</td>
                <td style={tableCellStyle}>{candidate.score}</td>
                
                {/* APTITUDE score cell */}
                {processedSubjects.aptitudeSubjects.length > 0 && (
                  <td style={tableCellStyle}>
                    <span style={isGroupedSubjectFailed(candidate, processedSubjects.aptitudeSubjects, cutOff) ? failTextStyle : null}>
                      {getGroupedScore(candidate, processedSubjects.aptitudeSubjects)}
                    </span>
                  </td>
                )}
                
                {/* TECHNICAL score cell */}
                {processedSubjects.technicalSubjects.length > 0 && (
                  <td style={tableCellStyle}>
                    <span style={isGroupedSubjectFailed(candidate, processedSubjects.technicalSubjects, cutOff) ? failTextStyle : null}>
                      {getGroupedScore(candidate, processedSubjects.technicalSubjects)}
                    </span>
                  </td>
                )}
                
                {/* General subject score cells */}
                {processedSubjects.generalSubjects.map((subject) => {
                  const score = getSubjectScore(candidate, subject);
                  const failed = isSubjectFailed(candidate, subject, cutOff);
                  
                  return (
                    <td key={subject} style={tableCellStyle}>
                      <span style={failed ? failTextStyle : null}>
                        {score}
                      </span>
                    </td>
                  );
                })}
                
                <td style={tableCellStyle}>
                  <span style={{
                    fontWeight: 'bold',
                    color: pass ? '#38A169' : '#E53E3E'
                  }}>
                    {pass ? 'Pass' : 'Fail'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const tableHeaderStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  backgroundColor: '#f8f9fa',
  cursor: 'pointer'
};

const tableRowStyle = {
  borderBottom: '1px solid #ddd',
  transition: 'background-color 0.2s'
};

const tableCellStyle = {
  padding: '10px 8px',
  textAlign: 'left'
};

const failTextStyle = {
  color: '#E53E3E',
  fontWeight: 'bold'
};

export default CandidateTable;