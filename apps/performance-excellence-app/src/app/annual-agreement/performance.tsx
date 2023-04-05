import {
  GoAButton,
  GoADetails,
  GoADivider,
  GoAFormItem,
  GoATextArea,
} from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { PerformanceAgreementEntity } from '../pa.slice';

import styles from '../app.module.css';

interface Performance {
  agreement: PerformanceAgreementEntity;
  onChange: (agreement: PerformanceAgreementEntity) => void;
}

export const Performance: FunctionComponent<Performance> = ({
  agreement,
  onChange,
}) => {
  return (
    <form>
      <h3>Performance</h3>
      <GoADetails heading="Goals, actions and results achieved">
        <p>
          Employees should identify at least three work-related priority goals
          aligned with department and business operational plans.
        </p>
      </GoADetails>
      <div>
        {agreement.performance.map(({ goals, targets }, idx) => (
          <div key={idx}>
            <GoAFormItem label="Goals and actions">
              <GoATextArea
                onChange={(_, value) => {
                  const update = {
                    ...agreement,
                    performance: [...agreement.performance],
                  };
                  update.performance[idx] = {
                    ...agreement.performance[idx],
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
                    performance: [...agreement.performance],
                  };
                  update.performance[idx] = {
                    ...agreement.performance[idx],
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
                    performance: [...agreement.performance],
                  };
                  update.performance.splice(idx, 1);
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
              performance: agreement.performance
                ? [...agreement.performance]
                : [],
            };
            update.performance.push({ goals: '', targets: '', results: '' });
            onChange(update);
          }}
        >
          Add item
        </GoAButton>
      </div>
      <h3>Leadership</h3>
      <GoADetails heading="Employee engagement in an inclusive workplace">
        <p>
          Supporting engagement initiatives to build a positive workplace
          culture and influence the ability to recruit, retain, and engage
          employees throughout the Ministry, and in a way that is inclusive of
          all Albertans.
        </p>
      </GoADetails>
      <div>
        {agreement.leadership?.map(({ goals, targets }, idx) => (
          <div key={idx}>
            <GoAFormItem label="Goals and actions">
              <GoATextArea
                onChange={(_, value) => {
                  const update = {
                    ...agreement,
                    leadership: [...agreement.leadership],
                  };
                  update.leadership[idx] = {
                    ...agreement.leadership[idx],
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
                    leadership: [...agreement.leadership],
                  };
                  update.leadership[idx] = {
                    ...agreement.leadership[idx],
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
                    leadership: [...agreement.leadership],
                  };
                  update.leadership.splice(idx, 1);
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
              leadership: agreement.leadership ? [...agreement.leadership] : [],
            };
            update.leadership.push({ goals: '', targets: '', results: '' });
            onChange(update);
          }}
        >
          Add item
        </GoAButton>
      </div>
    </form>
  );
};
