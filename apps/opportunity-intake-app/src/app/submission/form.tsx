import { GoAForm, GoAFormActions } from '@abgov/react-components/experimental';
import { push } from 'connected-react-router';
import { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { AppDispatch } from '../../main';
import { ActionButton } from '../components/actionButton';
import {
  IntakeState,
  INTAKE_FEATURE_KEY,
  updateFormData,
} from '../intake.slice';
import { OpportunityForm } from '../types';
import { DocumentsSection } from './form/documentsSection';
import { ExamplesSection } from './form/examplesSection';
import { GeneralSection } from './form/generalSection';

export const Form: FunctionComponent = () => {
  const { id, data, files } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].formData
  );

  const isSaving = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].savingStatus === 'saving'
  );

  const [localData, setLocalData] = useState(data);

  const dispatch = useDispatch<AppDispatch>();
  const dispatchUpdate = useDebouncedCallback(
    (formData: OpportunityForm) => dispatch(updateFormData({ formData })),
    2000
  );

  return (
    <GoAForm>
      <GeneralSection
        value={localData}
        onUpdate={(update) => {
          setLocalData(update);
          dispatchUpdate({ id, files, data: update });
        }}
      />

      <ExamplesSection
        value={localData}
        onUpdate={(update) => {
          setLocalData(update);
          dispatchUpdate({ id, files, data: update });
        }}
      />

      <DocumentsSection formId={id} files={files} />

      <GoAFormActions alignment="right">
        <ActionButton
          disabled={
            !(localData.ministry && localData.program && localData.description)
          }
          isExecuting={isSaving}
          onClick={() => {
            dispatch(
              updateFormData({
                formData: { id, files, data: localData },
                followUp: push('summary'),
              })
            );
          }}
        >
          Next
        </ActionButton>
      </GoAFormActions>
    </GoAForm>
  );
};
