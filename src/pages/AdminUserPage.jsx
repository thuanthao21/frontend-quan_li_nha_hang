import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { DeleteOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import { getUsersAPI, createUserAPI, deleteUserAPI } from '../services/api';

const AdminUserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsersAPI();
            setUsers(data);
        } catch (error) {
            message.error('Lỗi tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (values) => {
        try {
            await createUserAPI(values);
            message.success('Tạo nhân viên thành công! Mật khẩu mặc định: 123456');
            setIsModalOpen(false);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data || 'Tạo thất bại');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUserAPI(id);
            message.success('Đã xóa nhân viên!');
            fetchUsers();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50 },
        { title: 'Tên đăng nhập', dataIndex: 'username', render: t => <b>{t}</b> },
        { title: 'Họ và tên', dataIndex: 'fullName' },
        {
            title: 'Chức vụ', dataIndex: 'role',
            render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger icon={<DeleteOutlined />} disabled={record.username === 'admin'}>Xóa</Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>👥 Quản Lý Nhân Sự</h2>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
                    Thêm Nhân Viên
                </Button>
            </div>

            <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />

            <Modal
                title="Thêm Nhân Viên Mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Tạo Tài Khoản"
            >
                <Form form={form} onFinish={handleCreateUser} layout="vertical">
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input placeholder="VD: staff01" />
                    </Form.Item>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="role" label="Chức vụ" initialValue="STAFF">
                        <Select>
                            <Select.Option value="STAFF">Nhân viên</Select.Option>
                            <Select.Option value="ADMIN">Quản lý</Select.Option>
                        </Select>
                    </Form.Item>
                    <p style={{ color: 'gray', fontSize: 12 }}>* Mật khẩu mặc định sẽ là <b>123456</b></p>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUserPage;