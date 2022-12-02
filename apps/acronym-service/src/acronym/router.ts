import {
  AdspId,
  adspId,
  GoAError,
  ServiceDirectory,
  TokenProvider,
  UnauthorizedUserError,
} from '@abgov/adsp-service-sdk';
import axios from 'axios';
import { RequestHandler, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AcronymConfiguration } from './configuration';
import { ServiceUserRoles } from './roles';
import { AcronymDescription } from './types';

export const handleValidationErrors: RequestHandler = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new GoAError(
        `Request is not valid: ${errors.array({ onlyFirstError: true })[0]}`,
        {
          statusCode: 400,
        }
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};

export function getAcronym(): RequestHandler {
  return async (req, res, next) => {
    try {
      const { acronym } = req.params;

      const [configuration] =
        await req.getConfiguration<AcronymConfiguration>();

      const description = configuration[acronym];
      if (!description) {
        throw new GoAError(`Could not find definition for: ${acronym}`, {
          statusCode: 404,
        });
      }

      res.send({
        acronym: description.acronym,
        definitions: description.definitions,
      });
    } catch (err) {
      next(err);
    }
  };
}

export function setAcronym(
  serviceId: AdspId,
  directory: ServiceDirectory,
  tokenProvider: TokenProvider
): RequestHandler {
  return async (req, res, next) => {
    try {
      if (!req.user?.roles?.includes(ServiceUserRoles.Admin)) {
        throw new UnauthorizedUserError('set acronym', req.user);
      }

      const { acronym } = req.params;
      const description: AcronymDescription = req.body;
      if (acronym !== description.acronym) {
        throw new GoAError('Content acronym field does not match resource.', {
          statusCode: 400,
        });
      }

      const configurationServiceUrl = await directory.getServiceUrl(
        adspId`urn:ads:platform:configuration-service`
      );

      const token = await tokenProvider.getAccessToken();
      const request = !description
        ? {
            operation: 'DELETE',
            property: acronym,
          }
        : {
            operation: 'UPDATE',
            update: {
              [acronym]: description,
            },
          };
      const { data: _data } = await axios.patch(
        new URL(
          `/configuration/v2/configuration/${serviceId.namespace}/${serviceId.service}`,
          configurationServiceUrl
        ).href,
        request,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      res.send(description);
    } catch (err) {
      next(err);
    }
  };
}

export interface RouterProps {
  serviceId: AdspId;
  directory: ServiceDirectory;
  tokenProvider: TokenProvider;
}

export const createAcronymRouter = ({
  serviceId,
  directory,
  tokenProvider,
}: RouterProps): Router => {
  const router = Router();

  router.get(
    '/acronyms/:acronym',
    param('acronym').isLength({ min: 1, max: 20 }),
    handleValidationErrors,
    getAcronym()
  );

  router.put(
    '/acronyms/:acronym',
    [
      param('acronym').isLength({ min: 1, max: 20 }),
      body('acronym').optional().isLength({ min: 1, max: 20 }),
      body('definitions').optional().isArray(),
      body('definitions.*.context').isString().isLength({ min: 1, max: 150 }),
      body('definitions.*.represents')
        .isString()
        .isLength({ min: 1, max: 150 }),
      body('definitions.*.description')
        .isString()
        .isLength({ min: 1, max: 500 }),
    ],
    handleValidationErrors,
    setAcronym(serviceId, directory, tokenProvider)
  );

  return router;
};
