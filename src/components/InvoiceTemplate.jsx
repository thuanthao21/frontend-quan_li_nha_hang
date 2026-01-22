import React from 'react';
import dayjs from 'dayjs';

export const InvoiceTemplate = React.forwardRef(({ order }, ref) => {
    if (!order) return null;

    // Tính toán tiền nong
    const totalAmount = order.orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

    // Giả sử có giảm giá hoặc VAT (để 0 nếu chưa làm tính năng này)
    const discount = 0;
    const finalAmount = totalAmount - discount;

    return (
        <div style={{ display: 'none' }}> {/* Ẩn khỏi màn hình, chỉ hiện khi in */}
            <div ref={ref} className="printable-bill">
                {/* 1. HEADER QUÁN */}
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                    <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: 22 }}>DINEFLOW COFFEE</h2>
                    <p style={{ margin: '5px 0', fontSize: 12 }}>
                        123 Đường ABC, Quận 1, TP.HCM<br />
                        Hotline: 0909.123.456
                    </p>
                    <div style={{ borderBottom: '2px dashed #000', margin: '10px 0' }}></div>
                </div>

                {/* 2. THÔNG TIN ĐƠN */}
                <div style={{ fontSize: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Hóa đơn:</span>
                        <b>#{order.id}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ngày:</span>
                        <span>{dayjs().format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Bàn:</span>
                        <b>{order.table?.name || 'Mang về'}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Thu ngân:</span>
                        <span>Admin</span>
                    </div>
                </div>

                <div style={{ borderBottom: '1px solid #000', margin: '5px 0' }}></div>

                {/* 3. DANH SÁCH MÓN */}
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '5px 0' }}>Món</th>
                            <th style={{ textAlign: 'center', width: 30 }}>SL</th>
                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '5px 0', verticalAlign: 'top' }}>
                                    {item.product.name}
                                    {/* Nếu có ghi chú thì hiện nhỏ bên dưới */}
                                    {item.note && <div style={{ fontSize: 10, fontStyle: 'italic' }}>({item.note})</div>}
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: 5 }}>
                                    {item.quantity}
                                </td>
                                <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: 5 }}>
                                    {(item.priceAtPurchase * item.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

                {/* 4. TỔNG TIỀN */}
                <div style={{ fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span>Tổng tiền:</span>
                        <span>{totalAmount.toLocaleString()} đ</span>
                    </div>
                    {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span>Giảm giá:</span>
                            <span>-{discount.toLocaleString()} đ</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18, marginTop: 5 }}>
                        <span>THANH TOÁN:</span>
                        <span>{finalAmount.toLocaleString()} đ</span>
                    </div>
                </div>

                <div style={{ borderBottom: '2px dashed #000', margin: '15px 0' }}></div>

                {/* 5. FOOTER */}
                <div style={{ textAlign: 'center', fontSize: 12 }}>
                    <p style={{ margin: 5 }}>Wifi: DineFlowFree / Pass: 12345678</p>
                    <p style={{ fontStyle: 'italic', marginTop: 10 }}>Cảm ơn và hẹn gặp lại quý khách!</p>
                    <p style={{ fontSize: 10 }}>Powered by DineFlow POS</p>
                </div>

                {/* STYLE RIÊNG CHO LÚC IN */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-bill, .printable-bill * {
                            visibility: visible;
                        }
                        .printable-bill {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 80mm; /* Khổ giấy in nhiệt tiêu chuẩn */
                            padding: 10px;
                            font-family: 'Courier New', Courier, monospace; /* Font giống máy in */
                            color: black;
                            background: white;
                        }
                        @page {
                            size: auto;
                            margin: 0mm;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
});