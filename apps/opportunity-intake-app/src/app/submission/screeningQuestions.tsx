import { GoAButton } from '@abgov/react-components';
import { GoAForm, GoAFormActions } from '@abgov/react-components/experimental';
import { useHistory } from 'react-router';

export const ScreeningQuestions = () => {
  const history = useHistory();
  return (
    <GoAForm>
      <p>Testing</p>
      <GoAFormActions alignment="right">
        <GoAButton onClick={() => history.push(`form`)}>Next</GoAButton>
      </GoAFormActions>
    </GoAForm>
  );
};
