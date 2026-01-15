import React, { useEffect, useState, useMemo } from 'react';
import { Card, Tag, message, Row, Col, Typography, Tabs, Input, Empty, Spin } from 'antd';
import { SearchOutlined, AppstoreOutlined, CoffeeOutlined } from '@ant-design/icons';
import { getProductsAPI } from '../services/productService.js';

const { Title, Text } = Typography;
const { Meta } = Card;

const MenuPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProductsAPI();
            setProducts(data);
        } catch (error) {
            message.error('Không thể tải danh sách món ăn!');
        } finally {
            setLoading(false);
        }
    };

    // --- XỬ LÝ DỮ LIỆU ---

    // 1. Lọc theo từ khóa tìm kiếm trước
    const filteredBySearch = products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // 2. Phân tách cha: KITCHEN (Bếp) và BAR (Quầy pha chế)
    const kitchenItems = filteredBySearch.filter(p => p.kitchenStation === 'KITCHEN');
    const barItems = filteredBySearch.filter(p => p.kitchenStation === 'BAR');

    // 3. Hàm nhóm các món theo Danh mục (Category) - Cấp con
    const groupByCategory = (items) => {
        return items.reduce((groups, item) => {
            const category = item.categoryName || 'Khác';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    };

    // --- COMPONENT CON: Render danh sách nhóm ---
    const RenderSection = ({ items }) => {
        if (items.length === 0) return <Empty description="Không tìm thấy món nào" />;

        const groupedItems = groupByCategory(items); // Kết quả: { "Khai vị": [...], "Món chính": [...] }

        return (
            <div>
                {Object.keys(groupedItems).map((categoryName) => (
                    <div key={categoryName} style={{ marginBottom: 30 }}>
                        {/* Tiêu đề Danh mục con */}
                        <div style={{
                            borderLeft: '5px solid #1890ff',
                            paddingLeft: 10,
                            marginBottom: 15,
                            marginTop: 10
                        }}>
                            <Title level={4} style={{ margin: 0 }}>{categoryName}</Title>
                        </div>

                        {/* Grid các món ăn trong danh mục đó */}
                        <Row gutter={[16, 16]}>
                            {groupedItems[categoryName].map((product) => (
                                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product.id}>
                                    <Card
                                        hoverable
                                        style={{ height: '100%', borderRadius: 10, overflow: 'hidden' }}
                                        cover={
                                            <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                                                <img
                                                    alt={product.name}
                                                    src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {/* Giá tiền nổi bật trên ảnh */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 10,
                                                    right: 10,
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: '#fff',
                                                    padding: '5px 10px',
                                                    borderRadius: 20,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {product.price.toLocaleString()} ₫
                                                </div>
                                            </div>
                                        }
                                    >
                                        <Meta
                                            title={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ whiteSpace: 'normal' }}>{product.name}</span>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <Tag color="cyan">{categoryName}</Tag>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
            </div>
        );
    };

    // --- ITEMS CHO TABS ---
    const tabItems = [
        {
            key: '1',
            label: (<span><AppstoreOutlined /> Đồ Ăn (Bếp)</span>),
            children: <RenderSection items={kitchenItems} />,
        },
        {
            key: '2',
            label: (<span><CoffeeOutlined /> Đồ Uống (Bar)</span>),
            children: <RenderSection items={barItems} />,
        },
    ];

    return (
        <div style={{ padding: '0 10px' }}>
            {/* HEADER & TÌM KIẾM */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Title level={2} style={{ margin: 0 }}>📜 Thực Đơn Điện Tử</Title>
                <Input
                    placeholder="Tìm tên món ăn..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* NỘI DUNG CHÍNH */}
            <Spin spinning={loading} tip="Đang tải thực đơn...">
                <Card style={{ borderRadius: 10, minHeight: 500 }}>
                    <Tabs defaultActiveKey="1" items={tabItems} size="large" />
                </Card>
            </Spin>
        </div>
    );
};

export default MenuPage;