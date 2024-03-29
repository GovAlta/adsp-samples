import { createAsyncThunk, createReducer } from '@reduxjs/toolkit';
import { environment } from '../environments/environment';

export const CONFIG_FEATURE_KEY = 'config';

export interface ConfigState {
  clientId: string;
  realm: string;
  accessServiceUrl: string;
  directoryServiceUrl: string;
  fileServiceUrl: string;
  formServiceUrl: string;
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string;
}

export const initialStartState: ConfigState = {
  clientId: null,
  realm: null,
  accessServiceUrl: null,
  directoryServiceUrl: null,
  fileServiceUrl: null,
  formServiceUrl: null,
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
      const { access, directory } = await response.json();

      config.accessServiceUrl = access.url;
      config.clientId = access.client_id;
      config.realm = access.realm;
      config.directoryServiceUrl = directory.url;
    } catch (err) {
      // Fallback to environment if config.json retrieval fails.
    }

    const directoryResponse = await fetch(
      `${config.directoryServiceUrl}/directory/v2/namespaces/platform/entries`
    );
    const entries = await directoryResponse.json();

    return {
      ...config,
      fileServiceUrl: entries.find(
        (entry) => entry.urn === 'urn:ads:platform:file-service'
      )?.url,
      formServiceUrl: entries.find(
        (entry) => entry.urn === 'urn:ads:platform:form-service'
      )?.url,
    };
  }
);

export const configReducer = createReducer(initialStartState, (builder) => {
  builder
    .addCase(getConfiguration.pending, (state) => {
      state.loadingStatus = 'loading';
    })
    .addCase(getConfiguration.fulfilled, (state, action) => {
      state.loadingStatus = 'loaded';
      state.clientId = action.payload.clientId;
      state.realm = action.payload.realm;
      state.accessServiceUrl = action.payload.accessServiceUrl;
      state.directoryServiceUrl = action.payload.directoryServiceUrl;
      state.fileServiceUrl = action.payload.fileServiceUrl;
      state.formServiceUrl = action.payload.formServiceUrl;
    })
    .addCase(getConfiguration.rejected, (state, action) => {
      state.loadingStatus = 'error';
      state.error = action.error.message;
    });
});
