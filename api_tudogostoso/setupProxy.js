const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /search/* requests to backend
  app.use(
    '/search',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug',
    })
  );
  
  // Proxy all /recipe/* requests to backend
  app.use(
    '/recipe',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug',
    })
  );
};
