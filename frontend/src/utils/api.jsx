// src/utils/api.js
import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API calls
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const logout = async () => {
  await api.get('/auth/logout');
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Courses API calls
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourse = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Rounds API calls
export const getRounds = async () => {
  const response = await api.get('/rounds');
  return response.data;
};

export const getRound = async (id) => {
  const response = await api.get(`/rounds/${id}`);
  return response.data;
};

export const createRound = async (roundData) => {
  const response = await api.post('/rounds', roundData);
  return response.data;
};

export const updateRound = async (id, roundData) => {
  const response = await api.put(`/rounds/${id}`, roundData);
  return response.data;
};

export const getRoundStats = async (id) => {
  const response = await api.get(`/rounds/${id}/stats`);
  return response.data;
};

// Shots API calls
export const getShotsByRound = async (roundId) => {
  const response = await api.get(`/rounds/${roundId}/shots`);
  return response.data;
};

export const getShotsByHole = async (roundId, holeNumber) => {
  const response = await api.get(`/rounds/${roundId}/shots/holes/${holeNumber}`);
  return response.data;
};

export const createShot = async (roundId, shotData) => {
  const response = await api.post(`/rounds/${roundId}/shots`, shotData);
  return response.data;
};

export const updateShot = async (id, shotData) => {
  const response = await api.put(`/shots/${id}`, shotData);
  return response.data;
};

export const deleteShot = async (id) => {
  const response = await api.delete(`/shots/${id}`);
  return response.data;
};

export const getDistanceToGreen = async (roundId, holeNumber, coordinates) => {
  const { latitude, longitude } = coordinates;
  const response = await api.get(
    `/rounds/${roundId}/shots/holes/${holeNumber}/distance-to-green?latitude=${latitude}&longitude=${longitude}`
  );
  return response.data;
};