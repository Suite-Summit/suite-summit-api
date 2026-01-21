import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Company APIs
export const submitIntake = async (intakeData) => {
  const response = await axios.post(`${API_URL}/company/intake`, intakeData);
  return response.data;
};

export const getCompanyProfile = async () => {
  const response = await axios.get(`${API_URL}/company/profile`);
  return response.data;
};

export const getCompanyIntroRequests = async () => {
  const response = await axios.get(`${API_URL}/company/intro-requests`);
  return response.data;
};

// Executive APIs
export const applyAsExecutive = async (applicationData) => {
  const response = await axios.post(`${API_URL}/executive/apply`, applicationData);
  return response.data;
};

export const getExecutiveProfile = async () => {
  const response = await axios.get(`${API_URL}/executive/profile`);
  return response.data;
};

export const updateExecutiveAvailability = async (availability) => {
  const response = await axios.put(`${API_URL}/executive/availability?availability=${encodeURIComponent(availability)}`);
  return response.data;
};

export const getExecutiveIntroRequests = async () => {
  const response = await axios.get(`${API_URL}/executive/intro-requests`);
  return response.data;
};

export const respondToIntroRequest = async (requestId, response) => {
  const res = await axios.put(`${API_URL}/executive/intro-requests/${requestId}/respond?response=${response}`);
  return res.data;
};

// Matching APIs
export const getMatchedExecutives = async () => {
  const response = await axios.get(`${API_URL}/match/executives`);
  return response.data;
};

export const createIntroRequest = async (executiveId, message) => {
  const response = await axios.post(`${API_URL}/match/intro-request`, { executive_id: executiveId, message });
  return response.data;
};

export const generateAIInsights = async () => {
  const response = await axios.post(`${API_URL}/match/ai-insights`);
  return response.data;
};

// Admin APIs
export const getAllExecutives = async () => {
  const response = await axios.get(`${API_URL}/admin/executives`);
  return response.data;
};

export const updateExecutiveStatus = async (executiveId, status) => {
  const response = await axios.put(`${API_URL}/admin/executives/${executiveId}/status?status=${status}`);
  return response.data;
};

export const getAllCompanies = async () => {
  const response = await axios.get(`${API_URL}/admin/companies`);
  return response.data;
};

export const getAllIntroRequests = async () => {
  const response = await axios.get(`${API_URL}/admin/intro-requests`);
  return response.data;
};

export const getAILogs = async () => {
  const response = await axios.get(`${API_URL}/admin/ai-logs`);
  return response.data;
};

export const getPlatformStats = async () => {
  const response = await axios.get(`${API_URL}/admin/stats`);
  return response.data;
};

// Public APIs
export const getAvailableRoles = async () => {
  const response = await axios.get(`${API_URL}/roles`);
  return response.data;
};
