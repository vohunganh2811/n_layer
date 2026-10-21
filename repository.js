const dataSource = require('./data-source');

const FIELD_CHO_PHEP = ['name', 'price'];

function locField(fields) {
  const sach = {};
  for (const key of FIELD_CHO_PHEP) {
    if (key in fields) {
      sach[key] = fields[key];
    }
  }
  return sach;
}

function findAll() {
  return dataSource.load();
}

function findById(id) {
  const rows = dataSource.load();
  const found = rows.find((p) => p.id === id);
  return found === undefined ? null : found;
}

function create({ name, price }) {
  const rows = dataSource.load();
  const product = { id: dataSource.nextId(), name, price };
  rows.push(product);
  dataSource.save(rows);
  return product;
}

function replace(id, fields) {
  const rows = dataSource.load();
  const i = rows.findIndex((p) => p.id === id);
  if (i === -1) {
    return null;
  }
  const moi = { id, ...locField(fields) };
  rows[i] = moi;
  dataSource.save(rows);
  return moi;
}

function update(id, fields) {
  const rows = dataSource.load();
  const i = rows.findIndex((p) => p.id === id);
  if (i === -1) {
    return null;
  }
  Object.assign(rows[i], locField(fields));
  dataSource.save(rows);
  return rows[i];
}

function remove(id) {
  const rows = dataSource.load();
  const i = rows.findIndex((p) => p.id === id);
  if (i === -1) {
    return null;
  }
  rows.splice(i, 1);
  dataSource.save(rows);
  return true;
}

module.exports = { findAll, findById, create, replace, update, remove };
