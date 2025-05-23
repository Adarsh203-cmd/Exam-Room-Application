import React, { useState } from 'react';
import "../../styles/create_exam_module_css/CreateExam.css";

const roles = ['Custom', 'Service Desk', 'System Admin'];
const subjectsList = ['Networking', 'Java', 'Linux', 'OS', 'Python'];

const CreateExam = () => {
  const today = new Date().toISOString().split('T')[0];
  const oneWeekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [role, setRole] = useState('Custom');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questionType, setQuestionType] = useState('');
  const [mcqCount, setMcqCount] = useState('');
  const [fillCount, setFillCount] = useState('');

  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const examDetails = {
      examName: e.target.examName.value,
      examDate: e.target.examDate.value,
      role,
      subjects: role === 'Custom' ? selectedSubjects : ['Predefined'],
      questionType,
      mcqCount: questionType.includes('MCQ') ? mcqCount : 0,
      fillCount: questionType.includes('Fillups') ? fillCount : 0,
    };

    console.log('Creating Exam:', examDetails);
    alert('Exam Created! Go to Write Exam Page.');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Create Exam</h2>

      <div className="form-group">
        <label>Exam Name:</label>
        <input name="examName" type="text" required />
      </div>

      <div className="form-group">
        <label>Exam Date:</label>
        <input
          name="examDate"
          type="date"
          required
          defaultValue={today}
          min={today}
          max={oneWeekLater}
        />
      </div>

      <div className="form-group">
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      {role === 'Custom' && (
        <div className="form-group">
          <label>Choose Subjects:</label>
          <div className="checkbox-group">
            {subjectsList.map((subj) => (
              <label key={subj} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subj)}
                  onChange={() => handleSubjectChange(subj)}
                />
                {subj}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Question Type:</label>
        <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
          <option value="">--Select--</option>
          <option value="MCQ">MCQ</option>
          <option value="Fillups">Fillups</option>
          <option value="Both">Both</option>
        </select>
      </div>

      {(questionType === 'MCQ' || questionType === 'Both') && (
        <div className="form-group">
          <label>Number of MCQ Questions:</label>
          <input type="number" min="1" onChange={(e) => setMcqCount(e.target.value)} />
        </div>
      )}

      {(questionType === 'Fillups' || questionType === 'Both') && (
        <div className="form-group">
          <label>Number of Fill-ups:</label>
          <input type="number" min="1" onChange={(e) => setFillCount(e.target.value)} />
        </div>
      )}

      <button type="submit">Create Exam</button>
    </form>
  );
};

export default CreateExam;
