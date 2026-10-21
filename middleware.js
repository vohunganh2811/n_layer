const { sendResponse } = require('./router');

const TOKEN = 'demo-token';

function ghiLog(req, res) {
  const batDau = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - batDau;
    console.log(`${req.method} ${req.url} -> ${res.statusCode} (${ms}ms)`);
  });
  return true;
}

function kiemToken(req, res) {
  const header = req.headers.authorization || '';
  if (header !== `Bearer ${TOKEN}`) {
    sendResponse(
      res,
      401,
      { error: 'Thiếu hoặc sai token' },
      { 'WWW-Authenticate': 'Bearer realm="products"' },
    );
    return false;
  }
  return true;
}

module.exports = { ghiLog, kiemToken, TOKEN };
