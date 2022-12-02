import { GoAFormItem } from '@abgov/react-components';
import { FunctionComponent } from 'react';

interface FormFieldProps {
  isReadOnly?: boolean;
  isRequired?: boolean;
  label: string;
  value: unknown;
}

export const FormField: FunctionComponent<FormFieldProps> = ({
  isReadOnly,
  isRequired,
  label,
  value,
  children,
}) => {
  return (
    <GoAFormItem label={label + isRequired ? ' *' : ''}>
      {isReadOnly ? <div>{value}</div> : children}
    </GoAFormItem>
  );
};
