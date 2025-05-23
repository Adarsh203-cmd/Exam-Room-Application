import React from 'react';

/**
 * Navigation component for moving between exam questions
 * @param {Object} props Component props
 * @param {number} props.currentQuestion Current question index
 * @param {number} props.totalQuestions Total number of questions
 * @param {Function} props.goToNextQuestion Function to move to next question
 * @param {Function} props.goToPrevQuestion Function to move to previous question
 */
const ExamNavigation = ({ currentQuestion, totalQuestions, goToNextQuestion, goToPrevQuestion }) => {
  // Add debugging functions
  const handleNext = () => {
    console.log("Next button clicked, current question:", currentQuestion);
    goToNextQuestion();
  };
  
  const handlePrev = () => {
    console.log("Previous button clicked, current question:", currentQuestion);
    goToPrevQuestion();
  };
  
  return (
    <div className="question-footer">
      <button 
        className="nav-btn prev" 
        onClick={handlePrev}
        disabled={currentQuestion === 0}
      >
        Previous
      </button>
      <span className="question-counter">
        {currentQuestion + 1} of {totalQuestions}
      </span>
      <button 
        className="nav-btn next" 
        onClick={handleNext}
        disabled={currentQuestion === totalQuestions - 1}
      >
        Next
      </button>
    </div>
  );
};

export default ExamNavigation;