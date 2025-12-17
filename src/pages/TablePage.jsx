import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Badge, Button, message, Modal, List, Tabs, Table, Tag, Popconfirm, Input } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getTablesAPI, getProductsAPI, createOrderAPI, checkoutAPI, getCurrentOrderAPI } from '../services/api';

const TablePage = () => {
    const [tables, setTables] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    // Tìm kiếm
    const [searchText, setSearchText] = useState('');

    // Giỏ hàng & Đơn hàng
    const [cart, setCart] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tablesData, productsData] = await Promise.all([
                getTablesAPI(),
                getProductsAPI()
            ]);
            setTables(tablesData);
            setProducts(productsData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    // --- LOGIC TÌM KIẾM ---
    const getFilteredProducts = () => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    // Khi bấm vào bàn
    const handleTableClick = async (table) => {
        setSelectedTable(table);
        setCart([]);
        setCurrentOrder(null);
        setSearchText('');

        // Nếu bàn đang có khách, thử tải đơn hàng về
        if (table.status === 'OCCUPIED') {
            try {
                const orderData = await getCurrentOrderAPI(table.id);
                if (orderData) setCurrentOrder(orderData);
            } catch (error) {
                // Không làm gì cả nếu lỗi (nghĩa là chưa có đơn hoặc lỗi server), tránh báo đỏ console
                console.log("Bàn này chưa có đơn active hoặc lỗi nhẹ:", error.message);
            }
        }
        setIsModalOpen(true);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1, note: '' }]);
        }
        message.success(`Đã thêm ${product.name}`);
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return message.warning('Chưa chọn món nào!');
        const itemsToSend = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.note || ""
        }));

        try {
            await createOrderAPI({ tableId: selectedTable.id, items: itemsToSend });
            message.success('✅ Đã gửi món xuống bếp!');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Lỗi gửi đơn!');
        }
    };

    const handleCheckout = async () => {
        try {
            await checkoutAPI(selectedTable.id);
            message.success('💰 Thanh toán thành công! Bàn đã trống.');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Lỗi thanh toán');
        }
    };

    // --- GIAO DIỆN TAB GỌI MÓN ---
    const renderMenuTab = () => {
        const filteredProducts = getFilteredProducts();

        return (
            <Row gutter={16} style={{ height: '500px' }}>
                {/* CỘT TRÁI: MENU */}
                <Col span={15} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ marginBottom: 16 }}>
                        <Input
                            placeholder="Nhập tên món ăn..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            size="large"
                        />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: 5 }}>
                        <List
                            grid={{ gutter: 10, column: 3 }}
                            dataSource={filteredProducts}
                            renderItem={item => (
                                <List.Item>
                                    <Card
                                        size="small"
                                        hoverable
                                        title={<span style={{fontSize: 13}}>{item.name}</span>}
                                        // SỬA LỖI bodyStyle TẠI ĐÂY
                                        styles={{ body: { padding: '8px' } }}
                                        onClick={() => addToCart(item)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <b style={{ color: '#1677ff' }}>{item.price.toLocaleString()}</b>
                                            <Button type="primary" shape="circle" size="small" onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}>+</Button>
                                        </div>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>

                {/* CỘT PHẢI: GIỎ HÀNG */}
                <Col span={9} style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: 10 }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Đang chọn ({cart.reduce((sum, i) => sum + i.quantity, 0)})</h4>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={cart}
                            renderItem={item => (
                                <List.Item actions={[
                                    <Button size="small" danger type="text" onClick={() => {
                                        setCart(cart.filter(c => c.productId !== item.productId));
                                    }}>X</Button>
                                ]}>
                                    <List.Item.Meta
                                        title={<span style={{fontSize: 13}}>{item.name}</span>}
                                        description={
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <span>{item.price.toLocaleString()}</span>
                                                <span style={{ fontWeight: 'bold', color: 'black' }}>x{item.quantity}</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontWeight: 'bold', fontSize: 16 }}>
                            <span>Tổng tạm:</span>
                            <span style={{ color: '#faad14' }}>
                                {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} đ
                            </span>
                        </div>
                        <Button type="primary" block size="large" onClick={handleSubmitOrder} icon={<FilterOutlined rotate={180} />}>
                            GỬI BẾP
                        </Button>
                    </div>
                </Col>
            </Row>
        );
    };

    const renderBillTab = () => {
        if (!currentOrder) return <p style={{textAlign: 'center', marginTop: 20}}>Chưa có đơn hàng nào.</p>;

        const columns = [
            { title: 'Món', dataIndex: ['product', 'name'], key: 'name' },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 50 },
            { title: 'Thành tiền', key: 'total', render: (_, r) => (r.priceAtPurchase * r.quantity).toLocaleString() },
            { title: 'TT', dataIndex: 'status', key: 'status', width: 80,
              render: s => <Tag color={s === 'SERVED' ? 'green' : 'orange'}>{s}</Tag>
            },
        ];

        return (
            <div>
                <Table
                    dataSource={currentOrder.orderItems || []}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    scroll={{ y: 350 }}
                    size="small"
                />
                <div style={{ marginTop: 15, textAlign: 'right' }}>
                    <h3 style={{color: 'red'}}>Tổng cộng: {currentOrder.totalAmount?.toLocaleString()} VNĐ</h3>
                    <Popconfirm
                        title="Thanh toán & Trả bàn"
                        description="Xác nhận khách đã trả tiền?"
                        onConfirm={handleCheckout}
                        okText="Đúng" cancelText="Huỷ"
                    >
                        <Button type="primary" danger size="large" style={{marginTop: 10}}>THANH TOÁN XONG</Button>
                    </Popconfirm>
                </div>
            </div>
        );
    };

    const items = [
        { key: '1', label: '📖 Gọi Món', children: renderMenuTab() },
        {
          key: '2',
          label: '🧾 Hoá Đơn',
          children: renderBillTab(),
          disabled: selectedTable?.status === 'EMPTY'
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>🍽️ Sơ Đồ Nhà Hàng</h2>
            <Row gutter={[16, 16]}>
                {tables.map(table => (
                    <Col span={6} key={table.id}>
                        <Card
                            hoverable
                            onClick={() => handleTableClick(table)}
                            style={{
                                textAlign: 'center',
                                backgroundColor: table.status === 'OCCUPIED' ? '#fff1f0' : '#f6ffed',
                                borderColor: table.status === 'OCCUPIED' ? '#ff4d4f' : '#b7eb8f'
                            }}
                            styles={{ body: { padding: '15px' } }}
                        >
                            <h3 style={{ margin: 0 }}>{table.name}</h3>
                            <Tag color={table.status === 'OCCUPIED' ? 'red' : 'green'} style={{marginTop: 5}}>
                                {table.status === 'OCCUPIED' ? 'Có khách' : 'Trống'}
                            </Tag>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={selectedTable ? `Bàn ${selectedTable.name}` : ''}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
                // SỬA LỖI MODAL TẠI ĐÂY (dùng destroyOnClose thông thường, nếu vẫn lỗi thì kệ nó vì không ảnh hưởng chức năng)
                destroyOnClose={true}
                style={{ top: 20 }}
            >
                <Tabs defaultActiveKey="1" items={items} />
            </Modal>
        </div>
    );
};

export default TablePage;