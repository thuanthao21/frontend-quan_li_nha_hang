import axiosClient from './axiosClient';

// --- POS & ORDER ---
export const getTablesAPI = async () => {
    // SỬA: Thêm /api
    const response = await axiosClient.get('/api/tables');
    return response.data;
};

export const createOrderAPI = async (orderData) => {
    // SỬA: Thêm /api
    const response = await axiosClient.post('/api/orders', orderData);
    return response.data;
};

export const getCurrentOrderAPI = async (tableId) => {
    try {
        // SỬA: Thêm /api
        const response = await axiosClient.get(`/api/orders/${tableId}/current`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const checkoutAPI = async (tableId) => {
    // SỬA: Thêm /api
    const response = await axiosClient.post(`/api/orders/${tableId}/checkout`);
    return response.data;
};

// --- KITCHEN ---
export const getKitchenOrdersAPI = async () => {
    // SỬA: Thêm /api
    const response = await axiosClient.get('/api/orders/kitchen');
    return response.data;
};

export const updateOrderStatusAPI = async (orderId, status) => {
    // SỬA: Thêm /api
    const response = await axiosClient.put(`/api/orders/${orderId}/status?status=${status}`);
    return response.data;
};


export const getDashboardStatsAPI = async (from, to) => {
    // SỬA: Thêm /api vào đường dẫn báo cáo
    let url = '/api/reports/dashboard';

    if (from && to) {
        url += `?from=${from}&to=${to}`;
    }

    const response = await axiosClient.get(url);
    return response.data;
};

export const payItemsAPI = async (orderId, orderItemIds) => {
    // SỬA: Thêm /api
    const response = await axiosClient.post(`/api/orders/${orderId}/pay-items`, orderItemIds);
    return response.data;
};

export const updateOrderItemStatusAPI = async (itemId, status) => {
    // SỬA: Thêm /api
    const response = await axiosClient.put(`/api/orders/items/${itemId}/status?status=${status}`);
    return response.data;
};