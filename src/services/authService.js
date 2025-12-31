import axiosClient from './axiosClient';

export const loginAPI = async (username, password) => {
    const response = await axiosClient.post('/auth/login', { username, password });
    return response.data;
};

// Admin quản lý User
export const getUsersAPI = async () => {
    const response = await axiosClient.get('/users');
    return response.data;
};

export const createUserAPI = async (user) => {
    const response = await axiosClient.post('/users', user);
    return response.data;
};

export const deleteUserAPI = async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
};