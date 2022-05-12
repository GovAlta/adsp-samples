import { GoACallout } from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { UserState } from 'redux-oidc';
import { Submissions } from './submissions';

export const Admin: FunctionComponent = () => {
  const user = useSelector((state: { user: UserState }) => state.user.user);
  return (
    <Switch>
      {!user && (
        <Route>
          <section>
            <GoACallout
              type="information"
              title="Sign in to access"
              content="Sign in using your account to access the opportunity intake administration."
            />
          </section>
        </Route>
      )}
      <Route path="/admin/submissions">
        <Submissions />
      </Route>
      <Redirect to="/admin/submissions" />
    </Switch>
  );
};
