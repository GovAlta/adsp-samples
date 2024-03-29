import { GoACallout, GoAFormItem } from '@abgov/react-components';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AppDispatch } from '../../main';
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
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (formId) {
      dispatch(sendCode({ formId }));
    }
  }, [formId, dispatch]);

  return (
    <form>
      <p>Let's get your back to where you were</p>
      <GoAFormItem label="Enter code from the email or text message.">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
      </GoAFormItem>
      <div>
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
      </div>
      {verifyError && (
        <GoACallout
          type="emergency"
          heading="Access not verified"
          children="The provided code could not be verified. Please try again."
        />
      )}
    </form>
  );
};
