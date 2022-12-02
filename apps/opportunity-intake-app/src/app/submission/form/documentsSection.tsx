import { GoAButton, GoAElementLoader } from '@abgov/react-components';
import { GoAIconButton } from '@abgov/react-components/experimental';
import { FunctionComponent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../main';
import { ActionButton } from '../../components/actionButton';
import {
  deleteFormFile,
  IntakeState,
  INTAKE_FEATURE_KEY,
  uploadFormFile,
} from '../../intake.slice';
import styles from './section.module.scss';

interface DocumentsSectionProps {
  showSummary?: boolean;
  formId: string;
  files: Record<string, string>;
}

interface FileItemProps {
  showReadOnly?: boolean;
  formId: string;
  fileId: string;
}

const FileItem: FunctionComponent<FileItemProps> = ({
  formId,
  fileId,
  showReadOnly,
}) => {
  const { filename = '', isLoading } = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) => ({
      filename: state[INTAKE_FEATURE_KEY].files?.[fileId]?.filename,
      isLoading:
        state[INTAKE_FEATURE_KEY].loadingFileStatus[fileId] === 'loading',
    })
  );
  const dispatch = useDispatch<AppDispatch>();
  return (
    <li>
      {!isLoading ? (
        <span>
          {filename}
          {!showReadOnly && (
            <GoAIconButton
              type="trash"
              size="medium"
              onClick={() => dispatch(deleteFormFile({ formId, fileId }))}
            />
          )}
        </span>
      ) : (
        <GoAElementLoader
          visible={true}
          baseColour="#fff"
          spinnerColour="#0070c4"
        />
      )}
    </li>
  );
};

export const DocumentsSection: FunctionComponent<DocumentsSectionProps> = ({
  showSummary,
  formId,
  files,
}) => {
  const isUploading = useSelector(
    (state: { [INTAKE_FEATURE_KEY]: IntakeState }) =>
      state[INTAKE_FEATURE_KEY].uploadingFileStatus === 'uploading'
  );
  const [showReadOnly, setShowReadOnly] = useState(showSummary);
  const [selectedFile, setSelectedFile] = useState<File>();
  const dispatch = useDispatch<AppDispatch>();
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h3>Supporting documents</h3>
        {showSummary && (
          <GoAIconButton
            type="create"
            size="medium"
            onClick={() => {
              setShowReadOnly(!showReadOnly);
            }}
          />
        )}
      </div>
      {!showReadOnly && (
        <div className={styles.fileUpload}>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <ActionButton
            isExecuting={isUploading}
            buttonType="secondary"
            onClick={() =>
              dispatch(uploadFormFile({ formId, file: selectedFile }))
            }
          >
            Upload
          </ActionButton>
        </div>
      )}
      <ul>
        {Object.keys(files).map((id) => (
          <FileItem
            key={id}
            formId={formId}
            fileId={id}
            showReadOnly={showReadOnly}
          />
        ))}
      </ul>
    </section>
  );
};
