const http = require('node:http');
const { createRouter } = require('./router');
const { ghiLog, kiemToken } = require('./middleware');
const c = require('./controller');

const PORT = Number(process.env.PORT) || 3000;

const KIEM_TOKEN = false;

const ROUTE_GHI = ['POST', 'PUT', 'PATCH', 'DELETE'];

const routes = [
  { method: 'GET', path: '/products', handler: c.list },
  { method: 'HEAD', path: '/products', handler: c.list },
  { method: 'POST', path: '/products', handler: c.create },
  { method: 'GET', path: '/products/:id', handler: c.getOne },
  { method: 'HEAD', path: '/products/:id', handler: c.getOne },
  { method: 'PUT', path: '/products/:id', handler: c.replace },
  { method: 'PATCH', path: '/products/:id', handler: c.update },
  { method: 'DELETE', path: '/products/:id', handler: c.remove },
].map((route) => {
  if (KIEM_TOKEN && ROUTE_GHI.includes(route.method)) {
    return { ...route, middlewares: [kiemToken] };
  }
  return route;
});

const server = http.createServer(createRouter(routes, [ghiLog]));

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  if (KIEM_TOKEN) {
    console.log('KIEM_TOKEN = true  -> route ghi cần: Authorization: Bearer demo-token');
  } else {
    console.log('KIEM_TOKEN = false -> route ghi không cần token');
  }
});
