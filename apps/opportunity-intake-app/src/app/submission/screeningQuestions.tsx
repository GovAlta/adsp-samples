import { GoAButton, GoACheckbox } from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
} from '@abgov/react-components/experimental';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';

export const ScreeningQuestions = () => {
  const dispatch = useDispatch();
  return (
    <GoAForm>
      <h3>Let start with some quick questions</h3>
      <GoAFormItem>Question A?</GoAFormItem>
      <GoAFormItem>Question B?</GoAFormItem>
      <GoAFormItem>Question C?</GoAFormItem>
      <GoAFormActions alignment="right">
        <GoAButton onClick={() => dispatch(push('new'))}>Next</GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
