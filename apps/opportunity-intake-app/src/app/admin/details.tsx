import { GoAElementLoader, GoAPageLoader } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormItem,
  GoAIconButton,
} from '@abgov/react-components/experimental';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const dispatch = useDispatch();

  return (
    <li>
      {!isLoading ? (
        <span>
          {filename}
          <GoAIconButton
            type="download"
            size="medium"
            onClick={() => {
              dispatch(downloadFile({ fileId, filename }));
            }}
          />
        </span>
      ) : (
        <GoAElementLoader
          visible={true}
          baseColour="#fff"
          spinnerColour="#0070c4"
        />
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
        <GoAPageLoader visible={true} />
      ) : (
        <GoAForm>
          <section>
            <h3>General information</h3>
            <GoAFormItem>
              <label>Ministry</label>
              <div>{details?.data?.ministry}</div>
            </GoAFormItem>
            <GoAFormItem>
              <label>Program</label>
              <div>{details?.data?.program}</div>
            </GoAFormItem>
            <GoAFormItem>
              <label>Team</label>
              <div>{details?.data?.team}</div>
            </GoAFormItem>
            <GoAFormItem>
              <label>Description</label>
              <div>{details?.data?.description}</div>
            </GoAFormItem>
          </section>
          <section>
            <h3>Examples</h3>
            {details?.data?.examples?.map(({ users, need, use }, idx) => (
              <div key={idx}>
                <GoAFormItem>
                  <label>Users</label>
                  <div>{users}</div>
                </GoAFormItem>
                <GoAFormItem>
                  <label>Need</label>
                  <div>{need}</div>
                </GoAFormItem>
                <GoAFormItem>
                  <label>Use</label>
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
        </GoAForm>
      )}
    </section>
  );
};
