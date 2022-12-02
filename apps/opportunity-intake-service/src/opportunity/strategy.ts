import {
  adspId,
  ServiceDirectory,
  TokenProvider,
} from '@abgov/adsp-service-sdk';
import axios from 'axios';
import { Strategy } from 'passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import { OpportunityFormData } from './types';

export const FORM = 'form';
export const FORM_DATA = 'formData';
// This is a strategy used to serialize the form ID into the session.
export const creatorStrategy = new CustomStrategy((req, done) => {
  const formId = req[FORM]?.id;
  done(!formId ? new Error('form Id not found.') : null, {
    formData: { id: formId, data: {}, files: {} },
  });
});

// This is a strategy that retrieves the form data with a one time code.
export function codeStrategy(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): Strategy {
  return new CustomStrategy(async (req, done) => {
    try {
      const { formId } = req.params;

      if (req.user?.['formData'].id === formId) {
        done(null, req.user);
      } else {
        const { code } = req.query;

        const formServiceUrl = await directory.getServiceUrl(
          adspId`urn:ads:platform:form-service`
        );
        const token = await tokenProvider.getAccessToken();

        const { data } = await axios.get<OpportunityFormData>(
          new URL(`/form/v1/forms/${formId}/data?code=${code}`, formServiceUrl)
            .href,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        done(null, { formData: data });
      }
    } catch (err) {
      done(err);
    }
  });
}
