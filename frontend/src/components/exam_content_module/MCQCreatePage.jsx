import React, { useState } from 'react';
import "../../styles/exam_content_module_css/MCQCreatePage.css"; // Import the CSS file

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const MCQCreatePage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    question_text: '',
    options: [],
    answer_type: 'Single',
    correct_answers: [],
    difficulty: 'Easy',
    marks: 1,
  });

  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption && !formData.options.includes(newOption)) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption]
      }));
      setNewOption('');
    }
  };

  const toggleCorrectAnswer = (option) => {
    if (formData.answer_type === 'Single') {
      setFormData({ ...formData, correct_answers: [option] });
    } else {
      const current = formData.correct_answers.includes(option)
        ? formData.correct_answers.filter(ans => ans !== option)
        : [...formData.correct_answers, option];
      setFormData({ ...formData, correct_answers: current });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/exam_content/mcq/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create MCQ');

      alert('MCQ created successfully!');
      setFormData({
        subject: '',
        question_text: '',
        options: [],
        answer_type: 'Single',
        correct_answers: [],
        difficulty: 'Easy',
        marks: 1,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mcq-container">
      <h2>Create MCQ Question</h2>
      <form onSubmit={handleSubmit} className="mcq-form">

        <label>Subject</label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        >
          <option value="" disabled>Select Subject</option>
          {SUBJECT_OPTIONS.map((subj, index) => (
            <option key={index} value={subj}>{subj}</option>
          ))}
        </select>

        <label>Question Text</label>
        <textarea
          placeholder="Enter question text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          required
        />

        <label>Add Option</label>
        <div className="option-input">
          <input
            type="text"
            placeholder="Add Option"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
          />
          <button type="button" onClick={addOption}>Add</button>
        </div>

        <div className="options-list">
          {formData.options.map((option, index) => (
            <label key={index} className="option-item">
              <input
                type={formData.answer_type === 'Single' ? 'radio' : 'checkbox'}
                name="correct"
                value={option}
                checked={formData.correct_answers.includes(option)}
                onChange={() => toggleCorrectAnswer(option)}
              />
              {option}
            </label>
          ))}
        </div>

        <label>Answer Type</label>
        <select
          value={formData.answer_type}
          onChange={(e) => setFormData({ ...formData, answer_type: e.target.value, correct_answers: [] })}
        >
          <option value="Single">Single</option>
          <option value="Multiple">Multiple</option>
        </select>

        <label>Difficulty Level</label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <label>Marks</label>
        <input
          type="number"
          value={formData.marks}
          onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
        />

        <button type="submit" className="submit-btn">Submit Question</button>
      </form>
    </div>
  );
};

export default MCQCreatePage;
