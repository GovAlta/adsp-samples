import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { FileInfo, FormInfo, OpportunityForm } from './types';

export const INTAKE_FEATURE_KEY = 'intake';

export interface IntakeState {
  loadingFormStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  loadingDataStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  loadingFileStatus: Record<
    string,
    'not loaded' | 'loading' | 'loaded' | 'error'
  >;
  sendCodeStatus: 'not sent' | 'sending' | 'sent' | 'error';
  savingStatus: 'not saved' | 'saving' | 'saved' | 'error';
  uploadingFileStatus: 'not uploaded' | 'uploading' | 'uploaded' | 'error';
  error: string;
  form: FormInfo;
  formData: OpportunityForm;
  files: Record<string, FileInfo>;
}

const initialIntakeState: IntakeState = {
  loadingFormStatus: 'not loaded',
  loadingDataStatus: 'not loaded',
  loadingFileStatus: {},
  sendCodeStatus: 'not sent',
  savingStatus: 'not saved',
  uploadingFileStatus: 'not uploaded',
  error: null,
  form: null,
  formData: null,
  files: {},
};

export const createForm = createAsyncThunk(
  'intake/createForm',
  async (
    { email, phone, name }: { email: string; phone: string; name: string },
    { dispatch }
  ) => {
    const response = await fetch('/api/v1/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, name }),
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
  async (
    { formId, code = '' }: { formId: string; code?: string },
    { dispatch }
  ) => {
    const response = await fetch(
      `/api/v1/opportunities/${formId}/data?code=${code}`,
      {
        method: 'GET',
      }
    );

    const formData: OpportunityForm = await response.json();
    for (const key of Object.keys(formData.files)) {
      dispatch(getFormFile({ formId, fileId: key }));
    }

    return formData;
  }
);

export const getFormFile = createAsyncThunk(
  'intake/getFormFile',
  async ({ formId, fileId }: { formId: string; fileId: string }) => {
    const response = await fetch(
      `/api/v1/opportunities/${formId}/files/${fileId}`,
      {
        method: 'GET',
      }
    );
    const file: FileInfo = await response.json();
    return file;
  }
);

export const uploadFormFile = createAsyncThunk(
  'intake/uploadFormFile',
  async ({ formId, file }: { formId: string; file: File }) => {
    const formData = new FormData();
    formData.append('type', 'opportunity-supporting-files');
    formData.append('recordId', formId);
    formData.append('file', file);

    const response = await fetch(`/api/v1/opportunities/${formId}/files`, {
      method: 'POST',
      body: formData,
    });
    const fileInfo: FileInfo = await response.json();
    return fileInfo;
  }
);

export const deleteFormFile = createAsyncThunk(
  'intake/deleteFormFile',
  async ({ formId, fileId }: { formId: string; fileId: string }) => {
    const response = await fetch(
      `/api/v1/opportunities/${formId}/files/${fileId}`,
      {
        method: 'DELETE',
      }
    );
    const file = await response.json();
    return file;
  }
);

export const updateFormData = createAsyncThunk(
  'intake/updateFormData',
  async (
    { formData, followUp }: { formData: OpportunityForm; followUp?: AnyAction },
    { dispatch }
  ) => {
    const response = await fetch(`/api/v1/opportunities/${formData.id}/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData.data, files: formData.files }),
    });

    if (response.status === 401) {
      dispatch(push(`/submission/${formData.id}`));
      return null;
    } else {
      const updatedData: OpportunityForm = await response.json();

      if (followUp) {
        dispatch(followUp);
      }

      return updatedData;
    }
  }
);

export const submitForm = createAsyncThunk(
  'intake/submitForm',
  async ({ formId }: { formId: string }, { dispatch }) => {
    const response = await fetch(`/api/v1/opportunities/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'submit' }),
    });

    if (response.status === 401) {
      dispatch(push(`/submission/${formId}`));
      return null;
    } else {
      const form: FormInfo = await response.json();
      return form;
    }
  }
);

export const intakeSlice = createSlice({
  name: INTAKE_FEATURE_KEY,
  initialState: initialIntakeState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createForm.pending, (state) => {
        state.loadingFormStatus = 'loading';
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.form = action.payload;
        state.loadingFormStatus = 'loaded';
      })
      .addCase(createForm.rejected, (state, action) => {
        state.loadingFormStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(getForm.pending, (state) => {
        state.loadingFormStatus = 'loading';
      })
      .addCase(getForm.fulfilled, (state, action) => {
        state.loadingFormStatus = 'loaded';
        state.form = action.payload;
      })
      .addCase(getForm.rejected, (state, action) => {
        state.loadingFormStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(sendCode.pending, (state) => {
        state.sendCodeStatus = 'sending';
        state.error = null;
      })
      .addCase(sendCode.fulfilled, (state) => {
        state.sendCodeStatus = 'sent';
      })
      .addCase(sendCode.rejected, (state, action) => {
        state.sendCodeStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(getFormData.pending, (state) => {
        state.loadingDataStatus = 'loading';
      })
      .addCase(getFormData.fulfilled, (state, action) => {
        state.formData = action.payload;
        state.loadingDataStatus = 'loaded';
      })
      .addCase(getFormData.rejected, (state, action) => {
        state.loadingDataStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(getFormFile.pending, (state, action) => {
        state.loadingFileStatus[action.meta.arg.fileId] = 'loading';
      })
      .addCase(getFormFile.fulfilled, (state, action) => {
        state.files[action.meta.arg.fileId] = action.payload;
        state.loadingFileStatus[action.meta.arg.fileId] = 'loaded';
      })
      .addCase(getFormFile.rejected, (state, action) => {
        state.loadingFileStatus[action.meta.arg.fileId] = 'error';
        state.error = action.error.message;
      })
      .addCase(uploadFormFile.pending, (state) => {
        state.uploadingFileStatus = 'uploading';
      })
      .addCase(uploadFormFile.fulfilled, (state, action) => {
        state.files[action.payload.id] = action.payload;
        state.uploadingFileStatus = 'uploaded';
        state.loadingFileStatus[action.payload.id] = 'loaded';
        state.formData.files[action.payload.id] = action.payload.urn;
      })
      .addCase(uploadFormFile.rejected, (state, action) => {
        state.uploadingFileStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(deleteFormFile.fulfilled, (state, action) => {
        delete state.files[action.meta.arg.fileId];
        delete state.loadingFileStatus[action.meta.arg.fileId];
        delete state.formData.files[action.meta.arg.fileId];
      })
      .addCase(deleteFormFile.rejected, (state, action) => {
        state.uploadingFileStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(updateFormData.pending, (state) => {
        state.savingStatus = 'saving';
      })
      .addCase(updateFormData.fulfilled, (state, action) => {
        state.savingStatus = 'saved';
        state.formData = action.payload;
      })
      .addCase(updateFormData.rejected, (state, action) => {
        state.savingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(submitForm.pending, (state) => {
        state.savingStatus = 'saving';
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.savingStatus = 'saved';
        if (action.payload) {
          state.form = action.payload;
        }
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.savingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

export const intakeReducer = intakeSlice.reducer;
