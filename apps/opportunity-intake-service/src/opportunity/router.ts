import {
  adspId,
  ServiceDirectory,
  TokenProvider,
  UnauthorizedUserError,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import { RequestHandler, Router } from 'express';
import { PassportStatic } from 'passport';
import { FORM, FORM_DATA } from './strategy';
import { FormInfo, OpportunityFormData } from './types';

export interface RouterProps {
  passport: PassportStatic;
  directory: ServiceDirectory;
  tokenProvider: TokenProvider;
}

const OPPORTUNITY_FORM_DEFINITION = 'opportunity-intake';
export function createDraft(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, _res, next) => {
    try {
      const { name, email } = req.body;

      const formServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:form-service`
      );
      const token = await tokenProvider.getAccessToken();
      const { data } = await axios.post<FormInfo>(
        new URL('/form/v1/forms', formServiceUrl).href,
        {
          definitionId: OPPORTUNITY_FORM_DEFINITION,
          applicant: {
            userId: email.toLowerCase(),
            addressAs: name,
            channels: [
              {
                channel: 'email',
                address: email,
              },
            ],
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req[FORM] = data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function getForm(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { formId } = req.params;

      const formServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:form-service`
      );
      const token = await tokenProvider.getAccessToken();
      const { data } = await axios.get<FormInfo>(
        new URL(`/form/v1/forms/${formId}`, formServiceUrl).href,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      res.send(data);
    } catch (err) {
      next(err);
    }
  };
}

export function formOperation(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { formId } = req.params;
      const { operation } = req.body;
      const formServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:form-service`
      );
      const token = await tokenProvider.getAccessToken();
      const { data } = await axios.post<FormInfo>(
        new URL(`/form/v1/forms/${formId}`, formServiceUrl).href,
        { operation },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // if (operation === 'submit') {
      //   const taskServiceUrl = await directory.getServiceUrl(
      //     adspId`urn:ads:platform:form-service`
      //   );
      //   token = await tokenProvider.getAccessToken();
      //   await axios.post(
      //     new URL('/task/v1/tasks/opportunity-intake', taskServiceUrl).href,
      //     {
      //       name: `Process submission`,
      //       description: 'Process submission',
      //       recordId: formId,
      //     },
      //     {
      //       headers: { Authorization: `Bearer ${token}` },
      //     }
      //   );
      // }

      res.send(data);
    } catch (err) {
      next(err);
    }
  };
}

export function updateDraft(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { formId } = req.params;
      if (req.user?.[FORM_DATA]?.id !== formId) {
        throw new UnauthorizedUserError('update draft', null);
      }

      const formServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:form-service`
      );
      const token = await tokenProvider.getAccessToken();
      const { data } = await axios.put<OpportunityFormData>(
        new URL(`/form/v1/forms/${formId}/data`, formServiceUrl).href,
        req.body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session['passport'].user.formData = data;
      res.send(data);
    } catch (err) {
      next(err);
    }
  };
}

export function createOpportunityRouter({
  passport,
  directory,
  tokenProvider,
}: RouterProps): Router {
  const router = Router();

  router.post(
    '/opportunities',
    createDraft(directory, tokenProvider),
    passport.authenticate('creator'),
    (req, res) => res.send(req[FORM])
  );

  router.get('/opportunities/:formId', getForm(directory, tokenProvider));
  router.post(
    '/opportunities/:formId',
    formOperation(directory, tokenProvider)
  );

  router.get(
    '/opportunities/:formId/data',
    passport.authenticate(['code']),
    (req, res) => {
      res.send(req.user[FORM_DATA]);
    }
  );

  router.put(
    '/opportunities/:formId/data',
    updateDraft(directory, tokenProvider)
  );
  return router;
}
