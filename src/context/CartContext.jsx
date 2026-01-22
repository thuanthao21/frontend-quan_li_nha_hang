import React, { createContext, useState } from 'react';
import { message } from 'antd';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Thêm món vào giỏ
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                note: '' // Khởi tạo ghi chú rỗng
            }]);
        }
        message.success(`Đã thêm ${product.name}`);
    };

    // Xóa món khỏi giỏ
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    // Tăng giảm số lượng
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
        ));
    };

    // [MỚI] Hàm cập nhật ghi chú
    const updateNote = (productId, noteText) => {
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, note: noteText } : item
        ));
    };

    // Xóa sạch giỏ (sau khi gửi bếp)
    const clearCart = () => setCart([]);

    // Tính tổng tiền tạm tính
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateNote, // <--- Nhớ export hàm này
            clearCart,
            totalAmount
        }}>
            {children}
        </CartContext.Provider>
    );
};