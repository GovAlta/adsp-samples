import { GoAPageLoader } from '@abgov/react-components';
import { configureStore } from '@reduxjs/toolkit';
import { User, UserManager } from 'oidc-client';
import decodeJwt from 'jwt-decode';
import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import {
  Action,
  CallbackComponent,
  loadUser,
  OidcProvider,
  reducer as oidcReducer,
  SignoutCallbackComponent,
  UserState,
  USER_FOUND,
} from 'redux-oidc';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { createUserManager } from './access';
import {
  ConfigState,
  CONFIG_FEATURE_KEY,
  getConfiguration,
  configReducer,
} from './app/config.slice';
import { chatReducer, CHAT_FEATURE_KEY } from './app/chat.slice';
import App from './app/app';

const store = configureStore({
  reducer: {
    user: (state: UserState, action) => {
      if (action.type === USER_FOUND) {
        const result: Record<string, unknown> = decodeJwt(
          (action as Action<User>).payload.access_token
        );
        action['payload']['roles'] =
          result.resource_access?.['urn:ads:autotest:chat-service']?.roles ||
          [];
      }
      return oidcReducer(state, action);
    },
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
