/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { server } from "@/config/env";
import { tokenStorage } from "@/shared/api/http";

export function useNotificationSocket(
  destination: string,
  onNotification: (msg: any) => void
) {
  useEffect(() => {
    if (!destination) return;

    const accessToken = tokenStorage.getAccessToken();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${server}/ws`) as any,
      connectHeaders: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        stompClient.subscribe(destination, (message) => {
          try {
            onNotification(JSON.parse(message.body));
          } catch {
            onNotification(message.body);
          }
        });
      },
      onStompError: () => {},
      onWebSocketError: () => {},
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [destination, onNotification]);
}