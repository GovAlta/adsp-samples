import { GoAButton, GoAHeader } from '@abgov/react-components';
import { UserManager } from 'oidc-client';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { UserState } from 'redux-oidc';

import styles from './app.module.scss';
import { Landing } from './landing';
import { Submission } from './submission';
import { Admin } from './admin';

interface AppProps {
  userManager: UserManager;
}

export const App: FunctionComponent<AppProps> = ({ userManager }) => {
  const user = useSelector((state: { user: UserState }) => state.user.user);
  const location = useLocation();

  return (
    <div
      className={`${styles.app} ${
        location.pathname !== '/' ? styles.opportunityApp : ''
      }`}
    >
      <GoAHeader
        serviceLevel="alpha"
        serviceName="Platform Opportunities"
        serviceHome="/"
      >
        {location.pathname.startsWith('/admin') &&
          (user ? (
            <GoAButton onClick={() => userManager.signoutRedirect()}>
              Sign Out
            </GoAButton>
          ) : (
            <GoAButton onClick={() => userManager.signinRedirect()}>
              Sign In
            </GoAButton>
          ))}
      </GoAHeader>
      <Route exact path="/">
        <Landing />
      </Route>
      <main>
        <Switch>
          <Route path="/submission">
            <Submission />
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
          <Redirect to="/" />
        </Switch>
      </main>
      <footer className={styles.footer}>
        <div className="goa-socialconnect">
          <div className="goa-title">Connect with us on</div>
          <ul>
            <li className={styles.github}>
              <a
                href="https://github.com/GovAlta/adsp-samples"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default App;
