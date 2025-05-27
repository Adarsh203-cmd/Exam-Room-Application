import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8000/api/exam_content';
const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const QuestionManagerPage = () => {
  const [questionType, setQuestionType] = useState('mcq');
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ subject: '', difficulty: '' });
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuestions = async () => {
    let url = `${API_BASE}/${questionType}/list/?`;
    if (filters.subject) url += `subject=${filters.subject}&`;
    if (filters.difficulty) url += `difficulty=${filters.difficulty}`;
    const response = await fetch(url);
    const data = await response.json();
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [questionType, filters]);

  const deleteQuestion = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this question?');
    if (!confirm) return;
    const response = await fetch(`${API_BASE}/${questionType}/${id}/`, {
      method: 'DELETE',
    });
    if (response.status === 204) {
      alert('Deleted successfully');
      fetchQuestions();
    }
  };

  const updateQuestion = async () => {
    const response = await fetch(`${API_BASE}/${questionType}/${editingQuestion.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingQuestion),
    });
    if (response.ok) {
      alert('Updated successfully!');
      setEditingQuestion(null);
      fetchQuestions();
    } else {
      alert('Update failed');
    }
  };

  const renderEditForm = () => (
    <div style={{ background: '#eee', padding: '1rem', marginBottom: '2rem' }}>
      <h3>Edit Question</h3>
      <textarea
        rows={4}
        value={editingQuestion.question_text}
        onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
      /><br /><br />
      {questionType === 'mcq' ? (
        <>
          <label>Options (JSON):</label>
          <textarea
            value={JSON.stringify(editingQuestion.options)}
            onChange={(e) =>
              setEditingQuestion({ ...editingQuestion, options: JSON.parse(e.target.value) })
            }
          /><br /><br />
          <label>Correct Answers (JSON):</label>
          <input
            value={JSON.stringify(editingQuestion.correct_answers)}
            onChange={(e) =>
              setEditingQuestion({ ...editingQuestion, correct_answers: JSON.parse(e.target.value) })
            }
          /><br /><br />
        </>
      ) : (
        <>
          <label>Correct Answer:</label>
          <input
            value={editingQuestion.correct_answers}
            onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answers: e.target.value })}
          /><br /><br />
        </>
      )}
      <button onClick={updateQuestion}>Update</button>
      <button onClick={() => setEditingQuestion(null)} style={{ marginLeft: '1rem' }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manage Questions</h2>

      <label>Question Type:
        <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
          <option value="mcq">MCQ</option>
          <option value="fill">Fill in the Blank</option>
        </select>
      </label>
      <br /><br />

      <label>Subject:
        <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })}>
          <option value="">All</option>
          {SUBJECT_OPTIONS.map((subj, i) => (
            <option key={i} value={subj}>{subj}</option>
          ))}
        </select>
      </label>

      <label style={{ marginLeft: '1rem' }}>Difficulty:
        <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>

      <br /><br />

      {editingQuestion && renderEditForm()}

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question Text</th>
            <th>Subject</th>
            <th>Difficulty</th>
            <th>Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>{q.question_text.slice(0, 60)}...</td>
              <td>{q.subject}</td>
              <td>{q.difficulty}</td>
              <td>{q.marks}</td>
              <td>
                <button onClick={() => setEditingQuestion(q)}>Edit</button>
                <button onClick={() => deleteQuestion(q.id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionManagerPage;
