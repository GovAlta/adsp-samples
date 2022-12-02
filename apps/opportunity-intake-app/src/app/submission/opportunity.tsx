import { GoACircularProgress } from '@abgov/react-components';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { Acknowledge } from './acknowledge';
import {
  getForm,
  getFormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
} from '../intake.slice';
import { Verify } from './verify';
import { Draft } from './draft';
import { NotFound } from './notFound';
import { AppDispatch } from '../../main';

export const Opportunity: FunctionComponent = () => {
  const { form, formData } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) => ({
      form: state[INTAKE_FEATURE_KEY].form,
      formData: state[INTAKE_FEATURE_KEY].formData,
    })
  );

  // Pending load of form or its data, then we're loading.
  const isLoading = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].loadingFormStatus === 'loading' ||
      state[INTAKE_FEATURE_KEY].loadingFormStatus === 'not loaded'
  );
  const dispatch = useDispatch<AppDispatch>();
  const { formId } = useParams<{ formId: string }>();

  useEffect(() => {
    dispatch(getForm({ formId }));
    dispatch(getFormData({ formId }));
  }, [dispatch, formId]);

  return (
    <div>
      <GoACircularProgress message="Loading draft..." visible={isLoading} />
      {
        // Form exists, is in draft, and form data not loaded.
        !isLoading && form?.status === 'draft' && !formData && <Verify />
      }
      {
        // Form exists, is in draft, and form data loaded.
        !isLoading && form?.status === 'draft' && formData && <Draft />
      }
      {
        // Form exists, is not in draft
        !isLoading && form?.status === 'submitted' && <Acknowledge />
      }
      {
        // Form does not exist
        !isLoading && !form && <NotFound />
      }
    </div>
  );
};
