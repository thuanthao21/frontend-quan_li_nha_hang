import axiosClient from './axiosClient';

// --- POS & ORDER ---
export const getTablesAPI = async () => {
    const response = await axiosClient.get('/tables');
    return response.data;
};

export const createOrderAPI = async (orderData) => {
    const response = await axiosClient.post('/orders', orderData);
    return response.data;
};

export const getCurrentOrderAPI = async (tableId) => {
    try {
        const response = await axiosClient.get(`/orders/${tableId}/current`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const checkoutAPI = async (tableId) => {
    const response = await axiosClient.post(`/orders/${tableId}/checkout`);
    return response.data;
};

// --- KITCHEN ---
export const getKitchenOrdersAPI = async () => {
    const response = await axiosClient.get('/orders/kitchen');
    return response.data;
};

export const updateOrderStatusAPI = async (orderId, status) => {
    const response = await axiosClient.put(`/orders/${orderId}/status?status=${status}`);
    return response.data;
};

// --- DASHBOARD (Tạm để chung đây hoặc tách reportService) ---
export const getDashboardStatsAPI = async () => {
    const response = await axiosClient.get('/reports/dashboard');
    return response.data;
};

export const payItemsAPI = async (orderId, orderItemIds) => {
    // Gửi lên server: orderId và danh sách ID các món muốn trả tiền
    const response = await axiosClient.post(`/orders/${orderId}/pay-items`, orderItemIds);
    return response.data;
};

export const updateOrderItemStatusAPI = async (itemId, status) => {
    const response = await axiosClient.put(`/orders/items/${itemId}/status?status=${status}`);
    return response.data;
};