import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BarChart3,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const ExamComplete = () => {
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [detailed, setDetailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const processExamCompletion = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const attemptId = localStorage.getItem("attemptId");

        if (!accessToken || !attemptId) {
          setError("Missing authentication data. Please login again.");
          setLoading(false);
          return;
        }

        // Step 1: Trigger evaluation
        setEvaluating(true);
        console.log("Starting evaluation for attempt:", attemptId);

        let evaluationResponse;
        let resultId;

        try {
          evaluationResponse = await axios.post(
            `/api/evaluation/evaluate/${attemptId}/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Evaluation response:", evaluationResponse.data);
          resultId = evaluationResponse.data.result_id;
        } catch (evaluationError) {
          console.log("Evaluation error:", evaluationError);

          // Check if this is the duplicate key error
          if (
            evaluationError.response &&
            evaluationError.response.status === 500 &&
            evaluationError.response.data &&
            evaluationError.response.data.error &&
            evaluationError.response.data.error.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            console.log(
              "Duplicate key error detected - result already exists, trying to fetch it"
            );

            // The evaluation already happened but failed to return properly
            // We need to find the existing result for this attempt
            // You might need to add an endpoint to get result by attempt_id
            // For now, let's try to extract the result_id from error or use a fallback approach

            try {
              // Option 1: If your backend includes result_id in error response
              if (evaluationError.response.data.result_id) {
                resultId = evaluationError.response.data.result_id;
              } else {
                // Option 2: Try to fetch the latest result for this candidate
                // This assumes you have an endpoint to get candidate results
                const candidateResultsResponse = await axios.get(
                  `/api/evaluation/candidate-results/`, // You might need to pass candidate ID
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                // Get the most recent result
                if (
                  candidateResultsResponse.data &&
                  candidateResultsResponse.data.length > 0
                ) {
                  const latestResult = candidateResultsResponse.data[0]; // Assuming sorted by date desc
                  resultId = latestResult.result_id;
                } else {
                  throw new Error("Could not find existing result");
                }
              }
            } catch (fallbackError) {
              console.error(
                "Failed to recover from duplicate key error:",
                fallbackError
              );
              throw evaluationError; // Re-throw original error
            }
          } else {
            // Some other error, re-throw it
            throw evaluationError;
          }
        }

        if (resultId) {
          // Step 2: Get detailed results with retry logic
          let resultResponse;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              resultResponse = await axios.get(
                `/api/evaluation/result/${resultId}/`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              console.log("Result response:", resultResponse.data);
              break; // Success, exit retry loop
            } catch (resultError) {
              retryCount++;
              console.log(
                `Result fetch attempt ${retryCount} failed:`,
                resultError
              );

              if (retryCount >= maxRetries) {
                throw resultError;
              }

              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retryCount)
              );
            }
          }

          if (resultResponse) {
            setResult({
              ...resultResponse.data,
              // Include evaluation data if available
              ...(evaluationResponse?.data && {
                total_marks: evaluationResponse.data.total_marks,
                total_possible: evaluationResponse.data.total_possible,
                percentage: evaluationResponse.data.percentage,
                passed: evaluationResponse.data.passed,
              }),
            });
          }
        } else {
          throw new Error("No result ID available from evaluation");
        }

        setEvaluating(false);
        setLoading(false);

        // Clean up localStorage
        localStorage.removeItem("attemptId");
        localStorage.removeItem("examAnswers");
      } catch (err) {
        console.error("Error processing exam completion:", err);

        // Provide more specific error messages
        let errorMessage =
          "Failed to process exam results. Please contact support.";

        if (err.response?.data?.error) {
          if (err.response.data.error.includes("duplicate key")) {
            errorMessage =
              "Your exam has already been evaluated. Please contact support if you don't see your results.";
          } else {
            errorMessage = err.response.data.error;
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setEvaluating(false);
        setLoading(false);
      }
    };

    processExamCompletion();
  }, []);

  const handleBackToLogin = () => {
    // Clear all exam-related data
    localStorage.removeItem("examToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("attemptId");
    localStorage.removeItem("examAnswers");
    navigate("/");
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return "bg-green-50 border-green-200";
    if (percentage >= 60) return "bg-blue-50 border-blue-200";
    if (percentage >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  if (loading || evaluating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {evaluating ? "Evaluating Your Exam..." : "Processing Results..."}
          </h2>
          <p className="text-gray-600">
            {evaluating
              ? "Please wait while we calculate your scores and generate your results."
              : "Loading your exam completion page..."}
          </p>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Processing Results
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToLogin}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "500",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Results Available
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to retrieve your exam results.
          </p>
          <button
            onClick={handleBackToLogin}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "500",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {result.is_passed ? (
                <CheckCircle className="h-20 w-20 text-green-500" />
              ) : (
                <XCircle className="h-20 w-20 text-red-500" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Exam {result.is_passed ? "Completed Successfully!" : "Completed"}
            </h1>
            <p className="text-xl text-gray-600">{result.exam_title}</p>
          </div>

          {/* Main Results Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div
              className={`p-6 ${getScoreBgColor(
                result.percentage_score
              )} border-l-4`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      YOUR SCORE
                    </span>
                  </div>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      result.percentage_score
                    )}`}
                  >
                    {result.total_marks_obtained}/{result.total_marks_possible}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">marks</div>
                </div>

                {/* Percentage */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      PERCENTAGE
                    </span>
                  </div>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      result.percentage_score
                    )}`}
                  >
                    {result.percentage_score.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">score</div>
                </div>

                {/* Status */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      STATUS
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      result.is_passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {result.is_passed ? "PASSED" : "FAILED"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(result.evaluated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject-wise breakdown */}
            {result.subjects && result.subjects.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Subject-wise Performance
                  </h3>
                  <button
                    onClick={() => setDetailed(!detailed)}
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      fontWeight: "500",
                      fontSize: "14px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#dbeafe";
                      e.target.style.color = "#1d4ed8";
                      e.target.style.borderColor = "#93c5fd";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#eff6ff";
                      e.target.style.color = "#2563eb";
                      e.target.style.borderColor = "#bfdbfe";
                    }}
                  >
                    {detailed ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {detailed && (
                  <div className="space-y-4">
                    {result.subjects.map((subject, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-800">
                            {subject.subject}
                          </h4>
                          <span
                            className={`font-semibold ${getScoreColor(
                              subject.percentage
                            )}`}
                          >
                            {subject.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>
                            Marks: {subject.marks_obtained}/
                            {subject.total_marks}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              subject.percentage >= 80
                                ? "bg-green-500"
                                : subject.percentage >= 60
                                ? "bg-blue-500"
                                : subject.percentage >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(subject.percentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={handleBackToLogin}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "500",
                padding: "16px 32px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
                display: "inline-flex",
                alignItems: "center",
                fontSize: "16px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Login
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Candidate: {result.candidate_name}</p>
            <p>
              Evaluated on: {new Date(result.evaluated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamComplete;
