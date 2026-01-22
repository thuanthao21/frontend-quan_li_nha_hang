import React, { useEffect, useState, useContext, useRef } from 'react';
import { Row, Col, message, Modal, Tabs, Input, List, Table, Tag, Button, Space, Popconfirm, Radio } from 'antd';
import { SearchOutlined, PrinterOutlined, SwapOutlined, CheckCircleOutlined } from '@ant-design/icons'; // Thêm icon check
import { useReactToPrint } from 'react-to-print';

// Import Service & Context
import { getTablesAPI, createOrderAPI, getCurrentOrderAPI, payItemsAPI, moveTableAPI } from '../../services/orderService';
import { getProductsAPI } from '../../services/productService';
import { CartContext } from '../../context/CartContext';

// Import Component hóa đơn
import { InvoiceTemplate } from '../../components/InvoiceTemplate';

// Import Components nhỏ
import TableCard from '../../components/specific/TableCard';
import ProductItem from '../../components/specific/ProductItem';
import BillReceipt from '../../components/specific/BillReceipt';

const TablePage = () => {
    // --- STATE DỮ LIỆU ---
    const [tables, setTables] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [searchText, setSearchText] = useState('');

    // --- STATE UI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBillItems, setSelectedBillItems] = useState([]);

    // --- STATE CHUYỂN/GỘP BÀN ---
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [availableTables, setAvailableTables] = useState([]);
    const [targetTableId, setTargetTableId] = useState(null);

    // --- CONTEXT & REF ---
    const { cart, addToCart, removeFromCart, updateNote, clearCart, totalAmount } = useContext(CartContext);
    const componentRef = useRef(null);

    // --- CẤU HÌNH IN ---
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Bill-${currentOrder?.id || Date.now()}`,
    });

    // --- LOAD DỮ LIỆU ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tablesData, productsData] = await Promise.all([getTablesAPI(), getProductsAPI()]);
            setTables(tablesData.sort((a, b) => a.id - b.id));
            setProducts(productsData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    // --- XỬ LÝ KHI BẤM VÀO BÀN ---
    const handleTableClick = async (table) => {
        setSelectedTable(table);
        clearCart();
        setCurrentOrder(null);
        setSearchText('');
        setSelectedBillItems([]);

        if (table.status === 'OCCUPIED') {
            try {
                const orderData = await getCurrentOrderAPI(table.id);
                if (orderData) setCurrentOrder(orderData);
            } catch (error) {
                console.log("Không tìm thấy đơn active");
            }
        }
        setIsModalOpen(true);
    };

    // --- GỬI ĐƠN BẾP ---
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
            const updatedOrder = await getCurrentOrderAPI(selectedTable.id);
            setCurrentOrder(updatedOrder);
            clearCart();
            if (selectedTable.status !== 'OCCUPIED') {
                fetchData();
                setSelectedTable({ ...selectedTable, status: 'OCCUPIED' });
            }
        } catch (error) {
            message.error('Lỗi gửi đơn!');
        }
    };

    // --- THANH TOÁN ---
    const handlePayment = async (payAll = false) => {
        if (!currentOrder) return;

        let itemsToPayIds = [];
        if (payAll) {
            itemsToPayIds = currentOrder.orderItems
                .filter(item => item.status !== 'PAID')
                .map(item => item.id);
        } else {
            itemsToPayIds = selectedBillItems;
        }

        if (itemsToPayIds.length === 0) {
            return message.warning('Không có món nào cần thanh toán!');
        }

        try {
            await payItemsAPI(currentOrder.id, itemsToPayIds);
            message.success('Thanh toán thành công! 💰');

            if (payAll) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const updatedOrder = await getCurrentOrderAPI(selectedTable.id);
                setCurrentOrder(updatedOrder);
                setSelectedBillItems([]);
            }
        } catch (error) {
            message.error('Lỗi thanh toán: ' + error.message);
        }
    };

    // --- XỬ LÝ CHUYỂN / GỘP BÀN ---
    const handleOpenMoveModal = () => {
        const others = tables.filter(t => t.id !== selectedTable.id);
        setAvailableTables(others);
        setTargetTableId(null);
        setIsMoveModalOpen(true);
    };

    const handleConfirmMove = async () => {
        if (!targetTableId) return message.warning("Chưa chọn bàn đích!");
        try {
            await moveTableAPI(selectedTable.id, targetTableId);
            message.success("Thao tác thành công!");
            setIsMoveModalOpen(false);
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error(error.response?.data || "Lỗi chuyển bàn");
        }
    };

    // --- UI: TAB GỌI MÓN ---
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
                    updateNote={updateNote}
                    totalAmount={totalAmount}
                    onSubmit={handleSubmitOrder}
                />
            </Col>
        </Row>
    );

    // --- UI: TAB HÓA ĐƠN ---
    const renderBillTab = () => {
        if (!currentOrder) return <p style={{ textAlign: 'center', marginTop: 20 }}>Chưa có đơn hàng nào.</p>;

        const columns = [
            {
                title: 'Tên món', dataIndex: ['product', 'name'], key: 'name',
                render: (text, record) => (
                    <div>
                        <div>{text}</div>
                        {record.note && <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>Note: {record.note}</div>}
                    </div>
                )
            },
            { title: 'ĐG', dataIndex: 'priceAtPurchase', render: p => p.toLocaleString() },
            { title: 'SL', dataIndex: 'quantity', width: 50 },
            { title: 'Thành tiền', render: (_, r) => <b>{(r.priceAtPurchase * r.quantity).toLocaleString()}</b> },
            {
                title: 'TT', dataIndex: 'status', width: 80,
                render: s => <Tag color={s === 'PAID' ? 'green' : 'orange'}>{s === 'PAID' ? 'Đã trả' : s}</Tag>
            },
        ];

        const grandTotal = currentOrder.orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
        const paidAmount = currentOrder.orderItems
            .filter(item => item.status === 'PAID')
            .reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
        const remainingAmount = grandTotal - paidAmount;
        const selectedTotal = currentOrder.orderItems
            .filter(item => selectedBillItems.includes(item.id))
            .reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

        return (
            <div>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedBillItems,
                        onChange: (keys) => setSelectedBillItems(keys),
                        getCheckboxProps: (r) => ({ disabled: r.status === 'PAID' }),
                    }}
                    dataSource={currentOrder.orderItems}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    scroll={{ y: 300 }}
                    size="small"
                />

                <div style={{ marginTop: 15, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                        <span>Tổng đơn hàng:</span><span>{grandTotal.toLocaleString()} đ</span>
                    </div>
                    {paidAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a' }}>
                            <span>Đã thanh toán:</span><span>- {paidAmount.toLocaleString()} đ</span>
                        </div>
                    )}
                    <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold', color: '#f5222d' }}>
                        <span>KHÁCH CẦN TRẢ:</span><span>{remainingAmount.toLocaleString()} đ</span>
                    </div>
                    {selectedBillItems.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1890ff', marginTop: 5 }}>
                            <span>Đang chọn thanh toán:</span><b>{selectedTotal.toLocaleString()} đ</b>
                        </div>
                    )}
                    <div style={{ marginTop: 15, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <Button icon={<SwapOutlined />} onClick={handleOpenMoveModal}>Chuyển/Gộp</Button>
                        <Button icon={<PrinterOutlined />} onClick={handlePrint}>In Bill</Button>
                        {selectedBillItems.length > 0 ? (
                            <Button type="primary" onClick={() => handlePayment(false)}>Trả {selectedBillItems.length} món</Button>
                        ) : (
                            remainingAmount > 0 ? (
                                <Popconfirm title="Thanh toán phần còn lại và trả bàn?" onConfirm={() => handlePayment(true)}>
                                    <Button type="primary" danger>Thanh Toán Hết</Button>
                                </Popconfirm>
                            ) : (<Button type="primary" disabled>Đã thanh toán xong</Button>)
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>🍽️ Quản Lý Bàn & Order</h2>
            <Row gutter={[16, 16]}>
                {tables.map(table => (
                    <Col xs={12} sm={8} md={6} lg={4} key={table.id}>
                        <TableCard table={table} onClick={handleTableClick} />
                    </Col>
                ))}
            </Row>

            <Modal
                title={`Bàn ${selectedTable?.name || ''}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
                destroyOnClose
                style={{ top: 20 }}
            >
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        { key: '1', label: '📖 Gọi Món', children: renderMenuTab() },
                        { key: '2', label: '🧾 Thanh Toán', children: renderBillTab(), disabled: selectedTable?.status === 'EMPTY' }
                    ]}
                />
            </Modal>

            {/* 👇 [ĐÃ SỬA] MODAL CHUYỂN / GỘP BÀN VỚI HIỆU ỨNG CHỌN */}
            <Modal
                title={<span><SwapOutlined /> Chuyển hoặc Gộp bàn</span>}
                open={isMoveModalOpen}
                onCancel={() => setIsMoveModalOpen(false)}
                onOk={handleConfirmMove}
                okText="Xác nhận ngay"
                cancelText="Hủy bỏ"
                width={650}
            >
                <p>Bạn đang chọn bàn: <b>{selectedTable?.name}</b></p>
                <p>Vui lòng chọn bàn đích:</p>
                <div style={{ maxHeight: 400, overflowY: 'auto', padding: 5 }}>
                    <Radio.Group onChange={e => setTargetTableId(e.target.value)} value={targetTableId} style={{ width: '100%' }}>
                        <Row gutter={[12, 12]}>
                            {availableTables.map(t => {
                                // Logic màu sắc
                                const isOccupied = t.status === 'OCCUPIED' || t.status === 'SERVING';
                                const isSelected = targetTableId === t.id;

                                // Màu chủ đạo: Vàng (Gộp) hoặc Xanh (Chuyển)
                                const baseColor = isOccupied ? '#faad14' : '#52c41a';

                                return (
                                    <Col span={8} key={t.id}>
                                        <Radio.Button
                                            value={t.id}
                                            style={{
                                                width: '100%',
                                                textAlign: 'center',
                                                height: '65px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',

                                                // STYLE ĐỘNG DỰA TRÊN SELECTION
                                                backgroundColor: isSelected ? baseColor : 'white',
                                                borderColor: baseColor,
                                                color: isSelected ? 'white' : baseColor,
                                                fontWeight: 'bold',
                                                boxShadow: isSelected ? `0 4px 10px ${baseColor}66` : 'none', // Bóng đổ khi chọn
                                                transform: isSelected ? 'scale(1.05)' : 'scale(1)', // Phóng to nhẹ khi chọn
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ fontSize: 16 }}>
                                                {isSelected && <CheckCircleOutlined style={{ marginRight: 5 }} />}
                                                {t.name}
                                            </div>
                                            <div style={{ fontSize: 11, opacity: isSelected ? 1 : 0.8 }}>
                                                {isOccupied ? 'SẼ GỘP VÀO' : 'SẼ CHUYỂN ĐẾN'}
                                            </div>
                                        </Radio.Button>
                                    </Col>
                                )
                            })}
                        </Row>
                    </Radio.Group>
                </div>
                <div style={{ marginTop: 20, fontSize: 12, color: '#888', fontStyle: 'italic', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                    * Màu xanh: Bàn trống (Chuyển bàn). <br/>
                    * Màu cam: Bàn có khách (Gộp đơn và cộng dồn tiền).
                </div>
            </Modal>

            <div style={{ display: 'none' }}>
                <InvoiceTemplate ref={componentRef} order={currentOrder} />
            </div>
        </div>
    );
};

export default TablePage;