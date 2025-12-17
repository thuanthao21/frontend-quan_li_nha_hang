import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Button, Tag, message, Badge } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getKitchenOrdersAPI, updateOrderStatusAPI } from '../services/api';

const KitchenPage = () => {
    const [orders, setOrders] = useState([]);
    // Dùng useRef để giữ biến stompClient không bị mất khi render lại
    const stompClientRef = useRef(null);

    useEffect(() => {
        let isMounted = true; // Cờ kiểm tra xem trang còn hiển thị không

        // 1. Hàm load đơn cũ
        const fetchKitchenOrders = async () => {
            try {
                const data = await getKitchenOrdersAPI();
                if (isMounted) setOrders(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchKitchenOrders();

        // 2. Kết nối WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = null; // Tắt log debug cho đỡ rối

        stompClientRef.current = client;

        client.connect({}, () => {
            // [QUAN TRỌNG] Chỉ subscribe nếu trang vẫn đang mount và kết nối còn sống
            if (isMounted && client.connected) {
                // console.log("✅ Đã kết nối WebSocket Bếp!");
                message.success("👨‍🍳 Bếp đã kết nối!");

                client.subscribe('/topic/kitchen', (data) => {
                    const newOrder = JSON.parse(data.body);
                    handleNewOrderSocket(newOrder);
                });
            }
        }, (error) => {
            if (isMounted) {
                console.error("Lỗi Socket:", error);
            }
        });

        // Cleanup: Ngắt kết nối khi rời trang
        return () => {
            isMounted = false;
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, []);

    // --- XỬ LÝ KHI CÓ ĐƠN MỚI ---
    const handleNewOrderSocket = (newOrder) => {
        // Phát âm thanh báo hiệu
        playNotificationSound();

        setOrders(prevOrders => {
            // Nếu đơn đã có trong list (do mạng lag gửi trùng) thì update, chưa có thì thêm mới
            const exists = prevOrders.find(o => o.id === newOrder.id);
            if (exists) {
                return prevOrders.map(o => o.id === newOrder.id ? newOrder : o);
            }
            message.info(`🔔 Bàn ${newOrder.table.name} vừa gọi món!`);
            return [newOrder, ...prevOrders];
        });
    };

    const playNotificationSound = () => {
        // Link âm thanh tiếng chuông ngắn
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Trình duyệt chặn tự phát âm thanh"));
    };

    // --- CẬP NHẬT TRẠNG THÁI ---
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatusAPI(orderId, newStatus);
            message.success('Đã cập nhật trạng thái!');

            // Cập nhật giao diện ngay lập tức
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            message.error('Lỗi cập nhật!');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>👨‍🍳 Bếp & Quầy Bar <Badge count={orders.length} style={{ backgroundColor: '#52c41a' }} /></h2>

            <Row gutter={[16, 16]}>
                {orders.map(order => (
                    <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
                        <Card
                            title={<span style={{fontSize: 18, color: '#d4380d'}}>{order.table?.name || 'Mang về'}</span>}
                            extra={<Tag color="blue">#{order.id}</Tag>}
                            hoverable
                            styles={{ body: { padding: '15px' } }} // Sửa lỗi bodyStyle deprecated
                            style={{
                                border: order.status === 'UNPAID' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                backgroundColor: order.status === 'PAID' ? '#f6ffed' : '#fff'
                            }}
                        >
                            <div style={{ marginBottom: 15, maxHeight: 200, overflowY: 'auto' }}>
                                {order.orderItems.map((item, index) => (
                                    <div key={index} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        padding: '5px 0', borderBottom: '1px dashed #eee',
                                        fontSize: 15
                                    }}>
                                        <span><b>{item.quantity}x</b> {item.product.name}</span>
                                        {item.note && <span style={{color: 'red', fontSize: 12}}>({item.note})</span>}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                                <span style={{ color: 'gray', fontSize: 12 }}>
                                    <ClockCircleOutlined /> {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                                <Tag color={order.status === 'UNPAID' ? 'orange' : 'green'}>
                                    {order.status === 'UNPAID' ? 'Mới' : order.status}
                                </Tag>
                            </div>

                            {/* Nút thao tác của Bếp */}
                            <div style={{ marginTop: 15 }}>
                                {order.status === 'UNPAID' && (
                                    <Button type="primary" block icon={<CheckCircleOutlined />}
                                            onClick={() => handleStatusChange(order.id, 'COOKING')}>
                                        Nhận Nấu
                                    </Button>
                                )}

                                {order.status === 'COOKING' && (
                                    <Button type="primary" block style={{backgroundColor: '#52c41a'}}
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => handleStatusChange(order.id, 'SERVED')}>
                                        Xong Món
                                    </Button>
                                )}

                                {order.status === 'SERVED' && (
                                    <Button disabled block>Đã phục vụ</Button>
                                )}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {orders.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 50, color: 'gray' }}>
                    <h3>Hiện không có đơn hàng nào cần xử lý 🎉</h3>
                </div>
            )}
        </div>
    );
};

export default KitchenPage;