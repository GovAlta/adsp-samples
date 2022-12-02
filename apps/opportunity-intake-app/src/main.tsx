import { GoAPageLoader } from '@abgov/react-components';
import { AnyAction, configureStore } from '@reduxjs/toolkit';
import {
  ConnectedRouter,
  connectRouter,
  push,
  routerMiddleware,
} from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { UserManager } from 'oidc-client';
import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom/client';
import {
  CallbackComponent,
  loadUser,
  OidcProvider,
  reducer as oidcReducer,
  SignoutCallbackComponent,
} from 'redux-oidc';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import {
  CONFIG_FEATURE_KEY,
  configReducer,
  getConfiguration,
  ConfigState,
} from './app/config.slice';
import { createUserManager } from './access';
import App from './app/app';
import { INTAKE_FEATURE_KEY, intakeReducer } from './app/intake.slice';
import { environment } from './environments/environment';
import { assessReducer, ASSESS_FEATURE_KEY } from './app/assess.slice';

export const history = createBrowserHistory();
const store = configureStore({
  reducer: {
    router: connectRouter(history),
    user: oidcReducer,
    [CONFIG_FEATURE_KEY]: configReducer,
    [INTAKE_FEATURE_KEY]: intakeReducer,
    [ASSESS_FEATURE_KEY]: assessReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['redux-oidc/USER_FOUND'],
        ignoredPaths: ['user.user'],
      },
    }).concat(routerMiddleware(history));
  },
  devTools: true,
  // Optional Redux store enhancers
  enhancers: [],
});

store.dispatch(getConfiguration());
export type AppDispatch = typeof store.dispatch;

const Main: FunctionComponent = () => {
  const { accessServiceUrl } = useSelector(
    (state: { config: ConfigState }) => state.config
  );

  let userManager: UserManager = null;
  if (accessServiceUrl) {
    userManager = createUserManager({
      url: accessServiceUrl,
      realm: environment.access.realm,
      client_id: environment.access.client_id,
    });
    loadUser(store, userManager);
  }

  const dispatch = useDispatch<AppDispatch>();

  return userManager ? (
    <OidcProvider store={store} userManager={userManager}>
      <React.StrictMode>
        <ConnectedRouter history={history}>
          <Switch>
            <Route
              path="/auth/callback"
              render={({ history }) => (
                <CallbackComponent
                  userManager={userManager}
                  successCallback={() => dispatch(push('/admin/submissions'))}
                  errorCallback={() => dispatch(push('/'))}
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
                  successCallback={() => dispatch(push('/admin'))}
                  errorCallback={() => dispatch(push('/'))}
                >
                  <span>signing out...</span>
                </SignoutCallbackComponent>
              )}
            />
            <Route>
              <App userManager={userManager} />
            </Route>
          </Switch>
        </ConnectedRouter>
      </React.StrictMode>
    </OidcProvider>
  ) : (
    <GoAPageLoader />
  );
};
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <Main />
  </Provider>
);
