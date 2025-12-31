import React from 'react';
import { Card, Button } from 'antd';

const ProductItem = ({ product, onAdd }) => {
    return (
        <Card
            size="small"
            hoverable
            title={<span style={{ fontSize: 13, fontWeight: 'bold' }}>{product.name}</span>}
            styles={{ body: { padding: '8px' } }}
            onClick={() => onAdd(product)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ color: '#1677ff' }}>{product.price.toLocaleString()}</b>
                <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(product);
                    }}
                >
                    +
                </Button>
            </div>
        </Card>
    );
};

export default ProductItem;