const repo = require('./repository');
const { sendResponse, readJson } = require('./router');

function loiName(name) {
  if (typeof name !== 'string') {
    return 'name phải là chuỗi';
  }
  if (name.trim() === '') {
    return 'name không được rỗng';
  }
  return null;
}

function loiPrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'price phải là số';
  }
  if (price <= 0) {
    return 'price phải lớn hơn 0';
  }
  return null;
}

function parseId(raw) {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

async function list(req, res, ctx) {
  const raw = ctx.query.get('limit');
  if (raw !== null) {
    if (!/^\d+$/.test(raw) || Number(raw) === 0) {
      sendResponse(res, 400, { error: 'limit phải là số nguyên lớn hơn 0' });
      return;
    }
    sendResponse(res, 200, repo.findAll().slice(0, Number(raw)));
    return;
  }
  sendResponse(res, 200, repo.findAll());
}

async function getOne(req, res, ctx) {
  const id = parseId(ctx.params.id);
  if (id === null) {
    sendResponse(res, 404, { error: 'Id không hợp lệ' });
    return;
  }
  const product = repo.findById(id);
  if (product === null) {
    sendResponse(res, 404, { error: `Không có product id ${id}` });
    return;
  }
  sendResponse(res, 200, product);
}

async function create(req, res) {
  const body = await readJson(req);
  if (!body.ok) {
    sendResponse(res, 400, { error: 'Body không phải JSON hợp lệ' });
    return;
  }
  const loi = loiName(body.data.name) || loiPrice(body.data.price);
  if (loi !== null) {
    sendResponse(res, 400, { error: loi });
    return;
  }
  const product = repo.create({ name: body.data.name, price: body.data.price });
  sendResponse(res, 201, product);
}

async function replace(req, res, ctx) {
  const id = parseId(ctx.params.id);
  if (id === null) {
    sendResponse(res, 404, { error: 'Id không hợp lệ' });
    return;
  }
  if (repo.findById(id) === null) {
    sendResponse(res, 404, { error: `Không có product id ${id}` });
    return;
  }
  const body = await readJson(req);
  if (!body.ok) {
    sendResponse(res, 400, { error: 'Body không phải JSON hợp lệ' });
    return;
  }
  const loi = loiName(body.data.name) || loiPrice(body.data.price);
  if (loi !== null) {
    sendResponse(res, 400, { error: loi });
    return;
  }
  sendResponse(res, 200, repo.replace(id, body.data));
}

async function update(req, res, ctx) {
  const id = parseId(ctx.params.id);
  if (id === null) {
    sendResponse(res, 404, { error: 'Id không hợp lệ' });
    return;
  }
  if (repo.findById(id) === null) {
    sendResponse(res, 404, { error: `Không có product id ${id}` });
    return;
  }
  const body = await readJson(req);
  if (!body.ok) {
    sendResponse(res, 400, { error: 'Body không phải JSON hợp lệ' });
    return;
  }
  const loi = ('name' in body.data ? loiName(body.data.name) : null)
    || ('price' in body.data ? loiPrice(body.data.price) : null);
  if (loi !== null) {
    sendResponse(res, 400, { error: loi });
    return;
  }
  sendResponse(res, 200, repo.update(id, body.data));
}

async function remove(req, res, ctx) {
  const id = parseId(ctx.params.id);
  if (id === null) {
    sendResponse(res, 404, { error: 'Id không hợp lệ' });
    return;
  }
  const ketQua = repo.remove(id);
  if (ketQua === null) {
    sendResponse(res, 404, { error: `Không có product id ${id}` });
    return;
  }
  sendResponse(res, 204);
}

module.exports = { list, getOne, create, replace, update, remove };
