import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Avatar, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, FileImageOutlined } from '@ant-design/icons';
import { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI } from '../services/api';

const AdminProductPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    // 1. Load dữ liệu
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProductsAPI();
            // Sắp xếp ID mới nhất lên đầu
            setProducts(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            message.error('Không thể tải danh sách món!');
        } finally {
            setLoading(false);
        }
    };

    // 2. Mở Modal
    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            // Nếu là sửa -> Fill dữ liệu vào form
            form.setFieldsValue(product);
        } else {
            // Nếu là thêm mới -> Reset form, đặt giá trị mặc định
            form.resetFields();
            form.setFieldsValue({ kitchenStation: 'BAR', categoryId: 1 }); // Mặc định ID=1 (Cà Phê)
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý Lưu (Thêm/Sửa)
    const handleSave = async (values) => {
        try {
            if (editingProduct) {
                await updateProductAPI(editingProduct.id, values);
                message.success('Cập nhật món thành công! 🎉');
            } else {
                await createProductAPI(values);
                message.success('Thêm món mới thành công! 🎉');
            }
            setIsModalOpen(false);
            fetchProducts(); // Load lại bảng
        } catch (error) {
            // Hiển thị lỗi chi tiết từ Backend nếu có
            message.error('Lỗi: ' + (error.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    // 4. Xử lý Xóa
    const handleDelete = async (id) => {
        try {
            await deleteProductAPI(id);
            message.success('Đã xóa món ăn!');
            fetchProducts();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        {
            title: 'Hình ảnh', dataIndex: 'imageUrl', align: 'center',
            render: (url) => <Avatar shape="square" size={50} src={url} icon={<FileImageOutlined />} />
        },
        {
            title: 'Tên món', dataIndex: 'name',
            render: (text) => <b style={{ fontSize: '15px' }}>{text}</b>
        },
        {
            title: 'Giá bán', dataIndex: 'price',
            render: (price) => <span style={{ color: '#389e0d', fontWeight: 'bold' }}>{price.toLocaleString()} ₫</span>
        },
        {
            title: 'Khu vực', dataIndex: 'kitchenStation', align: 'center',
            render: (station) => (
                <Tag color={station === 'KITCHEN' ? 'orange' : 'purple'}>
                    {station === 'KITCHEN' ? 'BẾP NẤU' : 'QUẦY BAR'}
                </Tag>
            )
        },
        {
            title: 'Thao tác', align: 'center',
            render: (_, record) => (
                <>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleOpenModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa món này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa ngay"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa món">
                            <Button type="text" icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} />
                        </Tooltip>
                    </Popconfirm>
                </>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>🛠️ Quản Trị Thực Đơn</h2>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Món Mới
                </Button>
            </div>

            <Table
                dataSource={products}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{ pageSize: 6 }}
            />

            {/* MODAL FORM */}
            <Modal
                title={editingProduct ? "✏️ Chỉnh Sửa Món Ăn" : "✨ Thêm Món Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu Dữ Liệu"
                cancelText="Hủy Bỏ"
            >
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên món ăn"
                        rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}
                    >
                        <Input placeholder="Ví dụ: Cà phê trứng" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="price"
                            label="Giá tiền (VNĐ)"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: 'Nhập giá tiền!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>

                        <Form.Item
                            name="kitchenStation"
                            label="Khu vực chế biến"
                            style={{ flex: 1 }}
                            initialValue="BAR"
                        >
                            <Select>
                                <Select.Option value="BAR">🍹 Quầy Bar</Select.Option>
                                <Select.Option value="KITCHEN">👨‍🍳 Bếp Nấu</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="imageUrl"
                        label="Link hình ảnh (URL)"
                        rules={[{ required: true, message: 'Vui lòng nhập link ảnh!' }]}
                    >
                        <Input.TextArea rows={2} placeholder="https://..." />
                    </Form.Item>

                    {/* Tạm thời nhập ID danh mục thủ công (1, 2, 3...) */}
                    <Form.Item name="categoryId" label="Mã Danh Mục (ID)" initialValue={1}>
                         <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProductPage;