import {
  GoADetails,
  GoAButton,
  GoAFormItem,
  GoATextArea,
  GoADivider,
} from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { PerformanceAgreementEntity } from '../pa.slice';

import styles from '../app.module.css';

interface DevelopmentPlan {
  agreement: PerformanceAgreementEntity;
  onChange: (agreement: PerformanceAgreementEntity) => void;
}

export const DevelopmentPlan: FunctionComponent<DevelopmentPlan> = ({
  agreement,
  onChange,
}) => {
  return (
    <form>
      <h3>Professional development</h3>
      <GoADetails heading="Identify key needs to support your learning and professional development">
        <p>
          specific skills, competencies, knowledge and experience required to
          develop in current and future roles
        </p>
      </GoADetails>
      <div>
        {agreement.development.map(({ goals, targets }, idx) => (
          <div key={idx}>
            <GoAFormItem label="Goals and actions">
              <GoATextArea
                onChange={(_, value) => {
                  const update = {
                    ...agreement,
                    development: [...agreement.development],
                  };
                  update.development[idx] = {
                    ...agreement.development[idx],
                    goals: value,
                  };

                  onChange(update);
                }}
                value={goals}
                name="goal"
              />
            </GoAFormItem>
            <GoAFormItem label="Targets and milestones">
              <GoATextArea
                onChange={(_, value) => {
                  const update = {
                    ...agreement,
                    development: [...agreement.development],
                  };
                  update.development[idx] = {
                    ...agreement.development[idx],
                    targets: value,
                  };

                  onChange(update);
                }}
                value={targets}
                name="targets"
              />
            </GoAFormItem>
            <div className={styles.actionBar}>
              <GoAButton
                type="tertiary"
                onClick={() => {
                  const update = {
                    ...agreement,
                    development: [...agreement.development],
                  };
                  update.development.splice(idx, 1);
                  onChange(update);
                }}
              >
                Delete item
              </GoAButton>
            </div>
            <GoADivider mt="m" mb="l" />
          </div>
        ))}
      </div>
      <div className={styles.actionBar}>
        <GoAButton
          type="secondary"
          onClick={() => {
            const update = {
              ...agreement,
              development: agreement.development
                ? [...agreement.development]
                : [],
            };
            update.development.push({ goals: '', targets: '', results: '' });
            onChange(update);
          }}
        >
          Add item
        </GoAButton>
      </div>
    </form>
  );
};
