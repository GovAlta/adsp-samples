import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

export const NotFound: FunctionComponent = () => {
  return (
    <div>
      <h3>We can't find that submission</h3>
      <p>
        The specified submission could not be found. If you used the link from a
        previous submission, it may have already been processed.
      </p>
      <p>
        If you would like to submit a new platform idea, please go{' '}
        <Link to="/submission">here</Link>.
      </p>
    </div>
  );
};
