import {
  GoAIconButton,
} from '@abgov/react-components/experimental';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setRoom } from './chat.slice';
import styles from './rooms.module.scss';

export const NewRoom = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  return (
    <li className={styles.addRoom}>
      {showAdd ? (
        <span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <GoAIconButton
            type="close"
            size="medium"
            onClick={() => {
              setName('');
              setShowAdd(false);
            }}
          />
          <GoAIconButton
            type="checkmark"
            size="medium"
            disabled={!name}
            onClick={() => {
              dispatch(
                setRoom({
                  id: name.toLowerCase().replace(/ /g, '-'),
                  name,
                  description: '',
                })
              );
              setName('');
              setShowAdd(false);
            }}
          />
        </span>
      ) : (
        <GoAIconButton
          type="add-circle"
          size="medium"
          onClick={() => setShowAdd(true)}
        />
      )}
    </li>
  );
};
