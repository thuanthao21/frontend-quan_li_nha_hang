import React from 'react';

// Sử dụng forwardRef để thư viện in có thể "chụp" được component này
export const InvoiceTemplate = React.forwardRef(({ order }, ref) => {

    // Nếu chưa có order, vẫn render 1 div rỗng để ref không null
    if (!order) return <div ref={ref}></div>;

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours()}:${now.getMinutes()} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    };

    return (
        <div
            ref={ref}
            style={{
                padding: '20px',
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto',
                fontFamily: 'Courier New, monospace',
                fontSize: '12px'
            }}
        >
            {/* 1. Header quán */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>DINEFLOW RESTAURANT</h2>
                <p style={{ margin: '2px 0' }}>ĐC: 123 Đường Văn Hóa, TP.HCM</p>
                <p style={{ margin: '2px 0' }}>Hotline: 0909.123.456</p>
                <p style={{ margin: '5px 0' }}>--------------------------------</p>
            </div>

            {/* 2. Thông tin đơn */}
            <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '2px 0' }}><strong>Bàn: {order.table?.name}</strong></p>
                <p style={{ margin: '2px 0' }}>Số HĐ: #{order.id}</p>
                <p style={{ margin: '2px 0' }}>Ngày: {getCurrentTime()}</p>
                <p style={{ margin: '2px 0' }}>Thu ngân: Admin</p>
            </div>

            <p style={{ margin: '5px 0' }}>--------------------------------</p>

            {/* 3. Danh sách món */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', borderBottom: '1px dashed #000' }}>Món</th>
                        <th style={{ textAlign: 'center', borderBottom: '1px dashed #000' }}>SL</th>
                        <th style={{ textAlign: 'right', borderBottom: '1px dashed #000' }}>Tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.orderItems.map((item, index) => (
                        <tr key={index}>
                            <td style={{ paddingTop: '5px' }}>{item.product.name}</td>
                            <td style={{ textAlign: 'center', paddingTop: '5px' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right', paddingTop: '5px' }}>
                                {formatMoney(item.product.price * item.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p style={{ margin: '5px 0' }}>--------------------------------</p>

            {/* 4. Tổng tiền */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
                <span>TỔNG CỘNG:</span>
                <span>{formatMoney(order.totalAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span>Tiền khách đưa:</span>
                <span>{formatMoney(order.totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền thừa:</span>
                <span>0 ₫</span>
            </div>

            {/* 5. Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ margin: '5px 0', fontStyle: 'italic' }}>Cảm ơn quý khách & Hẹn gặp lại!</p>
                <p style={{ margin: '2px 0' }}>Pass Wifi: dineflow888</p>
                <p style={{ margin: '2px 0' }}>Powered by DineFlow</p>
            </div>
        </div>
    );
});
