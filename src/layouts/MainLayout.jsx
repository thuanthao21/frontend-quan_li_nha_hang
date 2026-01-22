import React, { useState, useRef } from 'react';
import { Layout, Menu, Button, theme, notification, message, Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    LogoutOutlined,
    CoffeeOutlined,
    AppstoreOutlined,
    SoundOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const notifiedItemsRef = useRef(new Set());

    // =========================================================================
    // 🔊 HỆ THỐNG ÂM THANH (WEB AUDIO API - KHÔNG CẦN LINK)
    // =========================================================================

    // 1. Tiếng Bếp MỚI: "Ding - Dong" (Chuông báo êm ái)
    const playKitchenSound = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        const playTone = (freq, time, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // Dùng sóng 'sine' (hình sin) để tạo tiếng chuông tròn, êm
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + duration);

            // Hiệu ứng ngân (Fade out)
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(1, time + 0.05); // Âm lượng tăng nhanh
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // Ngân dài và tắt dần
        };

        // Ding (Nốt Mi - E5)
        playTone(659.25, now, 1.2);
        // Dong (Nốt Đô - C5) - Kêu sau 0.5s
        playTone(523.25, now + 0.5, 1.5);
    };

    // 2. Tiếng Nhân viên: "Ting Ting" (Cao vút, nhẹ nhàng)
    const playStaffSound = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        const playPing = (freq, time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + 0.5);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        };

        // Kêu 2 tiếng Ting - Ting (Nốt C7 - Rất cao)
        playPing(2093.00, now);
        playPing(2093.00, now + 0.15);
    };

    // Hàm kích hoạt (Mở khóa trình duyệt)
    const enableAudio = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            ctx.resume().then(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.001);
                message.success('🔊 Đã bật âm thanh!');
            });
        }
    };

    // =========================================================================

    useWebSocket('/topic/kitchen', (order) => {
        if (!user) return;
        const role = user.role?.toUpperCase();
        const currentPath = location.pathname;

        // LOGIC BẾP (Kêu Ding Dong)
        if ((role === 'KITCHEN' || role === 'ADMIN') && currentPath === '/kitchen') {
            const newItems = order.orderItems.filter(item => item.status === 'PENDING');
            const itemsToNotify = newItems.filter(item => !notifiedItemsRef.current.has(item.id));

            if (itemsToNotify.length > 0) {
                itemsToNotify.forEach(item => notifiedItemsRef.current.add(item.id));

                playKitchenSound(); // <--- Kêu Ding Dong

                notification.info({
                    message: '👨‍🍳 CÓ MÓN MỚI!',
                    description: `Bàn ${order.table?.name}: ${itemsToNotify.length} món mới.`,
                    style: { backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }
                });
            }
        }

        // LOGIC NHÂN VIÊN (Kêu Ting Ting)
        if ((role === 'STAFF' || role === 'ADMIN') && currentPath !== '/kitchen') {
            const readyItems = order.orderItems.filter(item => item.status === 'READY');
            const itemsToNotify = readyItems.filter(item => !notifiedItemsRef.current.has(item.id));

            if (itemsToNotify.length > 0) {
                itemsToNotify.forEach(item => notifiedItemsRef.current.add(item.id));

                playStaffSound(); // <--- Kêu Ting Ting

                notification.success({
                    message: '✅ MÓN ĐÃ XONG!',
                    description: `Bàn ${order.table?.name}: ${itemsToNotify.length} món đã xong.`,
                    style: { backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }
                });
            }
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userRole = user?.role?.toUpperCase();
    let menuItems = [];

    if (userRole === 'KITCHEN') {
        menuItems = [ { key: '/kitchen', icon: <CoffeeOutlined />, label: 'Màn hình Bếp' } ];
    } else {
        menuItems = [
            { key: '/dashboard', icon: <AppstoreOutlined />, label: 'Tổng quan' },
            { key: '/tables', icon: <VideoCameraOutlined />, label: 'Quản lý Bàn' },
            { key: '/menu', icon: <CoffeeOutlined />, label: 'Thực đơn' },
        ];
        if (userRole === 'ADMIN') {
            menuItems.push(
                { key: '/admin/products', icon: <UploadOutlined />, label: 'Quản trị Món' },
                { key: '/admin/categories', icon: <UploadOutlined />, label: 'Danh mục' },
                { key: '/admin/users', icon: <UserOutlined />, label: 'Nhân sự' },
                { key: '/kitchen', icon: <CoffeeOutlined />, label: 'Màn hình Bếp' }
            );
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
                    {collapsed ? 'DF' : 'DINEFLOW'}
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={({ key }) => navigate(key)} items={menuItems} />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 20px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '16px', width: 64, height: 64 }} />

                        {/* NÚT BẬT LOA */}
                        <Tooltip title="Click để bật âm thanh thông báo">
                            <Button type="dashed" shape="circle" icon={<SoundOutlined />} onClick={enableAudio} style={{ marginLeft: 10, color: '#1890ff', borderColor: '#1890ff' }} />
                        </Tooltip>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 'bold' }}>{user?.fullName || 'User'}</div>
                            <small style={{ color: 'gray' }}>{userRole}</small>
                        </div>
                        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>Thoát</Button>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;