'use strict';

// Общий прайс-лист: тариф, название, срок в месяцах и цена.
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

// Находит один вариант по тарифу и сроку.
function findMembership(tariff, months) {
  for (let i = 0; i < memberships.length; i++) {
    const item = memberships[i];
    if (item.tariff === tariff && item.months === Number(months)) {
      return item;
    }
  }
  return undefined;
}

// Считает скидку 15%, итог и стоимость месяца.
function membershipPrice(item, student) {
  let discount = 0;
  if (student) {
    discount = Math.round(item.price * 0.15);
  }
  const total = item.price - discount;
  const monthly = total / item.months;
  return { discount, total, monthly };
}

// Форматирует число: 30000 → 30 000 ₸.
function money(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`;
}

// Создаёт элемент с безопасным текстом и готовыми CSS-классами.
function element(tag, text = '', classes = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (classes) {
    const classNames = classes.split(' ');
    for (let i = 0; i < classNames.length; i++) {
      node.classList.add(classNames[i]);
    }
  }
  return node;
}

// Создаёт список с подписью; options содержит пары [значение, текст].
function selectField(parent, id, title, options) {
  const group = element('div', '', 'mb-3');
  const label = element('label', title, 'form-label');
  label.htmlFor = id;
  const select = element('select', '', 'form-select');
  select.id = id;
  for (let i = 0; i < options.length; i++) {
    const option = element('option', options[i][1]);
    option.value = options[i][0];
    select.append(option);
  }
  group.append(label, select);
  parent.append(group);
  return select;
}

// Создаёт галочку с подписью и возвращает сам input.
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

// Перерисовывает список; createItem создаёт один пункт из объекта.
function renderList(container, items, createItem) {
  container.replaceChildren();
  if (items.length === 0) {
    container.append(element('li', 'Ничего не найдено. Измените условия или сбросьте фильтры.'));
  }
  for (let i = 0; i < items.length; i++) {
    const listItem = createItem(items[i]);
    container.append(listItem);
  }
}

// Проверяет дату рождения и вычисляет полные годы.
function birthAge(value, today = new Date()) {
  const birth = new Date(`${value}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(birth.getTime()) || birth > today) {
    return NaN;
  }
  const dateParts = value.split('-');
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  if (birth.getFullYear() !== year || birth.getMonth() + 1 !== month || birth.getDate() !== day) {
    return NaN;
  }
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

// Возвращает ошибки вида id поля → сообщение; пустой объект означает успех.
function membershipErrors(data, today = new Date()) {
  const errors = {};
  const age = birthAge(data.birth, today);
  if (data.name.trim().length < 2 || data.name.trim().length > 80) {
    errors['client-name'] = 'Введите имя от 2 до 80 символов.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors['client-email'] = 'Введите корректный email, например name@example.com.';
  }
  if (!/^[+\d\s()-]+$/.test(data.phone) || !/^[78]\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors['client-phone'] = 'Введите 11 цифр, начиная с +7 или 8.';
  }
  if (!Number.isInteger(age) || age < 14 || age > 99) {
    errors['client-dob'] = 'Укажите корректную дату рождения: возраст должен быть от 14 до 99 лет.';
  }
  if (!findMembership(data.tariff, data.months)) {
    errors['tariff-select'] = 'Выберите тариф и срок абонемента.';
  }
  if (!data.agree) {
    errors['client-agree'] = 'Подтвердите согласие с условиями.';
  }
  if (age >= 14 && age < 18 && !data.guardian) {
    errors['guardian-agree'] = 'До 18 лет требуется согласие законного представителя.';
  }
  if (age >= 14 && age < 15 && !data.accompanied) {
    errors['accompanied-agree'] = 'До 15 лет требуется сопровождение представителя или тренера.';
  }
  if (data.comment.length > 500) {
    errors['client-comment'] = 'Максимум 500 символов.';
  }
  return errors;
}

// Самопроверка: node assets/js/main.js. В браузере этот блок не запускается.
if (typeof module !== 'undefined' && require.main === module) {
  const assert = require('node:assert/strict');
  const today = new Date(2026, 9, 21);
  const valid = { name: 'Анна', email: 'anna@example.com', phone: '+7 (700) 123-45-67', birth: '2008-10-21', tariff: 'exp', months: '3', agree: true, guardian: false, accompanied: false, comment: '' };
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
    ['birth', '', 'client-dob'], ['birth', '2027-01-01', 'client-dob'],
    ['birth', '2013-10-21', 'client-dob'], ['birth', '1926-10-21', 'client-dob'],
    ['birth', '2008-02-31', 'client-dob'], ['agree', false, 'client-agree'],
    ['months', '', 'tariff-select'], ['comment', 'x'.repeat(501), 'client-comment']
  ]) assert.ok(membershipErrors({ ...valid, [key]: value }, today)[error]);
  assert.deepEqual(membershipErrors({ ...valid, birth: '1927-10-21' }, today), {});
  assert.deepEqual(membershipErrors({ ...valid, birth: '2008-02-29' }, today), {});
  const minor = { ...valid, birth: '2012-10-21' };
  assert.ok(membershipErrors(minor, today)['guardian-agree']);
  assert.ok(membershipErrors(minor, today)['accompanied-agree']);
  assert.deepEqual(membershipErrors({ ...minor, guardian: true, accompanied: true }, today), {});
  console.log('PASS: membership prices, discounts, validation and age boundaries.');
}

/* ШПАРГАЛКА
memberships — данные абонементов; tariff — код, months — срок, price — цена.
findMembership — найти вариант; membershipPrice — рассчитать; money — оформить цену.
element — создать элемент; selectField — список; checkboxField — галочка.
renderList — очистить список и заполнить заново; birthAge — возраст по дате.
membershipErrors — проверить форму, вернуть объект ошибок.
const — без переназначения; let — значение меняется; return — результат функции.
for — повторить действия; if/else — выбор действия; && — И; || — ИЛИ; ! — НЕ.
=== / !== — строгое сравнение; Number — перевод в число; NaN — не число.
textContent — текст; classList — CSS-классы; append — вставить; remove — удалить.
*/
