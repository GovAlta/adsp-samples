import { configureStore } from '@reduxjs/toolkit';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { reducer as oidcReducer } from 'redux-oidc';
import { START_FEATURE_KEY, startReducer } from './app/start.slice';
import { PA_FEATURE_KEY, paReducer } from './app/pa.slice';

export const history = createBrowserHistory();
export const store = configureStore({
  reducer: {
    user: oidcReducer,
    router: connectRouter(history),
    [START_FEATURE_KEY]: startReducer,
    [PA_FEATURE_KEY]: paReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  // Optional Redux store enhancers
  enhancers: [],
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }).concat(routerMiddleware(history)),
});
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
