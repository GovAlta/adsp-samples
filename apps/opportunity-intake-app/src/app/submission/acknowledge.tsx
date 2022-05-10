import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

export const Acknowledge: FunctionComponent = () => {
  return (
    <div>
      <h3>Thank you for the submission</h3>
      <p>
        Thank you! Your submission has been received. We will contact you for
        next steps if the opportunity is selected for additional exploration.
      </p>
      <p>
        If you would like to submit a new platform idea, please go{' '}
        <Link to="/submission">here</Link>.
      </p>
    </div>
  );
};
