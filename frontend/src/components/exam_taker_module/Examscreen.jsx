import React, { useState } from "react";
import "../../styles/exam_taker_css/Examscreen.css";

const questions = [
  {
    type: "mcq",
    question: "What is the capital of France?",
    options: ["Paris", "Berlin", "Madrid", "Rome"],
  },
  {
    type: "mcq",
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Shakespeare", "Hemingway", "Tolkien", "Austen"],
  },
  {
    type: "mcq",
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
  },
  {
    type: "fillup",
    question: "The Eiffel Tower is located in _______ (City).",
    answer: "",
  },
  {
    type: "fillup",
    question: "Shakespeare wrote many plays, including _______ and _______.",
    answer: "",
  },
  {
    type: "fillup",
    question: "The formula for water is _______ (Chemical Formula).",
    answer: "",
  },
  {
    type: "fillup",
    question: "The Earth revolves around the _______ (Star).",
    answer: "",
  },
  {
    type: "fillup",
    question: "Albert Einstein developed the theory of _______ (Theory).",
    answer: "",
  },
  {
    type: "fillup",
    question: "The Great Wall of China is located in _______ (Country).",
    answer: "",
  },
  {
    type: "fillup",
    question: "The currency of Japan is _______ (Currency).",
    answer: "",
  },
  {
    type: "mcq",
    question: "Which is the smallest country in the world?",
    options: ["Vatican City", "Monaco", "Nauru", "San Marino"],
  },
  {
    type: "mcq",
    question: "Who is the author of '1984'?",
    options: ["George Orwell", "Aldous Huxley", "Margaret Atwood", "Philip K. Dick"],
  },
  {
    type: "mcq",
    question: "What is the largest mammal on Earth?",
    options: ["Blue Whale", "Elephant", "Giraffe", "Shark"],
  },
  {
    type: "mcq",
    question: "Which element has the chemical symbol 'O'?",
    options: ["Oxygen", "Osmium", "Ozone", "Oganesson"],
  },
  {
    type: "mcq",
    question: "What is the longest river in the world?",
    options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
  },
  {
    type: "mcq",
    question: "Who painted the Mona Lisa?",
    options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Claude Monet"],
  },
  {
    type: "mcq",
    question: "What is the chemical symbol for gold?",
    options: ["Au", "Ag", "Pb", "Fe"],
  },
  {
    type: "mcq",
    question: "Who was the first person to step on the moon?",
    options: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"],
  },
  {
    type: "mcq",
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
  },
  {
    type: "mcq",
    question: "What is the freezing point of water?",
    options: ["0°C", "32°F", "-273°C", "100°C"],
  },
  {
    type: "mcq",
    question: "What is the largest continent by area?",
    options: ["Asia", "Africa", "North America", "Europe"],
  },
  {
    type: "mcq",
    question: "Which language is primarily spoken in Brazil?",
    options: ["Portuguese", "Spanish", "English", "French"],
  },
  {
    type: "mcq",
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["Japan", "China", "South Korea", "Thailand"],
  },
  {
    type: "mcq",
    question: "Who invented the telephone?",
    options: ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Guglielmo Marconi"],
  },
  {
    type: "mcq",
    question: "What is the largest ocean in the world?",
    options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
  },
];

const ExamScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState(Array(questions.length).fill(null));
  const [flagged, setFlagged] = useState(Array(questions.length).fill(false));
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOptionChange = (index, option) => {
    const updated = [...responses];
    updated[index] = option;
    setResponses(updated);
  };

  const toggleFlag = (index) => {
    const updated = [...flagged];
    updated[index] = !updated[index];
    setFlagged(updated);
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    setShowConfirm(false);
    alert("Exam submitted successfully!");
  };

  const cancelSubmit = () => {
    setShowConfirm(false);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="exam-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="timer">Time Left: 1:25:00</div>
        <div className="question-grid">
        {questions.map((_, idx) => (
          <button
            key={idx}
            className={`question-btn 
              ${currentIndex === idx ? "active" : ""} 
              ${responses[idx] ? "answered" : "unanswered"} 
              ${flagged[idx] ? "flagged" : ""}`}
            onClick={() => setCurrentIndex(idx)}
          >
            Q{idx + 1}
          </button>
        ))}
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {/* Main Section */}
      <div className="main-section">
        <div className="question-panel">
          <h2>Question {currentIndex + 1}</h2>
          <p className="question-text">{questions[currentIndex].question}</p>
          <div className="options">
            {questions[currentIndex].type === "mcq" ? (
              questions[currentIndex].options.map((option, idx) => (
                <div key={idx} className="option">
                  <label>
                    <input
                      type="radio"
                      name={`question-${currentIndex}`}
                      value={option}
                      checked={responses[currentIndex] === option}
                      onChange={() => handleOptionChange(currentIndex, option)}
                    />{" "}
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <input
                type="text"
                placeholder="Type your answer"
                value={responses[currentIndex] || ""}
                onChange={(e) =>
                  handleOptionChange(currentIndex, e.target.value)
                }
              />
            )}
          </div>
          <button className="flag-btn" onClick={() => toggleFlag(currentIndex)}>
            {flagged[currentIndex] ? "Unflag" : "Flag"}
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="rightbar">
        <h3>Exam Panel</h3>
        <div><strong>Exam:</strong> ReactJS Certification</div>
        <div><strong>Candidate:</strong> John Doe</div>
        <br />
        <button className="nav-btn" onClick={() => handleOptionChange(currentIndex, null)}>
          Clear Selection
        </button>
        <button className="nav-btn" onClick={goToPrevious} disabled={currentIndex === 0}>
          Previous
        </button>
        <button className="nav-btn" onClick={goToNext} disabled={currentIndex === questions.length - 1}>
          Next
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Do you really want to submit?</p>
            <div className="popup-actions">
              <button className="yes-btn" onClick={confirmSubmit}>Yes</button>
              <button className="no-btn" onClick={cancelSubmit}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScreen;