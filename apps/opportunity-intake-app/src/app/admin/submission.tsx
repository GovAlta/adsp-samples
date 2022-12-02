import { GoABadge, GoAIconButton } from '@abgov/react-components/experimental';
import { DateTime } from 'luxon';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../main';
import { getSubmissionDetails } from '../assess.slice';
import { FormInfo } from '../types';
import { Details } from './details';

interface SubmissionItemProps {
  form: FormInfo;
}
export const Submission: FunctionComponent<SubmissionItemProps> = ({
  form,
}) => {
  const { id, created, submitted, applicant, status } = form;
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      <tr key={id}>
        <td>{DateTime.fromISO(created).toFormat('LLL dd')}</td>
        <td>{submitted && DateTime.fromISO(submitted).toFormat('LLL dd')}</td>
        <td>{applicant?.addressAs}</td>
        <td>
          <GoABadge
            type={status === 'submitted' ? 'success' : 'information'}
            content={status}
          />
        </td>
        <td>
          {status === 'submitted' && (
            <GoAIconButton
              type={showDetails ? 'eye-off' : 'eye'}
              onClick={() => {
                setShowDetails(!showDetails);
                dispatch(getSubmissionDetails({ formId: form.id }));
              }}
            />
          )}
        </td>
      </tr>
      {showDetails && (
        <tr>
          <td colSpan={5}>
            <Details form={form} />
          </td>
        </tr>
      )}
    </>
  );
};
