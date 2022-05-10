import {
  GoAButton,
  GoACallout,
  GoAElementLoader,
} from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ActionButton } from '../components/actionButton';
import {
  getFormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
  sendCode,
} from '../intake.slice';

export const Verify = () => {
  const { formId } = useParams<{ formId: string }>();
  const { isSending, isAccessing } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) => ({
      isSending: state[INTAKE_FEATURE_KEY].sendCodeStatus === 'sending',
      isAccessing: state[INTAKE_FEATURE_KEY].loadingDataStatus === 'loading',
    })
  );

  const verifyError = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].error
  );

  const [code, setCode] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    if (formId) {
      dispatch(sendCode({ formId }));
    }
  }, [formId, dispatch]);

  return (
    <GoAForm>
      <p>Let's get your back to where you were</p>
      <GoAFormItem>
        <label>Enter code from the email</label>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
      </GoAFormItem>
      <GoAFormActions alignment="right">
        <ActionButton
          buttonType="secondary"
          isExecuting={isSending}
          onClick={() => dispatch(sendCode({ formId }))}
        >
          Send code
        </ActionButton>
        <ActionButton
          disabled={!code}
          isExecuting={isAccessing}
          onClick={() => dispatch(getFormData({ formId, code }))}
        >
          Verify
        </ActionButton>
      </GoAFormActions>
      {verifyError && (
        <GoACallout
          type="emergency"
          title="Access not verified"
          content="The provided code could not be verified. Please try again."
        />
      )}
    </GoAForm>
  );
};
