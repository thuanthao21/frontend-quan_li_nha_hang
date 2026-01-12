import axios from 'axios';
//import { API_BASE_URL } from '../utils/constants';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động gắn Token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Xử lý lỗi chung (Optional)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ví dụ: Nếu token hết hạn (401) thì tự logout
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        throw error;
    }
);

export default axiosClient;