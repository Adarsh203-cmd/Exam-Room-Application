import React, { useState } from 'react';
import "../../styles/exam_content_module_css/FillInTheBlankCreatePage.css"; // ⬅️ Make sure to create this CSS file

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const FillInTheBlankCreatePage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    question_text: '',
    correct_answers: '',
    difficulty: 'Easy',
    marks: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/exam_content/fill/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      alert('Fill-in-the-Blank question created successfully!');
      setFormData({
        subject: '',
        question_text: '',
        correct_answers: '',
        difficulty: 'Easy',
        marks: 1,
      });
    } catch (err) {
      console.error(err.message);
      alert('Failed to create Fill-in-the-Blank question');
    }
  };

  return (
    <div className="container">
      <h2 className="heading">Create Fill-in-the-Blank Question</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Subject:
          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          >
            <option value="" disabled>Select Subject</option>
            {SUBJECT_OPTIONS.map((subj, index) => (
              <option key={index} value={subj}>{subj}</option>
            ))}
          </select>
        </label>

        <label>
          Question Text:
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            placeholder="Enter your question"
          />
        </label>

        <label>
          Correct Answers:
          <textarea
            value={formData.correct_answers}
            onChange={(e) => setFormData({ ...formData, correct_answers: e.target.value })}
            placeholder="Expected answers (comma separated)"
          />
        </label>

        <label>
          Difficulty:
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>

        <label>
          Marks:
          <input
            type="number"
            value={formData.marks}
            onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
          />
        </label>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default FillInTheBlankCreatePage;
