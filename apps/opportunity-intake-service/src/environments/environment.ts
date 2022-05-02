import * as dotenv from 'dotenv';
dotenv.config();

export const environment = {
  production: false,
  port: '3334',
  TENANT_REALM: null,
  ACCESS_SERVICE_URL: null,
  DIRECTORY_SERVICE_URL: null,
  CLIENT_ID: 'urn:ads:autotest:opportunity-intake-service',
  CLIENT_SECRET: null,
  SESSION_SECRET: 'some random local whatever',
  TRUSTED_PROXY: 'uniquelocal',
  LOG_LEVEL: 'debug',
  ...process.env,
};
