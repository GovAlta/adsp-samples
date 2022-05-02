import { GoAButton } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { push } from 'connected-react-router';
import { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import {
  FormData,
  IntakeState,
  INTAKE_FEATURE_KEY,
  updateFormData,
} from '../intake.slice';

export const Form: FunctionComponent = () => {
  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );

  const [localData, setLocalData] = useState(data);
  const { ministry = '', program = '', description = '' } = localData;
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
            const update = { ...localData, ministry: e.target.value };
            setLocalData(update);
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
            const update = { ...localData, program: e.target.value };
            setLocalData(update);
            dispatchUpdate({ id, files, data: update });
          }}
        />
      </GoAFormItem>

      <GoAFormItem>
        <label>Describe your idea</label>
        <textarea
          value={description}
          onChange={(e) => {
            const update = { ...localData, description: e.target.value };
            setLocalData(update);
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
        <GoAFormItem>
          <label>How does the platform service help?</label>
          <textarea />
        </GoAFormItem>
      </div>
      <div>
        <h3> Supporting documents </h3>
        <input type="file" />
        <ul>
          {Object.entries(files).map(([key, file]) => (
            <div key={key}></div>
          ))}
        </ul>
      </div>

      <GoAFormActions alignment="right">
        <GoAButton onClick={() => dispatch(push('summary'))}>Next</GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
