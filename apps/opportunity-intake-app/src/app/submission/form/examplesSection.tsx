import { GoAButton, GoAIconButton } from '@abgov/react-components';
import { FunctionComponent, useState } from 'react';
import { FormField } from '../../components/formField';
import { SectionProps } from './types';
import styles from './section.module.scss';

export const ExamplesSection: FunctionComponent<SectionProps> = ({
  showSummary,
  value,
  onUpdate,
}) => {
  const {
    examples = [
      {
        users: '',
        need: '',
        use: '',
      },
    ],
  } = value;
  const [showReadOnly, setShowReadOnly] = useState(showSummary);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h3>Provide examples of its use</h3>
        {showSummary && (
          <GoAIconButton
            icon="create"
            size="medium"
            onClick={() => {
              setShowReadOnly(!showReadOnly);
            }}
          />
        )}
      </div>
      {examples?.map(({ users = '', need = '', use = '' }, idx) => (
        <div key={idx}>
          <div className={styles.heading}>
            <h4>Example #{idx + 1}</h4>
            {!showReadOnly && (
              <GoAIconButton
                icon="trash"
                size="medium"
                onClick={() => {
                  const update = {
                    ...value,
                    examples: [...examples],
                  };
                  update.examples.splice(idx, 1);
                  onUpdate(update);
                }}
              />
            )}
          </div>
          <FormField
            label="Who are the users?"
            value={users}
            isReadOnly={showReadOnly}
          >
            <input
              id={`${idx}-users`}
              type="text"
              value={users}
              onChange={(e) => {
                const update = { ...value, examples: [...examples] };
                update.examples[idx] = {
                  ...examples[idx],
                  users: e.target.value,
                };
                onUpdate(update);
              }}
            />
          </FormField>
          <FormField
            label="What are they trying to do?"
            value={need}
            isReadOnly={showReadOnly}
          >
            <textarea
              id={`${idx}-need`}
              value={need}
              onChange={(e) => {
                const update = { ...value, examples: [...examples] };
                update.examples[idx] = {
                  ...examples[idx],
                  need: e.target.value,
                };
                onUpdate(update);
              }}
            />
          </FormField>
          <FormField
            label="How does the platform service help?"
            value={use}
            isReadOnly={showReadOnly}
          >
            <textarea
              id={`${idx}-use`}
              value={use}
              onChange={(e) => {
                const update = { ...value, examples: [...examples] };
                update.examples[idx] = {
                  ...examples[idx],
                  use: e.target.value,
                };
                onUpdate(update);
              }}
            />
          </FormField>
        </div>
      ))}

      {!showReadOnly && (
        <div>
          <GoAButton
            type="secondary"
            onClick={() => {
              onUpdate({
                ...value,
                examples: [...examples, { users: '', need: '', use: '' }],
              });
            }}
          >
            Add example
          </GoAButton>
        </div>
      )}
    </section>
  );
};
