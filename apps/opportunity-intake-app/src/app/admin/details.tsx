import {
  GoACircularProgress,
  GoAFormItem,
  GoAIconButton,
} from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../main';
import { AssessState, ASSESS_FEATURE_KEY, downloadFile } from '../assess.slice';
import { FormInfo } from '../types';
import styles from './submissions.module.scss';

interface DetailsProps {
  form: FormInfo;
}
interface FileItemProps {
  fileId: string;
}

const FileItem: FunctionComponent<FileItemProps> = ({ fileId }) => {
  const { filename = '', isLoading } = useSelector(
    (state: { [ASSESS_FEATURE_KEY]: AssessState }) => ({
      filename: state[ASSESS_FEATURE_KEY].files?.[fileId]?.filename,
      isLoading:
        state[ASSESS_FEATURE_KEY].loadingFileStatus[fileId] === 'loading',
    })
  );
  const dispatch = useDispatch<AppDispatch>();

  return (
    <li>
      {!isLoading ? (
        <span>
          {filename}
          <GoAIconButton
            icon="download"
            size="medium"
            onClick={() => {
              dispatch(downloadFile({ fileId, filename }));
            }}
          />
        </span>
      ) : (
        <GoACircularProgress visible={true} variant="inline" size="small" />
      )}
    </li>
  );
};

export const Details: FunctionComponent<DetailsProps> = ({ form }) => {
  const { isLoading, details } = useSelector(
    (state: { [ASSESS_FEATURE_KEY]: AssessState }) => ({
      isLoading:
        state[ASSESS_FEATURE_KEY].loadingDetailsStatus[form.id] === 'loading',
      details: state[ASSESS_FEATURE_KEY].submissionDetails[form.id],
    })
  );

  return (
    <section className={styles.details}>
      {isLoading ? (
        <GoACircularProgress visible={true} variant="fullscreen" size="large" />
      ) : (
        <form>
          <section>
            <h3>General information</h3>
            <GoAFormItem label="Ministry">
              <div>{details?.data?.ministry}</div>
            </GoAFormItem>
            <GoAFormItem label="Program">
              <div>{details?.data?.program}</div>
            </GoAFormItem>
            <GoAFormItem label="Team">
              <div>{details?.data?.team}</div>
            </GoAFormItem>
            <GoAFormItem label="Description">
              <div>{details?.data?.description}</div>
            </GoAFormItem>
          </section>
          <section>
            <h3>Examples</h3>
            {details?.data?.examples?.map(({ users, need, use }, idx) => (
              <div key={idx}>
                <GoAFormItem label="Users">
                  <div>{users}</div>
                </GoAFormItem>
                <GoAFormItem label="Need">
                  <div>{need}</div>
                </GoAFormItem>
                <GoAFormItem label="Use">
                  <div>{use}</div>
                </GoAFormItem>
              </div>
            ))}
          </section>
          <section>
            <h3>Supporting documents</h3>
            <ul>
              {Object.keys(details?.files || {}).map((fileId) => (
                <FileItem key={fileId} fileId={fileId} />
              ))}
            </ul>
          </section>
        </form>
      )}
    </section>
  );
};
