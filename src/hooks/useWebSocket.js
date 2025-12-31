import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { API_BASE_URL } from '../utils/constants';

const useWebSocket = (topic, callback) => {
    const stompClientRef = useRef(null);

    useEffect(() => {
        // Thay thế /api bằng /ws để kết nối socket
        const socketUrl = API_BASE_URL.replace('/api', '/ws');
        const socket = new SockJS(socketUrl);
        const client = Stomp.over(socket);

        // Tắt log debug cho đỡ rối console
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
    }, [topic]); // Chỉ chạy lại khi topic thay đổi

    return stompClientRef.current;
};

export default useWebSocket;