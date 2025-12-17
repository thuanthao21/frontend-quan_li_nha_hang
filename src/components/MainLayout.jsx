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
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();

    // 1. Lấy Role của người dùng hiện tại
    const role = localStorage.getItem('role');

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // 2. Định nghĩa danh sách Menu cơ bản (Ai cũng thấy)
    const menuItems = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Tổng quan',
            onClick: () => navigate('/dashboard')
        },
        {
            key: '2',
            icon: <VideoCameraOutlined />,
            label: 'Quản lý Bàn',
            onClick: () => navigate('/tables')
        },
        {
            key: '3',
            icon: <CoffeeOutlined />,
            label: 'Thực đơn',
            onClick: () => navigate('/menu')
        },
    ];

    // 3. Nếu là ADMIN -> Thêm menu Quản trị vào cuối danh sách
    if (role === 'ADMIN') {
        menuItems.push(
            {
            key: '4',
            icon: <UploadOutlined />,
            label: 'Quản trị (Admin)',
            onClick: () => navigate('/admin/products')
        });
        menuItems.push({
                key: '5',
                icon: <UserOutlined />,
                label: 'Nhân sự',
                onClick: () => navigate('/admin/users')
            });
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
                    {collapsed ? 'DF' : 'DINEFLOW'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={menuItems} // Truyền danh sách menu đã xử lý vào đây
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;