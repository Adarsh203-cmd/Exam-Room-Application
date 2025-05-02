// frontend/src/components/dashboard/CompletedExams.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompletedExams = () => {
  const [completedExams, setCompletedExams] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/exam_allotment/exams/completed/')
      .then(res => setCompletedExams(res.data))
      .catch(err => console.error('Error fetching completed exams:', err));
  }, []);
  

  return (
    <div>
      <h2>Completed Exams</h2>
      {completedExams.map(exam => (
        <div key={exam.exam_token} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h3>{exam.exam_title}</h3>
          <p>Start: {new Date(exam.exam_start_time).toLocaleString()}</p>
          <p>End: {new Date(exam.exam_end_time).toLocaleString()}</p>
          <p>URL: <a href={exam.exam_url}>{exam.exam_url}</a></p>
          <p>Token: {exam.exam_token}</p>
          {/* You can add assigned candidates dropdown here later */}
        </div>
      ))}
    </div>
  );
};

export default CompletedExams;
