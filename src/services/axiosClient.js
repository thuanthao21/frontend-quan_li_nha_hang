import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosClient = axios.create({
    // .replace(/\/$/, "") sẽ xóa dấu "/" ở cuối URL nếu có
    baseURL: API_BASE_URL.replace(/\/$/, ""),
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

// Interceptor: Xử lý lỗi (401/403)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu lỗi 401 (Hết hạn) hoặc 403 (Không có quyền)
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Chỉ xóa token và logout nếu không phải là đang ở trang login
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/login';
            }
        }
        throw error;
    }
);

export default axiosClient;