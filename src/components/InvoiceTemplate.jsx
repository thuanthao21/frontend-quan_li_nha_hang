import React from 'react';

// Sử dụng forwardRef để component cha có thể "nắm" được cái div này
export const InvoiceTemplate = React.forwardRef(({ order }, ref) => {

    // Hàm format tiền
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // Hàm lấy giờ hiện tại
    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
    };

    return (
        // ⚠️ QUAN TRỌNG: ref nằm ở div ngoài cùng. Div này LUÔN LUÔN tồn tại.
        <div ref={ref} style={{ padding: '20px', width: '100%', maxWidth: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>

            {/* Chỉ khi có order thì mới hiện nội dung bên trong */}
            {order ? (
                <>
                    {/* 1. Header */}
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>DINEFLOW RESTAURANT</h3>
                        <p style={{ margin: '2px 0' }}>ĐC: 123 Đường ABC, TP.HCM</p>
                        <p style={{ margin: '2px 0' }}>Hotline: 0909.123.456</p>
                        <p style={{ margin: '5px 0' }}>================================</p>
                    </div>

                    {/* 2. Info */}
                    <div style={{ marginBottom: '10px' }}>
                        <p style={{ margin: '2px 0' }}><strong>Bàn: {order.table?.name}</strong></p>
                        <p style={{ margin: '2px 0' }}>Mã HĐ: #{order.id}</p>
                        <p style={{ margin: '2px 0' }}>Ngày: {getCurrentTime()}</p>
                    </div>
                    <p style={{ margin: '5px 0' }}>--------------------------------</p>

                    {/* 3. Items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left' }}>Món</th>
                                <th style={{ textAlign: 'center' }}>SL</th>
                                <th style={{ textAlign: 'right' }}>Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ paddingTop: '4px' }}>{item.product.name}</td>
                                    <td style={{ textAlign: 'center', paddingTop: '4px' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', paddingTop: '4px' }}>
                                        {formatMoney(item.product.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p style={{ margin: '5px 0' }}>--------------------------------</p>

                    {/* 4. Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
                        <span>TỔNG CỘNG:</span>
                        <span>{formatMoney(order.totalAmount)}</span>
                    </div>

                    {/* 5. Footer */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ margin: '2px 0', fontStyle: 'italic' }}>Cảm ơn quý khách!</p>
                        <p style={{ margin: '2px 0' }}>Hẹn gặp lại.</p>
                    </div>
                </>
            ) : (
                <p>Đang tải dữ liệu...</p>
            )}
        </div>
    );
});