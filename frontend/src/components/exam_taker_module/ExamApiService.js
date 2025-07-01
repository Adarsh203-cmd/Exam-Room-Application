import axios from "axios";

const API_BASE_URL = "/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;
        localStorage.setItem("accessToken", access);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("examToken");

        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Exam API services
const ExamApiService = {
  // Authentication
  examLogin: (userData) => {
    return apiClient.post("/exam-view/exam-login/", userData);
  },

  // Exam flow
  startExam: (examToken) => {
    return apiClient.post("/exam-view/start-exam/", { exam_token: examToken });
  },

  fetchQuestions: (examToken) => {
    return apiClient.get(`/exam-view/fetch-questions/?exam_token=${examToken}`);
  },

  submitExam: (submissionData) => {
    return apiClient.post("/exam-view/submit-exam/", submissionData);
  },

  // Token management
  verifyToken: (token) => {
    return apiClient.post("/auth/token/verify/", { token });
  },

  refreshToken: (refreshToken) => {
    return apiClient.post("/auth/token/refresh/", { refresh: refreshToken });
  },
};

export default ExamApiService;
