import axiosClient from './axiosClient';

export const getProductsAPI = async () => {
    const response = await axiosClient.get('/api/products');
    return response.data;
};

export const createProductAPI = async (product) => {
    const response = await axiosClient.post('/api/products', product);
    return response.data;
};

export const updateProductAPI = async (id, product) => {
    const response = await axiosClient.put(`/api/products/${id}`, product);
    return response.data;
};

// [MỚI] Hàm đổi trạng thái còn/hết hàng
export const toggleProductStatusAPI = async (id) => {
    const response = await axiosClient.put(`/api/products/${id}/availability`);
    return response.data;
};

export const deleteProductAPI = async (id) => {
    const response = await axiosClient.delete(`/api/products/${id}`);
    return response.data;
};