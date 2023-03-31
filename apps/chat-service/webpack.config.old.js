const SwaggerJSDocWebpackPlugin = require('swagger-jsdoc-webpack-plugin');
const swaggerDefinition = require('./swagger.config');

module.exports = (config) => {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new SwaggerJSDocWebpackPlugin({
        swaggerDefinition,
        apis: [
          'apps/chat-service/src/**/*.ts',
          'apps/chat-service/src/**/*.swagger.yml',
        ],
      }),
    ],
  };
};
