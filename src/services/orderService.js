import axiosClient from './axiosClient';

// Enum trạng thái để dùng trong Code Frontend cho chuẩn
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    COOKING: 'COOKING',
    READY: 'READY',
    SERVED: 'SERVED',
    UNPAID: 'UNPAID',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

// 1. Lấy danh sách bàn
export const getTablesAPI = async () => {
    const response = await axiosClient.get('/api/tables');
    return response.data;
};

// 2. Tạo đơn mới
export const createOrderAPI = async (orderData) => {
    const response = await axiosClient.post('/api/orders', orderData);
    return response.data;
};

// 3. Lấy đơn hiện tại (Đã xử lý lỗi null/204)
export const getCurrentOrderAPI = async (tableId) => {
    try {
        const response = await axiosClient.get(`/api/orders/${tableId}/current`);
        // Nếu server trả về rỗng (204) hoặc không có data
        if (!response || !response.data) return null;
        return response.data;
    } catch (error) {
        // Nếu lỗi 404 coi như bàn trống
        return null;
    }
};

// 4. Thanh toán cả bàn
export const checkoutAPI = async (tableId) => {
    const response = await axiosClient.post(`/api/orders/${tableId}/checkout`);
    return response.data;
};

// 5. Thanh toán theo món (Tách bill)
export const payItemsAPI = async (orderId, orderItemIds) => {
    const response = await axiosClient.post(`/api/orders/${orderId}/pay-items`, orderItemIds);
    return response.data;
};

// 6. Chuyển bàn
export const moveTableAPI = async (fromTableId, toTableId) => {
    const response = await axiosClient.post(`/api/orders/move?fromTableId=${fromTableId}&toTableId=${toTableId}`);
    return response.data;
};

// --- API CHO BẾP ---

// 7. Lấy danh sách đơn bếp
export const getKitchenOrdersAPI = async () => {
    const response = await axiosClient.get('/api/orders/kitchen');
    return response.data;
};

// 8. Cập nhật trạng thái từng món (Bếp tick món)
// URL: /api/orders/items/123/status?status=READY
export const updateOrderItemStatusAPI = async (itemId, status) => {
    const response = await axiosClient.put(`/api/orders/items/${itemId}/status`, null, {
        params: { status }
    });
    return response.data;
};

// --- BÁO CÁO ---
export const getDashboardStatsAPI = async (from, to) => {
    const response = await axiosClient.get('/api/reports/dashboard', {
        params: { from, to, _t: new Date().getTime() }
    });
    return response.data;
};

export const getTopProductsAPI = async (from, to) => {
    const response = await axiosClient.get('/api/reports/top-products', {
        params: { from, to, _t: new Date().getTime() }
    });
    return response.data;
};