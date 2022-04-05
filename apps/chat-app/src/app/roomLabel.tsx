import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { selectedRoomSelector } from './chat.slice';
import styles from './roomLabel.module.scss';

export const RoomLabel: FunctionComponent = () => {
  const room = useSelector(selectedRoomSelector);
  return room ? (
    <div className={styles.roomLabel}>
      <div>
        <b>{room.name}</b>
      </div>
      <div>{room.description}</div>
    </div>
  ) : null;
};
