import {
  createAsyncThunk,
  createReducer,
  createSelector,
} from '@reduxjs/toolkit';
import { UserState } from 'redux-oidc';
import { ConfigState, CONFIG_FEATURE_KEY } from './config.slice';
import { FileInfo, FormInfo, OpportunityForm } from './types';

export const ASSESS_FEATURE_KEY = 'assess';

export interface AssessState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  loadingDetailsStatus: Record<
    string,
    'not loaded' | 'loading' | 'loaded' | 'error'
  >;
  loadingFileStatus: Record<
    string,
    'not loaded' | 'loading' | 'loaded' | 'error'
  >;
  error: string;
  submissions: Record<string, FormInfo>;
  submissionDetails: Record<string, OpportunityForm>;
  results: string[];
  page: {
    after: string;
    next: string;
  };
  files: Record<string, FileInfo>;
}

export const initialStartState: AssessState = {
  loadingStatus: 'not loaded',
  loadingDetailsStatus: {},
  loadingFileStatus: {},
  error: null,
  submissions: {},
  submissionDetails: {},
  results: [],
  page: {
    after: null,
    next: null,
  },
  files: {},
};

export type OpportunityFormInfo = OpportunityForm & FormInfo;

interface FormsResult {
  results: FormInfo[];
  page: {
    next: string;
    after: string;
  };
}

export const getSubmissions = createAsyncThunk(
  'assess/getSubmissions',
  async ({ after }: { after?: string }, { getState }) => {
    const state = getState() as {
      [CONFIG_FEATURE_KEY]: ConfigState;
      user: UserState;
    };
    const formServiceUrl = state[CONFIG_FEATURE_KEY].formServiceUrl;

    const criteria = {
      definitionIdEquals: 'opportunity-intake',
      // statusEquals: 'submitted',
    };
    const response = await fetch(
      `${formServiceUrl}/form/v1/forms?top=10&criteria=${JSON.stringify(
        criteria
      )}${after ? `&after=${after}` : ''}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${state.user.user.access_token}` },
      }
    );

    const results: FormsResult = await response.json();
    return results;
  }
);

export const getSubmissionDetails = createAsyncThunk(
  'assess/getSubmissionDetails',
  async ({ formId }: { formId: string }, { dispatch, getState }) => {
    const state = getState() as {
      [CONFIG_FEATURE_KEY]: ConfigState;
      user: UserState;
    };
    const formServiceUrl = state[CONFIG_FEATURE_KEY].formServiceUrl;

    const response = await fetch(
      `${formServiceUrl}/form/v1/forms/${formId}/data`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${state.user.user.access_token}` },
      }
    );

    const result: OpportunityForm = await response.json();
    for (const key of Object.keys(result.files)) {
      dispatch(getFile({ formId, fileId: key }));
    }

    return result;
  }
);

export const getFile = createAsyncThunk(
  'assess/getFile',
  async ({ fileId }: { formId: string; fileId: string }, { getState }) => {
    const state = getState() as {
      [CONFIG_FEATURE_KEY]: ConfigState;
      user: UserState;
    };
    const fileServiceUrl = state[CONFIG_FEATURE_KEY].fileServiceUrl;

    const response = await fetch(`${fileServiceUrl}/file/v1/files/${fileId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${state.user.user.access_token}` },
    });

    const file: FileInfo = await response.json();
    return file;
  }
);

export const downloadFile = createAsyncThunk(
  'assess/downloadFile',
  async (
    { fileId, filename }: { fileId: string; filename: string },
    { getState }
  ) => {
    const state = getState() as {
      [CONFIG_FEATURE_KEY]: ConfigState;
      user: UserState;
    };
    const fileServiceUrl = state[CONFIG_FEATURE_KEY].fileServiceUrl;

    const response = await fetch(
      `${fileServiceUrl}/file/v1/files/${fileId}/download`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${state.user.user.access_token}` },
      }
    );

    const fileBlob = await response.blob();
    const element = document.createElement('a');
    element.href = URL.createObjectURL(fileBlob);
    document.body.appendChild(element);
    element.download = filename;
    element.click();
    element.remove();
  }
);

export const assessReducer = createReducer(initialStartState, (builder) => {
  builder
    .addCase(getSubmissions.pending, (state) => {
      state.loadingStatus = 'loading';
    })
    .addCase(getSubmissions.fulfilled, (state, action) => {
      state.loadingStatus = 'loaded';
      state.results = action.payload.results.map((result) => result.id);
      state.submissions = action.payload.results.reduce(
        (submissions, result) => ({ ...submissions, [result.id]: result }),
        state.submissions
      );
      state.page = action.payload.page;
    })
    .addCase(getSubmissions.rejected, (state, action) => {
      state.loadingStatus = 'error';
      state.error = action.error.message;
    })
    .addCase(getSubmissionDetails.pending, (state, action) => {
      state.loadingDetailsStatus[action.meta.arg.formId] = 'loading';
    })
    .addCase(getSubmissionDetails.fulfilled, (state, action) => {
      state.loadingDetailsStatus[action.meta.arg.formId] = 'loaded';
      state.submissionDetails[action.meta.arg.formId] = action.payload;
    })
    .addCase(getSubmissionDetails.rejected, (state, action) => {
      state.loadingDetailsStatus[action.meta.arg.formId] = 'error';
      state.error = action.error.message;
    })
    .addCase(getFile.pending, (state, action) => {
      state.loadingFileStatus[action.meta.arg.fileId] = 'loading';
    })
    .addCase(getFile.fulfilled, (state, action) => {
      state.files[action.meta.arg.fileId] = action.payload;
      state.loadingFileStatus[action.meta.arg.fileId] = 'loaded';
    })
    .addCase(getFile.rejected, (state, action) => {
      state.loadingFileStatus[action.meta.arg.fileId] = 'error';
      state.error = action.error.message;
    });
});

export const submissionsSelector = createSelector(
  (state: { [ASSESS_FEATURE_KEY]: AssessState }) =>
    state[ASSESS_FEATURE_KEY].results,
  (state: { [ASSESS_FEATURE_KEY]: AssessState }) =>
    state[ASSESS_FEATURE_KEY].submissions,
  (results, submissions) =>
    results
      .map((result) => submissions[result])
      .filter((submission) => !!submission)
);
