import axiosClient from './axiosClient';

export const loginAPI = async (username, password) => {
    const response = await axiosClient.post('/api/auth/login', { username, password });
    return response.data;
};

export const getUsersAPI = async () => {
    const response = await axiosClient.get('/api/users');
    return response.data;
};

export const createUserAPI = async (user) => {
    const response = await axiosClient.post('/api/users', user);
    return response.data;
};

export const updateUserAPI = async (id, user) => {
    const response = await axiosClient.put(`/api/users/${id}`, user);
    return response.data;
};

export const toggleUserStatusAPI = async (id) => {
    const response = await axiosClient.patch(`/api/users/${id}/toggle-status`);
    return response.data;
};

export const resetPasswordAPI = async (id) => {
    const response = await axiosClient.patch(`/api/users/${id}/reset-password`);
    return response.data;
};

// [MỚI] Hàm xóa vĩnh viễn
export const deleteUserAPI = async (id) => {
    const response = await axiosClient.delete(`/api/users/${id}`);
    return response.data;
};