import React from 'react';

/**
 * Sidebar component showing question navigation and submit button
 * @param {Object} props Component props
 * @param {Array} props.questions Array of question objects
 * @param {number} props.currentQuestion Current question index
 * @param {Array} props.flaggedQuestions Array of flagged question indices
 * @param {Function} props.isQuestionAnswered Function to check if a question is answered
 * @param {Function} props.goToQuestion Function to navigate to a specific question
 * @param {Function} props.handleSubmitExam Function to submit the exam
 */
const QuestionSidebar = ({ 
  questions, 
  currentQuestion, 
  flaggedQuestions, 
  isQuestionAnswered, 
  goToQuestion, 
  handleSubmitExam 
}) => {
  return (
    <div className="question-sidebar">
      <div className="question-navigation">
        <h3>Questions</h3>
        <div className="question-buttons">
          {questions.map((question, index) => (
            <button
              key={index}
              className={`question-nav-btn 
                ${currentQuestion === index ? 'active' : ''} 
                ${flaggedQuestions.includes(index) ? 'flagged' : ''} 
                ${isQuestionAnswered(index, question.id) ? 'answered' : ''}`}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      <button className="submit-exam-btn" onClick={handleSubmitExam}>
        Submit Exam
      </button>
    </div>
  );
};

export default QuestionSidebar;