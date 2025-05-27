import React from 'react';

const ExamReporting = ({ examReports, sortOrder, setSortOrder, setSelectedExam, setCustomCutOff, setSelectedCandidate }) => {
  // Sort the exam reports based on the sort order (date)
  const sortedReports = [...examReports].sort((a, b) =>
    sortOrder === 'asc'
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  return (
    <>
      <div className="report-filters">
        <label>Sort by Date:</label>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      <div className="card-grid">
        {sortedReports.length > 0 ? (
          sortedReports.map((exam) => (
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
              <p>Candidates: {exam.candidates.length}</p>
            </div>
          ))
        ) : (
          <div className="no-data-message">No exam reports available</div>
        )}
      </div>
    </>
  );
};

export default ExamReporting;