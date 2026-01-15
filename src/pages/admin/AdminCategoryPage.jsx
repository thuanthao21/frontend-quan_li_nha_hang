import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, FolderOpenOutlined } from '@ant-design/icons';
// Import đúng service đã tách
import { getCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from '../../services/categoryService';

const AdminCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategoriesAPI();
            // Sắp xếp ID giảm dần
            setCategories(data.sort((a, b) => b.id - a.id));
        } catch (error) {
            message.error('Lỗi tải danh mục!');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue(category);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingCategory) {
                await updateCategoryAPI(editingCategory.id, values);
                message.success('Cập nhật thành công!');
            } else {
                await createCategoryAPI(values);
                message.success('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            message.error('Lỗi: ' + (error.response?.data?.message || 'Thao tác thất bại'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategoryAPI(id);
            message.success('Đã xóa danh mục!');
            fetchCategories();
        } catch (error) {
            message.error('Không thể xóa (Có thể danh mục đang chứa món ăn)!');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
        {
            title: 'Tên Danh Mục',
            dataIndex: 'name',
            render: (text) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    <FolderOpenOutlined style={{ marginRight: 8 }} />
                    {text}
                </span>
            )
        },
        {
            title: 'Hành động',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm
                        title="Xóa danh mục này?"
                        description="Lưu ý: Không thể xóa nếu đang có món ăn thuộc danh mục này."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>📂 Quản Lý Danh Mục</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Tạo Danh Mục
                </Button>
            </div>

            <Card>
                <Table
                    dataSource={categories}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={editingCategory ? "✏️ Chỉnh Sửa Danh Mục" : "✨ Tạo Danh Mục Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Trà Sữa, Cà Phê..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCategoryPage;