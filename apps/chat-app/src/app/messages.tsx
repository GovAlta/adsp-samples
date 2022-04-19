import { GoAElementLoader } from '@abgov/react-components';
import { DateTime } from 'luxon';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChatState,
  fetchMessages,
  FileContent,
  currentMessageSetSelector,
  Message,
  roomMessagesSelector,
  selectedRoomSelector,
} from './chat.slice';
import styles from './messages.module.scss';

interface MessageFileProps {
  content: FileContent;
}
const MessageFile: FunctionComponent<MessageFileProps> = ({ content }) => {
  const loadingStatus = useSelector(
    (state: { chat: ChatState }) => state.chat.loadingStatus
  );
  const files = useSelector((state: { chat: ChatState }) => state.chat.files);
  const imgSrc = files[content.urn];
  return loadingStatus[`download-${content.urn}`] === 'loading' ? (
    <GoAElementLoader
      visible={true}
      baseColour="#fff"
      spinnerColour="#0070c4"
    />
  ) : (
    <img alt={content.filename} src={imgSrc} />
  );
};

interface MessageItemProps {
  message: Message;
}
const MessageItem: FunctionComponent<MessageItemProps> = ({ message }) => {
  return (
    <li key={`${message.hash}`}>
      <div>
        <b>{message.from.name}</b>
        <span>
          {message.timestamp.toFormat(
            `h:mm a ${
              message.timestamp.hasSame(DateTime.now(), 'day') ? '' : 'cccc'
            } ${
              message.timestamp.hasSame(DateTime.now(), 'week') ? '' : 'LLLL d'
            }`
          )}
        </span>
      </div>
      <div>
        {message.message?.map((item, idx) => {
          return typeof item === 'string' ? (
            <p key={idx}>{item}</p>
          ) : (
            <MessageFile key={idx} content={item} />
          );
        })}
      </div>
    </li>
  );
};

export const Messages: FunctionComponent = () => {
  const messages = useSelector(roomMessagesSelector);
  const room = useSelector(selectedRoomSelector);
  const messageSet = useSelector(currentMessageSetSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (room) {
      dispatch(fetchMessages({ roomId: room.id, top: messageSet.top, after: messageSet.after }));
    }
  }, [dispatch, room, messageSet]);

  return (
    <ul className={styles.messages}>
      {messages?.map((message, idx) => (
        <MessageItem key={idx} message={message} />
      ))}
    </ul>
  );
};
