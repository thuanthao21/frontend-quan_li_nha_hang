import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import các trang
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import MainLayout from './layouts/MainLayout';
import MenuPage from './pages/MenuPage';
import TablePage from './pages/pos/TablePage';
import AdminProductPage from './pages/admin/AdminProductPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import KitchenPage from './pages/kitchen/KitchenPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';

// [QUAN TRỌNG] Import trang Khách hàng (Nguyên nhân lỗi của bạn)
import CustomerMenuPage from './pages/customer/CustomerMenuPage';

// [QUAN TRỌNG] Import CartProvider để dùng giỏ hàng
import { CartProvider } from './context/CartContext';

// Component bảo vệ: Nếu chưa login thì đá về trang login
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // Bọc CartProvider ở ngoài cùng để cả App dùng được giỏ hàng
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Trang Login (Public) */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. Trang Khách hàng gọi món (Public - Không cần Login) */}
          <Route path="/menu/:tableId" element={<CustomerMenuPage />} />

          {/* 3. Các trang nội bộ (Cần Login) */}

          {/* Dashboard */}
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

          {/* Menu cũ (Nếu còn dùng) */}
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

          {/* Quản lý Bàn & POS */}
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

          {/* Quản lý Món ăn */}
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

          {/* Quản lý Nhân viên */}
          <Route path="/admin/users" element={
              <PrivateRoute>
                  <MainLayout>
                      <AdminUserPage />
                  </MainLayout>
              </PrivateRoute>
          } />

          {/* Quản lý Danh mục */}
          <Route
              path="/admin/categories"
              element={
                  <PrivateRoute>
                      <MainLayout>
                          <AdminCategoryPage />
                      </MainLayout>
                  </PrivateRoute>
              }
          />

          {/* Màn hình Bếp */}
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
    </CartProvider>
  );
}

export default App;