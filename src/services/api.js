import axios from 'axios';

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://admin-dashboard-backend-blush.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, the token might be expired or invalid
      // We'll handle this in the AuthContext
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Homepage Details API
export const homepageDetailsApi = {
  list: () => api.get('/homepage-details'),
  create: (formData) =>
    api.post('/homepage-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/homepage-details/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/homepage-details/${id}`),
};

// About Details API
export const aboutDetailsApi = {
  list: () => api.get('/about-details'),
  create: (formData) =>
    api.post('/about-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/about-details/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/about-details/${id}`),
};

// Gallery Details API
export const galleryDetailsApi = {
  list: () => api.get('/gallery-details'),
  create: (formData) =>
    api.post('/gallery-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/gallery-details/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/gallery-details/${id}`),
};

// Ahval Details API
export const ahvalDetailsApi = {
  list: () => api.get('/ahval-details'),
  create: (formData) =>
    api.post('/ahval-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/ahval-details/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/ahval-details/${id}`),
};

// Leader Details API (by role)
export const leaderDetailsApi = {
  getByRole: (role) => api.get(`/leader-details/${role}`),
  upsertByRole: (role, formData) =>
    api.put(`/leader-details/${role}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeByRole: (role) => api.delete(`/leader-details/${role}`),
};

export default api;
