import { FunctionComponent } from 'react';
import styles from './section.module.scss';

interface DocumentsSectionProps {
  showSummary?: boolean;
  files: Record<string, string>;
}

export const DocumentsSection: FunctionComponent<DocumentsSectionProps> = ({
  files,
}) => {
  return (
    <section className={styles.section}>
      <h3>Supporting documents</h3>
      <input type="file" />
      <ul>
        {Object.entries(files).map(([key, file]) => (
          <div key={key}></div>
        ))}
      </ul>
    </section>
  );
};
