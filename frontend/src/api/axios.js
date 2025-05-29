import axios from "axios";

const instance = axios.create({
  baseURL: "", // ✅ Your Django backend running locally
  withCredentials: true, // if you're using cookies/session-based auth
});

export default instance;
