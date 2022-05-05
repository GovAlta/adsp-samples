import { FunctionComponent } from 'react';
import { GoAButton } from '@abgov/react-components';
import { ChatState, fetchMessages, selectedRoomSelector } from './chat.slice';
import { useDispatch, useSelector } from 'react-redux';
import styles from './paging.module.scss';

export const Paging: FunctionComponent = () => {
  const room = useSelector(selectedRoomSelector);
  const isLoading = useSelector(
    (state: { chat: ChatState }) => state.chat.loadingStatus['messages'] === 'loading'
  );
  const dispatch = useDispatch();

  return (
    <div className={styles.paging}>
      {room?.set?.next && (
        <GoAButton
          disabled={isLoading}
          buttonType="secondary"
          onClick={() => {
            dispatch(
              fetchMessages({
                roomId: room.id,
                top: room.set.top,
                after: room.set.next,
              })
            );
            console.log('loading More...');
          }}
        >
          Load more
        </GoAButton>
      )}
    </div>
  );
};
