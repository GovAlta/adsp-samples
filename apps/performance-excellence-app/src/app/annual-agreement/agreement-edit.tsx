import {
  GoAButton,
  GoAFormStep,
  GoAFormStepper,
} from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { PerformanceAgreementEntity } from '../pa.slice';
import { AgreementDetails } from './agreement-details';
import { Performance } from './performance';
import { DevelopmentPlan } from './development-plan';
import styles from '../app.module.css';
import { Review } from './review';

interface AgreementEdit {
  step: number;
  agreement: PerformanceAgreementEntity;
  onSelectStep: (step: number) => void;
  onChange: (agreement: PerformanceAgreementEntity) => void;
  onBack: () => void;
  onNext: () => void;
}
export const AgreementEdit: FunctionComponent<AgreementEdit> = ({
  step,
  agreement,
  onSelectStep,
  onChange,
  onBack,
  onNext,
}) => {
  const isDetailsComplete = !!(
    agreement.cycleStart &&
    agreement.cycleEnd &&
    agreement.department &&
    agreement.businessUnit &&
    agreement.supervisor &&
    agreement.firstName &&
    agreement.lastName
  );

  const isPerformanceComplete = !!(
    agreement.performance?.length &&
    agreement.leadership?.length &&
    !agreement.performance.find(({ goals, targets }) => !goals || !targets) &&
    !agreement.leadership.find(({ goals, targets }) => !goals || !targets)
  );

  const isPerformancePartial =
    !isPerformanceComplete &&
    (agreement.performance?.length || agreement.leadership?.length);

  const isDevelopmentComplete = !!(
    agreement.development?.length &&
    !agreement.development.find(({ goals, targets }) => !goals || !targets)
  );

  const isDevelopmentPartial =
    !isDevelopmentComplete && agreement.development?.length;

  return (
    <>
      <GoAFormStepper
        testId="agreement-stepper"
        step={-1}
        onChange={onSelectStep}
      >
        <GoAFormStep
          text="Employee details"
          status={isDetailsComplete ? 'complete' : 'incomplete'}
        />
        <GoAFormStep
          text="Performance"
          status={
            isPerformanceComplete
              ? 'complete'
              : isPerformancePartial
              ? 'incomplete'
              : null
          }
        />
        <GoAFormStep
          text="Development plan"
          status={
            isDevelopmentComplete
              ? 'complete'
              : isDevelopmentPartial
              ? 'incomplete'
              : null
          }
        />
        <GoAFormStep text="Review" />
      </GoAFormStepper>
      <div>
        {step === 1 && (
          <AgreementDetails agreement={agreement} onChange={onChange} />
        )}
        {step === 2 && (
          <Performance agreement={agreement} onChange={onChange} />
        )}
        {step === 3 && (
          <DevelopmentPlan agreement={agreement} onChange={onChange} />
        )}
        {step === 4 && (
          <Review
            agreement={agreement}
            isDetailsComplete={isDetailsComplete}
            isPerformanceComplete={isPerformanceComplete}
            isDevelopmentComplete={isDevelopmentComplete}
          />
        )}
      </div>
      <div className={styles.actionBar}>
        {step > 1 && (
          <GoAButton type="secondary" onClick={onBack}>
            Back
          </GoAButton>
        )}
        {step < 4 && (
          <GoAButton type="primary" onClick={onNext}>
            Next
          </GoAButton>
        )}
        {step === 4 && (
          <GoAButton
            type="submit"
            disabled={
              !isDetailsComplete ||
              !isDevelopmentComplete ||
              !isPerformanceComplete
            }
          >
            Submit
          </GoAButton>
        )}
      </div>
    </>
  );
};
