import { GoAButton } from '@abgov/react-components';
import { GoAForm, GoAFormActions } from '@abgov/react-components/experimental';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { IntakeState, INTAKE_FEATURE_KEY, submitForm } from '../intake.slice';

export const Summary = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );
  return (
    <GoAForm>
      <GoAFormActions alignment="right">
        <GoAButton buttonType="secondary" onClick={() => history.push('form')}>
          Back
        </GoAButton>
        <GoAButton onClick={() => dispatch(submitForm({ formId: id }))}>
          Submit
        </GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
