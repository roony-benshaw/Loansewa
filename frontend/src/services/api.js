import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const loanAPI = {
  applyForLoan: async (applicationData, userId) => {
    const response = await api.post(`/loan/apply?user_id=${userId}`, applicationData);
    return response.data;
  },

  getUserApplications: async (userId) => {
    const response = await api.get(`/loan/applications/${userId}`);
    return response.data;
  },
};

export default api;
