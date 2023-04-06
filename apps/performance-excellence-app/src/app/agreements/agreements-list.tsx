import {
  GoAButton,
  GoACircularProgress,
  GoATable,
} from '@abgov/react-components';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPerformanceAgreement,
  selectAllAgreements,
  selectCurrentAgreement,
  selectPALoading,
  selectPASaving,
} from '../pa.slice';
import { AppDispatch } from '../../store';

export const AgreementsList = () => {
  const agreements = useSelector(selectAllAgreements);
  const current = useSelector(selectCurrentAgreement);
  const loading = useSelector(selectPALoading);
  const saving = useSelector(selectPASaving);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <section>
      <div>
        {current ? (
          <GoAButton
            disabled={loading !== 'loaded'}
            onClick={() => dispatch(push(`/agreements/${current.id}/details`))}
          >
            Resume current cycle
          </GoAButton>
        ) : (
          !agreements.length && (
            <GoAButton
              disabled={loading !== 'loaded' || saving !== 'no changes'}
              onClick={() => dispatch(createPerformanceAgreement())}
            >
              Start new cycle
            </GoAButton>
          )
        )}
      </div>
      <GoATable width="100%">
        <thead>
          <tr>
            <th>Cycle</th>
            <th>Status</th>
            <th>Department</th>
            <th>Supervisor</th>
          </tr>
        </thead>
        <tbody>
          {loading === 'loading' ? (
            <tr>
              <td colSpan={4}>
                <GoACircularProgress
                  size="large"
                  visible={loading === 'loading'}
                />
              </td>
            </tr>
          ) : agreements?.length ? (
            agreements.map((agreement) => (
              <tr key={agreement.id}>
                <td>{`${agreement.cycleStart.getFullYear()} to ${agreement.cycleEnd.getFullYear()}`}</td>
                <td>{agreement.status}</td>
                <td>{agreement.department}</td>
                <td>{agreement.supervisor}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No draft agreements</td>
            </tr>
          )}
        </tbody>
      </GoATable>
    </section>
  );
};
