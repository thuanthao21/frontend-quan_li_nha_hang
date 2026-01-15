import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { API_BASE_URL } from '../utils/constants';

const useWebSocket = (topic, callback) => {
    const stompClientRef = useRef(null);

    useEffect(() => {
        // --- SỬA ĐOẠN NÀY ---
        // 1. Xóa chữ '/api' ở cuối nếu lỡ có
        let cleanUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        // 2. Xóa dấu '/' ở cuối nếu có
        cleanUrl = cleanUrl.replace(/\/$/, '');
        // 3. Cộng chuỗi chuẩn xác
        const socketUrl = cleanUrl + '/ws';

        console.log("🔌 Connecting to WebSocket URL:", socketUrl); // Debug xem đúng link chưa

        const socket = new SockJS(socketUrl);
        const client = Stomp.over(socket);

        // Tắt log debug (nếu muốn debug thì comment dòng này lại)
        client.debug = null;

        client.connect({}, () => {
            console.log(`✅ Đã kết nối WebSocket tới ${topic}`);

            client.subscribe(topic, (message) => {
                if (message.body) {
                    const data = JSON.parse(message.body);
                    callback(data);
                }
            });
        }, (error) => {
            console.error('❌ Lỗi kết nối WebSocket:', error);
        });

        stompClientRef.current = client;

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [topic]);

    return stompClientRef.current;
};

export default useWebSocket;