import axiosClient from './axiosClient';

// Lấy danh sách danh mục
export const getCategoriesAPI = async () => {
    const response = await axiosClient.get('/api/categories');
    return response.data;
};

// Tạo danh mục mới
export const createCategoryAPI = async (category) => {
    const response = await axiosClient.post('/api/categories', category);
    return response.data;
};

// Cập nhật danh mục
export const updateCategoryAPI = async (id, category) => {
    const response = await axiosClient.put(`/api/categories/${id}`, category);
    return response.data;
};

// Xóa danh mục
export const deleteCategoryAPI = async (id) => {
    const response = await axiosClient.delete(`/api/categories/${id}`);
    return response.data;
};