import React, { useState } from 'react';
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

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
      console.error(err.message);
      alert('Failed to create MCQ');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create MCQ Question</h2>
      <form onSubmit={handleSubmit}>
      <label>Subject:
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

<br /><br />

        <textarea
          placeholder="Question Text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
        /><br /><br />

        <input
          placeholder="Add Option"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
        />
        <button type="button" onClick={addOption}>Add</button>

        <ul>
          {formData.options.map((option, index) => (
            <li key={index}>
              <label>
                <input
                  type={formData.answer_type === 'Single' ? 'radio' : 'checkbox'}
                  name="correct"
                  value={option}
                  checked={formData.correct_answers.includes(option)}
                  onChange={() => toggleCorrectAnswer(option)}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>

        <label>Answer Type:
          <select
            value={formData.answer_type}
            onChange={(e) => setFormData({ ...formData, answer_type: e.target.value, correct_answers: [] })}
          >
            <option value="Single">Single</option>
            <option value="Multiple">Multiple</option>
          </select>
        </label><br /><br />

        <label>Difficulty:
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label><br /><br />

        <input
          type="number"
          placeholder="Marks"
          value={formData.marks}
          onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
        /><br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MCQCreatePage;
