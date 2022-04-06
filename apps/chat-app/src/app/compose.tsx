import { GoAButton } from '@abgov/react-components';
import { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatState, MessageContent, sendMessage } from './chat.slice';
import styles from './compose.module.scss';

interface ComposeFilePreview {
  file: File;
}
const ComposeFilePreview: FunctionComponent<ComposeFilePreview> = ({
  file,
}) => {
  const [fileUrl, setFileUrl] = useState<string>();
  useEffect(() => {
    let reader: FileReader;
    if (file) {
      reader = new FileReader();
      reader.onload = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    return () => reader?.abort();
  }, [file]);
  return <img alt={file.name} src={fileUrl} />;
};

export const Compose: FunctionComponent = () => {
  const selectedRoom = useSelector(
    (state: { chat: ChatState }) => state.chat.selectedRoom
  );
  const [draft, setDraft] = useState<MessageContent>(['']);
  const dispatch = useDispatch();
  return (
    <div className={styles.compose}>
      <div className={styles.composeContent}>
        {draft.map((item, idx) => {
          if (typeof item === 'string') {
            return idx + 1 === draft.length ? (
              <textarea
                key={idx}
                value={item}
                onChange={(e) => {
                  const update = [...draft];
                  update.splice(idx, 1, e.target.value);
                  setDraft(update);
                }}
              />
            ) : (
              <p key={idx}>{item}</p>
            );
          } else {
            return <ComposeFilePreview key={idx} file={item.file} />;
          }
        })}
      </div>
      <div className={styles.composeActions}>
        <input
          type="file"
          multiple={false}
          accept="image/gif, image/jpeg, image/png"
          onChange={(e) => {
            const update = [...draft];
            if (!update[update.length - 1]) {
              update.pop();
            }
            update.push(
              {
                file: e.target.files[0],
                filename: e.target.files[0].name,
              },
              ''
            );
            setDraft(update);
          }}
        />
        <GoAButton buttonType="secondary" onClick={() => setDraft([''])}>
          Clear
        </GoAButton>
        <GoAButton
          disabled={!draft.filter((item) => !!item).length}
          onClick={() => {
            setDraft(['']);
            dispatch(sendMessage({ message: draft }));
          }}
        >
          Send
        </GoAButton>
      </div>
      {!selectedRoom && <div className={styles.overlay} />}
    </div>
  );
};
