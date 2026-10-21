let rows = [
  { id: 1, name: 'Bàn gỗ', price: 1200000 },
  { id: 2, name: 'Ghế xoay', price: 850000 },
  { id: 3, name: 'Đèn bàn', price: 300000 },
];

let idCounter = 3;

function load() {
  return rows.map((r) => ({ ...r }));
}

function save(next) {
  rows = next.map((r) => ({ ...r }));
}

function nextId() {
  idCounter += 1;
  return idCounter;
}

module.exports = { load, save, nextId };
