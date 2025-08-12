import apiClient from './apiClient';

const createCRUDAPI = (endpoint) => ({
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`${endpoint}${queryString ? '?' + queryString : ''}`);
    return response;
  },

  getById: async (id) => {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`${endpoint}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`${endpoint}/${id}`);
    return response;
  }
});

export const driversAPI = createCRUDAPI('/drivers');
export const routesAPI = createCRUDAPI('/routes');
export const ordersAPI = createCRUDAPI('/orders');