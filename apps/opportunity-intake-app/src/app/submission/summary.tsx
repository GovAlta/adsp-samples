import { GoAButton } from '@abgov/react-components';
import { GoAForm, GoAFormActions } from '@abgov/react-components/experimental';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { ActionButton } from '../components/actionButton';
import { IntakeState, INTAKE_FEATURE_KEY, submitForm } from '../intake.slice';

export const Summary = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );

  const isSubmitting = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].savingStatus === 'saving'
  );

  return (
    <GoAForm>
      <GoAFormActions alignment="right">
        <GoAButton buttonType="secondary" onClick={() => history.push('form')}>
          Back
        </GoAButton>
        <ActionButton
          isExecuting={isSubmitting}
          onClick={() => dispatch(submitForm({ formId: id }))}
        >
          Submit
        </ActionButton>
      </GoAFormActions>
    </GoAForm>
  );
};
