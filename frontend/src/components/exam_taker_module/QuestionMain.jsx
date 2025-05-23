import React from 'react';

const QuestionInput = ({ 
  currentQuestion, 
  currentQuestionData, 
  answers, 
  handleAnswerChange,
  getUniqueQuestionKey
}) => {
  if (!currentQuestionData) return null;
  
  const questionType = currentQuestionData.type; // "MCQ" or "FIB"
  const questionId = currentQuestionData.id;
  const uniqueKey = getUniqueQuestionKey(currentQuestion, questionId);
  
  // Handle MCQ questions
  if (questionType === 'MCQ') {
    // Check if it's a multiple select or single choice
    const isMultipleSelect = currentQuestionData.answer_type === 'multiple_select';
    
    if (isMultipleSelect) {
      // Multiple select (checkboxes - multiple selection)
      // Initialize the answer as an array if not already
      const selectedOptions = Array.isArray(answers[uniqueKey]) 
        ? answers[uniqueKey] 
        : answers[uniqueKey] ? [answers[uniqueKey]] : [];
      
      // Handle checkbox selection/deselection
      const handleCheckboxChange = (option) => {
        let updatedSelections;
        
        if (selectedOptions.includes(option)) {
          // Remove if already selected
          updatedSelections = selectedOptions.filter(item => item !== option);
        } else {
          // Add if not selected
          updatedSelections = [...selectedOptions, option];
        }
        
        // Only update if there's a change
        if (JSON.stringify(selectedOptions) !== JSON.stringify(updatedSelections)) {
          handleAnswerChange(currentQuestion, questionId, updatedSelections);
        }
      };
      
      return (
        <div className="multiple-select">
          <p className="question-instructions">Select all that apply:</p>
          {currentQuestionData.options && currentQuestionData.options.length > 0 ? (
            currentQuestionData.options.map((option, index) => (
              <div 
                className={`option checkbox-option ${selectedOptions.includes(option) ? 'selected' : ''}`} 
                key={index}
                onClick={() => handleCheckboxChange(option)}
              >
                <input
                  type="checkbox"
                  id={`option-${uniqueKey}-${index}`}
                  name={`question-${uniqueKey}`}
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
                <label htmlFor={`option-${uniqueKey}-${index}`}>{option}</label>
              </div>
            ))
          ) : (
            <div className="error-message">No options available for this question.</div>
          )}
        </div>
      );
    } else {
      // Single choice (radio buttons)
      return (
        <div className="multiple-choice">
          <p className="question-instructions">Select one option:</p>
          {currentQuestionData.options && currentQuestionData.options.length > 0 ? (
            currentQuestionData.options.map((option, index) => (
              <div 
                className={`option ${answers[uniqueKey] === option ? 'selected' : ''}`} 
                key={index}
                onClick={() => handleAnswerChange(currentQuestion, questionId, option)}
              >
                <input
                  type="radio"
                  id={`option-${uniqueKey}-${index}`}
                  name={`question-${uniqueKey}`}
                  value={option}
                  checked={answers[uniqueKey] === option}
                  onChange={() => handleAnswerChange(currentQuestion, questionId, option)}
                />
                <label htmlFor={`option-${uniqueKey}-${index}`}>{option}</label>
              </div>
            ))
          ) : (
            <div className="error-message">No options available for this question.</div>
          )}
        </div>
      );
    }
  }
  
  // Fill in the blank (text input - default for any unknown type)
  else {
    return (
      <div className="fill-in-blank">
        <p className="question-instructions">Enter your answer below:</p>
        <textarea
          value={answers[uniqueKey] || ''}
          onChange={(e) => handleAnswerChange(currentQuestion, questionId, e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
        />
      </div>
    );
  }
};

export default QuestionInput;