import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import {
  CallbackComponent,
  loadUser,
  OidcProvider,
  SignoutCallbackComponent,
} from 'redux-oidc';

import { environment } from './environments/environment';
import { createUserManager } from './access';
import App from './app/app';
import { history, store } from './store';
import { setConfiguration } from './app/start.slice';

// Fetch configuration from web server; otherwise fallback to static environment.
fetch('/config/config.json')
  .then((res) => (res.ok ? res.json() : environment))
  .then(({ access, directory }) => {
    const userManager = createUserManager(access);
    loadUser(store, userManager);
    store.dispatch(
      setConfiguration({ accessUrl: access.url, directoryUrl: directory.url })
    );

    ReactDOM.render(
      <Provider store={store}>
        <OidcProvider store={store} userManager={userManager}>
          <React.StrictMode>
            <Router history={history}>
              <Switch>
                <Route
                  path="/auth/callback"
                  render={({ history }) => (
                    <CallbackComponent
                      userManager={userManager}
                      successCallback={() => history.push('/agreements')}
                      errorCallback={() => history.push('/')}
                    >
                      <span>signing in...</span>
                    </CallbackComponent>
                  )}
                />
                <Route
                  path="/signout/callback"
                  render={({ history }) => (
                    <SignoutCallbackComponent
                      userManager={userManager}
                      successCallback={() => history.push('/')}
                      errorCallback={() => history.push('/')}
                    >
                      <span>signing out...</span>
                    </SignoutCallbackComponent>
                  )}
                />
                <Route>
                  <App userManager={userManager} />
                </Route>
              </Switch>
            </Router>
          </React.StrictMode>
        </OidcProvider>
      </Provider>,
      document.getElementById('root')
    );
  });
