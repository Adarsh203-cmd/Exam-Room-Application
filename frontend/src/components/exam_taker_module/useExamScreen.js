import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useFullScreen from "./useFullScreen";

/**
 * Custom hook for handling exam screen logic
 * @returns {Object} Exam state and methods
 */
const useExamScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();

  // Security integration with fullscreen hook
  const { showWarning, securityViolations, setShowWarning } = useFullScreen(
    (violations) => {
      console.log(`Security violation count updated: ${violations}`);
      // Additional handling if needed
    }
  );

  // Generate a unique key for each question based on its position and ID
  const getUniqueQuestionKey = (questionIndex, questionId) => {
    return `q_${questionIndex}_${questionId}`;
  };

  // Load saved answers from localStorage on initial mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem("examAnswers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  // Initialize exam data
  useEffect(() => {
    let timerInterval;

    const fetchExamData = async () => {
      const examToken = localStorage.getItem("examToken");
      const accessToken = localStorage.getItem("accessToken");
      const savedAttemptId = localStorage.getItem("attemptId");

      if (!examToken || !accessToken) {
        setError("Authentication failed. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Loading exam with token:", examToken);

      try {
        // First fetch questions
        const questionsResponse = await axios.get(
          `/api/exam-view/fetch-questions/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              exam_token: examToken,
            },
          }
        );

        console.log("Questions response:", questionsResponse.data);

        // Initialize answers object with empty values for all questions using unique keys
        const initialAnswers = {};
        questionsResponse.data.questions.forEach((question, index) => {
          const uniqueKey = getUniqueQuestionKey(index, question.id);
          // Backend sends "type": "MCQ" or "type": "FIB"
          initialAnswers[uniqueKey] =
            question.type === "MCQ"
              ? question.answer_type === "multiple_select"
                ? []
                : null
              : ""; // FIB gets empty string
        });

        setQuestions(questionsResponse.data.questions);
        setExamTitle(questionsResponse.data.exam_title || "Exam");

        // Migrate any locally saved answers to the new key format
        const savedAnswers = localStorage.getItem("examAnswers");
        if (savedAnswers) {
          const localAnswersData = JSON.parse(savedAnswers);
          if (localAnswersData && Object.keys(localAnswersData).length > 0) {
            // Create a mapping of question IDs to their indices in the questions array
            const questionIdToIndex = {};
            questionsResponse.data.questions.forEach((question, index) => {
              questionIdToIndex[question.id] = index;
            });

            // Convert old answers to new format with unique keys
            const migratedAnswers = { ...initialAnswers };
            Object.entries(localAnswersData).forEach(([questionId, answer]) => {
              const index = questionIdToIndex[questionId];
              if (index !== undefined) {
                const uniqueKey = getUniqueQuestionKey(index, questionId);
                migratedAnswers[uniqueKey] = answer;
              }
            });

            setAnswers(migratedAnswers);
          } else {
            setAnswers(initialAnswers);
          }
        } else {
          setAnswers(initialAnswers);
        }

        // Then get the exam timing information
        const examResponse = await axios.get(`/api/exam-view/start-exam/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            exam_token: examToken,
          },
        });

        console.log("Exam timing response:", examResponse.data);

        // Save attempt ID
        const currentAttemptId = examResponse.data.attempt_id || savedAttemptId;
        if (currentAttemptId) {
          localStorage.setItem("attemptId", currentAttemptId);
          setAttemptId(currentAttemptId);
        }

        // Use duration directly for timer rather than calculating from start time
        const durationMinutes = examResponse.data.duration_minutes;
        console.log(`Exam duration: ${durationMinutes} minutes`);

        // Set initial time remaining to the full duration
        const initialHours = Math.floor(durationMinutes / 60);
        const initialMinutes = durationMinutes % 60;
        setTimeRemaining(
          `${initialHours.toString().padStart(2, "0")}:${initialMinutes
            .toString()
            .padStart(2, "0")}:00`
        );

        // Calculate end time for the timer
        const now = new Date().getTime();
        const endTime = now + durationMinutes * 60 * 1000;

        console.log(`Timer will end at: ${new Date(endTime).toISOString()}`);

        const updateTimer = () => {
          const currentTime = new Date().getTime();
          const distance = endTime - currentTime;

          // Ensure we don't get negative time
          if (distance <= 0) {
            // Time's up, submit exam
            console.log("Time's up! Submitting exam...");
            clearInterval(timerInterval);

            // Ensure we have answers before submitting
            if (Object.keys(answers).length > 0) {
              handleSubmitExam();
            } else {
              console.warn("No answers to submit, delaying submission...");
              // Try again in a second with current state
              setTimeout(() => {
                handleSubmitExam();
              }, 1000);
            }
            return;
          }

          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeRemaining(
            `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          );
        };

        updateTimer(); // Initial call
        timerInterval = setInterval(updateTimer, 1000);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setError(
          "Failed to load exam. " + (err.response?.data?.message || err.message)
        );
        setLoading(false);
      }
    };

    fetchExamData();

    // Cleanup function
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [navigate]); // Don't include answers as dependency

  // Save answers to localStorage whenever they change
  useEffect(() => {
    // Only save non-empty answers
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("examAnswers", JSON.stringify(answers));
      console.log("Saved answers to localStorage:", answers);
    }
  }, [answers]);

  const handleAnswerChange = (questionIndex, questionId, value) => {
    const uniqueKey = getUniqueQuestionKey(questionIndex, questionId);
    console.log(`Handling answer change for ${uniqueKey}:`, value);

    setAnswers((prev) => ({
      ...prev,
      [uniqueKey]: value,
    }));
  };

  const toggleFlagged = (questionIndex) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionIndex)) {
        return prev.filter((i) => i !== questionIndex);
      } else {
        return [...prev, questionIndex];
      }
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const proceedWithSubmission = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const examToken = localStorage.getItem("examToken");
      const currentAttemptId = attemptId || localStorage.getItem("attemptId");

      // Check if we have all required data
      if (!accessToken || !examToken) {
        setError("Missing authentication data. Please login again.");
        return;
      }

      if (!currentAttemptId) {
        setError("No attempt ID found. Please restart the exam.");
        return;
      }

      // Convert answers from unique-key format back to question ID format
      const mcqAnswers = [];
      const fibAnswers = [];

      questions.forEach((question, index) => {
        const uniqueKey = getUniqueQuestionKey(index, question.id);
        const answer = answers[uniqueKey];

        // Skip null or undefined values
        if (answer === null || answer === undefined) return;

        if (question.type === "MCQ") {
          // For MCQ questions, we need to handle both single and multiple selection
          if (question.answer_type === "multiple_select") {
            // Ensure array format for multiple select
            const selectedOptions = Array.isArray(answer)
              ? answer
              : [answer].filter(Boolean);
            mcqAnswers.push({
              question_id: question.id,
              selected_options: selectedOptions,
            });
          } else {
            // Single choice MCQ
            mcqAnswers.push({
              question_id: question.id,
              selected_options: Array.isArray(answer) ? answer : [answer],
            });
          }
        } else {
          // Handle as fill-in-blank (FIB)
          fibAnswers.push({
            question_id: question.id,
            user_response: answer || "",
          });
        }
      });

      console.log("Submitting exam with MCQ answers:", mcqAnswers);
      console.log("Submitting exam with FIB answers:", fibAnswers);

      // Include security violations in the submission
      const securityData = {
        security_violations: securityViolations,
        fullscreen_exits: securityViolations,
      };

      console.log("Submitting security data:", securityData);

      try {
        // Send data in the format expected by the backend
        const response = await axios.post(
          "/api/exam-view/submit-answers/",
          {
            attempt_id: currentAttemptId,
            mcq_answers: mcqAnswers,
            fib_answers: fibAnswers,
            security_data: securityData,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Submit response:", response.data);
        localStorage.removeItem("examAnswers");
        navigate("/exam-complete");
      } catch (submitError) {
        console.error("Submit exam endpoint failed:", submitError);

        // Check if this is the "already submitted" error
        if (
          submitError.response &&
          submitError.response.status === 400 &&
          submitError.response.data &&
          submitError.response.data.error === "Answers already submitted"
        ) {
          console.log(
            "Exam was already submitted, redirecting to completion page"
          );
          localStorage.removeItem("examAnswers");
          navigate("/exam-complete");
          return;
        }

        // For other errors, show the error message
        if (
          submitError.response &&
          submitError.response.data &&
          submitError.response.data.error
        ) {
          setError(`Submission error: ${submitError.response.data.error}`);
        } else {
          throw submitError;
        }
      }
    } catch (err) {
      console.error("Failed to submit exam:", err);
      setError(
        "Failed to submit exam. Your answers are saved locally. Please try again or contact support."
      );

      // If all else fails, just go to the completion page after confirmation
      if (
        window.confirm(
          "There was an issue submitting your exam. Would you like to continue to the completion page anyway?"
        )
      ) {
        navigate("/exam-complete");
      }
    }
  };

  const handleSubmitExam = () => {
    // Check for unattempted questions
    const unattemptedQuestions = questions.filter((q, idx) => {
      const uniqueKey = getUniqueQuestionKey(idx, q.id);
      const answer = answers[uniqueKey];
      // For MCQ single choice, answer could be null
      // For MCQ multiple choice, answer could be empty array
      // For FIB, answer could be empty string
      return (
        answer === null ||
        answer === undefined ||
        (Array.isArray(answer) && answer.length === 0) ||
        answer === ""
      );
    });

    // Build confirmation message
    let confirmMessage = "Are you sure you want to submit your exam?";

    // Add warning about unattempted questions
    if (unattemptedQuestions.length > 0) {
      confirmMessage += `\n\nWarning: You have ${unattemptedQuestions.length} unattempted question(s).`;
    }

    // Add warning about flagged questions
    if (flaggedQuestions.length > 0) {
      confirmMessage += `\n\nWarning: You have ${flaggedQuestions.length} flagged question(s) for review.`;
    }

    // Include security violation information
    if (securityViolations > 0) {
      confirmMessage += `\n\nNote: ${securityViolations} security violation(s) have been recorded during this exam session.`;
    }

    // If there are warnings, show custom dialog
    if (unattemptedQuestions.length > 0 || flaggedQuestions.length > 0) {
      setDialogMessage(confirmMessage);
      setShowDialog(true);
    } else {
      // Everything is good, just confirm with a standard confirm dialog
      if (window.confirm(confirmMessage)) {
        proceedWithSubmission();
      }
    }
  };

  // Check if the question has been answered
  const isQuestionAnswered = (index, questionId) => {
    const uniqueKey = getUniqueQuestionKey(index, questionId);
    const answer = answers[uniqueKey];
    return (
      answer !== null &&
      answer !== undefined &&
      !(Array.isArray(answer) && answer.length === 0) &&
      answer !== ""
    );
  };

  return {
    questions,
    loading,
    error,
    examTitle,
    currentQuestion,
    timeRemaining,
    answers,
    flaggedQuestions,
    showDialog,
    dialogMessage,
    showWarning,
    securityViolations,
    setShowDialog,
    handleAnswerChange,
    getUniqueQuestionKey,
    toggleFlagged,
    goToQuestion,
    goToNextQuestion,
    goToPrevQuestion,
    handleSubmitExam,
    isQuestionAnswered,
    proceedWithSubmission,
    setShowWarning,
  };
};

export default useExamScreen;
