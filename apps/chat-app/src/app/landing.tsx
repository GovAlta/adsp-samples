import { GoAHeroBanner } from '@abgov/react-components';
import { FunctionComponent } from 'react';
import styles from './app.module.scss';

export const Landing: FunctionComponent = () => {
  return (
    <>
      <GoAHeroBanner
        title="Chat: example of ADSP app and service"
        backgroundUrl={'../assets/banner.jpg'}
      />
      <main>
        <section>
          <h2>Welcome to chat-app!</h2>
          <p>
            Don't panic. Start editing the project to build your digital
            service.
          </p>
          <h3>A few things you might want to do next:</h3>
          <ul className={styles.nextSteps}>
            <li>Create the 'chat-app' client in your realm to let users</li>
            <li>
              Make requests to the backend API by either updating nginx.conf or
              enabling CORS on the API.
            </li>
          </ul>
        </section>
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
    </>
  );
};
