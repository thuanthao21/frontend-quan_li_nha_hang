import axios from 'axios';
import { message } from 'antd'; // Import message của Antd để báo lỗi đẹp hơn

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const axiosClient = axios.create({
    baseURL: API_BASE_URL.replace(/\/$/, ""),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor Request: Giữ nguyên
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (config.headers && token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor Response: SỬA PHẦN NÀY
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // TRƯỜNG HỢP 1: Lỗi 401 (Token hết hạn, chưa đăng nhập)
        if (status === 401) {
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                window.location.href = '/login';
            }
        }
        // TRƯỜNG HỢP 2: Lỗi 403 (Không có quyền truy cập)
        else if (status === 403) {
            // KHÔNG ĐƯỢC logout, chỉ báo lỗi cho người dùng biết
            message.error("⛔ Bạn không có quyền thực hiện thao tác này!");
        }
        // Các lỗi khác (400, 404, 500...)
        else {
            // Có thể log ra hoặc để component tự xử lý
            console.error("API Error:", error);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;