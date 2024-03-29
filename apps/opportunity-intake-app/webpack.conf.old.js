const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (configuration) => {
  configuration.entry['renew'] = ['./src/renew.ts'];

  configuration.plugins.push(
    new HtmlWebpackPlugin({
      template: './src/renew.html',
      chunks: ['renew'],
      filename: 'renew.html',
    })
  );

  return configuration;
};
