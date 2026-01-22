import React, { useState } from 'react';
import { Card, Tag, Modal, Button } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react'; // Import thư viện QR

const TableCard = ({ table, onClick }) => {
    const [isQrOpen, setIsQrOpen] = useState(false);

    // Link menu cho bàn này (Ví dụ: http://localhost:5173/menu/1)
    // Lưu ý: Khi deploy phải đổi localhost thành tên miền thật
    const menuLink = `${window.location.origin}/menu/${table.id}`;

    // Xử lý sự kiện bấm nút QR (chặn không cho kích hoạt onClick của bàn)
    const handleQrClick = (e) => {
        e.stopPropagation();
        setIsQrOpen(true);
    };

    // Màu sắc theo trạng thái
    const getStatusColor = (status) => {
        switch (status) {
            case 'EMPTY': return '#52c41a';    // Xanh lá
            case 'OCCUPIED': return '#faad14'; // Cam
            default: return '#d9d9d9';
        }
    };

    return (
        <>
            <Card
                hoverable
                style={{
                    width: '100%',
                    textAlign: 'center',
                    borderTop: `5px solid ${getStatusColor(table.status)}`,
                    position: 'relative' // Để đặt nút QR
                }}
                onClick={() => onClick(table)}
            >
                {/* Nút QR nhỏ ở góc trên phải */}
                <Button
                    type="text"
                    icon={<QrcodeOutlined />}
                    size="small"
                    style={{ position: 'absolute', top: 5, right: 5, color: '#888' }}
                    onClick={handleQrClick}
                />

                <h3 style={{ margin: '10px 0' }}>{table.name}</h3>
                <Tag color={getStatusColor(table.status)}>
                    {table.status === 'EMPTY' ? 'Trống' : 'Có khách'}
                </Tag>
            </Card>

            {/* Modal hiện QR Code to */}
            <Modal
                title={`Mã QR - ${table.name}`}
                open={isQrOpen}
                onCancel={(e) => { e.stopPropagation(); setIsQrOpen(false); }}
                footer={null}
                width={300}
                style={{ textAlign: 'center' }}
            >
                <div style={{ background: 'white', padding: 20, display: 'inline-block' }}>
                    <QRCodeSVG value={menuLink} size={200} />
                </div>
                <p style={{ marginTop: 10, color: '#888' }}>
                    Quét để gọi món<br/>
                    <a href={menuLink} target="_blank" rel="noreferrer">{menuLink}</a>
                </p>
            </Modal>
        </>
    );
};

export default TableCard;