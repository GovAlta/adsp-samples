import { GoAButton, GoAFormItem } from '@abgov/react-components';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../main';

export const ScreeningQuestions = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <form>
      <h3>Let start with some quick questions</h3>
      <GoAFormItem label="Question A?"></GoAFormItem>
      <GoAFormItem label="Question B?"></GoAFormItem>
      <GoAFormItem label="Question C?"></GoAFormItem>
      <div>
        <GoAButton onClick={() => dispatch(push('new'))}>Next</GoAButton>
      </div>
    </form>
  );
};
