const { createProxyMiddleware } = require('http-proxy-middleware');
 
module.exports = function(app) {
  app.use(createProxyMiddleware('/scheduler', { target: 'http://127.0.0.1:6002' }))
  app.use(createProxyMiddleware('/api', { target: 'http://127.0.0.1:6003' }))
  app.use(createProxyMiddleware('/user', { target: 'http://127.0.0.1:6003' }))
}