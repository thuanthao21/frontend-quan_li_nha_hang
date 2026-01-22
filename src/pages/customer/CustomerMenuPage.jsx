import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Badge, message, FloatButton, Drawer, List, Spin, Result, Row, Col, Typography, Empty, Tag, Modal, Input, Divider, Tabs } from 'antd'; // 1. Import Tabs
import { ShoppingCartOutlined, MinusOutlined, PlusOutlined, ShopOutlined, CommentOutlined, EditOutlined } from '@ant-design/icons';
import { getProductsAPI } from '../../services/productService';
import { createOrderAPI } from '../../services/orderService';
import { getCategoriesAPI } from '../../services/categoryService'; // 2. Import API danh mục

const { Title, Text } = Typography;
const { TextArea } = Input;

const CustomerMenuPage = () => {
    const { tableId } = useParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // State lưu danh mục
    const [selectedCategory, setSelectedCategory] = useState('ALL'); // State lưu danh mục đang chọn

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // State Modal
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 3. Gọi song song cả món ăn và danh mục
            const [productsData, categoriesData] = await Promise.all([
                getProductsAPI(),
                getCategoriesAPI()
            ]);

            setProducts(productsData.filter(p => p.isAvailable !== false));
            setCategories(categoriesData);
        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // 4. Logic Lọc sản phẩm
    const filteredProducts = selectedCategory === 'ALL'
        ? products
        : products.filter(p => p.categoryId === selectedCategory);

    // --- CÁC HÀM XỬ LÝ GIỎ HÀNG (GIỮ NGUYÊN) ---
    const handleOpenDetail = (product) => {
        setSelectedProduct(product);
        setNote('');
        setQuantity(1);
        setDetailVisible(true);
    };

    const handleAddToCartFromModal = () => {
        if (!selectedProduct) return;
        const existIndex = cart.findIndex(x => x.id === selectedProduct.id);
        let newCart = [...cart];
        if (existIndex !== -1) {
            newCart[existIndex].qty += quantity;
            newCart[existIndex].note = note;
        } else {
            newCart.push({ ...selectedProduct, qty: quantity, note: note });
        }
        setCart(newCart);
        message.success({ content: `Đã thêm ${selectedProduct.name}`, key: 'cart_msg', duration: 1 });
        setDetailVisible(false);
    };

    const updateQtyInCart = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) return { ...item, qty: Math.max(0, item.qty + delta) };
            return item;
        }).filter(x => x.qty > 0));
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        const itemsToSend = cart.map(item => ({
            productId: item.id,
            quantity: item.qty,
            note: item.note || ""
        }));
        try {
            await createOrderAPI({ tableId: parseInt(tableId), items: itemsToSend });
            setOrderSuccess(true);
            setCart([]);
            setCartVisible(false);
        } catch (error) {
            message.error("Lỗi đặt món. Vui lòng gọi nhân viên!");
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (orderSuccess) {
        return (
            <Result
                status="success"
                title="Đặt món thành công!"
                subTitle="Nhà bếp đã nhận đơn. Chúc quý khách ngon miệng!"
                extra={[<Button type="primary" key="back" size="large" onClick={() => setOrderSuccess(false)}>Gọi thêm món</Button>]}
                style={{ padding: '50px 20px' }}
            />
        );
    }

    // --- STYLES ---
    const cardStyle = { borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: 'none', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' };
    const imageContainerStyle = { height: '150px', width: '100%', overflow: 'hidden', position: 'relative' };
    const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.3s' };

    // 5. Chuẩn bị dữ liệu cho Tabs
    const tabItems = [
        { key: 'ALL', label: 'Tất cả' },
        ...categories.map(c => ({ key: c.id, label: c.name }))
    ];

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 80 }}>
            {/* HEADER */}
            <div style={{ background: '#fff', padding: '10px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#faad14', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ShopOutlined /> DINEFLOW MENU
                </Title>
                <Tag color="blue" style={{ marginTop: 5 }}>Bàn {tableId}</Tag>
            </div>

            {/* THANH LỌC DANH MỤC (STICKY) */}
            <div style={{ position: 'sticky', top: 0, zIndex: 99, background: '#f0f2f5', padding: '0 10px' }}>
                <Tabs
                    activeKey={String(selectedCategory)} // Chuyển về string để khớp với key
                    onChange={(key) => setSelectedCategory(key === 'ALL' ? 'ALL' : parseInt(key))}
                    items={tabItems}
                    style={{ background: '#f0f2f5' }}
                    tabBarStyle={{ margin: 0, borderBottom: 'none' }} // Xóa gạch chân mặc định
                    type="card" // Dạng thẻ nhìn cho nổi
                    size="small"
                />
            </div>

            {/* BODY */}
            <div style={{ padding: '10px 15px' }}>
                {loading ? (
                    <Spin size="large" style={{ display:'block', margin:'50px auto' }} tip="Đang tải thực đơn..." />
                ) : filteredProducts.length === 0 ? (
                    <Empty description="Không có món nào trong mục này" style={{ marginTop: 50 }} />
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredProducts.map(p => (
                            <Col xs={24} sm={12} md={8} key={p.id}>
                                <Card
                                    hoverable
                                    style={cardStyle}
                                    bodyStyle={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                                    onClick={() => handleOpenDetail(p)}
                                    cover={
                                        <div style={imageContainerStyle}>
                                            <img alt={p.name} src={p.imageUrl || "https://via.placeholder.com/300x200"} style={imageStyle} />
                                        </div>
                                    }
                                >
                                    <div style={{ marginBottom: 10 }}>
                                        <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 15 }}>{p.name}</Title>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <Text style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>{p.price.toLocaleString()} ₫</Text>
                                        <Button type="primary" shape="circle" icon={<PlusOutlined />} size="middle" onClick={(e) => { e.stopPropagation(); handleOpenDetail(p); }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* MODAL CHI TIẾT */}
            <Modal title={null} footer={null} open={detailVisible} onCancel={() => setDetailVisible(false)} centered width={400} destroyOnClose>
                {selectedProduct && (
                    <div>
                        <div style={{ margin: '-24px -24px 20px -24px', height: 200, overflow: 'hidden' }}>
                            <img src={selectedProduct.imageUrl || "https://via.placeholder.com/300"} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <Title level={4} style={{ marginBottom: 5 }}>{selectedProduct.name}</Title>
                        <Text style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>{selectedProduct.price.toLocaleString()} ₫</Text>
                        <Divider style={{ margin: '15px 0' }} />
                        <div style={{ marginBottom: 20 }}>
                            <Text strong>Số lượng:</Text>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, gap: 15 }}>
                                <Button icon={<MinusOutlined />} disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)} />
                                <span style={{ fontSize: 20, fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>{quantity}</span>
                                <Button icon={<PlusOutlined />} onClick={() => setQuantity(q => q + 1)} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <Text strong><CommentOutlined /> Ghi chú:</Text>
                            <TextArea rows={3} placeholder="Ví dụ: Ít đường..." style={{ marginTop: 10 }} value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>
                        <Button type="primary" block size="large" style={{ height: 50, fontSize: 16, fontWeight: 'bold' }} onClick={handleAddToCartFromModal}>
                            THÊM VÀO GIỎ - {(selectedProduct.price * quantity).toLocaleString()} ₫
                        </Button>
                    </div>
                )}
            </Modal>

            {/* GIỎ HÀNG FLOATING */}
            {totalQty > 0 && (
                <FloatButton.Group shape="circle" style={{ right: 24, bottom: 30 }}>
                    <Badge count={totalQty} offset={[-5, 5]} color="#ff4d4f">
                        <FloatButton icon={<ShoppingCartOutlined style={{ fontSize: 24 }} />} type="primary" style={{ width: 60, height: 60, boxShadow: '0 4px 10px rgba(255, 77, 79, 0.4)' }} onClick={() => setCartVisible(true)} />
                    </Badge>
                </FloatButton.Group>
            )}

            {/* DRAWER GIỎ HÀNG */}
            <Drawer
                title={<div style={{textAlign: 'center'}}>Giỏ hàng ({totalQty} món)</div>}
                placement="bottom"
                onClose={() => setCartVisible(false)}
                open={cartVisible}
                height="80%"
                styles={{ body: { paddingBottom: 80 } }}
                extra={<Button danger type="text" onClick={() => setCart([])}>Xóa hết</Button>}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={cart}
                    renderItem={item => (
                        <List.Item style={{ padding: '15px 0' }}>
                            <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                                <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 15 }} />
                                <div style={{ flex: 1, marginRight: 10 }}>
                                    <h4 style={{ margin: 0, fontSize: 16 }}>{item.name}</h4>
                                    <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{item.price.toLocaleString()} ₫</span>
                                    {item.note && <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '4px 8px', borderRadius: 4, marginTop: 5, fontSize: 12, color: '#d48806' }}><EditOutlined /> Note: {item.note}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f5f5f5', borderRadius: 20, padding: '2px' }}>
                                    <Button shape="circle" size="small" icon={<MinusOutlined />} onClick={() => updateQtyInCart(item.id, -1)} />
                                    <span style={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                                    <Button shape="circle" size="small" type="primary" icon={<PlusOutlined />} onClick={() => updateQtyInCart(item.id, 1)} />
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: '#fff', padding: '15px 20px', borderTop: '1px solid #f0f0f0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                        <span>Tổng cộng:</span>
                        <span style={{ color: '#ff4d4f' }}>{totalAmount.toLocaleString()} ₫</span>
                    </div>
                    <Button type="primary" block size="large" style={{ height: 50, fontSize: 18, fontWeight: 'bold', borderRadius: 25 }} onClick={handlePlaceOrder}>
                        XÁC NHẬN ĐẶT MÓN
                    </Button>
                </div>
            </Drawer>
        </div>
    );
};

export default CustomerMenuPage;