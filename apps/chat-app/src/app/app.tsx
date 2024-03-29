import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserManager } from 'oidc-client';
import { UserState } from 'redux-oidc';
import {
  GoAButton,
  GoAAppHeader,
  GoAMicrositeHeader,
} from '@abgov/react-components';

import styles from './app.module.scss';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Landing } from './landing';
import { Chat } from './chat';

interface AppProps {
  userManager: UserManager;
}

export function App({ userManager }: AppProps) {
  const user = useSelector((state: { user: UserState }) => state.user.user);

  return (
    <div className={styles.app}>
      <GoAMicrositeHeader type="beta" />
      <GoAAppHeader heading="ADSP Chat Example" url="/">
        {user ? (
          <GoAButton onClick={() => userManager.signoutRedirect()}>
            Sign Out
          </GoAButton>
        ) : (
          <GoAButton onClick={() => userManager.signinRedirect()}>
            Sign In
          </GoAButton>
        )}
      </GoAAppHeader>
      <Router>
        <Switch>
          <Route path="/chat">
            <Chat />
          </Route>
          <Route path="/">
            <Landing />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
