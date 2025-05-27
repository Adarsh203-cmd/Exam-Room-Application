import React from 'react';

/**
 * Component for rendering different question input types (MCQ single, MCQ multiple, FIB)
 * @param {Object} props Component props
 * @param {Object} props.questionData Current question data
 * @param {number} props.questionIndex Index of the current question
 * @param {any} props.answer Current answer value
 * @param {Function} props.onAnswerChange Function to handle answer changes
 * @param {Function} props.getUniqueQuestionKey Function to generate unique question keys
 */
const QuestionInput = ({ 
  questionData, 
  questionIndex, 
  answer, 
  onAnswerChange,
  getUniqueQuestionKey
}) => {
  if (!questionData) return null;
  
  const questionType = questionData.type; // "MCQ" or "FIB"
  const questionId = questionData.id;
  const uniqueKey = getUniqueQuestionKey(questionIndex, questionId);
  
  // Handle MCQ questions
  if (questionType === 'MCQ') {
    // Check if it's a multiple select or single choice
    const isMultipleSelect = questionData.answer_type === 'multiple_select';
    
    if (isMultipleSelect) {
      // Multiple select (checkboxes - multiple selection)
      // Initialize the answer as an array if not already
      const selectedOptions = Array.isArray(answer) 
        ? answer 
        : answer ? [answer] : [];
      
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
          onAnswerChange(questionIndex, questionId, updatedSelections);
        }
      };
      
      return (
        <div className="multiple-select">
          <p className="question-instructions">Select all that apply:</p>
          {questionData.options && questionData.options.length > 0 ? (
            questionData.options.map((option, index) => (
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
          {questionData.options && questionData.options.length > 0 ? (
            questionData.options.map((option, index) => (
              <div 
                className={`option ${answer === option ? 'selected' : ''}`} 
                key={index}
                onClick={() => onAnswerChange(questionIndex, questionId, option)}
              >
                <input
                  type="radio"
                  id={`option-${uniqueKey}-${index}`}
                  name={`question-${uniqueKey}`}
                  value={option}
                  checked={answer === option}
                  onChange={() => onAnswerChange(questionIndex, questionId, option)}
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
          value={answer || ''}
          onChange={(e) => onAnswerChange(questionIndex, questionId, e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
        />
      </div>
    );
  }
};

export default QuestionInput;