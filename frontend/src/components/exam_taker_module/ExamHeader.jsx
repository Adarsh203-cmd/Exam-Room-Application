import React from 'react';

/**
 * Header component for the exam displaying title and timer
 * @param {Object} props Component props
 * @param {string} props.examTitle Title of the exam
 * @param {string} props.timeRemaining Formatted time remaining string
 */
const ExamHeader = ({ examTitle, timeRemaining }) => {
  // Determine if time is running low (less than a minute)
  const isTimeLow = timeRemaining && timeRemaining.startsWith('00:');

  return (
    <div className="exam-header">
      <h1>{examTitle}</h1>
      <div className="exam-timer">
        <span className="timer-label">Time Remaining: </span>
        <span className={`timer-value ${isTimeLow ? 'timer-low' : ''}`}>
          {timeRemaining}
        </span>
      </div>
    </div>
  );
};

export default ExamHeader;