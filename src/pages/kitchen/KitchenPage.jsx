import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Button, Tag, message, Badge, List, Space } from 'antd';
import { CheckCircleOutlined, FireOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import useWebSocket from '../../hooks/useWebSocket'; // Dùng lại hook socket xịn xò
import { getKitchenOrdersAPI, updateOrderItemStatusAPI } from '../../services/orderService';
import { API_BASE_URL } from '../../utils/constants'; // Để dùng cho âm thanh nếu cần

const KitchenPage = () => {
    const [orders, setOrders] = useState([]);

    // 1. Load đơn cũ khi vào trang
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getKitchenOrdersAPI();
            // Lọc: Chỉ hiện những đơn CHƯA hoàn thành hết (tức là còn món chưa SERVED)
            // Hoặc backend đã lọc sẵn rồi.
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    // 2. Lắng nghe WebSocket (Khi khách gọi thêm món, socket sẽ bắn toàn bộ Order về)
    useWebSocket('/topic/kitchen', (updatedOrder) => {
        setOrders(prevOrders => {
            // Kiểm tra xem đơn này đã có trong màn hình bếp chưa
            const exists = prevOrders.find(o => o.id === updatedOrder.id);

            if (exists) {
                // Nếu có rồi -> Cập nhật lại (Món mới sẽ tự hiện ra, món cũ cập nhật trạng thái)
                return prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            } else {
                // Nếu chưa có (Bàn mới mở) -> Thêm vào đầu
                playNotificationSound();
                message.info(`🔔 Bàn ${updatedOrder.table.name} vừa mở đơn!`);
                return [updatedOrder, ...prevOrders];
            }
        });
    });

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    };

    // 3. Xử lý chuyển trạng thái TỪNG MÓN
    const handleItemStatus = async (itemId, newStatus) => {
        try {
            // Gọi API (Backend sẽ bắn socket lại để update UI, nhưng ta update UI luôn cho nhanh)
            await updateOrderItemStatusAPI(itemId, newStatus);

            // Cập nhật Optimistic UI (Update ngay lập tức trên giao diện ko cần chờ socket)
            setOrders(prev => prev.map(order => ({
                ...order,
                orderItems: order.orderItems.map(item =>
                    item.id === itemId ? { ...item, status: newStatus } : item
                )
            })));
        } catch (error) {
            message.error('Lỗi cập nhật món!');
        }
    };

    // Helper: Sắp xếp món ăn (Món mới lên trên, món xong xuống dưới)
    const sortItems = (items) => {
        const priority = { 'PENDING': 1, 'COOKING': 2, 'SERVED': 3 };
        return [...items].sort((a, b) => priority[a.status] - priority[b.status]);
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>👨‍🍳 Màn Hình Bếp (Chế độ từng món)</h2>

            <Row gutter={[16, 16]}>
                {orders.map(order => {
                    // Kiểm tra xem đơn này còn món nào chưa xong không
                    const activeItems = order.orderItems.filter(i => i.status !== 'PAID');
                    if (activeItems.length === 0) return null; // Ẩn đơn đã xong hết

                    return (
                        <Col xs={24} sm={12} md={12} lg={8} key={order.id}>
                            <Card
                                title={<span style={{ fontSize: 18, color: '#d4380d' }}>{order.table?.name}</span>}
                                extra={<Tag color="blue">#{order.id}</Tag>}
                                style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                                styles={{ body: { padding: '0px' } }}
                            >
                                <List
                                    dataSource={sortItems(activeItems)}
                                    renderItem={item => (
                                        <List.Item style={{
                                            padding: 15,
                                            backgroundColor: item.status === 'PENDING' ? '#fff7e6' : 'white',
                                            borderLeft: item.status === 'PENDING' ? '5px solid #fa8c16' : '5px solid transparent'
                                        }}>
                                            <div style={{ width: '100%' }}>
                                                {/* Tên món và Note */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                                                        {item.quantity}x {item.product.name}
                                                    </span>
                                                    <Tag color={
                                                        item.status === 'PENDING' ? 'orange' :
                                                        item.status === 'COOKING' ? 'blue' : 'green'
                                                    }>
                                                        {item.status}
                                                    </Tag>
                                                </div>
                                                {item.note && <div style={{ color: 'red', fontStyle: 'italic', marginBottom: 8 }}>Note: {item.note}</div>}

                                                {/* Nút thao tác */}
                                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                                    {item.status === 'PENDING' && (
                                                        <Button
                                                            type="primary"
                                                            icon={<FireOutlined />}
                                                            onClick={() => handleItemStatus(item.id, 'COOKING')}
                                                        >
                                                            Nấu
                                                        </Button>
                                                    )}
                                                    {item.status === 'COOKING' && (
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: '#52c41a' }}
                                                            icon={<CheckCircleOutlined />}
                                                            onClick={() => handleItemStatus(item.id, 'SERVED')}
                                                        >
                                                            Xong
                                                        </Button>
                                                    )}
                                                    {item.status === 'SERVED' && (
                                                        <Button size="small" disabled icon={<CheckCircleOutlined />}>Đã ra món</Button>
                                                    )}
                                                </Space>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {orders.length === 0 && <p style={{ textAlign: 'center', marginTop: 50, color: 'gray' }}>Bếp đang rảnh rỗi! 😴</p>}
        </div>
    );
};

export default KitchenPage;