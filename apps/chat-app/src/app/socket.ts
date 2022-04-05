
import { io } from 'socket.io-client';

let socket = null;
export function connect(token: string, dispatch) {
  socket = io(`wss://push-service.adsp-dev.gov.ab.ca/autotest`, {
    query: {
      stream: 'chat-messages',
    },
    withCredentials: true,
    extraHeaders: { Authorization: `Bearer ${token}` },
  });

  socket.on('connect', () => {
    console.log(socket.id);
  });

  socket.on('chat-service:message-sent', () => {
    dispatch();
  });
}
