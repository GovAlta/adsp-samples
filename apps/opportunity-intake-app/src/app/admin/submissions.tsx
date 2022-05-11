import { GoAPageLoader } from '@abgov/react-components';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AssessState,
  ASSESS_FEATURE_KEY,
  getSubmissions,
  submissionsSelector,
} from '../assess.slice';
import { ActionButton } from '../components/actionButton';
import { Submission } from './submission';
import styles from './submissions.module.scss';

const SubmissionList: FunctionComponent = () => {
  const submissions = useSelector(submissionsSelector);
  const { after, next, isLoading } = useSelector(
    (state: { [ASSESS_FEATURE_KEY]: AssessState }) => ({
      after: state[ASSESS_FEATURE_KEY].page.after,
      next: state[ASSESS_FEATURE_KEY].page.next,
      isLoading: state[ASSESS_FEATURE_KEY].loadingStatus === 'loading',
    })
  );
  const dispatch = useDispatch();

  return (
    <table>
      <colgroup>
        <col width="18%" />
        <col width="18%" />
        <col width="18%" />
        <col width="10%" />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th>Created on</th>
          <th>Submitted on</th>
          <th>Applicant</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {(!after || !submissions.length) && isLoading ? (
          <tr key="loading">
            <td colSpan={5}>
              <GoAPageLoader visible={true} />
            </td>
          </tr>
        ) : (
          submissions.map((submission) => (
            <Submission key={submission.id} form={submission} />
          ))
        )}
        {next && (
          <ActionButton
            isExecuting={isLoading}
            onClick={() => dispatch(getSubmissions({ after: next }))}
          >
            Load more
          </ActionButton>
        )}
      </tbody>
    </table>
  );
};

export const Submissions: FunctionComponent = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSubmissions({}));
  });

  return (
    <section className={styles.submissions}>
      <h2>Submissions</h2>
      <SubmissionList />
    </section>
  );
};
