'use strict';

// Prices from the existing membership cards and comparison table.
const memberships = [
  { tariff: 'exp', name: 'GYM/EXP', months: 1, price: 30000 },
  { tariff: 'exp', name: 'GYM/EXP', months: 3, price: 60000 },
  { tariff: 'exp', name: 'GYM/EXP', months: 6, price: 80000 },
  { tariff: 'exp', name: 'GYM/EXP', months: 12, price: 110000 },
  { tariff: 'exp-plus', name: 'GYM/EXP+', months: 1, price: 35000 },
  { tariff: 'exp-plus', name: 'GYM/EXP+', months: 3, price: 70000 },
  { tariff: 'exp-plus', name: 'GYM/EXP+', months: 6, price: 100000 },
  { tariff: 'exp-plus', name: 'GYM/EXP+', months: 12, price: 130000 },
  { tariff: 'big-plus', name: 'BIG+/EXP', months: 1, price: 40000 },
  { tariff: 'big-plus', name: 'BIG+/EXP', months: 3, price: 100000 },
  { tariff: 'big-plus', name: 'BIG+/EXP', months: 6, price: 130000 },
  { tariff: 'big-plus', name: 'BIG+/EXP', months: 12, price: 180000 }
];

function findMembership(tariff, months) {
  return memberships.find(item => item.tariff === tariff && item.months === Number(months));
}

function membershipPrice(item, student) {
  const discount = student ? Math.round(item.price * 0.15) : 0;
  return { discount, total: item.price - discount, monthly: (item.price - discount) / item.months };
}

function money(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`;
}

function element(tag, text = '', classes = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (classes) node.classList.add(...classes.split(' '));
  return node;
}

function selectField(parent, id, title, options) {
  const group = element('div', '', 'mb-3');
  const label = element('label', title, 'form-label');
  label.htmlFor = id;
  const select = element('select', '', 'form-select');
  select.id = id;
  for (const [value, text] of options) {
    const option = element('option', text);
    option.value = value;
    select.append(option);
  }
  group.append(label, select);
  parent.append(group);
  return select;
}

function checkboxField(parent, id, title) {
  const group = element('div', '', 'form-check mb-3');
  const input = element('input', '', 'form-check-input');
  input.id = id;
  input.type = 'checkbox';
  const label = element('label', title, 'form-check-label');
  label.htmlFor = id;
  group.append(input, label);
  parent.append(group);
  return input;
}

function renderList(container, items, createItem) {
  container.replaceChildren();
  if (items.length === 0) container.append(element('li', 'Ничего не найдено. Измените условия или сбросьте фильтры.'));
  for (const item of items) container.append(createItem(item));
}

function birthAge(value, today = new Date()) {
  const birth = new Date(`${value}T00:00:00`);
  if (!value || Number.isNaN(birth.getTime()) || birth > today) return NaN;
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function membershipErrors(data, today = new Date()) {
  const errors = {};
  if (data.name.trim().length < 2 || data.name.trim().length > 80) errors['client-name'] = 'Введите имя от 2 до 80 символов.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors['client-email'] = 'Введите корректный email, например name@example.com.';
  if (!/^[+\d\s()-]+$/.test(data.phone) || !/^[78]\d{10}$/.test(data.phone.replace(/\D/g, ''))) errors['client-phone'] = 'Введите 11 цифр, начиная с +7 или 8.';
  if (!Number.isInteger(Number(data.age)) || Number(data.age) < 14 || Number(data.age) > 99) errors['client-age'] = 'Укажите целый возраст от 14 до 99 лет.';
  if (data.birth && birthAge(data.birth, today) !== Number(data.age)) errors['client-dob'] = 'Дата рождения должна быть в прошлом и соответствовать возрасту.';
  if (!findMembership(data.tariff, data.months)) errors['tariff-select'] = 'Выберите тариф и срок абонемента.';
  if (!data.agree) errors['client-agree'] = 'Подтвердите согласие с условиями.';
  if (Number(data.age) < 18 && !data.guardian) errors['guardian-agree'] = 'До 18 лет требуется согласие законного представителя.';
  if (Number(data.age) < 15 && !data.accompanied) errors['accompanied-agree'] = 'До 15 лет требуется сопровождение представителя или тренера.';
  if (data.comment.length > 500) errors['client-comment'] = 'Максимум 500 символов.';
  return errors;
}

// Small dependency-free check: node assets/js/main.js. Does not run in the browser.
if (typeof module !== 'undefined' && require.main === module) {
  const assert = require('node:assert/strict');
  const today = new Date(2026, 9, 21);
  const valid = { name: 'Анна', email: 'anna@example.com', phone: '+7 (700) 123-45-67', age: '18', birth: '2008-10-21', tariff: 'exp', months: '3', agree: true, guardian: false, accompanied: false, comment: '' };
  assert.equal(memberships.length, 12);
  for (const item of memberships) {
    assert.equal(membershipPrice(item, false).total, item.price);
    assert.equal(membershipPrice(item, true).total, item.price * 0.85);
  }
  assert.equal(membershipPrice(findMembership('exp', 3), true).total, 51000);
  assert.equal(findMembership('fake', 1), undefined);
  assert.equal(findMembership('exp', 2), undefined);
  assert.equal(birthAge('2008-10-21', today), 18);
  assert.equal(birthAge('2008-10-22', today), 17);
  assert.deepEqual(membershipErrors(valid, today), {});
  for (const [key, value, error] of [
    ['name', '  ', 'client-name'], ['email', 'bad', 'client-email'],
    ['phone', '+7 BAD 7001234567', 'client-phone'], ['phone', '123', 'client-phone'],
    ['age', '14.5', 'client-age'], ['birth', '2027-01-01', 'client-dob'],
    ['birth', '2007-10-21', 'client-dob'], ['agree', false, 'client-agree'],
    ['months', '', 'tariff-select'], ['comment', 'x'.repeat(501), 'client-comment']
  ]) assert.ok(membershipErrors({ ...valid, [key]: value }, today)[error]);
  const minor = { ...valid, age: '14', birth: '2012-10-21' };
  assert.ok(membershipErrors(minor, today)['guardian-agree']);
  assert.ok(membershipErrors(minor, today)['accompanied-agree']);
  assert.deepEqual(membershipErrors({ ...minor, guardian: true, accompanied: true }, today), {});
  console.log('PASS: membership prices, discounts, validation and age boundaries.');
}
