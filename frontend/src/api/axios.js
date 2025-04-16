import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', // ✅ Your Django backend running locally
  withCredentials: true, // if you're using cookies/session-based auth
});

export default instance;
