import {
  AdspId,
  adspId,
  GoAError,
  ServiceDirectory,
  TokenProvider,
} from '@govalta/adsp-service-sdk';
import axios from 'axios';
import { RequestHandler, Router } from 'express';
import * as proxy from 'express-http-proxy';
import { PassportStatic } from 'passport';
import { FORM, FORM_DATA } from './strategy';
import { FormInfo, OpportunityFormData } from './types';

export interface RouterProps {
  passport: PassportStatic;
  directory: ServiceDirectory;
  tokenProvider: TokenProvider;
}

const assertAuthenticated: RequestHandler = (req, _res, next) => {
  try {
    const { formId } = req.params;
    if (req.user?.[FORM_DATA]?.id !== formId) {
      throw new GoAError('User not authorized to access submission.', {
        statusCode: 401,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

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

export function getFormFile(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const formData: OpportunityFormData = req.user[FORM_DATA];
      const file = formData?.files?.[fileId];
      if (!file) {
        throw new GoAError('Form file not found.', { statusCode: 404 });
      }

      const fileResourceId = AdspId.parse(file);

      const fileServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:file-service`
      );
      const token = await tokenProvider.getAccessToken();
      const { data } = await axios.get(
        new URL(`/file/v1${fileResourceId.resource}`, fileServiceUrl).href,
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

export function deleteFormFile(
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      const { formId, fileId } = req.params;
      const formData: OpportunityFormData = req.user[FORM_DATA];
      const file = formData?.files?.[fileId];
      if (!file) {
        throw new GoAError('Form file not found.', { statusCode: 404 });
      }

      const fileResourceId = AdspId.parse(file);
      const fileServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:file-service`
      );
      let token = await tokenProvider.getAccessToken();
      await axios.delete(
        new URL(`/file/v1${fileResourceId.resource}`, fileServiceUrl).href,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:form-service`
      );
      token = await tokenProvider.getAccessToken();

      delete formData.files[fileId];
      const { data } = await axios.put<OpportunityFormData>(
        new URL(`/form/v1/forms/${formId}/data`, formServiceUrl).href,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session['passport'].user.formData = data;

      res.send({ deleted: true });
    } catch (err) {
      next(err);
    }
  };
}

export async function createOpportunityRouter({
  passport,
  directory,
  tokenProvider,
}: RouterProps): Promise<Router> {
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
    assertAuthenticated,
    updateDraft(directory, tokenProvider)
  );

  const fileServiceUrl = await directory.getServiceUrl(
    adspId`urn:ads:platform:file-service`
  );

  router.post(
    '/opportunities/:formId/files',
    assertAuthenticated,
    proxy(fileServiceUrl.href, {
      parseReqBody: false,
      limit: '10mb',
      proxyReqPathResolver: function () {
        return '/file/v1/files';
      },
      proxyReqOptDecorator: async (proxyReq) => {
        const accessToken = await tokenProvider.getAccessToken();
        proxyReq.headers['Authorization'] = `Bearer ${accessToken}`;
        return proxyReq;
      },
      userResDecorator: async (res, fileData, req) => {
        if (res.statusCode === 200) {
          const { formId } = req.params;
          const { id, urn } = JSON.parse(fileData.toString());
          const formServiceUrl = await directory.getServiceUrl(
            adspId`urn:ads:platform:form-service`
          );

          const token = await tokenProvider.getAccessToken();
          const { data } = await axios.put<OpportunityFormData>(
            new URL(`/form/v1/forms/${formId}/data`, formServiceUrl).href,
            {
              ...req.user[FORM_DATA],
              files: {
                ...req.user[FORM_DATA].files,
                [id]: urn,
              },
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          req.session['passport'].user.formData = data;
        }
        return fileData;
      },
    })
  );

  router.get(
    '/opportunities/:formId/files/:fileId',
    assertAuthenticated,
    getFormFile(directory, tokenProvider)
  );

  router.delete(
    '/opportunities/:formId/files/:fileId',
    assertAuthenticated,
    deleteFormFile(directory, tokenProvider)
  );

  return router;
}
