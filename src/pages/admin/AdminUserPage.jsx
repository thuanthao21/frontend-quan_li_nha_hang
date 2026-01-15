import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag, Tooltip, Space, Card, Row, Col } from 'antd';
// Thêm DeleteOutlined
import { UserAddOutlined, EditOutlined, LockOutlined, UnlockOutlined, ReloadOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
// Thêm deleteUserAPI
import { getUsersAPI, createUserAPI, updateUserAPI, toggleUserStatusAPI, resetPasswordAPI, deleteUserAPI } from '../../services/authService';

const AdminUserPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Lưu user đang sửa
    const [searchText, setSearchText] = useState('');
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

    // Mở Modal (Nếu có user -> Edit, Không có -> Create)
    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue(user); // Fill dữ liệu cũ vào form
        } else {
            form.resetFields(); // Reset form
        }
        setIsModalOpen(true);
    };

    // Xử lý Lưu (Tạo hoặc Cập nhật)
    const handleSave = async (values) => {
        try {
            if (editingUser) {
                // Update
                await updateUserAPI(editingUser.id, values);
                message.success('Cập nhật thông tin thành công!');
            } else {
                // Create
                await createUserAPI(values);
                message.success('Tạo nhân viên thành công! Mật khẩu: 123456');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data || 'Thao tác thất bại');
        }
    };

    // Xử lý Khóa/Mở khóa
    const handleToggleStatus = async (id) => {
        try {
            await toggleUserStatusAPI(id);
            message.success('Đã thay đổi trạng thái!');
            fetchUsers();
        } catch (error) {
            message.error('Lỗi khi thay đổi trạng thái');
        }
    };

    // Xử lý Reset mật khẩu
    const handleResetPassword = async (id) => {
        try {
            await resetPasswordAPI(id);
            message.success('Mật khẩu đã reset về: 123456');
        } catch (error) {
            message.error('Lỗi reset mật khẩu');
        }
    };

    // [MỚI] Xử lý Xóa vĩnh viễn
    const handleDelete = async (id) => {
        try {
            await deleteUserAPI(id);
            message.success('Đã xóa vĩnh viễn nhân viên!');
            fetchUsers();
        } catch (error) {
            // Hiển thị lỗi từ backend (Ví dụ: Đã có đơn hàng...)
            message.error(error.response?.data || 'Xóa thất bại!');
        }
    };

    // Lọc user theo tìm kiếm
    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        u.username.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 50, align: 'center' },
        {
            title: 'Nhân viên',
            render: (_, r) => (
                <div>
                    <b style={{ color: r.active ? 'inherit' : '#999' }}>{r.username}</b>
                    <br/>
                    <small style={{ color: '#666' }}>{r.fullName}</small>
                </div>
            )
        },
        {
            title: 'Chức vụ', dataIndex: 'role', align: 'center',
            render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
        },
        {
            title: 'Trạng thái', dataIndex: 'active', align: 'center',
            render: (active) => (
                <Tag color={active ? 'green' : 'default'}>
                    {active ? 'Đang làm việc' : 'Đã khóa'}
                </Tag>
            )
        },
        {
            title: 'Hành động', align: 'center', width: 220,
            render: (_, record) => (
                <Space>
                    {/* Nút Sửa */}
                    <Tooltip title="Sửa thông tin">
                        <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleOpenModal(record)} />
                    </Tooltip>

                    {/* Nút Reset Pass */}
                    <Popconfirm title="Reset mật khẩu về 123456?" onConfirm={() => handleResetPassword(record.id)}>
                        <Tooltip title="Reset mật khẩu">
                            <Button type="text" icon={<ReloadOutlined style={{ color: 'orange' }} />} />
                        </Tooltip>
                    </Popconfirm>

                    {/* Nút Khóa/Mở khóa */}
                    <Popconfirm
                        title={record.active ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
                        onConfirm={() => handleToggleStatus(record.id)}
                        disabled={record.username === 'admin'}
                    >
                        <Tooltip title={record.active ? "Khóa tài khoản" : "Mở khóa"}>
                            <Button
                                type="text"
                                icon={record.active ? <LockOutlined style={{ color: '#d48806' }} /> : <UnlockOutlined style={{ color: '#52c41a' }} />}
                                disabled={record.username === 'admin'}
                            />
                        </Tooltip>
                    </Popconfirm>

                    {/* [MỚI] Nút Xóa vĩnh viễn */}
                    <Popconfirm
                        title="XÓA VĨNH VIỄN?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa luôn" cancelText="Hủy"
                        disabled={record.username === 'admin'}
                    >
                        <Tooltip title="Xóa vĩnh viễn">
                            <Button type="text" danger icon={<DeleteOutlined />} disabled={record.username === 'admin'} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>👥 Quản Lý Nhân Sự</h2>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Nhân Viên
                </Button>
            </div>

            <Card style={{ marginBottom: 20 }} size="small">
                <Row gutter={16}>
                    <Col span={8}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo tên hoặc tài khoản..."
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={16} style={{ textAlign: 'right', color: '#888' }}>
                         Tổng: {filteredUsers.length} nhân viên
                    </Col>
                </Row>
            </Card>

            <Table dataSource={filteredUsers} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />

            {/* Modal Create/Edit */}
            <Modal
                title={editingUser ? "✏️ Cập Nhật Thông Tin" : "✨ Thêm Nhân Viên Mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} onFinish={handleSave} layout="vertical">
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập!' }]}>
                        <Input disabled={!!editingUser} placeholder="VD: staff01" />
                        {/* Khi sửa thì không cho đổi username */}
                    </Form.Item>

                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập!' }]}>
                        <Input placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item name="role" label="Chức vụ" initialValue="STAFF">
                        <Select>
                            <Select.Option value="STAFF">Nhân viên</Select.Option>
                            <Select.Option value="ADMIN">Quản lý (Admin)</Select.Option>
                        </Select>
                    </Form.Item>

                    {!editingUser && (
                         <p style={{ color: 'gray', fontSize: 12 }}>* Mật khẩu mặc định: <b>123456</b></p>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUserPage;