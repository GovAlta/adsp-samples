import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import axios from 'axios';
import { debounce } from 'lodash';
import { AppState } from '../store';
import { push } from 'connected-react-router';

export const PA_FEATURE_KEY = 'performance-agreement';

/*
 * Update these interfaces according to your requirements.
 */
export interface PerformanceAgreementItem {
  goals: string;
  targets: string;
  results: string;
}

export interface PerformanceAgreementEntity {
  id: string;
  status: FormStatus;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  supervisor?: string;
  businessUnit?: string;
  cycleStart: Date;
  cycleEnd: Date;
  performance?: PerformanceAgreementItem[];
  leadership?: PerformanceAgreementItem[];
  development?: PerformanceAgreementItem[];
}

type FormStatus = 'draft' | 'submitted' | 'locked';

export interface PerformanceAgreementState
  extends EntityState<PerformanceAgreementEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  savingStatus: 'changed' | 'saving' | 'no changes' | 'error';
  error: string;
}

export const paAdapter = createEntityAdapter<PerformanceAgreementEntity>();

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(fetchIntake())
 * }, [dispatch]);
 * ```
 */

interface Form {
  id: string;
  status: FormStatus;
  submitted: string;
  data?: Record<string, unknown>;
}
interface FormsResult {
  results: Form[];
}

export const getPerformanceAgreements = createAsyncThunk(
  'agreements/getPerformanceAgreements',
  async (_, { getState }) => {
    const state = getState() as AppState;
    const token = state.user.user?.access_token;
    const formServiceUrl =
      state.start.directory['urn:ads:platform:form-service'];

    const { data } = await axios.get<FormsResult>(
      `${formServiceUrl}/form/v1/forms`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          criteria: {
            definitionIdEquals: 'performance-agreement',
          },
        },
      }
    );

    const agreements: PerformanceAgreementEntity[] = [];
    for (const result of data.results) {
      if (result.status === 'locked') {
        continue;
      }

      const { data } = await axios.get<{ data: Record<string, unknown> }>(
        `${formServiceUrl}/form/v1/forms/${result.id}/data`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { cycleStart, cycleEnd, ...values } = data.data;

      agreements.push({
        id: result.id,
        status: result.status,
        ...values,
        cycleStart: cycleStart ? new Date(cycleStart as string) : null,
        cycleEnd: cycleEnd ? new Date(cycleEnd as string) : null,
      } as PerformanceAgreementEntity);
    }

    return agreements;
  }
);

export const createPerformanceAgreement = createAsyncThunk(
  'agreements/createPerformanceAgreements',
  async (_, { getState }) => {
    const state = getState() as AppState;
    const token = state.user.user?.access_token;
    const user = state.user.user.profile;
    const formServiceUrl =
      state.start.directory['urn:ads:platform:form-service'];

    const { data } = await axios.post<Form>(
      `${formServiceUrl}/form/v1/forms`,
      {
        definitionId: 'performance-agreement',
        applicant: { userId: user.sub },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { data: updatedData } = await axios.put<Form>(
      `${formServiceUrl}/form/v1/forms/${data.id}/data`,
      {
        data: {
          employeeId: '',
          department: '',
          supervisor: '',
          businessUnit: '',
          firstName: user.given_name,
          lastName: user.family_name,
          cycleStart: '2023-04-01',
          cycleEnd: '2024-03-31',
          performance: [],
          leadership: [],
          development: [],
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { cycleStart, cycleEnd, ...values } = updatedData.data;
    return {
      ...values,
      id: data.id,
      status: data.status,
      cycleStart: new Date(cycleStart as string),
      cycleEnd: new Date(cycleEnd as string),
    } as PerformanceAgreementEntity;
  }
);

const savePerformanceAgreement = createAsyncThunk(
  'agreements/savePerformanceAgreement',
  debounce(async (entity: PerformanceAgreementEntity, { getState }) => {
    const state = getState() as AppState;
    const token = state.user.user?.access_token;
    const formServiceUrl =
      state.start.directory['urn:ads:platform:form-service'];

    const { id: _id, status: _status, ...data } = entity;
    await axios.put(
      `${formServiceUrl}/form/v1/forms/${entity.id}/data`,
      {
        data,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }, 2000)
);

export const updatePerformanceAgreement = createAsyncThunk(
  'agreements/updatePerformanceAgreement',
  async (entity: PerformanceAgreementEntity, { dispatch }) => {
    dispatch(savePerformanceAgreement(entity));
    return entity;
  }
);

export const submitPerformanceAgreement = createAsyncThunk(
  'agreements/submitPerformanceAgreement',
  async (entity: PerformanceAgreementEntity, { dispatch, getState }) => {
    const state = getState() as AppState;
    const token = state.user.user?.access_token;
    const formServiceUrl =
      state.start.directory['urn:ads:platform:form-service'];

    const { data } = await axios.post<{
      submitted: string;
      status: FormStatus;
    }>(
      `${formServiceUrl}/form/v1/forms/${entity.id}`,
      {
        operation: 'submit',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    dispatch(push('/agreements'));

    return { ...entity, status: data.status } as PerformanceAgreementEntity;
  }
);

export const initialPAState: PerformanceAgreementState =
  paAdapter.getInitialState({
    loadingStatus: 'not loaded',
    savingStatus: 'no changes',
    error: null,
    section: 'none',
    selected: null,
  });

export const paSlice = createSlice({
  name: PA_FEATURE_KEY,
  initialState: initialPAState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPerformanceAgreements.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(getPerformanceAgreements.fulfilled, (state, action) => {
        paAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
      })
      .addCase(getPerformanceAgreements.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(createPerformanceAgreement.pending, (state) => {
        state.savingStatus = 'saving';
      })
      .addCase(createPerformanceAgreement.fulfilled, (state, action) => {
        paAdapter.setOne(state, action.payload);
        state.savingStatus = 'no changes';
      })
      .addCase(savePerformanceAgreement.pending, (state) => {
        state.savingStatus = 'saving';
      })
      .addCase(savePerformanceAgreement.rejected, (state) => {
        state.savingStatus = 'error';
      })
      .addCase(savePerformanceAgreement.fulfilled, (state) => {
        state.savingStatus = 'no changes';
      })
      .addCase(updatePerformanceAgreement.fulfilled, (state, action) => {
        paAdapter.setOne(state, action.payload);
        state.savingStatus = 'changed';
      })
      .addCase(submitPerformanceAgreement.fulfilled, (state, action) =>
        paAdapter.setOne(state, action.payload)
      );
  },
});

/*
 * Export reducer for store configuration.
 */
export const paReducer = paSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(intakeActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const paActions = paSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllIntake);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = paAdapter.getSelectors();

export const selectPAState = (rootState: unknown): PerformanceAgreementState =>
  rootState[PA_FEATURE_KEY];

export const selectAllAgreements = createSelector(selectPAState, selectAll);
export const selectAgreementsEntities = createSelector(
  selectPAState,
  selectEntities
);

export const selectCurrentAgreement = createSelector(
  selectAllAgreements,
  (agreements) => {
    return agreements.find(({ status }) => status === 'draft');
  }
);

export const selectIsReady = createSelector(
  (state: AppState) => state.user,
  (state: AppState) => state.start,
  (userState, startState) => !!(userState.user && startState.directory)
);

export const selectPALoading = createSelector(
  selectPAState,
  (state) => state.loadingStatus
);

export const selectPASaving = createSelector(
  selectPAState,
  (state) => state.savingStatus
);
