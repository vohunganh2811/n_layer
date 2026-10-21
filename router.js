const GIOI_HAN_BODY = 1_000_000;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function sendResponse(res, status, data, headers) {
  res.statusCode = status;
  if (headers) {
    for (const [ten, giaTri] of Object.entries(headers)) {
      res.setHeader(ten, giaTri);
    }
  }
  if (status === 204) {
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let xong = false;
    const ketThuc = (fn, giaTri) => {
      if (xong) {
        return;
      }
      xong = true;
      fn(giaTri);
    };
    req.on('data', (chunk) => {
      if (xong) {
        return;
      }
      body += chunk;
      if (body.length > GIOI_HAN_BODY) {
        req.pause();
        ketThuc(reject, new HttpError(413, 'Body quá lớn'));
      }
    });
    req.on('end', () => ketThuc(resolve, body));
    req.on('error', (err) => ketThuc(reject, err));
    req.on('aborted', () => ketThuc(reject, new HttpError(400, 'Client huỷ kết nối')));
  });
}

async function readJson(req) {
  const text = await readBody(req);
  try {
    const data = JSON.parse(text);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false };
    }
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

function khopPath(mau, pathThat) {
  const segMau = mau.split('/').filter(Boolean);
  const segThat = pathThat.split('/').filter(Boolean);
  if (segMau.length !== segThat.length) {
    return null;
  }
  const params = {};
  for (let i = 0; i < segMau.length; i += 1) {
    if (segMau[i].startsWith(':')) {
      params[segMau[i].slice(1)] = segThat[i];
    } else if (segMau[i] !== segThat[i]) {
      return null;
    }
  }
  return params;
}

function pathDiDang(pathname) {
  if (pathname === '/') {
    return false;
  }
  return pathname.includes('//') || pathname.endsWith('/');
}

function createRouter(routes, middlewaresChung = []) {
  return async function xuLy(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      for (const mw of middlewaresChung) {
        const diTiep = await mw(req, res);
        if (diTiep === false) {
          return;
        }
      }
      if (pathDiDang(url.pathname)) {
        sendResponse(res, 404, { error: 'Route không tồn tại' });
        return;
      }
      let pathKhop = null;
      for (const route of routes) {
        const params = khopPath(route.path, url.pathname);
        if (params === null) {
          continue;
        }
        pathKhop = route.path;
        if (route.method !== req.method) {
          continue;
        }
        for (const mw of route.middlewares || []) {
          const diTiep = await mw(req, res);
          if (diTiep === false) {
            return;
          }
        }
        await route.handler(req, res, { params, query: url.searchParams });
        return;
      }
      if (pathKhop !== null) {
        sendResponse(res, 404, { error: `Method không hỗ trợ cho ${pathKhop}` });
        return;
      }
      sendResponse(res, 404, { error: 'Route không tồn tại' });
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) {
        console.error('[500]', req.method, req.url, '->', err.message);
      }
      if (!res.headersSent && !res.destroyed) {
        if (status === 413) {
          res.setHeader('Connection', 'close');
          res.on('finish', () => req.destroy());
        }
        sendResponse(res, status, {
          error: status === 500 ? 'Lỗi server' : err.message,
        });
      }
    }
  };
}

module.exports = {
  createRouter,
  khopPath,
  sendResponse,
  readBody,
  readJson,
  HttpError,
  GIOI_HAN_BODY,
};
