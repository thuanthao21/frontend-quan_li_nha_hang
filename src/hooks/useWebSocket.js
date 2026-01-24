import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { API_BASE_URL } from '../utils/constants';

const useWebSocket = (topic, callback) => {
    const stompClientRef = useRef(null);

    // 🔥 [FIX QUAN TRỌNG] Lưu callback mới nhất vào Ref
    // Giúp tránh lỗi "Stale Closure" (dữ liệu user bị null trong hàm cũ)
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        // 1. Xử lý URL chuẩn
        let cleanUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        cleanUrl = cleanUrl.replace(/\/$/, '');
        const socketUrl = cleanUrl + '/ws';

        console.log("🔌 Connecting to WebSocket URL:", socketUrl);

        const socket = new SockJS(socketUrl);
        const client = Stomp.over(socket);

        // Mẹo: Ở Production nên tắt debug để đỡ rối, nhưng lúc test lỗi thì nên bật
        // client.debug = null;

        client.connect({}, () => {
            console.log(`✅ Đã kết nối WebSocket tới ${topic}`);

            client.subscribe(topic, (message) => {
                if (message.body) {
                    const data = JSON.parse(message.body);

                    // 🔥 Gọi hàm từ Ref để luôn lấy logic mới nhất (có user)
                    if (savedCallback.current) {
                        savedCallback.current(data);
                    }
                }
            });
        }, (error) => {
            console.error('❌ Lỗi kết nối WebSocket:', error);
            // Có thể thêm logic tự reconnect sau 5s ở đây nếu muốn
        });

        stompClientRef.current = client;

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [topic]); // Chỉ kết nối lại khi topic thay đổi, không phụ thuộc vào callback

    return stompClientRef.current;
};

export default useWebSocket;