import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, message } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStatsAPI } from '../services/api';

const DashboardPage = () => {
    const [stats, setStats] = useState({ revenue: 0, todayOrders: 0, chartData: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardStatsAPI();
                setStats(data);
            } catch (error) {
                message.error('Lỗi tải báo cáo');
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>👋 Xin chào, {localStorage.getItem('role')}!</h2>
            <p>Báo cáo tình hình kinh doanh.</p>

            {/* 1. Các thẻ số liệu */}
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic
                            title="Đơn hàng hôm nay"
                            value={stats.todayOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.revenue}
                            precision={0}
                            suffix="VNĐ"
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic title="Nhân viên" value="Active" prefix={<UserOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* 2. Biểu đồ */}
            <div style={{ marginTop: 30 }}>
                <h3>📈 Biểu đồ Doanh Thu Tuần Qua</h3>
                <Card>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                                <Legend />
                                <Bar dataKey="value" name="Doanh Thu" fill="#1890ff" barSize={50} radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;