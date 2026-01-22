import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Button, Tag, message, List, Space, Badge } from 'antd';
import { CheckCircleOutlined, FireOutlined, BellOutlined, SoundOutlined } from '@ant-design/icons';
import useWebSocket from '../../hooks/useWebSocket';
import { getKitchenOrdersAPI, updateOrderItemStatusAPI } from '../../services/orderService';

// Link âm thanh
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2558/2558-preview.mp3';

const KitchenPage = () => {
    const [orders, setOrders] = useState([]);

    // 1. Dùng Ref để tham chiếu dữ liệu orders hiện tại (để so sánh logic mà không cần vào setOrders)
    const ordersRef = useRef([]);

    // Đồng bộ Ref với State mỗi khi render
    ordersRef.current = orders;

    // Audio Ref
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getKitchenOrdersAPI();
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    // 2. Hàm kích hoạt âm thanh thủ công (Fix lỗi trình duyệt chặn)
    const enableSound = () => {
        audioRef.current.play().then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            message.success("Đã bật âm thanh báo đơn! 🔊");
        }).catch(() => message.error("Không thể bật loa. Hãy kiểm tra cài đặt trình duyệt."));
    };

    const playSound = () => {
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Chưa bật loa:", e));
    };

    // --- LOGIC SOCKET (ĐÃ SỬA LỖI PURE FUNCTION) ---
    useWebSocket('/topic/kitchen', (updatedOrder) => {
        // A. TÍNH TOÁN LOGIC (Dùng dữ liệu từ Ref, KHÔNG dùng state trực tiếp để tránh loop)
        const currentOrders = ordersRef.current;
        const existingIndex = currentOrders.findIndex(o => o.id === updatedOrder.id);

        let shouldNotify = false;

        if (existingIndex === -1) {
            // Trường hợp 1: Đơn mới tinh chưa có trong list
            shouldNotify = true;
        } else {
            // Trường hợp 2: Đơn cũ, kiểm tra xem số lượng món PENDING có tăng lên không
            const oldOrder = currentOrders[existingIndex];
            // Safe check để tránh lỗi null
            const oldPending = oldOrder.orderItems ? oldOrder.orderItems.filter(i => i.status === 'PENDING').length : 0;
            const newPending = updatedOrder.orderItems ? updatedOrder.orderItems.filter(i => i.status === 'PENDING').length : 0;

            if (newPending > oldPending) {
                shouldNotify = true;
            }
        }

        // B. THỰC HIỆN SIDE EFFECT (Nằm NGOÀI setOrders) -> Fix lỗi render method
        if (shouldNotify) {
            playSound();
            message.info({
                content: `🔔 Bàn ${updatedOrder.table?.name} có món mới!`,
                duration: 5,
                style: { marginTop: '10vh' },
            });
        }

        // C. CẬP NHẬT STATE (Chỉ cập nhật dữ liệu, không làm gì khác)
        setOrders(prevOrders => {
            const idx = prevOrders.findIndex(o => o.id === updatedOrder.id);
            if (idx !== -1) {
                const newList = [...prevOrders];
                newList[idx] = updatedOrder;
                return newList;
            } else {
                return [updatedOrder, ...prevOrders];
            }
        });
    });

    const handleItemStatus = async (itemId, newStatus) => {
        try {
            await updateOrderItemStatusAPI(itemId, newStatus);
            // Optimistic Update
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

    const sortItems = (items) => {
        const priority = { 'PENDING': 1, 'COOKING': 2, 'READY': 3, 'SERVED': 4 };
        return [...items].sort((a, b) => priority[a.status] - priority[b.status]);
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>👨‍🍳 Màn Hình Bếp</h2>

                {/* Nút bật loa: Bắt buộc phải có để trình duyệt cho phép phát tiếng */}
                <Button
                    type="primary"
                    icon={<SoundOutlined />}
                    onClick={enableSound}
                >
                    Bật Loa
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                {orders.map(order => {
                    const activeItems = order.orderItems.filter(i => i.status !== 'PAID');
                    if (activeItems.length === 0) return null;

                    const pendingCount = activeItems.filter(i => i.status === 'PENDING').length;

                    return (
                        <Col xs={24} sm={12} md={12} lg={8} key={order.id}>
                            <Badge.Ribbon text="Món Mới" color="red" style={{ display: pendingCount > 0 ? 'block' : 'none' }}>
                                <Card
                                    title={<span style={{ fontSize: 18, color: '#d4380d' }}>{order.table?.name}</span>}
                                    extra={<Tag color="blue">#{order.id}</Tag>}
                                    style={{ boxShadow: pendingCount > 0 ? '0 0 10px rgba(255, 0, 0, 0.3)' : '0 4px 8px rgba(0,0,0,0.1)' }}
                                    styles={{ body: { padding: '0px' } }}
                                >
                                    <List
                                        dataSource={sortItems(activeItems)}
                                        renderItem={item => (
                                            <List.Item style={{
                                                padding: 15,
                                                backgroundColor: item.status === 'PENDING' ? '#fff7e6' : 'white',
                                                borderLeft: item.status === 'PENDING' ? '5px solid #fa8c16' :
                                                            item.status === 'READY' ? '5px solid #52c41a' : '5px solid transparent'
                                            }}>
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                                                            {item.quantity}x {item.product.name}
                                                        </span>
                                                        <Tag color={
                                                            item.status === 'PENDING' ? 'orange' :
                                                            item.status === 'COOKING' ? 'blue' :
                                                            item.status === 'READY' ? 'green' : 'default'
                                                        }>
                                                            {item.status}
                                                        </Tag>
                                                    </div>
                                                    {item.note && <div style={{ color: 'red', fontStyle: 'italic', marginBottom: 8 }}>Note: {item.note}</div>}

                                                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                                        {item.status === 'PENDING' && (
                                                            <Button type="primary" icon={<FireOutlined />} onClick={() => handleItemStatus(item.id, 'COOKING')}>Nấu</Button>
                                                        )}
                                                        {item.status === 'COOKING' && (
                                                            <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<BellOutlined />} onClick={() => handleItemStatus(item.id, 'READY')}>Báo Xong</Button>
                                                        )}
                                                        {item.status === 'READY' && <Tag icon={<CheckCircleOutlined />} color="success">Đã báo</Tag>}
                                                        {item.status === 'SERVED' && <Tag color="default">Đã ăn</Tag>}
                                                    </Space>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Badge.Ribbon>
                        </Col>
                    );
                })}
            </Row>
            {orders.length === 0 && <p style={{ textAlign: 'center', marginTop: 50, color: 'gray' }}>Bếp đang rảnh rỗi! 😴</p>}
        </div>
    );
};

export default KitchenPage;