// frontend/src/components/dashboard/ScheduledExams.jsx
import React, { useEffect, useState } from "react";
import { apiClient } from '../../config/api';

const ScheduledExams = () => {
  const [scheduledExams, setScheduledExams] = useState([]);

  useEffect(() => {
    apiClient
      .get("/api/exam_allotment/exams/scheduled/")
      .then((res) => setScheduledExams(res.data))
      .catch((err) => console.error("Error fetching scheduled exams:", err));
  }, []);
  return (
    <div>
      <h2>Scheduled Exams</h2>
      {scheduledExams.map((exam) => (
        <div
          key={exam.exam_token}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{exam.exam_title}</h3>
          <p>Start: {new Date(exam.exam_start_time).toLocaleString()}</p>
          <p>End: {new Date(exam.exam_end_time).toLocaleString()}</p>
          <p>
            URL: <a href={exam.exam_url}>{exam.exam_url}</a>
          </p>
          <p>Token: {exam.exam_token}</p>
          {/* You can add assigned candidates dropdown here later */}
        </div>
      ))}
    </div>
  );
};

export default ScheduledExams;
