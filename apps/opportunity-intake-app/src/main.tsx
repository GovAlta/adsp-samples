import {
  ConnectedRouter,
  connectRouter,
  routerMiddleware,
} from 'connected-react-router';
import { createBrowserHistory } from 'history';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { reducer as oidcReducer } from 'redux-oidc';
import { configureStore } from '@reduxjs/toolkit';

import {
  CONFIG_FEATURE_KEY,
  configReducer,
  getConfiguration,
} from './app/config.slice';
import { INTAKE_FEATURE_KEY, intakeReducer } from './app/intake.slice';
import App from './app/app';

export const history = createBrowserHistory();
const store = configureStore({
  reducer: {
    router: connectRouter(history),
    user: oidcReducer,
    [CONFIG_FEATURE_KEY]: configReducer,
    [INTAKE_FEATURE_KEY]: intakeReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return [
      ...getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
          ignoredPaths: [],
        },
      }),
      routerMiddleware(history),
    ];
  },
  devTools: true,
  // Optional Redux store enhancers
  enhancers: [],
});

store.dispatch(getConfiguration());

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
