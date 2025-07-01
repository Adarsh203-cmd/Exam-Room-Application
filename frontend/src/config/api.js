// // src/config/api.js
// import axios from "axios";

// // Get the base URL from environment variable, fallback to localhost for development
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// // Create axios instance with base configuration
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30 seconds timeout
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add request interceptor for auth tokens
// apiClient.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Handle common errors
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       // Optionally redirect to login
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Export the base URL for cases where you need it directly
// export { API_BASE_URL };

// // Default export
// export default apiClient;
