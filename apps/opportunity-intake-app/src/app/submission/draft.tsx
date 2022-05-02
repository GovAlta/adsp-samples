import { Redirect, Route, Switch, useRouteMatch } from 'react-router';
import { Form } from './form';
import { Summary } from './summary';

export const Draft = () => {
  const { path } = useRouteMatch<{ formId: string }>();
  return (
    <Switch>
      <Route exact path={`${path}/form`}>
        <Form />
      </Route>
      <Route exact path={`${path}/summary`}>
        <Summary />
      </Route>
      <Redirect to={`${path}/form`} />
    </Switch>
  );
};
