import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_verify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sa_verify_token');
      localStorage.removeItem('sa_verify_role');
      localStorage.removeItem('sa_verify_fullname');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
