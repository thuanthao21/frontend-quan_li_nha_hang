import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout';
import MenuPage from './pages/MenuPage';
import TablePage from './pages/TablePage';
import AdminProductPage from './pages/AdminProductPage';
import AdminUserPage from './pages/AdminUserPage';
import KitchenPage from './pages/KitchenPage';


// Component bảo vệ: Nếu chưa login thì đá về trang login
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Trang Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Trang Dashboard */}
        <Route
            path="/dashboard"
            element={
                <PrivateRoute>
                    <MainLayout>
                        <DashboardPage />
                    </MainLayout>
                </PrivateRoute>
            }
        />

        {/* 3. Trang Menu */}
        <Route
            path="/menu"
            element={
                <PrivateRoute>
                    <MainLayout>
                        <MenuPage />
                    </MainLayout>
                </PrivateRoute>
            }
        />

        {/* 4. Trang Quản lý Bàn */}
        <Route
            path="/tables"
            element={
                <PrivateRoute>
                    <MainLayout>
                        <TablePage />
                    </MainLayout>
                </PrivateRoute>
            }
        />

        {/* 5. Trang Quản Trị (Mới thêm) */}
        <Route
            path="/admin/products"
            element={
                <PrivateRoute>
                    <MainLayout>
                        <AdminProductPage />
                    </MainLayout>
                </PrivateRoute>
            }
        />
        <Route path="/admin/users" element={
            <PrivateRoute>
                <MainLayout>
                    <AdminUserPage />
                </MainLayout>
            </PrivateRoute>
        } />
        <Route path="/kitchen" element={
            <PrivateRoute>
                <MainLayout>
                    <KitchenPage />
                </MainLayout>
            </PrivateRoute>
        } />

        {/* Mặc định vào dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;