import { GoAButton, GoACallout } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createForm } from './intake.slice';

export const NewOpportunity: FunctionComponent = () => {
  const [email, setEmail] = useState<string>();
  const [name, setName] = useState<string>();
  const dispatch = useDispatch();
  return (
    <section>
      <h2>Your platform idea</h2>
      <div>
        <p>
          Thank you for your interest in submitting an idea for the ADSP
          platform. We have a structured form to help us understand and process
          new ideas for the platform.
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </GoAFormItem>
            <GoAFormActions alignment="right">
              <GoAButton buttonType="secondary">Cancel</GoAButton>
              <GoAButton
                disabled={!email || !name}
                onClick={() => dispatch(createForm({ email, name }))}
              >
                Next
              </GoAButton>
            </GoAFormActions>
          </GoAForm>
        </form>
      </div>
    </section>
  );
};
