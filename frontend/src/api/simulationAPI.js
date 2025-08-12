import apiClient from './apiClient';

export const simulationAPI = {
  runSimulation: async (params) => {
    const response = await apiClient.post('/simulate', params);
    return response;
  },

  getSimulationHistory: async (limit = 10) => {
    const response = await apiClient.get(`/simulations?limit=${limit}`);
    return response;
  },

  getSimulationById: async (id) => {
    const response = await apiClient.get(`/simulations/${id}`);
    return response;
  }
};