import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin, DatePicker } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStatsAPI } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DashboardPage = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        revenue: 0,
        todayOrders: 0,
        chartData: []
    });

    const [loading, setLoading] = useState(false);

    // Mặc định: 7 ngày gần nhất
    const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'day'), dayjs()]);

    // Khi dateRange thay đổi, gọi API
    useEffect(() => {
        if (dateRange && dateRange[0] && dateRange[1]) {
            const from = dateRange[0].format('YYYY-MM-DD');
            const to = dateRange[1].format('YYYY-MM-DD');
            fetchData(from, to);
        }
    }, [dateRange]);

    const fetchData = async (from, to) => {
        setLoading(true);
        try {
            const data = await getDashboardStatsAPI(from, to);
            setStats({
                revenue: data.todayRevenue,
                todayOrders: data.todayOrders,
                chartData: data.chartData
            });
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    // Preset nhanh
    const rangePresets = [
        { label: '7 Ngày qua', value: [dayjs().subtract(6, 'day'), dayjs()] },
        { label: '30 Ngày qua', value: [dayjs().subtract(29, 'day'), dayjs()] },
        { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
        { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    ];

    return (
        <div>
            <h2>👋 Xin chào, {user?.role || 'Admin'}!</h2>
            <p style={{ color: 'gray' }}>
                Dưới đây là tình hình kinh doanh theo khoảng thời gian bạn chọn.
            </p>

            {/* =======================
                1. THẺ THỐNG KÊ HÔM NAY
            ======================= */}
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#e6f7ff', marginBottom: 10 }}>
                        <Statistic
                            title="Đơn hàng hôm nay"
                            value={stats.todayOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f6ffed', marginBottom: 10 }}>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={stats.revenue}
                            precision={0}
                            suffix="₫"
                            prefix={<DollarCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#fff7e6', marginBottom: 10 }}>
                        <Statistic
                            title="Nhân sự hoạt động"
                            value={user?.role === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* =======================
                2. BIỂU ĐỒ DOANH THU
            ======================= */}
            <div style={{ marginTop: 30 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 15
                    }}
                >
                    <h3 style={{ margin: 0 }}>📈 Biểu đồ Doanh Thu</h3>

                    {/* 👇 Bộ chọn khoảng ngày */}
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        presets={rangePresets}
                    />
                </div>

                <Card>
                    <Spin spinning={loading}>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat('vi-VN', {
                                                notation: 'compact',
                                                compactDisplay: 'short'
                                            }).format(value)
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(value)
                                        }
                                        labelStyle={{ color: 'black' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="value"
                                        name="Doanh Thu"
                                        fill="#1890ff"
                                        barSize={45}
                                        radius={[5, 5, 0, 0]}
                                        animationDuration={1200}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Spin>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
