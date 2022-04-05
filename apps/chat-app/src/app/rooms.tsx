import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatState, roomListSelector, selectRoom } from './chat.slice';
import styles from './rooms.module.scss';

export const Rooms: FunctionComponent = () => {
  const rooms = useSelector(roomListSelector);
  const selectedRoom = useSelector(
    (state: { chat: ChatState }) => state.chat.selectedRoom
  );
  const dispatch = useDispatch();
  return (
    <ul className={styles.rooms}>
      {rooms.map((room) => (
        <li
          key={room.id}
          data-selected={selectedRoom === room.id}
          onClick={() => {
            if (selectedRoom !== room.id) {
              dispatch(selectRoom(room.id));
            }
          }}
        >
          {room.name}
        </li>
      ))}
    </ul>
  );
};
