import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/exam_allotment_css/CreateExamForm.css";

const CreateExamForm = () => {
  const [subjects, setSubjects] = useState([]);
  const [forms, setForms] = useState([
    { subjectId: "", numQuestions: "", questions: [] },
    { subjectId: "", numQuestions: "", questions: [] },
    { subjectId: "", numQuestions: "", questions: [] },
    { subjectId: "", numQuestions: "", questions: [] },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/subject/");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const handleFormChange = (index, field, value) => {
    const updatedForms = [...forms];
    updatedForms[index][field] = value;
    setForms(updatedForms);
  };

  const handleGenerateQuestions = async (index) => {
    const { subjectId, numQuestions } = forms[index];
    if (!subjectId || !numQuestions) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/random-questions/?subject_id=${subjectId}&count=${numQuestions}`
      );
      const data = await response.json();

      const updatedForms = [...forms];
      updatedForms[index].questions = data;
      setForms(updatedForms);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If you need to POST to backend, do it here.
    console.log("Form Submitted:", forms);
    navigate("/exam-config");
  };

  return (
    <form className="create-exam-container" onSubmit={handleSubmit}>
      <div className="form-content">
        {forms.map((form, index) => (
          <div key={index} className="form-section">
            <h3>Subject {index + 1}</h3>

            <label>Subject:</label>
            <select
              value={form.subjectId}
              onChange={(e) => handleFormChange(index, "subjectId", e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>

            <label>Number of Questions:</label>
            <input
              type="number"
              value={form.numQuestions}
              onChange={(e) => handleFormChange(index, "numQuestions", e.target.value)}
            />

            <button type="button" onClick={() => handleGenerateQuestions(index)}>
              Generate Questions
            </button>

            {form.questions.length > 0 && (
              <div className="question-list">
                {form.questions.map((q, idx) => (
                  <div key={idx} className="question-item">
                    <h4>Q{idx + 1}: {q.question_text}</h4>
                    <ul>
                      <li>A. {q.option1}</li>
                      <li>B. {q.option2}</li>
                      <li>C. {q.option3}</li>
                      <li>D. {q.option4}</li>
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="submit-section">
        <button type="submit" className="submit-btn">
          Continue to Exam Configuration
        </button>
      </div>
    </form>
  );
};

export default CreateExamForm;
