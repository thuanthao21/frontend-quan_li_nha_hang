import React from 'react';
import { Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

const POSLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#001529', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/dashboard')}
                >
                    Thoát POS
                </Button>
                <h2 style={{ color: 'white', margin: '0 0 0 20px' }}>Chế độ Bán Hàng</h2>
            </Header>
            <Content style={{ padding: '20px' }}>
                {children}
            </Content>
        </Layout>
    );
};

export default POSLayout;