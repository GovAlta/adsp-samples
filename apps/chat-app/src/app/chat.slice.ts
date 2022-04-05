import {
  createAsyncThunk,
  createReducer,
  createSelector,
  createAction,
} from '@reduxjs/toolkit';
import { UserState } from 'redux-oidc';
import { io, Socket } from 'socket.io-client';
import { ConfigState } from './config.slice';

export const CHAT_FEATURE_KEY = 'chat';

interface Room {
  id: string;
  name: string;
  description: string;
}

export interface FileContent {
  filename: string;
  urn?: string;
  file?: File;
}

export type MessageContent = (string | FileContent)[];

function instanceOfFileContent(
  object: string | FileContent
): object is FileContent {
  return typeof object !== 'string' && 'filename' in object;
}

export interface Message {
  roomId: string;
  timestamp: Date;
  message: MessageContent;
  from: {
    id: string;
    name: string;
  };
}

export interface ChatState {
  connected: boolean;
  files: Record<string, string>;
  rooms: Record<string, Room>;
  roomList: string[];
  selectedRoom: string;
  messages: Record<string, Message[]>;
  loadingStatus: Record<string, 'not loaded' | 'loading' | 'loaded' | 'error'>;
  error: string;
}

interface MessageValue {
  timestamp: string;
  value: {
    payload: {
      room: string;
      message: MessageContent;
      from: { name: string; id: string };
    };
  };
}

interface MessageEvent {
  timestamp: string;
  payload: {
    room: string;
    message: MessageContent;
    from: { name: string; id: string };
  };
}

export const selectRoom = createAction('chat/selectRoom', (roomId: string) => ({
  payload: roomId,
}));

export const receivedMessage = createAction(
  'chat/receivedMessage',
  (message: Message) => ({ payload: message })
);

export const downloadFile = createAsyncThunk(
  'chat/downloadFile',
  async (
    {
      token,
      content,
    }: {
      token: string;
      content: FileContent;
    },
    { getState }
  ): Promise<string> => {
    const fileServiceUrl = (getState() as { config: ConfigState }).config
      .fileServiceUrl;
    const response = await fetch(
      `${fileServiceUrl}/file/v1${content.urn
        .split(':')
        .pop()}/download?embed=true&unsafe=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const fileReader = new FileReader();
    const blob = await response.blob();
    fileReader.readAsDataURL(blob);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
    });

    return dataUrl;
  }
);

export const connectedStream = createAction(
  'chat/connectedStream'
);

export const disconnectedStream = createAction(
  'chat/disconnectedStream'
);

let socket: Socket;
export const connectStream = createAsyncThunk(
  'chat/connectStream',
  async (token: string, { dispatch, getState }): Promise<void> => {
    const pushServiceUrl = (getState() as { config: ConfigState }).config
      .pushServiceUrl;

    if (socket) {
      // Disconnect the previous connection if exists.
      socket.disconnect();
    }
    
    socket = io(`${pushServiceUrl}/autotest`, {
      query: {
        stream: 'chat-messages',
      },
      withCredentials: true,
      extraHeaders: { Authorization: `Bearer ${token}` },
    });

    socket.on('connect', () => {
      dispatch(connectedStream());
    });

    socket.on('disconnected', () => {
      dispatch(disconnectedStream());
    });

    socket.on('chat-service:message-sent', (e: MessageEvent) => {
      const message: Message = {
        timestamp: new Date(e.timestamp),
        roomId: e.payload.room,
        message:
          typeof e.payload.message === 'string'
            ? [e.payload.message]
            : e.payload.message,
        from: e.payload.from,
      };
      dispatch(receivedMessage(message));
      for (const content of message.message) {
        if (instanceOfFileContent(content)) {
          dispatch(downloadFile({ token, content }));
        }
      }
    });
  }
);

export const fetchRooms = createAsyncThunk(
  'chat/fetchRooms',
  async (token: string) => {
    const response = await fetch('/api/chat/v1/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId }: { roomId: string }, { dispatch, getState }) => {
    const state = getState() as { user: UserState };
    const token = state.user.user.access_token;
    const response = await fetch(`/api/chat/v1/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: { results: MessageValue[] } = await response.json();
    const messages: { roomId: string; results: Message[] } = {
      roomId,
      ...result,
      results: result.results
        .map(({ timestamp, value }) => {
          const result = {
            timestamp: new Date(timestamp),
            roomId: value.payload.room,
            message:
              typeof value.payload.message === 'string'
                ? [value.payload.message]
                : value.payload.message,
            from: value.payload.from,
          };

          for (const content of result.message) {
            if (instanceOfFileContent(content)) {
              dispatch(downloadFile({ token, content }));
            }
          }
          return result;
        })
        .reverse(),
    };

    return messages;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message }: { message: MessageContent }, { getState }) => {
    const state = getState() as {
      user: UserState;
      chat: ChatState;
      config: ConfigState;
    };
    const fileServiceUrl = state.config.fileServiceUrl;

    const messageContent: MessageContent = [];
    for (const item of message) {
      if (instanceOfFileContent(item)) {
        const formData = new FormData();
        formData.append('type', 'chat-files');
        formData.append('recordId', state.chat.selectedRoom);
        formData.append('file', item.file);
        const fileResponse = await fetch(`${fileServiceUrl}/file/v1/files`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.user.user.access_token}`,
          },
          body: formData,
        });

        const { filename, urn } = await fileResponse.json();
        messageContent.push({ filename, urn });
      } else {
        messageContent.push(item);
      }
    }
    const response = await fetch(
      `/api/chat/v1/rooms/${state.chat.selectedRoom}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.user.user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent }),
      }
    );
    return { roomId: state.chat.selectedRoom, ...(await response.json()) };
  }
);

