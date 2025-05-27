import React from 'react';
import useExamScreen from './useExamScreen';
import ExamHeader from './ExamHeader';
import ExamPage from './ExamPage';
import ConfirmDialog from './ConfirmDialog';
import "../../styles/exam_taker_module_css/ExamScreen.css";

/**
 * Main exam screen component that orchestrates the entire exam experience
 */
const ExamScreen = () => {
  // Create a single instance of useExamScreen to be used across components
  const examScreenHook = useExamScreen();
  
  const {
    questions,
    loading,
    error,
    examTitle,
    currentQuestion,
    timeRemaining,
    showDialog,
    dialogMessage,
    showWarning,
    setShowDialog,
    proceedWithSubmission,
    handleSubmitExam
  } = examScreenHook;

  if (loading) return <div className="exam-container">Loading exam...</div>;
  
  if (error) return (
    <div className="exam-container error">
      <div className="error-message">{error}</div>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Retry
      </button>
    </div>
  );
  
  if (!questions || questions.length === 0) {
    return <div className="exam-container">No questions found for this exam.</div>;
  }

  return (
    <div className="exam-container">
      {showDialog && (
        <ConfirmDialog 
          message={dialogMessage}
          onConfirm={() => {
            setShowDialog(false);
            proceedWithSubmission();
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
      
      {showWarning && (
        <div className="security-warning">
          Security violation detected! This will be reported.
        </div>
      )}
      
      <ExamHeader 
        examTitle={examTitle} 
        timeRemaining={timeRemaining} 
      />
      
      <ExamPage 
        handleSubmitExam={handleSubmitExam}
        currentQuestion={currentQuestion}
        questions={questions}
        // Pass the entire hook to ExamPage
        examScreenHook={examScreenHook}
      />
    </div>
  );
};

export default ExamScreen;