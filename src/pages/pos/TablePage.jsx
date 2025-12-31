import React, { useEffect, useState, useContext } from 'react';
import { Row, Col, message, Modal, Tabs, Input, List, Table, Tag, Button, Space, Popconfirm } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// Import Service & Context
import { getTablesAPI, createOrderAPI, getCurrentOrderAPI, payItemsAPI } from '../../services/orderService';
import { getProductsAPI } from '../../services/productService';
import { CartContext } from '../../context/CartContext';

// Import Components nhỏ
import TableCard from '../../components/specific/TableCard';
import ProductItem from '../../components/specific/ProductItem';
import BillReceipt from '../../components/specific/BillReceipt';

const TablePage = () => {
    const [tables, setTables] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [currentOrder, setCurrentOrder] = useState(null);

    // [MỚI] State lưu danh sách ID các món được tick chọn để thanh toán
    const [selectedBillItems, setSelectedBillItems] = useState([]);

    // Lấy state từ CartContext
    const { cart, addToCart, removeFromCart, clearCart, totalAmount } = useContext(CartContext);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tablesData, productsData] = await Promise.all([getTablesAPI(), getProductsAPI()]);
            setTables(tablesData);
            setProducts(productsData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    // Khi bấm vào bàn
    const handleTableClick = async (table) => {
        setSelectedTable(table);
        clearCart(); // Reset giỏ hàng gọi món
        setCurrentOrder(null);
        setSearchText('');
        setSelectedBillItems([]); // Reset danh sách chọn thanh toán

        if (table.status === 'OCCUPIED') {
            try {
                const orderData = await getCurrentOrderAPI(table.id);
                if (orderData) setCurrentOrder(orderData);
            } catch (error) {
                console.log("Bàn trống hoặc chưa có đơn active");
            }
        }
        setIsModalOpen(true);
    };

    // Gửi đơn xuống bếp
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

    // [MỚI] Xử lý thanh toán (Từng món hoặc Tất cả)
    const handlePayment = async (payAll = false) => {
        if (!currentOrder) return;

        let itemsToPayIds = [];

        if (payAll) {
            // Nếu chọn "Thanh toán hết": Lấy tất cả món chưa trả tiền
            itemsToPayIds = currentOrder.orderItems
                .filter(item => item.status !== 'PAID')
                .map(item => item.id);
        } else {
            // Nếu chọn "Thanh toán từng món": Lấy từ state checkbox
            itemsToPayIds = selectedBillItems;
        }

        if (itemsToPayIds.length === 0) {
            return message.warning('Vui lòng chọn món hoặc món đã được thanh toán hết!');
        }

        try {
            await payItemsAPI(currentOrder.id, itemsToPayIds);
            message.success('Thanh toán thành công! 💰');
            setIsModalOpen(false);
            fetchData(); // Load lại trạng thái bàn
        } catch (error) {
            message.error('Lỗi thanh toán: ' + error.message);
        }
    };

    // Tab 1: Gọi món (Menu bên trái, Bill tạm bên phải)
    const renderMenuTab = () => (
        <Row gutter={16} style={{ height: '500px' }}>
            <Col span={15} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Input
                    placeholder="Tìm món ăn..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <List
                        grid={{ gutter: 10, column: 3 }}
                        dataSource={products.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))}
                        renderItem={item => (
                            <List.Item>
                                <ProductItem product={item} onAdd={addToCart} />
                            </List.Item>
                        )}
                    />
                </div>
            </Col>
            <Col span={9}>
                <BillReceipt
                    cart={cart}
                    onRemove={removeFromCart}
                    totalAmount={totalAmount}
                    onSubmit={handleSubmitOrder}
                />
            </Col>
        </Row>
    );

    // Tab 2: Hóa đơn & Thanh toán (Có checkbox chọn món)
    const renderBillTab = () => {
        if (!currentOrder) return <p style={{ textAlign: 'center', marginTop: 20 }}>Chưa có đơn hàng nào.</p>;

        const columns = [
            { title: 'Tên món', dataIndex: ['product', 'name'], key: 'name' },
            {
                title: 'Đơn giá',
                dataIndex: 'priceAtPurchase',
                key: 'price',
                render: (price) => price.toLocaleString()
            },
            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 50 },
            {
                title: 'Thành tiền',
                key: 'total',
                render: (_, r) => <b>{(r.priceAtPurchase * r.quantity).toLocaleString()}</b>
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: s => (
                    <Tag color={s === 'PAID' ? 'green' : (s === 'SERVED' ? 'blue' : 'orange')}>
                        {s === 'PAID' ? 'ĐÃ TRẢ' : s}
                    </Tag>
                )
            },
        ];

        // Cấu hình checkbox chọn dòng
        const rowSelection = {
            selectedRowKeys: selectedBillItems,
            onChange: (selectedRowKeys) => {
                setSelectedBillItems(selectedRowKeys);
            },
            getCheckboxProps: (record) => ({
                disabled: record.status === 'PAID', // Không cho chọn món đã trả tiền
                name: record.product.name,
            }),
        };

        // Tính tổng tiền
        const totalOrder = currentOrder.orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

        // Tính tổng tiền ĐANG CHỌN checkbox
        const selectedTotal = currentOrder.orderItems
            .filter(item => selectedBillItems.includes(item.id))
            .reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

        return (
            <div>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        ...rowSelection,
                    }}
                    dataSource={currentOrder.orderItems || []}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    scroll={{ y: 350 }}
                    size="small"
                />

                <div style={{ marginTop: 20, padding: 15, background: '#f9f9f9', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span>Tổng giá trị đơn:</span>
                        <b>{totalOrder.toLocaleString()} VNĐ</b>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 16, color: '#1890ff' }}>
                        <span>Đang chọn thanh toán:</span>
                        <span style={{ fontWeight: 'bold' }}>{selectedTotal.toLocaleString()} VNĐ</span>
                    </div>

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button
                            type="default"
                            onClick={() => handlePayment(false)}
                            disabled={selectedBillItems.length === 0}
                        >
                            Thanh toán {selectedBillItems.length} món chọn
                        </Button>

                        <Popconfirm
                            title="Xác nhận thanh toán toàn bộ?"
                            description="Bàn sẽ được đóng sau khi thanh toán hết."
                            onConfirm={() => handlePayment(true)}
                            okText="Đồng ý" cancelText="Hủy"
                        >
                            <Button type="primary" danger>
                                THANH TOÁN TẤT CẢ
                            </Button>
                        </Popconfirm>
                    </Space>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>🍽️ Sơ Đồ Nhà Hàng</h2>
            <Row gutter={[16, 16]}>
                {tables.map(table => (
                    <Col span={6} key={table.id}>
                        <TableCard table={table} onClick={handleTableClick} />
                    </Col>
                ))}
            </Row>

            <Modal
                title={selectedTable ? `Bàn ${selectedTable.name}` : ''}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
                destroyOnClose={true}
                style={{ top: 20 }}
            >
                <Tabs items={[
                    { key: '1', label: '📖 Gọi Món', children: renderMenuTab() },
                    {
                        key: '2',
                        label: '🧾 Hóa Đơn & Thanh Toán',
                        children: renderBillTab(),
                        disabled: selectedTable?.status === 'EMPTY'
                    }
                ]} />
            </Modal>
        </div>
    );
};

export default TablePage;