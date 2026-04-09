import axios from "axios";

// Use environment variable if set, otherwise use relative URL (same domain)
const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api'
});

export default api;
