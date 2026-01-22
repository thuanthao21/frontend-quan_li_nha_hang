import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Avatar, Tag, Row, Col, Space, Card, Switch, Tooltip } from 'antd'; // 1. Thêm Switch
import { DeleteOutlined, EditOutlined, PlusOutlined, FileImageOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';

// 2. Import thêm API toggleProductStatusAPI
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI, toggleProductStatusAPI } from '../../services/productService';
import { getCategoriesAPI } from '../../services/categoryService';

const { Option } = Select;

const AdminProductPage = () => {
    // Dữ liệu gốc từ API
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // State cho UI
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // State cho Bộ lọc
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const [form] = Form.useForm();

    // 1. Load dữ liệu
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProductsAPI(),
                getCategoriesAPI()
            ]);

            setProducts(productsData.sort((a, b) => b.id - a.id));
            setCategories(categoriesData);
        } catch (error) {
            message.error('Lỗi tải dữ liệu!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // [MỚI] Hàm xử lý bật/tắt Hết món
    const handleToggleStatus = async (productId, currentStatus) => {
        try {
            await toggleProductStatusAPI(productId);
            // Cập nhật UI ngay lập tức (Optimistic update)
            setProducts(products.map(p =>
                p.id === productId ? { ...p, isAvailable: !currentStatus } : p
            ));
            message.success(currentStatus ? "Đã tắt món (Hết hàng)" : "Đã bật món (Còn hàng)");
        } catch (error) {
            message.error("Lỗi cập nhật trạng thái");
        }
    };

    // 2. Logic lọc dữ liệu
    const filteredProducts = products.filter(item => {
        const matchName = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = filterCategory === 'ALL' || item.categoryId === filterCategory;
        return matchName && matchCategory;
    });

    // 3. Helper lấy tên danh mục
    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Khác';
    };

    // 4. Các hàm CRUD
    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            form.setFieldsValue(product);
        } else {
            form.resetFields();
            const defaultCat = categories.length > 0 ? categories[0].id : null;
            form.setFieldsValue({ kitchenStation: 'BAR', categoryId: defaultCat, isAvailable: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingProduct) {
                await updateProductAPI(editingProduct.id, values);
                message.success('Cập nhật thành công!');
            } else {
                await createProductAPI(values);
                message.success('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Lỗi: ' + (error.response?.data?.message || 'Thất bại'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProductAPI(id);
            message.success('Đã xóa món ăn!');
            fetchData();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        {
            title: 'Hình ảnh', dataIndex: 'imageUrl', align: 'center', width: 80,
            render: (url) => <Avatar shape="square" size={50} src={url} icon={<FileImageOutlined />} />
        },
        {
            title: 'Tên món', dataIndex: 'name',
            render: (text, record) => (
                <div>
                    <b style={{ fontSize: '15px' }}>{text}</b>
                    <br />
                    <span style={{ fontSize: '12px', color: '#888' }}>
                        {getCategoryName(record.categoryId)}
                    </span>
                </div>
            )
        },
        {
            title: 'Danh mục', dataIndex: 'categoryId', width: 150,
            render: (id) => <Tag color="cyan">{getCategoryName(id)}</Tag>
        },
        {
            title: 'Giá bán', dataIndex: 'price', width: 120,
            render: (price) => <span style={{ color: '#389e0d', fontWeight: 'bold' }}>{price.toLocaleString()} ₫</span>
        },
        {
            title: 'Khu vực', dataIndex: 'kitchenStation', align: 'center', width: 100,
            render: (station) => (
                <Tag color={station === 'KITCHEN' ? 'orange' : 'purple'}>
                    {station === 'KITCHEN' ? 'BẾP' : 'BAR'}
                </Tag>
            )
        },
        // [MỚI] CỘT TRẠNG THÁI
        {
            title: 'Trạng thái',
            dataIndex: 'isAvailable',
            align: 'center',
            width: 130,
            render: (available, record) => (
                <Tooltip title="Bấm để đổi trạng thái">
                    <Switch
                        checkedChildren="Còn"
                        unCheckedChildren="Hết"
                        checked={available !== false} // Mặc định true nếu null
                        onChange={() => handleToggleStatus(record.id, available)}
                        style={{ backgroundColor: available !== false ? '#52c41a' : '#ff4d4f' }}
                    />
                </Tooltip>
            )
        },
        {
            title: 'Hành động', align: 'center', width: 100,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Xóa món này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>🛠️ Quản Lý Món Ăn</h2>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Món Mới
                </Button>
            </div>

            <Card style={{ marginBottom: 20 }} size="small">
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Input
                            placeholder="🔍 Tìm kiếm tên món..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            defaultValue="ALL"
                            style={{ width: '100%' }}
                            onChange={val => setFilterCategory(val)}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="ALL">📂 Tất cả danh mục</Option>
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={10} style={{ textAlign: 'right' }}>
                        <span style={{ color: '#888' }}>Hiển thị {filteredProducts.length} món</span>
                    </Col>
                </Row>
            </Card>

            <Table
                dataSource={filteredProducts}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{ pageSize: 6, showSizeChanger: false }}
            />

            <Modal
                title={editingProduct ? "✏️ Chỉnh Sửa Món Ăn" : "✨ Thêm Món Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu Dữ Liệu"
                cancelText="Hủy"
            >
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item name="name" label="Tên món ăn" rules={[{ required: true, message: 'Nhập tên món!' }]}>
                        <Input placeholder="Ví dụ: Cà phê sữa đá" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Nhập giá tiền!' }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0} step={1000}
                                    formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={val => val.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="kitchenStation" label="Nơi chế biến">
                                <Select>
                                    <Option value="BAR">🍹 Quầy Bar</Option>
                                    <Option value="KITCHEN">👨‍🍳 Bếp Nấu</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        {/* Cho phép đặt trạng thái ngay khi tạo */}
                        <Col span={12}>
                             <Form.Item name="isAvailable" label="Trạng thái ban đầu" valuePropName="checked" initialValue={true}>
                                <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="imageUrl" label="Hình ảnh (URL)" rules={[{ required: true }]}>
                        <Input.TextArea rows={2} placeholder="https://..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProductPage;