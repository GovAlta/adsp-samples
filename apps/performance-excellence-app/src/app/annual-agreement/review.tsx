import { FunctionComponent } from 'react';
import { PerformanceAgreementEntity } from '../pa.slice';
import { GoAContainer, GoADivider, GoAFormItem } from '@abgov/react-components';

interface ReviewProps {
  agreement: PerformanceAgreementEntity;
  isDetailsComplete: boolean;
  isPerformanceComplete: boolean;
  isDevelopmentComplete: boolean;
}
export const Review: FunctionComponent<ReviewProps> = ({
  agreement,
  isDetailsComplete,
  isPerformanceComplete,
  isDevelopmentComplete,
}) => {
  return (
    <div>
      <h3>Review and submit your agreement</h3>
      <p>
        If unforeseen circumstances or issues arise that could affect my ability
        to deliver on these accountabilities, I will initiate the process of
        redefining them with with my supervisor.
      </p>
      <GoAContainer accent="thin" type={isDetailsComplete ? 'success' : 'info'}>
        <h3>Employee details</h3>
        <div>
          <div>
            <GoAFormItem label="Performance cycle start">
              <span>{agreement.cycleStart.getFullYear().toString()}</span>
            </GoAFormItem>
            <GoAFormItem label="Performance cycle end">
              <span>{agreement.cycleEnd.getFullYear().toString()}</span>
            </GoAFormItem>
          </div>
          <div>
            <GoAFormItem label="First name">
              <span>{agreement.firstName}</span>
            </GoAFormItem>
            <GoAFormItem label="Last name">
              <span>{agreement.lastName}</span>
            </GoAFormItem>
          </div>
          <div>
            <GoAFormItem label="Employee ID">
              <span>{agreement.employeeId}</span>
            </GoAFormItem>
            <GoAFormItem label="Business unit">
              <span>{agreement.businessUnit}</span>
            </GoAFormItem>
            <GoAFormItem label="Department">
              <span>{agreement.department}</span>
            </GoAFormItem>
            <GoAFormItem label="Supervisor">
              <span>{agreement.supervisor}</span>
            </GoAFormItem>
          </div>
        </div>
      </GoAContainer>
      <GoAContainer
        accent="thin"
        type={isPerformanceComplete ? 'success' : 'info'}
      >
        <h3>Performance</h3>
        <div>
          {agreement.performance?.map(({ goals, targets }, idx) => (
            <div key={idx}>
              <GoAFormItem label="Goals and actions">
                <span>{goals}</span>
              </GoAFormItem>
              <GoAFormItem label="Targets and milestones">
                <span>{targets}</span>
              </GoAFormItem>
              <GoADivider mt="m" mb="l" />
            </div>
          ))}
        </div>
        <h3>Leadership</h3>
        <div>
          {agreement.leadership?.map(({ goals, targets }, idx) => (
            <div key={idx}>
              <GoAFormItem label="Goals and actions">
                <span>{goals}</span>
              </GoAFormItem>
              <GoAFormItem label="Targets and milestones">
                <span>{targets}</span>
              </GoAFormItem>
              <GoADivider mt="m" mb="l" />
            </div>
          ))}
        </div>
      </GoAContainer>
      <GoAContainer
        accent="thin"
        type={isDevelopmentComplete ? 'success' : 'info'}
      >
        <h3>Development plan</h3>
        <div>
          {agreement.development?.map(({ goals, targets }, idx) => (
            <div key={idx}>
              <GoAFormItem label="Goals and actions">
                <span>{goals}</span>
              </GoAFormItem>
              <GoAFormItem label="Targets and milestones">
                <span>{targets}</span>
              </GoAFormItem>
              <GoADivider mt="m" mb="l" />
            </div>
          ))}
        </div>
      </GoAContainer>
    </div>
  );
};
