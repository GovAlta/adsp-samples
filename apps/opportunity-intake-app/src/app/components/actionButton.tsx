import { GoAButton, GoACircularProgress } from '@abgov/react-components';
import { FunctionComponent } from 'react';
import styles from './actionButton.module.scss';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  buttonType?: 'primary' | 'secondary' | 'tertiary';
  isExecuting?: boolean;
}

export const ActionButton: FunctionComponent<ActionButtonProps> = ({
  disabled,
  isExecuting,
  children,
  onClick,
  ...props
}) => {
  return (
    <GoAButton
      {...props}
      disabled={isExecuting || disabled}
      onClick={() => {
        onClick();
      }}
    >
      <GoACircularProgress
        visible={isExecuting}
        variant="inline"
        size="small"
      />
      <span className={styles.content} data-executing={isExecuting}>
        {children}
      </span>
    </GoAButton>
  );
};
