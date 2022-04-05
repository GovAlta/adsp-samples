import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';
import { environment } from '../environments/environment';

export const CONFIG_FEATURE_KEY = 'config';

export interface ConfigState {
  clientId: string;
  realm: string;
  accessServiceUrl: string;
  directoryServiceUrl: string;
  fileServiceUrl: string;
  pushServiceUrl: string;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string;
}

export const initialStartState: ConfigState = {
  clientId: null,
  realm: null,
  accessServiceUrl: null,
  directoryServiceUrl: null,
  fileServiceUrl: null,
  pushServiceUrl: null,
  loadingStatus: 'not loaded',
  error: null,
};

export const getConfiguration = createAsyncThunk(
  'config/getConfiguration',
  async () => {
    const config = {
      clientId: environment.access.client_id,
      realm: environment.access.realm,
      accessServiceUrl: environment.access.url,
      directoryServiceUrl: environment.directory.url,
    };
    try {
      const response = await fetch('/config/config.json');
      const { accessServiceUrl, directoryServiceUrl, clientId, realm } =
        await response.json();

      config.accessServiceUrl = accessServiceUrl;
      config.clientId = clientId;
      config.realm = realm;
      config.directoryServiceUrl = directoryServiceUrl;
    } catch (err) {
      // Fallback to environment if config.json retrieval fails.
    }
    
    const directoryResponse = await fetch(
      `${config.directoryServiceUrl}/api/directory/v2/namespaces/platform`
    );
    const entries = await directoryResponse.json();

    return {
      ...config,
      fileServiceUrl: entries.find(
        (entry) => entry.urn === 'urn:ads:platform:file-service'
      )?.url,
      pushServiceUrl: entries.find(
        (entry) => entry.urn === 'urn:ads:platform:push-service'
      )?.url,
    };
  }
);

export const startReducer = createReducer(initialStartState, (builder) => {
  builder
    .addCase(getConfiguration.pending, (state: ConfigState) => {
      state.loadingStatus = 'loading';
    })
    .addCase(getConfiguration.fulfilled, (state, action) => {
      state.loadingStatus = 'loaded';
      state.clientId = action.payload.clientId;
      state.realm = action.payload.realm;
      state.accessServiceUrl = action.payload.accessServiceUrl;
      state.directoryServiceUrl = action.payload.directoryServiceUrl;
      state.pushServiceUrl = action.payload.pushServiceUrl;
      state.fileServiceUrl = action.payload.fileServiceUrl;
    })
    .addCase(getConfiguration.rejected, (state: ConfigState, action) => {
      state.loadingStatus = 'error';
      state.error = action.error.message;
    });
});
