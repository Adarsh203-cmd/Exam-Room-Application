import { useEffect, useState } from "react";

const API_BASE = "/api/exam_content";

const QuestionManagerPage = () => {
  const [questionType, setQuestionType] = useState("mcq");
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ subject: "", difficulty: "" });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [errors, setErrors] = useState({});
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Fetch subjects from database
  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const response = await fetch('/api/exam_allotment/subjects/');
      if (response.ok) {
        const data = await response.json();
        setSubjectOptions(data || []);
      } else {
        console.error('Failed to fetch subjects:', response.statusText);
        // Fallback to default subjects if API fails
        setSubjectOptions([
          "Mathematics",
          "Physics", 
          "Chemistry",
          "Biology",
          "Computer Science"
        ]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to default subjects if API fails
      setSubjectOptions([
        "Mathematics",
        "Physics",
        "Chemistry", 
        "Biology",
        "Computer Science"
      ]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      let url = `${API_BASE}/${questionType}/list/?`;
      if (filters.subject) url += `subject=${filters.subject}&`;
      if (filters.difficulty) url += `difficulty=${filters.difficulty}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        console.error('Failed to fetch questions:', response.statusText);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    }
  };

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [questionType, filters]);

  const deleteQuestion = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`${API_BASE}/${questionType}/${id}/`, {
        method: "DELETE",
      });
      if (response.status === 204) {
        alert("Deleted successfully");
        fetchQuestions();
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert("Error occurred while deleting question");
    }
  };

  const validate = () => {
    let tempErrors = {};

    // Common validation for all question types
    if (
      !editingQuestion.question_text ||
      editingQuestion.question_text.trim() === ""
    ) {
      tempErrors.question_text = "Question text cannot be empty";
    }

    if (questionType === "mcq") {
      if (editingQuestion.options.length < 2) {
        tempErrors.options = "At least two options are required";
      }

      // Check if all option fields are filled
      if (editingQuestion.options.some((opt) => !opt || opt.trim() === "")) {
        tempErrors.options = "All option fields must be filled";
      }

      if (
        !editingQuestion.correct_answers ||
        editingQuestion.correct_answers.length < 1
      ) {
        tempErrors.correct_answers =
          "Please select at least one correct answer";
      }
    } else {
      // Fill in the blank type validation
      if (
        !editingQuestion.correct_answers ||
        editingQuestion.correct_answers.trim() === ""
      ) {
        tempErrors.correct_answers = "Correct answer cannot be empty";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const updateQuestion = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE}/${questionType}/${editingQuestion.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingQuestion),
        }
      );
      if (response.ok) {
        alert("Updated successfully!");
        setEditingQuestion(null);
        fetchQuestions();
        setErrors({});
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert("Error occurred while updating question");
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...editingQuestion.options];
    newOptions[idx] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const toggleCorrectAnswer = (option) => {
    let newCorrect = [...(editingQuestion.correct_answers || [])];
    if (newCorrect.includes(option)) {
      newCorrect = newCorrect.filter((ans) => ans !== option);
    } else {
      newCorrect.push(option);
    }
    setEditingQuestion({ ...editingQuestion, correct_answers: newCorrect });
  };

  const addOption = () => {
    setEditingQuestion({
      ...editingQuestion,
      options: [...(editingQuestion.options || []), ""],
    });
  };

  const deleteOption = (idx) => {
    const newOptions = editingQuestion.options.filter((_, i) => i !== idx);
    const newCorrect = (editingQuestion.correct_answers || []).filter((ans) =>
      newOptions.includes(ans)
    );
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions,
      correct_answers: newCorrect,
    });
  };

  const renderEditForm = () => (
    <div className="modal">
      <h3>Edit Question</h3>
      <textarea
        rows={4}
        value={editingQuestion.question_text}
        onChange={(e) =>
          setEditingQuestion({
            ...editingQuestion,
            question_text: e.target.value,
          })
        }
        className="text-area"
        placeholder="Enter question text..."
      />
      {errors.question_text && (
        <div className="error">{errors.question_text}</div>
      )}

      {questionType === "mcq" ? (
        <>
          <label>Options:</label>
          {editingQuestion.options.map((opt, idx) => (
            <div key={idx} className="option-row">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="option-input"
                placeholder={`Option ${idx + 1}`}
              />
              <input
                type="checkbox"
                checked={(editingQuestion.correct_answers || []).includes(opt)}
                onChange={() => toggleCorrectAnswer(opt)}
                className="correct-answer-checkbox"
                title="Mark as correct answer"
              />
              <button
                onClick={() => deleteOption(idx)}
                className="delete-button"
                title="Delete option"
                disabled={editingQuestion.options.length <= 2}
              >
                Delete
              </button>
            </div>
          ))}
          {errors.options && <div className="error">{errors.options}</div>}
          {errors.correct_answers && (
            <div className="error">{errors.correct_answers}</div>
          )}
          <button
            className="add-option-button"
            type="button"
            onClick={addOption}
          >
            Add Option
          </button>
        </>
      ) : (
        <>
          <label>Correct Answer:</label>
          <input
            type="text"
            value={editingQuestion.correct_answers}
            onChange={(e) =>
              setEditingQuestion({
                ...editingQuestion,
                correct_answers: e.target.value,
              })
            }
            className="text-input"
            placeholder="Enter the correct answer..."
          />
          {errors.correct_answers && (
            <div className="error">{errors.correct_answers}</div>
          )}
        </>
      )}

      <div className="button-group">
        <button className="update-button" onClick={updateQuestion}>
          Update
        </button>
        <button
          className="cancel-button"
          onClick={() => {
            setEditingQuestion(null);
            setErrors({});
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h2>Manage Questions</h2>
      <div className="filter-container">
        <label>
          Question Type:
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="filter-select"
          >
            <option value="mcq">MCQ</option>
            <option value="fill">Fill in the Blank</option>
          </select>
        </label>

        <label>
          Subject:
          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value })
            }
            className="filter-select"
            disabled={isLoadingSubjects}
          >
            <option value="">
              {isLoadingSubjects ? "Loading subjects..." : "All"}
            </option>
            {subjectOptions.map((subj, i) => (
              <option key={i} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty:
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
            className="filter-select"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
      </div>

      {editingQuestion && (
        <div
          className="overlay"
          onClick={() => {
            setEditingQuestion(null);
            setErrors({});
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {renderEditForm()}
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
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
            {questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td title={q.question_text}>
                    {q.question_text.length > 60 
                      ? `${q.question_text.slice(0, 60)}...` 
                      : q.question_text}
                  </td>
                  <td>{q.subject}</td>
                  <td>{q.difficulty}</td>
                  <td>{q.marks}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => setEditingQuestion(q)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  {isLoadingSubjects 
                    ? "Loading..." 
                    : "No questions available for selected filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionManagerPage;

// CSS Styles
const styles = `
.container {
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  max-width: 1200px;
  margin: auto;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

.filter-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-container label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 500;
  color: #555;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  min-width: 150px;
}

.filter-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  max-width: 90vw;
  max-height: 90vh;
}

.modal {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 700px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin-bottom: 1rem;
  color: #333;
}

.text-area, .text-input {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.text-area {
  resize: vertical;
  min-height: 100px;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 8px;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.correct-answer-checkbox {
  width: 18px;
  height: 18px;
}

.delete-button, .edit-button, .update-button, .cancel-button, .add-option-button {
  padding: 8px 16px;
  background-color: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.delete-button:hover, .edit-button:hover, .update-button:hover, 
.cancel-button:hover, .add-option-button:hover {
  opacity: 0.9;
}

.delete-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-option-button {
  margin-top: 0.5rem;
  background-color: #28a745;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.update-button {
  background-color: #28a745;
}

.cancel-button {
  background-color: #6c757d;
}

.error {
  color: #dc3545;
  margin-bottom: 0.5rem;
  font-size: 14px;
  background-color: #f8d7da;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button {
  background-color: #28a745;
  padding: 6px 12px;
  font-size: 12px;
}

.delete-button {
  background-color: #dc3545;
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .filter-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal {
    min-width: auto;
    width: 95%;
    padding: 16px;
  }
  
  .option-row {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
`;

const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);