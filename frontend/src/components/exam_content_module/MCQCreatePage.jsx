import { useState } from 'react';

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

const MCQCreatePage = () => {
  const [questionType, setQuestionType] = useState('MCQ');

  const [mcqData, setMcqData] = useState({
    subject: '',
    question_text: '',
    options: [],
    answer_type: 'Single',
    correct_answers: [],
    difficulty: 'Easy',
    marks: 1,
  });

  const [fibData, setFibData] = useState({
    subject: '',
    question_text: '',
    correct_answers: '',
    difficulty: 'Easy',
    marks: 1,
  });

  const [newOption, setNewOption] = useState('');

  // For validation error messages
  const [errors, setErrors] = useState({});

  const addOption = () => {
    if (!newOption.trim()) return;
    if (mcqData.options.includes(newOption.trim())) return;
    setMcqData(prev => ({ ...prev, options: [...prev.options, newOption.trim()] }));
    setNewOption('');
    setErrors(prev => ({ ...prev, options: null })); // clear options error on add
  };

  const removeOption = (option) => {
    setMcqData(prev => {
      const filteredOptions = prev.options.filter(opt => opt !== option);
      const filteredCorrectAnswers = prev.correct_answers.filter(ans => ans !== option);
      return { ...prev, options: filteredOptions, correct_answers: filteredCorrectAnswers };
    });
    setErrors(prev => ({ ...prev, options: null, correct_answers: null }));
  };

  const toggleCorrectAnswer = (option) => {
    if (mcqData.answer_type === 'Single') {
      setMcqData({ ...mcqData, correct_answers: [option] });
    } else {
      const current = mcqData.correct_answers.includes(option)
        ? mcqData.correct_answers.filter(ans => ans !== option)
        : [...mcqData.correct_answers, option];
      setMcqData({ ...mcqData, correct_answers: current });
    }
    setErrors(prev => ({ ...prev, correct_answers: null })); // clear correct_answers error on change
  };

  const validate = () => {
    const newErrors = {};

    if (questionType === 'MCQ') {
      if (!mcqData.subject) newErrors.subject = 'Subject is required.';
      if (!mcqData.question_text.trim()) newErrors.question_text = 'Question text is required.';
      if (mcqData.options.length < 2) newErrors.options = 'Please add at least 2 options.';
      if (mcqData.correct_answers.length < 1) newErrors.correct_answers = 'Please select at least one correct answer.';
      if (!mcqData.difficulty) newErrors.difficulty = 'Difficulty is required.';
      if (!mcqData.marks || mcqData.marks < 1) newErrors.marks = 'Marks must be at least 1.';
    } else {
      // FIB validations
      if (!fibData.subject) newErrors.subject = 'Subject is required.';
      if (!fibData.question_text.trim()) newErrors.question_text = 'Question text is required.';
      if (!fibData.correct_answers.trim()) newErrors.correct_answers = 'Correct answer is required.';
      if (!fibData.difficulty) newErrors.difficulty = 'Difficulty is required.';
      if (!fibData.marks || fibData.marks < 1) newErrors.marks = 'Marks must be at least 1.';
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const data = questionType === 'MCQ' ? mcqData : fibData;
    const url = questionType === 'MCQ'
      ? 'http://localhost:8000/api/exam_content/mcq/create/'
      : 'http://localhost:8000/api/exam_content/fill/create/';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      alert(`${questionType} question created successfully!`);

      if (questionType === 'MCQ') {
        setMcqData({
          subject: '', question_text: '', options: [], answer_type: 'Single', correct_answers: [], difficulty: 'Easy', marks: 1
        });
      } else {
        setFibData({
          subject: '', question_text: '', correct_answers: '', difficulty: 'Easy', marks: 1
        });
      }
      setErrors({});
    } catch (err) {
      alert(err.message);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333',
    },
    selector: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
    },
    select: {
      width: '180px',
      padding: '10px',
      margin: '0 10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
      cursor: 'pointer',
    },
    formLabel: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '600',
    },
    textarea: {
      width: '100%',
      minHeight: '60px',
      padding: '10px',
      marginBottom: '5px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
      resize: 'vertical',
    },
    optionInputContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px',
    },
    addButton: {
      padding: '10px 16px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '600',
    },
    optionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: '6px 10px',
      marginBottom: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
    },
    optionText: {
      flexGrow: 1,
      fontSize: '14px',
    },
    removeButton: {
      marginLeft: '10px',
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#dc3545',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
    },
    answerTypeSelect: {
      width: '100%',
      padding: '10px',
      marginBottom: '5px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    marksInput: {
      width: '100%',
      padding: '10px',
      marginBottom: '20px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#28a745',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
    },
    errorText: {
      color: '#dc3545',
      fontSize: '12px',
      marginBottom: '10px',
      marginTop: '-10px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Question</h2>

      <div style={styles.selector}>
        <label style={{ marginRight: '8px' }}>Question Type:</label>
        <select
          style={styles.select}
          value={questionType}
          onChange={(e) => {
            setQuestionType(e.target.value);
            setErrors({});
          }}
        >
          <option value="MCQ">MCQ</option>
          <option value="FIB">Fill in the Blank</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Subject */}
        <label style={styles.formLabel}>Subject</label>
        <select
          style={styles.select}
          value={questionType === 'MCQ' ? mcqData.subject : fibData.subject}
          onChange={(e) => questionType === 'MCQ'
            ? setMcqData({ ...mcqData, subject: e.target.value })
            : setFibData({ ...fibData, subject: e.target.value })}
          required
        >
          <option value="" disabled>Select Subject</option>
          {SUBJECT_OPTIONS.map((subj, index) => (
            <option key={index} value={subj}>{subj}</option>
          ))}
        </select>
        {errors.subject && <div style={styles.errorText}>{errors.subject}</div>}

        {/* Question Text */}
        <label style={styles.formLabel}>Question Text</label>
        <textarea
          style={styles.textarea}
          placeholder="Enter question text"
          value={questionType === 'MCQ' ? mcqData.question_text : fibData.question_text}
          onChange={(e) => questionType === 'MCQ'
            ? setMcqData({ ...mcqData, question_text: e.target.value })
            : setFibData({ ...fibData, question_text: e.target.value })}
          required
        />
        {errors.question_text && <div style={styles.errorText}>{errors.question_text}</div>}

        {/* MCQ specific fields */}
        {questionType === 'MCQ' && (
          <>
            <label style={styles.formLabel}>Add Option</label>
            <div style={styles.optionInputContainer}>
              <input
                type="text"
                placeholder="Add Option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                style={{ ...styles.select, flexGrow: 1 }}
              />
              <button type="button" onClick={addOption} style={styles.addButton}>Add</button>
            </div>
            {errors.options && <div style={styles.errorText}>{errors.options}</div>}

            <div>
              {mcqData.options.map((option, index) => (
                <div key={index} style={styles.optionItem}>
                  <span style={styles.optionText}>{option}</span>
                  <input
                    type={mcqData.answer_type === 'Single' ? 'radio' : 'checkbox'}
                    name="correct"
                    value={option}
                    checked={mcqData.correct_answers.includes(option)}
                    onChange={() => toggleCorrectAnswer(option)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(option)}
                    style={styles.removeButton}
                    aria-label={`Remove option ${option}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.correct_answers && <div style={styles.errorText}>{errors.correct_answers}</div>}

            <label style={styles.formLabel}>Answer Type</label>
            <select
              style={styles.answerTypeSelect}
              value={mcqData.answer_type}
              onChange={(e) => setMcqData({ ...mcqData, answer_type: e.target.value, correct_answers: [] })}
            >
              <option value="Single">Single</option>
              <option value="Multiple">Multiple</option>
            </select>
          </>
        )}

        {/* FIB specific fields */}
        {questionType === 'FIB' && (
          <>
            <label style={styles.formLabel}>Correct Answers</label>
            <textarea
              style={styles.textarea}
              value={fibData.correct_answers}
              onChange={(e) => setFibData({ ...fibData, correct_answers: e.target.value })}
              placeholder="Expected answers (comma separated)"
            />
            {errors.correct_answers && <div style={styles.errorText}>{errors.correct_answers}</div>}
          </>
        )}

        {/* Difficulty */}
        <label style={styles.formLabel}>Difficulty</label>
        <select
          style={styles.select}
          value={questionType === 'MCQ' ? mcqData.difficulty : fibData.difficulty}
          onChange={(e) => questionType === 'MCQ'
            ? setMcqData({ ...mcqData, difficulty: e.target.value })
            : setFibData({ ...fibData, difficulty: e.target.value })}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        {errors.difficulty && <div style={styles.errorText}>{errors.difficulty}</div>}

        {/* Marks */}
        <label style={styles.formLabel}>Marks</label>
        <input
          type="number"
          min={1}
          style={styles.marksInput}
          value={questionType === 'MCQ' ? mcqData.marks : fibData.marks}
          onChange={(e) => questionType === 'MCQ'
            ? setMcqData({ ...mcqData, marks: Number(e.target.value) })
            : setFibData({ ...fibData, marks: Number(e.target.value) })}
        />
        {errors.marks && <div style={styles.errorText}>{errors.marks}</div>}

        <button type="submit" style={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default MCQCreatePage;