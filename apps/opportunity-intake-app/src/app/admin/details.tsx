import { GoAPageLoader } from '@abgov/react-components';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AssessState,
  ASSESS_FEATURE_KEY,
  getSubmissionDetails,
} from '../assess.slice';
import { FormInfo } from '../intake.slice';
import styles from './submissions.module.scss';

interface DetailsProps {
  form: FormInfo;
}

export const Details: FunctionComponent<DetailsProps> = ({ form }) => {
  const { isLoading, details } = useSelector(
    (state: { [ASSESS_FEATURE_KEY]: AssessState }) => ({
      isLoading:
        state[ASSESS_FEATURE_KEY].loadingDetailsStatus[form.id] === 'loading',
      details: state[ASSESS_FEATURE_KEY].submissionDetails[form.id],
    })
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (!details) {
      dispatch(getSubmissionDetails({ formId: form.id }));
    }
  });
  return (
    <section className={styles.details}>
      {isLoading ? (
        <GoAPageLoader visible={true} />
      ) : (
        <>
          <section>
            <h3>General information</h3>
            <div>
              <label>Ministry</label>
              <div>{details?.data?.ministry}</div>
            </div>
            <div>
              <label>Program</label>
              <div>{details?.data?.program}</div>
            </div>
            <div>
              <label>Team</label>
              <div>{details?.data?.team}</div>
            </div>
            <div>
              <label>Description</label>
              <div>{details?.data?.description}</div>
            </div>
          </section>
          <section>
            <h3>Examples</h3>
          </section>
          <section>
            <h3>Supporting documents</h3>
          </section>
        </>
      )}
    </section>
  );
};
