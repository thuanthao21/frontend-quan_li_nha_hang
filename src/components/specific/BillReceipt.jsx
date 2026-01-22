import React from 'react';
import { List, Button, Input } from 'antd'; // Import thêm Input
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

// Nhận thêm prop updateNote
const BillReceipt = ({ cart, onRemove, updateNote, totalAmount, onSubmit }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: 10 }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Đang chọn ({cart.reduce((sum, i) => sum + i.quantity, 0)})</h4>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={cart}
                    renderItem={item => (
                        <List.Item style={{ padding: '10px 0', borderBottom: '1px dashed #eee', display: 'block' }}>
                            {/* Dòng 1: Tên món + Nút xóa */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        {item.price.toLocaleString()} x <b style={{ color: 'black' }}>{item.quantity}</b>
                                    </div>
                                </div>
                                <Button
                                    size="small"
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => onRemove(item.productId)}
                                />
                            </div>

                            {/* Dòng 2: [MỚI] Ô nhập ghi chú */}
                            <Input
                                prefix={<EditOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                                placeholder="Ghi chú (vd: ít đá, cay...)"
                                size="small"
                                value={item.note}
                                onChange={(e) => updateNote(item.productId, e.target.value)}
                                style={{
                                    fontSize: 12,
                                    backgroundColor: '#fafafa',
                                    border: item.note ? '1px solid #1890ff' : '1px solid #d9d9d9'
                                }}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontWeight: 'bold', fontSize: 16 }}>
                    <span>Tổng tạm:</span>
                    <span style={{ color: '#faad14' }}>
                        {totalAmount.toLocaleString()} đ
                    </span>
                </div>
                <Button type="primary" block size="large" onClick={onSubmit}>
                    GỬI BẾP
                </Button>
            </div>
        </div>
    );
};

export default BillReceipt;