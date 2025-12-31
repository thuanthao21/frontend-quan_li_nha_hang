import axiosClient from './axiosClient';

export const getProductsAPI = async () => {
    const response = await axiosClient.get('/products');
    return response.data;
};

export const createProductAPI = async (product) => {
    const response = await axiosClient.post('/products', product);
    return response.data;
};

export const updateProductAPI = async (id, product) => {
    const response = await axiosClient.put(`/products/${id}`, product);
    return response.data;
};

export const deleteProductAPI = async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
};