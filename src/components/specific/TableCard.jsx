import React from 'react';
import { Card, Tag } from 'antd';

const TableCard = ({ table, onClick }) => {
    return (
        <Card
            hoverable
            onClick={() => onClick(table)}
            style={{
                textAlign: 'center',
                backgroundColor: table.status === 'OCCUPIED' ? '#fff1f0' : '#f6ffed',
                borderColor: table.status === 'OCCUPIED' ? '#ff4d4f' : '#b7eb8f',
                transition: 'all 0.3s'
            }}
            styles={{ body: { padding: '15px' } }}
        >
            <h3 style={{ margin: 0, fontSize: '18px' }}>{table.name}</h3>
            <Tag color={table.status === 'OCCUPIED' ? 'red' : 'green'} style={{ marginTop: 8 }}>
                {table.status === 'OCCUPIED' ? 'Có khách' : 'Trống'}
            </Tag>
        </Card>
    );
};

export default TableCard;