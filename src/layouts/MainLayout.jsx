import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    LogoutOutlined,
    CoffeeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: '/dashboard', icon: <UserOutlined />, label: 'Tổng quan' },
        { key: '/tables', icon: <VideoCameraOutlined />, label: 'Quản lý Bàn' },
        { key: '/menu', icon: <CoffeeOutlined />, label: 'Thực đơn' },
    ];

    // ✅ Kiểm tra quyền từ Context (an toàn tuyệt đối)
    if (user?.role?.toUpperCase() === 'ADMIN') {
        menuItems.push(
            { key: '/admin/products', icon: <UploadOutlined />, label: 'Quản trị Món' },
            { key: '/admin/users', icon: <UserOutlined />, label: 'Nhân sự' }
        );
    }

    // Menu chung
    menuItems.push({ key: '/kitchen', icon: <CoffeeOutlined />, label: 'Bếp & Bar' });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{
                    height: 32,
                    margin: 16,
                    background: 'rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: '#fff',
                    lineHeight: '32px',
                    fontWeight: 'bold'
                }}>
                    {collapsed ? 'DF' : 'DINEFLOW'}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={menuItems}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 20px',
                        background: colorBgContainer,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 'bold' }}>
                            Xin chào, {user ? user.role.toUpperCase() : '...'}
                        </span>
                        <Button
                            type="primary"
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                        >
                            Thoát
                        </Button>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
