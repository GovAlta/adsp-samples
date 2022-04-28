import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
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

const store = configureStore({
  reducer: {
    user: oidcReducer,
    [CONFIG_FEATURE_KEY]: configReducer,
    [INTAKE_FEATURE_KEY]: intakeReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredPaths: [],
      },
    });
  },
  devTools: true,
  // Optional Redux store enhancers
  enhancers: [],
});

store.dispatch(getConfiguration());

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
