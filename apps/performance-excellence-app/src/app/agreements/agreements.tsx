import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '../../store';
import { getPerformanceAgreements } from '../pa.slice';
import { AgreementsList } from './agreements-list';

export const Agreements = () => {
  const user = useSelector((state: AppState) => state.user.user);
  const directory = useSelector((state: AppState) => state.start.directory);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (user && directory) {
      dispatch(getPerformanceAgreements());
    }
  });

  return (
    <main>
      <h2>Your performance agreements</h2>
      <AgreementsList />
    </main>
  );
};
