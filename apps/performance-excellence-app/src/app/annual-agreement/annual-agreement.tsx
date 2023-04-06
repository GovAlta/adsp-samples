import { GoACircularProgress } from '@abgov/react-components';
import { push } from 'connected-react-router';
import { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { AppDispatch } from '../../store';
import {
  getPerformanceAgreements,
  selectAgreementsEntities,
  selectIsReady,
  selectPALoading,
  selectPASaving,
  submitPerformanceAgreement,
  updatePerformanceAgreement,
} from '../pa.slice';
import { AgreementEdit } from './agreement-edit';

export const steps = [
  'none',
  'details',
  'performance',
  'development',
  'review',
];
export const AnnualAgreement: FunctionComponent = () => {
  const isReady = useSelector(selectIsReady);
  const loading = useSelector(selectPALoading);
  const saving = useSelector(selectPASaving);
  const entities = useSelector(selectAgreementsEntities);
  const { agreementId, step } = useParams<{
    agreementId: string;
    step: string;
  }>();
  const agreement = entities[agreementId];

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (isReady && !agreement) {
      dispatch(getPerformanceAgreements());
    }
  });
  const stepIdx = steps.indexOf(step);
  return (
    <main>
      <h2>Agreement for upcoming year</h2>
      <section>
        {loading === 'loading' && <GoACircularProgress size="large" />}
        {isReady && step && loading === 'loaded' && (
          <AgreementEdit
            agreement={agreement}
            step={stepIdx}
            isSaving={saving === 'saving'}
            onSelectStep={(step) =>
              dispatch(push(`/agreements/${agreementId}/${steps[step]}`))
            }
            onChange={(agreement) =>
              dispatch(updatePerformanceAgreement(agreement))
            }
            onBack={() =>
              dispatch(push(`/agreements/${agreementId}/${steps[stepIdx - 1]}`))
            }
            onNext={() =>
              dispatch(push(`/agreements/${agreementId}/${steps[stepIdx + 1]}`))
            }
            onSubmit={(agreement) =>
              dispatch(submitPerformanceAgreement(agreement))
            }
          />
        )}
      </section>
    </main>
  );
};
