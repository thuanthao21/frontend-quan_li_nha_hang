// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // State này thay đổi thì App mới vẽ lại

    useEffect(() => {
        // Giữ đăng nhập khi F5
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            setUser({ token, role });
        }
    }, []);

    const login = (token, role) => {
        // 1. Lưu vào ổ cứng (để F5 còn nhớ)
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        // 2. CẬP NHẬT STATE NGAY LẬP TỨC (Đây là bước quan trọng nhất)
        setUser({ token, role });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};