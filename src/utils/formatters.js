export const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};