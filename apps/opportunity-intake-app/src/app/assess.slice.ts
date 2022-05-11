import {
  createAsyncThunk,
  createReducer,
  createSelector,
} from '@reduxjs/toolkit';
import { UserState } from 'redux-oidc';
import { ConfigState, CONFIG_FEATURE_KEY } from './config.slice';
import { FormInfo, OpportunityForm } from './intake.slice';

export const ASSESS_FEATURE_KEY = 'assess';

export interface AssessState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  loadingDetailsStatus: Record<
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
}

export const initialStartState: AssessState = {
  loadingStatus: 'not loaded',
  loadingDetailsStatus: {},
  error: null,
  submissions: {},
  submissionDetails: {},
  results: [],
  page: {
    after: null,
    next: null,
  },
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
  async ({ formId }: { formId: string }, { getState }) => {
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
    return result;
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
