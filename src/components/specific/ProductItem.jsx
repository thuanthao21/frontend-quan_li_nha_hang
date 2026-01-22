import React from 'react';
import { Card, Button, Badge } from 'antd'; // Import thêm Badge

const ProductItem = ({ product, onAdd }) => {
    // Kiểm tra trạng thái (nếu null hoặc true thì là còn hàng)
    const isAvailable = product.isAvailable !== false;

    return (
        <Badge.Ribbon
            text="HẾT MÓN"
            color="red"
            style={{ display: isAvailable ? 'none' : 'block' }} // Chỉ hiện khi hết hàng
        >
            <Card
                size="small"
                hoverable={isAvailable} // Chỉ hover được khi còn hàng
                title={
                    <span style={{
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: isAvailable ? 'black' : '#999' // Xám màu tên món nếu hết
                    }}>
                        {product.name}
                    </span>
                }
                styles={{ body: { padding: '8px' } }}
                style={{
                    opacity: isAvailable ? 1 : 0.6, // Làm mờ thẻ nếu hết hàng
                    backgroundColor: isAvailable ? 'white' : '#f5f5f5',
                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                }}
                onClick={() => {
                    // Chặn click vào thẻ
                    if (isAvailable) onAdd(product);
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: isAvailable ? '#1677ff' : '#999' }}>
                        {product.price.toLocaleString()}
                    </b>

                    <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        disabled={!isAvailable} // Khóa nút cộng
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) onAdd(product);
                        }}
                    >
                        +
                    </Button>
                </div>
            </Card>
        </Badge.Ribbon>
    );
};

export default ProductItem;