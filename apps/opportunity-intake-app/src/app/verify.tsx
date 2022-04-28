import { GoAButton, GoAElementLoader } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  getFormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
  sendCode,
} from './intake.slice';

export const Verify = () => {
  const { formId } = useParams<{ formId: string }>();
  const sendStatus = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].sendCodeStatus
  );
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
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
        <GoAButton
          buttonType="secondary"
          onClick={() => dispatch(sendCode({ formId }))}
        >
          Send code
          <span>
            <GoAElementLoader
              visible={sendStatus === 'sending'}
              baseColour="#fff"
              spinnerColour="#0070c4"
            />
          </span>
        </GoAButton>
        <GoAButton onClick={() => dispatch(getFormData({ formId, code }))}>
          Verify
        </GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
