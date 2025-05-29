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
  const [subjectColumns, setSubjectColumns] = useState(['aptitude', 'reasoning', 'networks']);
  
  // Set up subject columns from exam statistics
  useEffect(() => {
    if (examStatistics && examStatistics.subject_statistics) {
      // Extract subject names from the statistics
      const subjects = examStatistics.subject_statistics.map(stat => stat.subject);
      setSubjectColumns(subjects);
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
      // Handle sorting by subject scores
      if (sortConfig.key.startsWith('subject_')) {
        const subjectName = sortConfig.key.replace('subject_', '');
        
        const aScore = a.subjectScores ? 
          (a.subjectScores[subjectName] !== undefined ? a.subjectScores[subjectName] : -1) : 
          (a[subjectName.toLowerCase()] !== undefined ? a[subjectName.toLowerCase()] : -1);
          
        const bScore = b.subjectScores ? 
          (b.subjectScores[subjectName] !== undefined ? b.subjectScores[subjectName] : -1) : 
          (b[subjectName.toLowerCase()] !== undefined ? b[subjectName.toLowerCase()] : -1);
        
        if (aScore < bScore) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aScore > bScore) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Regular property sorting
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setSortedCandidates(candidatesCopy);
  }, [exam, cutOff, sortConfig, isPass]);
  
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
}
  
  // Check if a specific subject score is below the cutoff
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
            
            {/* Dynamic subject columns */}
            {subjectColumns.map((subject) => (
              <th 
                key={subject}
                style={tableHeaderStyle} 
                onClick={() => requestSort(`subject_${subject}`)}
              >
                {subject}{getSortIndicator(`subject_${subject}`)}
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
                
                {/* Dynamic subject score cells */}
                {subjectColumns.map((subject) => {
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