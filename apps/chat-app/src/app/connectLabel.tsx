import { GoABadge } from '@abgov/react-components/experimental';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { ChatState } from './chat.slice';
import styles from './connectLabel.module.scss';

export const ConnectLabel: FunctionComponent = () => {
  const connected = useSelector(
    (state: { chat: ChatState }) => state.chat.connected
  );
  return (
    <div className={styles.connect}>
      {connected ? (
        <GoABadge type="success" content="Connected" />
      ) : (
        <GoABadge type="information" content="Not connected" />
      )}
    </div>
  );
};
