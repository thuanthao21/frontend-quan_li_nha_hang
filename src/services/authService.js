import axiosClient from './axiosClient';

export const loginAPI = async (username, password) => {
    // SỬA DÒNG NÀY: Thêm /api vào trước /auth/login
    const response = await axiosClient.post('/api/auth/login', { username, password });
    return response.data;
};

// Admin quản lý User
export const getUsersAPI = async () => {
    // SỬA LUÔN DÒNG NÀY: Khả năng cao UserController của bạn cũng có prefix /api
    const response = await axiosClient.get('/api/users');
    return response.data;
};

export const createUserAPI = async (user) => {
    // SỬA LUÔN:
    const response = await axiosClient.post('/api/users', user);
    return response.data;
};

export const deleteUserAPI = async (id) => {
    // SỬA LUÔN:
    const response = await axiosClient.delete(`/api/users/${id}`);
    return response.data;
};