import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import {
  CallbackComponent,
  loadUser,
  OidcProvider,
  reducer as oidcReducer,
  SignoutCallbackComponent,
} from 'redux-oidc';
import { configureStore } from '@reduxjs/toolkit';

import { environment } from './environments/environment';
import {
  ConfigState,
  CONFIG_FEATURE_KEY,
  getConfiguration,
  configReducer,
} from './app/config.slice';
import { chatReducer, CHAT_FEATURE_KEY } from './app/chat.slice';
import { createUserManager } from './access';
import App from './app/app';
import { UserManager } from 'oidc-client';
import { GoAPageLoader } from '@abgov/react-components';

const store = configureStore({
  reducer: {
    user: oidcReducer,
    [CONFIG_FEATURE_KEY]: configReducer,
    [CHAT_FEATURE_KEY]: chatReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'redux-oidc/USER_FOUND',
          'chat/fetchMessages/fulfilled',
          'chat/receivedMessage',
          'chat/sendMessage/fulfilled',
        ],
        ignoredPaths: ['user.user', 'chat.messages'],
      },
    });
  },
  devTools: true,
  // Optional Redux store enhancers
  enhancers: [],
});

store.dispatch(getConfiguration());

const Main: FunctionComponent = () => {
  const { accessServiceUrl, clientId, realm } = useSelector(
    (state: { config: ConfigState }) => state.config
  );

  let userManager: UserManager = null;
  if (accessServiceUrl) {
    userManager = createUserManager({
      url: accessServiceUrl,
      realm,
      client_id: clientId,
    });
    loadUser(store, userManager);
  }
  return userManager ? (
    <OidcProvider store={store} userManager={userManager}>
      <React.StrictMode>
        <Router>
          <Switch>
            <Route
              path="/auth/callback"
              render={({ history }) => (
                <CallbackComponent
                  userManager={userManager}
                  successCallback={() => history.push('/chat')}
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
  ) : (
    <GoAPageLoader />
  );
};

ReactDOM.render(
  <Provider store={store}>
    <Main />
  </Provider>,
  document.getElementById('root')
);
