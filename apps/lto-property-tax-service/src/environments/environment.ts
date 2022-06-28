export const environment = {
  production: false,
  port: '3335',
  TENANT_REALM: null,
  ACCESS_SERVICE_URL: null,
  DIRECTORY_SERVICE_URL: null,
  CLIENT_ID: 'urn:ads:autotest:lto-property-tax-service',
  CLIENT_SECRET: null,
  TRUSTED_PROXY: 'uniquelocal',
  LOG_LEVEL: 'debug',
  ...process.env,
};
