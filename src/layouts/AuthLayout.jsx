import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

const AuthLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5',
                backgroundImage: 'url("https://source.unsplash.com/random/1920x1080/?restaurant")', // Ảnh nền ngẫu nhiên cho đẹp
                backgroundSize: 'cover'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: 40,
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {children}
                </div>
            </Content>
        </Layout>
    );
};

export default AuthLayout;