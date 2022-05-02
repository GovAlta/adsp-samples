import { GoAHeader } from '@abgov/react-components';
import { Route, Switch } from 'react-router';

import styles from './app.module.scss';
import { Landing } from './landing';
import { Submission } from './submission';

export function App() {
  return (
    <div className={styles.app}>
      <GoAHeader
        serviceLevel="alpha"
        serviceName="Platform Opportunities"
        serviceHome="/"
      />
      <Route exact path="/">
        <Landing />
      </Route>
      <main>
        <Switch>
          <Route path="/submission">
            <Submission />
          </Route>
        </Switch>
      </main>
      <footer className={styles.footer}>
        <div className="goa-socialconnect">
          <div className="goa-title">Connect with us on</div>
          <ul>
            <li className={styles.github}>
              <a
                href="https://github.com/abgov"
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
