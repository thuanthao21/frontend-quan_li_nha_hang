import axiosClient from './axiosClient';

// --- POS & ORDER ---
export const getTablesAPI = async () => {
    const response = await axiosClient.get('/api/tables');
    return response.data;
};

export const createOrderAPI = async (orderData) => {
    const response = await axiosClient.post('/api/orders', orderData);
    return response.data;
};

export const getCurrentOrderAPI = async (tableId) => {
    try {
        const response = await axiosClient.get(`/api/orders/${tableId}/current`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const checkoutAPI = async (tableId) => {
    const response = await axiosClient.post(`/api/orders/${tableId}/checkout`);
    return response.data;
};

// --- KITCHEN ---
export const getKitchenOrdersAPI = async () => {
    const response = await axiosClient.get('/api/orders/kitchen');
    return response.data;
};

export const updateOrderStatusAPI = async (orderId, status) => {
    const response = await axiosClient.put(`/api/orders/${orderId}/status?status=${status}`);
    return response.data;
};

// --- REPORT / DASHBOARD (ĐÃ SỬA CACHE) ---
export const getDashboardStatsAPI = async (from, to) => {
    const url = '/api/reports/dashboard';

    // Tạo params có chứa timestamp để chống cache
    const params = {
        from,
        to,
        _t: new Date().getTime() // 👈 QUAN TRỌNG: Timestamp ngẫu nhiên
    };

    const response = await axiosClient.get(url, { params });
    return response.data;
};

export const payItemsAPI = async (orderId, orderItemIds) => {
    const response = await axiosClient.post(`/api/orders/${orderId}/pay-items`, orderItemIds);
    return response.data;
};

export const updateOrderItemStatusAPI = async (itemId, status) => {
    const response = await axiosClient.put(`/api/orders/items/${itemId}/status?status=${status}`);
    return response.data;
};