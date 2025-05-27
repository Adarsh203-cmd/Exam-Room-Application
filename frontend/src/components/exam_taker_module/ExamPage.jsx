import React from 'react';
import QuestionSidebar from './QuestionSidebar';
import ExamNavigation from './ExamNavigation';
import QuestionInput from './QuestionInput';

/**
 * Main exam page component that includes question content and navigation
 * @param {Object} props Component props
 * @param {Function} props.handleSubmitExam Function to handle exam submission
 * @param {number} props.currentQuestion Current question index
 * @param {Array} props.questions Array of question objects
 * @param {Object} props.examScreenHook The useExamScreen hook instance
 */
const ExamPage = ({ handleSubmitExam, currentQuestion, questions, examScreenHook }) => {
  // Use the hook instance passed from ExamScreen
  const {
    flaggedQuestions,
    answers,
    goToQuestion,
    goToNextQuestion,
    goToPrevQuestion,
    toggleFlagged,
    handleAnswerChange,
    getUniqueQuestionKey,
    isQuestionAnswered
  } = examScreenHook;

  // Get the current question data
  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="exam-body">
      <QuestionSidebar
        questions={questions}
        currentQuestion={currentQuestion}
        flaggedQuestions={flaggedQuestions}
        isQuestionAnswered={isQuestionAnswered}
        goToQuestion={goToQuestion}
        handleSubmitExam={handleSubmitExam}
      />
      
      <div className="question-main">
        <div className="question-header">
          <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
          <button
            className={`flag-btn ${flaggedQuestions.includes(currentQuestion) ? 'flagged' : ''}`}
            onClick={() => toggleFlagged(currentQuestion)}
          >
            {flaggedQuestions.includes(currentQuestion) ? 'Unflag' : 'Flag'} Question
          </button>
        </div>
        
        <div className="question-content">
          <h3>{currentQuestionData.question_text}</h3>
          
          <QuestionInput
            questionData={currentQuestionData}
            questionIndex={currentQuestion}
            answer={answers[getUniqueQuestionKey(currentQuestion, currentQuestionData.id)]}
            onAnswerChange={handleAnswerChange}
            getUniqueQuestionKey={getUniqueQuestionKey}
          />
        </div>
        
        <ExamNavigation
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          goToNextQuestion={goToNextQuestion}
          goToPrevQuestion={goToPrevQuestion}
        />
      </div>
    </div>
  );
};

export default ExamPage;