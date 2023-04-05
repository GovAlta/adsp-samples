import {
  createAction,
  createAsyncThunk,
  createReducer,
  createSelector,
  PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';

export const START_FEATURE_KEY = 'start';

interface Configuration {
  accessUrl: string;
  directoryUrl: string;
}

export interface StartState {
  configuration: Configuration;
  directory: Record<string, string>;
  apiPublicMessage: string;
  apiPrivateMessage: string;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string;
}

interface DirectoryEntry {
  urn: string;
  url: string;
}
export const setConfiguration = createAsyncThunk(
  'start/setConfiguration',
  async (config: Configuration) => {
    const { data } = await axios.get<DirectoryEntry[]>(
      `${config.directoryUrl}/directory/v2/namespaces/platform/entries`
    );
    return data.reduce(
      (entries, entry) => ({ ...entries, [entry.urn]: entry.url }),
      {}
    );
  }
);

interface ApiResourceResponse {
  message: string;
}

// Redux thunk to get value from a public API.
export const fetchPublicResource = createAsyncThunk(
  'start/fetchPublicResource',
  async (_, _thunkAPI) => {
    const response = await fetch('/api/v1/public');
    return response.json();
  }
);

// Redux thunk to get value from a private API; access token is a required input.
export const fetchPrivateResource = createAsyncThunk(
  'start/fetchPrivateResource',
  async (token: string, _thunkAPI) => {
    const response = await fetch('/api/v1/private', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }
);

export const initialStartState: StartState = {
  configuration: null,
  directory: null,
  apiPublicMessage: null,
  apiPrivateMessage: null,
  loadingStatus: 'not loaded',
  error: null,
};

export const startReducer = createReducer(initialStartState, (builder) => {
  builder
    .addCase(setConfiguration.fulfilled, (state, action) => {
      state.configuration = action.meta.arg;
      state.directory = action.payload;
    })
    .addCase(fetchPublicResource.pending, (state: StartState) => {
      state.loadingStatus = 'loading';
    })
    .addCase(
      fetchPublicResource.fulfilled,
      (state: StartState, action: PayloadAction<ApiResourceResponse>) => {
        state.loadingStatus = 'loaded';
        state.apiPublicMessage = action.payload.message;
      }
    )
    .addCase(fetchPublicResource.rejected, (state: StartState, action) => {
      state.loadingStatus = 'error';
      state.error = action.error.message;
    })
    .addCase(fetchPrivateResource.pending, (state: StartState) => {
      state.loadingStatus = 'loading';
    })
    .addCase(
      fetchPrivateResource.fulfilled,
      (state: StartState, action: PayloadAction<ApiResourceResponse>) => {
        state.loadingStatus = 'loaded';
        state.apiPrivateMessage = action.payload.message;
      }
    )
    .addCase(fetchPrivateResource.rejected, (state: StartState, action) => {
      state.loadingStatus = 'error';
      state.error = action.error.message;
    });
});

export const publicResourceSelector = createSelector(
  (state: unknown): StartState => state[START_FEATURE_KEY],
  (start) => start.apiPublicMessage
);

export const privateResourceSelector = createSelector(
  (state: unknown): StartState => state[START_FEATURE_KEY],
  (start) => start.apiPrivateMessage
);
