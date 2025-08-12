import apiClient from './apiClient';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await apiClient.post('/auth/verify');
    return response.data;
  }
};