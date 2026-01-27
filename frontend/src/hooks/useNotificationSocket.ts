import { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useNotificationSocket(userId: string, onNotification: (msg: any) => void) {
  useEffect(() => {
    if (!userId) return;
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      onConnect: () => {
        stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            onNotification(JSON.parse(message.body));
          } catch {
            onNotification(message.body);
          }
        });
      },
    });
    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [userId, onNotification]);
}
