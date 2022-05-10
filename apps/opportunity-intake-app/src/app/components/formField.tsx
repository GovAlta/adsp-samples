import { GoAFormItem } from '@abgov/react-components/experimental';
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
    <GoAFormItem>
      <label htmlFor={children?.[0]?.props.id}>
        {label}
        {isRequired && ' *'}
      </label>
      {isReadOnly ? <div>{value}</div> : children}
    </GoAFormItem>
  );
};
