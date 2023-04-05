import { useSelector } from 'react-redux';
import { UserManager } from 'oidc-client';
import { UserState } from 'redux-oidc';
import {
  GoAAppHeader,
  GoAButton,
  GoAMicrositeHeader,
  GoAHeroBanner,
} from '@abgov/react-components';

import styles from './app.module.css';
import { Route, Switch } from 'react-router-dom';
import { AnnualAgreement } from './annual-agreement/annual-agreement';
import { Agreements } from './agreements/agreements';

interface AppProps {
  userManager: UserManager;
}

export function App({ userManager }: AppProps) {
  const user = useSelector((state: { user: UserState }) => state.user.user);

  return (
    <div className={styles.app}>
      <GoAMicrositeHeader type="alpha" />
      <GoAAppHeader url="/" heading="Performance excellence">
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
      <Switch>
        <Route path="/agreements/:agreementId/:step?">
          <AnnualAgreement />
        </Route>
        <Route path="/agreements">
          <Agreements />
        </Route>
        <Route path="*">
          <>
            <GoAHeroBanner
              heading="Performance excellence"
              backgroundUrl={'../assets/banner.jpg'}
            />
            <main>
              <section>
                <h2>Welcome to Performance excellence</h2>
                <p>
                  Don't panic. Start editing the project to build your digital
                  service.
                </p>
              </section>
            </main>
          </>
        </Route>
      </Switch>
      <footer className={styles.footer}>
        <div className="goa-socialconnect">
          <div className="goa-title">Connect with us on</div>
          <ul>
            <li className={styles.github}>
              <a
                href="https://github.com/GovAlta"
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
}

export default App;
