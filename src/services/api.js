import axios from 'axios';


// 1. Cấu hình địa chỉ Backend (Mặc định là localhost:8080)
const BASE_URL = "https://backendqlnhahang-production.up.railway.app/api";

// 2. Tự động gắn Token vào mọi request (nếu đã đăng nhập)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Hàm gọi API Đăng nhập
export const loginAPI = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data; // Trả về { token: "...", role: "..." }
};

// 4. Hàm lấy danh sách món ăn
export const getProductsAPI = async () => {
    const response = await api.get('/products');
    return response.data; // Trả về mảng danh sách món ăn
};

// 5. Lấy danh sách bàn
export const getTablesAPI = async () => {
    const response = await api.get('/tables'); // Em cần đảm bảo Backend có API này (nếu chưa có ta sẽ dùng tạm Mock hoặc viết thêm)
    // Lưu ý: Lúc nãy mình chưa viết Controller cho Table, nên tạm thời mình sẽ mock (giả lập) ở frontend hoặc quay lại Backend viết nhanh.
    // ĐỂ NHANH GỌN: Ta quay lại Backend viết Controller cho Table một chút nhé.
    return response.data;
};

// 6. Gửi đơn hàng
export const createOrderAPI = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const checkoutAPI = async (tableId) => {
    const response = await api.post(`/orders/${tableId}/checkout`);
    return response.data;
};

export const createProductAPI = async (product) => {
    const response = await api.post('/products', product);
    return response.data;
};

export const updateProductAPI = async (id, product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
};

export const deleteProductAPI = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getUsersAPI = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createUserAPI = async (user) => {
    const response = await api.post('/users', user);
    return response.data;
};

export const deleteUserAPI = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

export const getDashboardStatsAPI = async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
};

// --- KITCHEN API ---
export const getKitchenOrdersAPI = async () => {
    const response = await api.get('/orders/kitchen');
    return response.data;
};

export const updateOrderStatusAPI = async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status?status=${status}`);
    return response.data;
};

// Thêm hàm lấy chi tiết đơn của bàn đang ăn
export const getCurrentOrderAPI = async (tableId) => {
    try {
        const response = await api.get(`/orders/${tableId}/current`);
        return response.data;
    } catch (error) {
        return null; // Trả về null nếu chưa có đơn
    }
};



export default api;