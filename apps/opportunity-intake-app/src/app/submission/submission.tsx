import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router';
import { IntakeState, INTAKE_FEATURE_KEY } from '../intake.slice';
import { Form } from './form';
import { ScreeningQuestions } from './screeningQuestions';
import { Summary } from './summary';

export const Submission = () => {
  const { path } = useRouteMatch<{ formId: string }>();
  const status = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].form?.status
  );
  return (
    <div>
      <Switch>
        <Route exact path={`${path}/screen`}>
          <ScreeningQuestions />
        </Route>
        <Route exact path={`${path}/form`}>
          <Form />
        </Route>
        <Route exact path={`${path}/summary`}>
          <Summary />
        </Route>
        <Redirect to={`${path}/screen`} />
      </Switch>
    </div>
  );
};
