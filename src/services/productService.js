import axiosClient from './axiosClient';

export const getProductsAPI = async () => {
    // SỬA: Thêm /api
    const response = await axiosClient.get('/api/products');
    return response.data;
};

export const createProductAPI = async (product) => {
    // SỬA: Thêm /api
    const response = await axiosClient.post('/api/products', product);
    return response.data;
};

export const updateProductAPI = async (id, product) => {
    // SỬA: Thêm /api
    const response = await axiosClient.put(`/api/products/${id}`, product);
    return response.data;
};

export const deleteProductAPI = async (id) => {
    // SỬA: Thêm /api
    const response = await axiosClient.delete(`/api/products/${id}`);
    return response.data;
};