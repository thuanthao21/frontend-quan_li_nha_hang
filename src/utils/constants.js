// src/utils/constants.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Nếu bạn có dùng WebSocket (WS) thì thêm dòng này:
export const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');