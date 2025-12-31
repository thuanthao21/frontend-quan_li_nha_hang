import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Avatar, message } from 'antd';
import { getProductsAPI } from '../services/productService.js';

const MenuPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gọi API khi trang vừa load
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

    // Định nghĩa các cột cho bảng
    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'image',
            render: (url) => <Avatar shape="square" size={64} src={url} />
        },
        {
            title: 'Tên món',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString()} VNĐ` // Format tiền tệ
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'category',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Khu vực',
            dataIndex: 'kitchenStation',
            key: 'station',
            render: (station) => (
                <Tag color={station === 'KITCHEN' ? 'orange' : 'purple'}>
                    {station === 'KITCHEN' ? 'BẾP NẤU' : 'QUẦY BAR'}
                </Tag>
            )
        }
    ];

    return (
        <div>
            <h2>📜 Thực Đơn Nhà Hàng</h2>
            <Card style={{ marginTop: 20 }}>
                <Table
                    dataSource={products}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 6 }} // Mỗi trang 6 món
                />
            </Card>
        </div>
    );
};

export default MenuPage;