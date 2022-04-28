import { GoAPageLoader } from '@abgov/react-components';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { Acknowledge } from './acknowledge';
import {
  getForm,
  getFormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
} from './intake.slice';
import { Submission } from './submission';
import { Verify } from './verify';

export const Opportunity: FunctionComponent = () => {
  const { form, formData } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) => ({
      form: state[INTAKE_FEATURE_KEY].form,
      formData: state[INTAKE_FEATURE_KEY].formData,
    })
  );
  const loadingStatus = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].loadingFormStatus
  );
  const dispatch = useDispatch();
  const { formId } = useParams<{ formId: string }>();

  useEffect(() => {
    dispatch(getForm({ formId }));
    dispatch(getFormData({ formId }));
  }, [dispatch, formId]);

  return (
    <section>
      <h2>Your platform idea</h2>
      <div>
        <GoAPageLoader
          message="Loading draft..."
          visible={loadingStatus !== 'loaded' && loadingStatus !== 'error'}
        />
        {
          // Form exists, is in draft, and form data not loaded.
          form?.status === 'draft' && !formData && <Verify />
        }
        {
          // Form exists, is in draft, and form data loaded.
          form?.status === 'draft' && formData && <Submission />
        }
        {
          // Form exists, is not in draft
          form?.status === 'submitted' && <Acknowledge />
        }
        {
          // Form does not exist
          !form && loadingStatus === 'loaded' && <Redirect to="/submission" />
        }
      </div>
    </section>
  );
};
