import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { push } from 'connected-react-router';

export const INTAKE_FEATURE_KEY = 'intake';

interface FormInfo {
  id: string;
  status: 'draft' | 'submitted';
}

interface OpportunityFormData {
  ministry: string;
  program: string;
  description: string;
}

export interface FormData {
  id: string;
  data: OpportunityFormData;
  files: Record<string, string>;
}

export interface IntakeState {
  loadingFormStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  loadingDataStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  sendCodeStatus: 'not sent' | 'sending' | 'sent' | 'error';
  savingStatus: 'not saved' | 'saving' | 'saved' | 'error';
  error: string;
  form: FormInfo;
  formData: FormData;
}

const initialIntakeState: IntakeState = {
  loadingFormStatus: 'not loaded',
  loadingDataStatus: 'not loaded',
  sendCodeStatus: 'not sent',
  savingStatus: 'not saved',
  error: null,
  form: null,
  formData: null,
};

export const createForm = createAsyncThunk(
  'intake/createForm',
  async ({ email, name }: { email: string; name: string }, { dispatch }) => {
    const response = await fetch('/api/v1/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    const form: FormInfo = await response.json();
    dispatch(push(`/submission/${form.id}`));
    return form;
  }
);

export const getForm = createAsyncThunk(
  'intake/getForm',
  async ({ formId }: { formId: string }) => {
    const response = await fetch(`/api/v1/opportunities/${formId}`, {
      method: 'GET',
    });

    const form: FormInfo =
      response.status === 200 ? await response.json() : null;
    return form;
  }
);

export const sendCode = createAsyncThunk(
  'intake/sendCode',
  async ({ formId }: { formId: string; code?: string }) => {
    const response = await fetch(`/api/v1/opportunities/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'send-code' }),
    });

    const form: FormInfo = await response.json();
    return form;
  }
);

export const getFormData = createAsyncThunk(
  'intake/getFormData',
  async ({ formId, code = '' }: { formId: string; code?: string }) => {
    const response = await fetch(
      `/api/v1/opportunities/${formId}/data?code=${code}`,
      {
        method: 'GET',
      }
    );

    const formData: FormData = await response.json();
    return formData;
  }
);

export const updateFormData = createAsyncThunk(
  'intake/updateFormData',
  async ({ formData }: { formData: FormData }) => {
    const response = await fetch(`/api/v1/opportunities/${formData.id}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData.data, files: formData.files }),
    });

    const updatedData: FormData = await response.json();
    return updatedData;
  }
);

export const submitForm = createAsyncThunk(
  'intake/submitForm',
  async ({ formId }: { formId: string }) => {
    const response = await fetch(`/api/v1/opportunities/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'submit' }),
    });

    const form: FormInfo = await response.json();
    return form;
  }
);

export const intakeSlice = createSlice({
  name: INTAKE_FEATURE_KEY,
  initialState: initialIntakeState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createForm.pending, (state: IntakeState) => {
        state.loadingFormStatus = 'loading';
      })
      .addCase(createForm.fulfilled, (state: IntakeState, action) => {
        state.form = action.payload;
        state.loadingFormStatus = 'loaded';
      })
      .addCase(createForm.rejected, (state: IntakeState, action) => {
        state.loadingFormStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(getForm.pending, (state: IntakeState) => {
        state.loadingFormStatus = 'loading';
      })
      .addCase(getForm.fulfilled, (state: IntakeState, action) => {
        state.loadingFormStatus = 'loaded';
        state.form = action.payload;
      })
      .addCase(getForm.rejected, (state: IntakeState, action) => {
        state.loadingFormStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(sendCode.pending, (state: IntakeState) => {
        state.sendCodeStatus = 'sending';
        state.error = null;
      })
      .addCase(sendCode.fulfilled, (state: IntakeState) => {
        state.sendCodeStatus = 'sent';
      })
      .addCase(sendCode.rejected, (state: IntakeState, action) => {
        state.sendCodeStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(getFormData.pending, (state: IntakeState) => {
        state.loadingDataStatus = 'loading';
      })
      .addCase(getFormData.fulfilled, (state: IntakeState, action) => {
        state.formData = action.payload;
        state.loadingDataStatus = 'loaded';
      })
      .addCase(getFormData.rejected, (state: IntakeState, action) => {
        state.loadingDataStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(updateFormData.pending, (state: IntakeState) => {
        state.savingStatus = 'saving';
      })
      .addCase(updateFormData.fulfilled, (state: IntakeState, action) => {
        state.savingStatus = 'saved';
        state.formData = action.payload;
      })
      .addCase(updateFormData.rejected, (state: IntakeState, action) => {
        state.savingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(submitForm.pending, (state: IntakeState) => {
        state.savingStatus = 'saving';
      })
      .addCase(submitForm.fulfilled, (state: IntakeState, action) => {
        state.savingStatus = 'saved';
        state.form = action.payload;
      })
      .addCase(submitForm.rejected, (state: IntakeState, action) => {
        state.savingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

export const intakeReducer = intakeSlice.reducer;
