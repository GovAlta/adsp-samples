import { GoAButton, GoACallout } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { push } from 'connected-react-router';
import { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../main';
import { ActionButton } from '../components/actionButton';
import { createForm, IntakeState, INTAKE_FEATURE_KEY } from '../intake.slice';

export const New: FunctionComponent = () => {
  const [email, setEmail] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [name, setName] = useState<string>();

  const isCreating = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].loadingFormStatus === 'loading'
  );
  const dispatch = useDispatch<AppDispatch>();

  return (
    <section>
      <p>
        Thank you for your interest in submitting an idea for the ADSP platform.
        We have a structured form to help us understand and process new ideas
        for the platform.
      </p>
      <GoACallout
        type="information"
        title="We will save your draft"
        content={
          'Your draft submission will be saved as you make changes. ' +
          'Use your email to return to it later. Note that anyone ' +
          'with access to the email inbox will be able to access the draft.'
        }
      />
      <form>
        <GoAForm>
          <GoAFormItem>
            <label>Your preferred name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </GoAFormItem>
          <GoAFormItem>
            <label>Email for the saved draft</label>
            <input
              type="email"
              value={email}
              disabled={!!phone}
              onChange={(e) => setEmail(e.target.value)}
            />
          </GoAFormItem>
          <div>or if you prefer messages on your phone:</div>
          <GoAFormItem>
            <label>Phone number for the saved draft</label>
            <input
              type="tel"
              value={phone}
              disabled={!!email}
              onChange={(e) => setPhone(e.target.value)}
            />
          </GoAFormItem>
          <GoAFormActions alignment="right">
            <GoAButton
              buttonType="secondary"
              onClick={() => dispatch(push('/'))}
            >
              Cancel
            </GoAButton>
            <ActionButton
              disabled={!(email || phone) || !name}
              isExecuting={isCreating}
              onClick={() => {
                dispatch(createForm({ email, name, phone }));
              }}
            >
              Next
            </ActionButton>
          </GoAFormActions>
        </GoAForm>
      </form>
    </section>
  );
};
