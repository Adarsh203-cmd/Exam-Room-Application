import React from 'react';
import EnhancedExamFilter from './EnhancedExamFilter';

const ExamReporting = ({ 
  examReports, 
  sortOrder, 
  setSortOrder, 
  setSelectedExam, 
  setCustomCutOff, 
  setSelectedCandidate,
  allExamReports,
  onFilterChange // Add this missing prop
}) => {
  // Sort the exam reports based on the sort order (date)
  const sortedReports = [...examReports].sort((a, b) =>
    sortOrder === 'asc'
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  );

  return (
    <>
      <div className="report-filters">
        <EnhancedExamFilter
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onFilterChange={onFilterChange}
          examReports={allExamReports || examReports}
        />
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
              <p>Date: {new Date(exam.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
              })}</p>
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