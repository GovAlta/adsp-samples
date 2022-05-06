import { GoAButton, GoAElementLoader } from '@abgov/react-components';
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
      onClick={(e) => {
        onClick();
        e.preventDefault();
      }}
    >
      <GoAElementLoader
        visible={isExecuting}
        baseColour="#fff"
        spinnerColour="#0070c4"
      />
      <span className={styles.content} data-executing={isExecuting}>
        {children}
      </span>
    </GoAButton>
  );
};
