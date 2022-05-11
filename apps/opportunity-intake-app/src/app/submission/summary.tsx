import { GoAButton } from '@abgov/react-components';
import { GoAForm, GoAFormActions } from '@abgov/react-components/experimental';
import { push } from 'connected-react-router';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { ActionButton } from '../components/actionButton';
import {
  OpportunityForm,
  IntakeState,
  INTAKE_FEATURE_KEY,
  submitForm,
  updateFormData,
} from '../intake.slice';
import { DocumentsSection } from './form/documentsSection';
import { ExamplesSection } from './form/examplesSection';
import { GeneralSection } from './form/generalSection';

export const Summary = () => {
  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );

  const isSubmitting = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].savingStatus === 'saving'
  );

  const [localData, setLocalData] = useState(data);

  const dispatch = useDispatch();
  const dispatchUpdate = useDebouncedCallback(
    (formData: OpportunityForm) => dispatch(updateFormData({ formData })),
    2000
  );

  return (
    <GoAForm>
      <GeneralSection
        showSummary={true}
        value={localData}
        onUpdate={(update) => {
          setLocalData(update);
          dispatchUpdate({ id, files, data: update });
        }}
      />

      <ExamplesSection
        showSummary={true}
        value={localData}
        onUpdate={(update) => {
          setLocalData(update);
          dispatchUpdate({ id, files, data: update });
        }}
      />

      <DocumentsSection formId={id} showSummary={true} files={files} />

      <GoAFormActions alignment="right">
        <GoAButton
          buttonType="secondary"
          onClick={() => dispatch(push('form'))}
        >
          Back
        </GoAButton>
        <ActionButton
          disabled={
            !(localData.ministry && localData.program && localData.description)
          }
          isExecuting={isSubmitting}
          onClick={() => dispatch(submitForm({ formId: id }))}
        >
          Submit
        </ActionButton>
      </GoAFormActions>
    </GoAForm>
  );
};
