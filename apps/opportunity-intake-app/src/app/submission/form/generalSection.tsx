import { GoAIconButton } from '@abgov/react-components';
import { FunctionComponent, useState } from 'react';
import { FormField } from '../../components/formField';
import { SectionProps } from './types';
import styles from './section.module.scss';

export const GeneralSection: FunctionComponent<SectionProps> = ({
  showSummary,
  value,
  onUpdate,
}) => {
  const { ministry = '', program = '', team = '', description = '' } = value;
  const [showReadOnly, setShowReadOnly] = useState(showSummary);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h3>General information</h3>
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
      <FormField
        label="Ministry"
        value={ministry}
        isReadOnly={showReadOnly}
        isRequired={true}
      >
        <input
          id="ministry"
          type="text"
          value={ministry}
          onChange={(e) => {
            const update = { ...value, ministry: e.target.value };
            onUpdate(update);
          }}
        />
      </FormField>
      <FormField
        label="Program"
        value={program}
        isReadOnly={showReadOnly}
        isRequired={true}
      >
        <input
          id="program"
          type="text"
          value={program}
          onChange={(e) => {
            const update = { ...value, program: e.target.value };
            onUpdate(update);
          }}
        />
      </FormField>
      <FormField label="Team" value={team} isReadOnly={showReadOnly}>
        <input
          id="team"
          type="text"
          value={team}
          onChange={(e) => {
            const update = { ...value, team: e.target.value };
            onUpdate(update);
          }}
        />
      </FormField>
      <FormField
        label="Describe your idea"
        value={description}
        isReadOnly={showReadOnly}
        isRequired={true}
      >
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            const update = { ...value, description: e.target.value };
            onUpdate(update);
          }}
        />
      </FormField>
    </section>
  );
};
