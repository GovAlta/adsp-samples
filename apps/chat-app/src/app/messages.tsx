import { GoAElementLoader } from '@abgov/react-components';
import { response } from 'express';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChatState,
  fetchMessages,
  FileContent,
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

  const endRef = useRef<HTMLDivElement>();
  useEffect(() => endRef?.current?.scrollIntoView({ behavior: 'smooth' }), [endRef]);

  return <li key={`${message.timestamp}`}>
  <div>
    <b>{message.from.name}</b>
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
  <div ref={endRef} />
</li>
}

export const Messages: FunctionComponent = () => {
  const messages = useSelector(roomMessagesSelector);
  const room = useSelector(selectedRoomSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (room && !messages.length) {
      dispatch(fetchMessages({ roomId: room.id }));
    }
  }, [dispatch, room]);

  return (
    <ul className={styles.messages}>
      {messages?.map((message, idx) => <MessageItem key={idx} message={message} />)}
    </ul>
  );
};
