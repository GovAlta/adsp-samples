import {
  GoADetails,
  GoADropdown,
  GoADropdownItem,
  GoAFormItem,
  GoAInput,
  GoAInputDate,
} from '@abgov/react-components';
import { FunctionComponent } from 'react';
import { PerformanceAgreementEntity } from '../pa.slice';

interface EmployeeDetailsProps {
  agreement: PerformanceAgreementEntity;
  onChange: (agreement: PerformanceAgreementEntity) => void;
}

export const AgreementDetails: FunctionComponent<EmployeeDetailsProps> = ({
  agreement,
  onChange,
}) => {
  return (
    <form>
      <h3>Employee details</h3>
      <GoADetails heading="Common employee commitments">
        <ul className="goa-unordered-list">
          <li>
            I will demonstrate the Alberta Public Service Values of Respect,
            Accountability, Integrity, and Excellence in my interactions with
            others and contribute to a positive work environment in my
            day-to-day work.
          </li>
          <li>
            I will contribute to the advancement of Diversity and Inclusion in
            the Alberta Public Service and foster a positive and inclusive
            workplace.
          </li>
          <li>
            I will contribute to my organization’s success and fulfil my job
            expectations as identified in the goals and actions in my
            performance agreement.
          </li>
          <li>
            I will actively support my team and collaborate with others to
            achieve branch, division, department and/or government-wide goals.
          </li>
        </ul>
      </GoADetails>
      <div>
        <GoAFormItem label="First name">
          <GoAInput
            onChange={(_, value: string) =>
              onChange({ ...agreement, firstName: value })
            }
            value={agreement.firstName}
            name="First name"
          />
        </GoAFormItem>
        <GoAFormItem label="Last name">
          <GoAInput
            onChange={(_, value: string) =>
              onChange({ ...agreement, lastName: value })
            }
            value={agreement.lastName}
            name="Last name"
          />
        </GoAFormItem>
      </div>
      <div>
        <GoAFormItem label="Employee ID">
          <GoAInput
            onChange={(_, value: string) =>
              onChange({ ...agreement, employeeId: value })
            }
            value={agreement.employeeId}
            name="Employee ID"
          />
        </GoAFormItem>
        <GoAFormItem label="Business unit">
          <GoAInput
            onChange={(_, value: string) =>
              onChange({ ...agreement, businessUnit: value })
            }
            value={agreement.businessUnit}
            name="Business unit"
          />
        </GoAFormItem>
        <GoAFormItem label="Department">
          <GoADropdown
            value={agreement.department}
            onChange={(_, value: string) =>
              onChange({ ...agreement, department: value })
            }
            multiselect={false}
          >
            <GoADropdownItem
              value="Technology and innovation"
              label="Technology and innovation"
            />
            <GoADropdownItem
              value="Service Alberta and red tape reduction"
              label="Service Alberta and red tape reduction"
            />
            <GoADropdownItem
              value="Transportation and economic corridors"
              label="Transportation and economic corridors"
            />
            <GoADropdownItem value="Energy" label="Energy" />
            <GoADropdownItem value="Health" label="Health" />
          </GoADropdown>
        </GoAFormItem>
        <GoAFormItem label="Supervisor">
          <GoAInput
            onChange={(_, value: string) =>
              onChange({ ...agreement, supervisor: value })
            }
            value={agreement.supervisor}
            name="Supervisor"
          />
        </GoAFormItem>
      </div>
      <div>
        <GoAFormItem label="Performance cycle start">
          <GoAInputDate
            onChange={(_, value) =>
              onChange({ ...agreement, cycleStart: value as Date })
            }
            value={agreement.cycleStart}
            name="Cycle start"
          />
        </GoAFormItem>
        <GoAFormItem label="Performance cycle end">
          <GoAInputDate
            onChange={(_, value) =>
              onChange({ ...agreement, cycleEnd: value as Date })
            }
            value={agreement.cycleEnd}
            name="Cycle end"
          />
        </GoAFormItem>
      </div>
    </form>
  );
};
