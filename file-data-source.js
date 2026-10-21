const fs = require('node:fs');
const path = require('node:path');

const FILE = process.env.DATA_FILE || path.join(__dirname, 'products.json');

const MAC_DINH = {
  products: [
    { id: 1, name: 'Bàn gỗ', price: 1200000 },
    { id: 2, name: 'Ghế xoay', price: 850000 },
    { id: 3, name: 'Đèn bàn', price: 300000 },
  ],
  idCounter: 3,
};

let cache = null;

function docFile() {
  if (cache !== null) {
    return cache;
  }
  if (!fs.existsSync(FILE) || fs.readFileSync(FILE, 'utf8').trim() === '') {
    cache = { ...MAC_DINH, products: MAC_DINH.products.map((r) => ({ ...r })) };
    ghiFile(cache);
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  return cache;
}

function ghiFile(state) {
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2), 'utf8');
  cache = state;
}

function load() {
  return docFile().products.map((r) => ({ ...r }));
}

function save(next) {
  const state = docFile();
  state.products = next.map((r) => ({ ...r }));
  ghiFile(state);
}

function nextId() {
  const state = docFile();
  state.idCounter += 1;
  ghiFile(state);
  return state.idCounter;
}

module.exports = { load, save, nextId };
