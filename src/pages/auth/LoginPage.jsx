import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginAPI } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // 1. Gọi API
            const data = await loginAPI(values.username, values.password);

            // ✅ 2. Gọi Context (KHÔNG set localStorage ở đây)
            login(data.token, data.role);

            message.success('Đăng nhập thành công! 🎉');
            navigate('/dashboard');
        } catch (error) {
            message.error('Đăng nhập thất bại! Kiểm tra lại tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card title="☕ DINEFLOW LOGIN" style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <Form name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username (admin/staff)" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
