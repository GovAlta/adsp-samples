// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  production: false,
  access: {
    url: 'https://access.adsp-dev.gov.ab.ca',
    realm: 'b6aff762-20f8-4c5d-88d3-c38ae16d1937',
    client_id: 'urn:ads:autotest:opportunity-intake-app',
  },
  directory: {
    url: 'https://tenant-service.adsp-dev.gov.ab.ca'
  }
};
