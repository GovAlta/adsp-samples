import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router';
import { IntakeState, INTAKE_FEATURE_KEY } from '../intake.slice';
import { New } from './new';
import { Opportunity } from './opportunity';
import { ScreeningQuestions } from './screeningQuestions';

export const Submission = () => {
  const { path } = useRouteMatch<{ formId: string }>();
  const status = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].form?.status
  );
  return (
    <section>
      <h2>Your platform idea</h2>
      <Switch>
        <Route exact path={`${path}/screen`}>
          <ScreeningQuestions />
        </Route>
        <Route exact path={`${path}/new`}>
          <New />
        </Route>
        <Route path={`${path}/:formId`}>
          <Opportunity />
        </Route>
        <Redirect to={`${path}/screen`} />
      </Switch>
    </section>
  );
};
