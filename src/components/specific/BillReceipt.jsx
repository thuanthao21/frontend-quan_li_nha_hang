import React from 'react';
import { List, Button } from 'antd';

const BillReceipt = ({ cart, onRemove, totalAmount, onSubmit }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: 10 }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Đang chọn ({cart.reduce((sum, i) => sum + i.quantity, 0)})</h4>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={cart}
                    renderItem={item => (
                        <List.Item actions={[
                            <Button size="small" danger type="text" onClick={() => onRemove(item.productId)}>X</Button>
                        ]}>
                            <List.Item.Meta
                                title={<span style={{ fontSize: 13 }}>{item.name}</span>}
                                description={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{item.price.toLocaleString()}</span>
                                        <span style={{ fontWeight: 'bold', color: 'black' }}>x{item.quantity}</span>
                                    </div>
                                }
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