import { useEffect, useState } from "react";

const API_BASE = "/api/exam_content";
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
];

const QuestionManagerPage = () => {
  const [questionType, setQuestionType] = useState("mcq");
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ subject: "", difficulty: "" });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [errors, setErrors] = useState({});

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
    const confirm = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirm) return;
    const response = await fetch(`${API_BASE}/${questionType}/${id}/`, {
      method: "DELETE",
    });
    if (response.status === 204) {
      alert("Deleted successfully");
      fetchQuestions();
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
          >
            <option value="">All</option>
            {SUBJECT_OPTIONS.map((subj, i) => (
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
                  <td>{q.question_text.slice(0, 60)}...</td>
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
                  No questions available for selected filters.
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
}

.filter-container {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.filter-select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
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

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.text-area {
  width: 100%;
  margin-bottom: 0.25rem;
  padding: 10px;
}

.text-input {
  width: 100%;
  margin-bottom: 0.25rem;
  padding: 10px;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-input {
  flex-grow: 1;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.correct-answer-checkbox {
  margin-left: 10px;
}

.delete-button, .edit-button, .update-button, .cancel-button, .add-option-button {
  padding: 6px 12px;
  background-color: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-option-button {
  margin-top: 0.5rem;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.error {
  color: red;
  margin-bottom: 0.5rem;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f0f0f0;
  text-align: left;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-button {
  background-color: #4caf50; /* Green */
}

.delete-button {
  background-color: #f44336; /* Red */
}
`;

const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