export const initialStartState: ChatState = {
  connected: false,
  files: {},
  rooms: {},
  roomList: [],
  selectedRoom: null,
  messages: {},
  loadingStatus: {},
  error: null,
};

export const chatReducer = createReducer(initialStartState, (builder) => {
  builder
    .addCase(selectRoom, (state, action) => {
      state.selectedRoom = action.payload;
    })
    .addCase(fetchRooms.pending, (state) => {
      state.loadingStatus['rooms'] = 'loading';
    })
    .addCase(fetchRooms.fulfilled, (state, action) => {
      state.loadingStatus['rooms'] = 'loaded';
      state.roomList = action.payload.map((result) => result.id);
      state.rooms = action.payload.reduce(
        (rooms, result) => ({ ...rooms, [result.id]: result }),
        {}
      );
    })
    .addCase(fetchRooms.rejected, (state, action) => {
      state.loadingStatus['rooms'] = 'error';
      state.error = action.error.message;
    })
    .addCase(connectedStream, (state) => {
      state.connected = true;
    })
    .addCase(disconnectedStream, (state) => {
      state.connected = false;
    })
    .addCase(fetchMessages.pending, (state) => {
      state.loadingStatus['messages'] = 'loading';
    })
    .addCase(fetchMessages.fulfilled, (state, action) => {
      state.loadingStatus['messages'] = 'loaded';
      state.messages[action.payload.roomId] = action.payload.results;
    })
    .addCase(fetchMessages.rejected, (state, action) => {
      state.loadingStatus['messages'] = 'error';
      state.error = action.error.message;
    })
    .addCase(sendMessage.pending, (state) => {
      state.loadingStatus['send'] = 'loading';
    })
    .addCase(sendMessage.fulfilled, (state) => {
      state.loadingStatus['send'] = 'loaded';
    })
    .addCase(sendMessage.rejected, (state: ChatState, action) => {
      state.loadingStatus['send'] = 'error';
      state.error = action.error.message;
    })
    .addCase(receivedMessage, (state, action) => {
      state.messages[action.payload.roomId] = [
        ...state.messages[action.payload.roomId],
        action.payload,
      ];
    })
    .addCase(downloadFile.pending, (state, action) => {
      state.loadingStatus[`download-${action.meta.arg.content.urn}`] =
        'loading';
    })
    .addCase(downloadFile.fulfilled, (state, action) => {
      state.loadingStatus[`download-${action.meta.arg.content.urn}`] = 'loaded';
      state.files = {
        ...state.files,
        [action.meta.arg.content.urn]: action.payload,
      };
    })
    .addCase(downloadFile.rejected, (state, action) => {
      state.loadingStatus[`download-${action.meta.arg.content.urn}`] = 'error';
      state.error = action.error.message;
    });
});

export const roomListSelector = createSelector(
  (state: { [CHAT_FEATURE_KEY]: ChatState }) =>
    state[CHAT_FEATURE_KEY].roomList,
  (state: { [CHAT_FEATURE_KEY]: ChatState }) => state[CHAT_FEATURE_KEY].rooms,
  (list, rooms) => list.map((room) => rooms[room])
);

export const selectedRoomSelector = createSelector(
  (state: { [CHAT_FEATURE_KEY]: ChatState }) =>
    state[CHAT_FEATURE_KEY].selectedRoom,
  (state: { [CHAT_FEATURE_KEY]: ChatState }) => state[CHAT_FEATURE_KEY].rooms,
  (selected, rooms) => rooms[selected]
);

export const roomMessagesSelector = createSelector(
  (state: { [CHAT_FEATURE_KEY]: ChatState }) =>
    state[CHAT_FEATURE_KEY].selectedRoom,
  (state: { [CHAT_FEATURE_KEY]: ChatState }) =>
    state[CHAT_FEATURE_KEY].messages,
  (selected, messages) => messages[selected]
);
