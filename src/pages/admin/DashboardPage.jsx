import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Spin, DatePicker, Table, Tag } from 'antd'; // 1. Thêm Table, Tag
import { DollarCircleOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// 2. Import thêm getTopProductsAPI
import { getDashboardStatsAPI, getTopProductsAPI } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const DashboardPage = () => {
    const { user } = useAuth();

    // State thống kê chung
    const [stats, setStats] = useState({
        revenue: 0,
        todayOrders: 0,
        chartData: []
    });

    // 3. State cho Top Product
    const [topProducts, setTopProducts] = useState([]);

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
            // 4. Gọi song song cả 2 API (Dashboard + Top Product)
            const [dashboardData, topData] = await Promise.all([
                getDashboardStatsAPI(from, to),
                getTopProductsAPI(from, to)
            ]);

            setStats({
                revenue: dashboardData.todayRevenue,
                todayOrders: dashboardData.todayOrders,
                chartData: dashboardData.chartData
            });

            setTopProducts(topData); // Lưu dữ liệu top món

        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    // Preset nhanh cho bộ chọn ngày
    const rangePresets = [
        { label: '7 Ngày qua', value: [dayjs().subtract(6, 'day'), dayjs()] },
        { label: '30 Ngày qua', value: [dayjs().subtract(29, 'day'), dayjs()] },
        { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
        { label: 'Tháng trước', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
    ];

    // 5. Cấu hình cột cho bảng Top Product
    const topColumns = [
        {
            title: '#',
            key: 'index',
            align: 'center',
            width: 60,
            render: (_, __, index) => {
                // Tô màu cho Top 1, 2, 3
                let color = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default';
                return <Tag color={color}>#{index + 1}</Tag>;
            }
        },
        {
            title: 'Tên món',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Đã bán',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (qty) => <span style={{color: '#1890ff', fontWeight: 'bold'}}>{qty}</span>
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val) => val.toLocaleString() + ' ₫'
        },
    ];

    return (
        <div>
            <h2>👋 Xin chào, {user?.role || 'Admin'}!</h2>
            <p style={{ color: 'gray' }}>
                Dưới đây là tình hình kinh doanh và các món bán chạy theo thời gian bạn chọn.
            </p>

            {/* =======================
                THẺ THỐNG KÊ (HÔM NAY)
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
                PHẦN BIỂU ĐỒ VÀ BẢNG XẾP HẠNG
            ======================= */}
            <div style={{ marginTop: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0 }}>📈 Phân Tích Kinh Doanh</h3>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        presets={rangePresets}
                    />
                </div>

                <Spin spinning={loading}>
                    <Row gutter={[24, 24]}>

                        {/* CỘT TRÁI: BIỂU ĐỒ DOANH THU */}
                        <Col xs={24} lg={14}>
                            <Card title="Doanh Thu Theo Ngày">
                                <div style={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={stats.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis
                                                tickFormatter={(value) =>
                                                    new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value)
                                                }
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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
                                                animationDuration={1500}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI: TOP MÓN BÁN CHẠY */}
                        <Col xs={24} lg={10}>
                            <Card title="🏆 Top 5 Món Bán Chạy">
                                <Table
                                    dataSource={topProducts}
                                    columns={topColumns}
                                    pagination={false}
                                    rowKey="name"
                                    size="small"
                                    locale={{ emptyText: 'Chưa có dữ liệu' }}
                                />
                            </Card>
                        </Col>

                    </Row>
                </Spin>
            </div>
        </div>
    );
};

export default DashboardPage;