// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  production: false,
  access: {
    url: 'https://access-uat.alberta.ca',
    realm: '16da127a-d0d5-4587-baa7-5c468ede5918',
    client_id: 'urn:ads:demo:performance-excellence-app',
  },
  directory: {
    url: 'https://directory-service.adsp-uat.alberta.ca',
  },
};
