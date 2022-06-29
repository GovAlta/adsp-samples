import {
  GoAButton,
  GoACallout,
  GoARadio,
  GoARadioGroup,
} from '@abgov/react-components';
import {
  GoAForm,
  GoAFormActions,
  GoAFormItem,
  GoAInputEmail,
} from '@abgov/react-components/experimental';
import { FunctionComponent, useState } from 'react';
import styles from './screening.module.scss';

export const Screening: FunctionComponent = () => {
  const [madePurchase, setMadePurchase] = useState<boolean>();
  const [haveTaxBill, setHaveTaxBill] = useState<boolean>();
  const [havePenalty, setHavePenalty] = useState<boolean>();

  return (
    <main className={styles.screening}>
      <h1>Property tax penalty reimbursement</h1>
      <p>
        If you recently purchased property, did not receive a tax notice from
        your municipality, and were issued a late payment penalty, you may be
        eligible for reimbursement.
      </p>
      <section>
        <div>
          <h3>
            Did you buy or sell a property in Alberta in the last six month?
          </h3>
          <p></p>
          <GoARadioGroup
            name="purchase"
            value={`${madePurchase}`}
            onChange={(_, v) => setMadePurchase(v && v === 'true')}
          >
            <GoARadio label="Yes" value="true" />
            <GoARadio label="No" value="false" />
          </GoARadioGroup>
        </div>
        <div>
          <p>
            Municipal tax bills were recently issued based on title information
            from the land titles office. (additional help content...)
          </p>
        </div>
      </section>
      <section>
        <div>
          <h3>Did you receive a property tax bill for the property?</h3>
          <p></p>
          <GoARadioGroup
            name="bill"
            value={`${haveTaxBill}`}
            onChange={(_, v) => setHaveTaxBill(v && v === 'true')}
          >
            <GoARadio label="Yes" value="true" />
            <GoARadio label="No" value="false" />
          </GoARadioGroup>
        </div>
        <div>
          <p>
            You should have receive a property tax bill on the property from the
            municipality by mail. (additional help content...)
          </p>
        </div>
      </section>
      <section>
        <div>
          <h3>
            Have you received a late payment penalty for property taxes on this
            property?
          </h3>
          <p></p>
          <GoARadioGroup
            name="penalty"
            value={`${havePenalty}`}
            onChange={(_, v) => setHavePenalty(v && v === 'true')}
          >
            <GoARadio label="Yes" value="true" />
            <GoARadio label="No" value="false" />
          </GoARadioGroup>
        </div>
        <div>
          <p>
            Proof of late payment penalties for property taxes is required to
            apply for reimbursement. (additional help content...)
          </p>
        </div>
      </section>
      {madePurchase && haveTaxBill === false && havePenalty ? (
        <section>
          <GoACallout type={'information'} title="Contact us" content="" />
          <GoAForm>
            <GoAFormItem>
              <label>Email where we can reach you:</label>
              <GoAInputEmail name="email" onChange={null} value={null} />
              <GoAFormActions alignment="left">
                <GoAButton>Submit</GoAButton>
              </GoAFormActions>
            </GoAFormItem>
          </GoAForm>
        </section>
      ) : (
        <section>
          <GoACallout
            type="information"
            title="Please pay your property taxes."
            content="You don't appear to be affected by delays with land titles document registration processing times."
          />
        </section>
      )}
    </main>
  );
};
