import { GoAButton } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import {
  FormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
  updateFormData,
} from '../intake.slice';

export const Form: FunctionComponent = () => {
  const history = useHistory();
  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );

  const [{ ministry = '', program = '', description = '' }, setData] = useState(
    data || {}
  );
  const dispatch = useDispatch();
  const dispatchUpdate = useDebouncedCallback(
    (formData: FormData) => dispatch(updateFormData({ formData })),
    2000
  );

  return (
    <GoAForm>
      <GoAFormItem>
        <label>Ministry</label>
        <input
          type="text"
          value={ministry}
          onChange={(e) => {
            const update = { ...data, ministry: e.target.value };
            setData(update);
            dispatchUpdate({ id, files, data: update });
          }}
        />
      </GoAFormItem>

      <GoAFormItem>
        <label>Program</label>
        <input
          type="text"
          value={program}
          onChange={(e) => {
            const update = { ...data, program: e.target.value };
            setData(update);
            dispatchUpdate({ id, files, data: update });
          }}
        />
      </GoAFormItem>

      <GoAFormItem>
        <label>Describe your idea</label>
        <textarea
          value={description}
          onChange={(e) => {
            const update = { ...data, description: e.target.value };
            setData(update);
            dispatchUpdate({ id, files, data: update });
          }}
        />
      </GoAFormItem>

      <div>
        <h3>Describe an example of its use</h3>
        <GoAFormItem>
          <label>Who are the users?</label>
          <input type="text" />
        </GoAFormItem>
        <GoAFormItem>
          <label>What are they trying to do?</label>
          <textarea />
        </GoAFormItem>
      </div>
      <div>
        <h3> Supporting documents </h3>

      </div>
      
      <GoAFormActions alignment="right">
        <GoAButton
          buttonType="secondary"
          onClick={() => history.push('screen')}
        >
          Back
        </GoAButton>
        <GoAButton onClick={() => history.push('summary')}>Next</GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
