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

// Общие проверки и форматирование используются всеми формами.
function fullNameError(value) {
  const name = String(value || '').trim();
  return name.length <= 80 && /^[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*(?:\s+[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*)+$/u.test(name)
    ? '' : 'Введите имя и фамилию буквами через пробел (до 80 символов).';
}

function phoneError(value) {
  return /^(?:\+7|7|8)[\d ()-]*$/.test(value) && /^[78]\d{10}$/.test(value.replace(/\D/g, ''))
    ? '' : 'Введите полный номер +7 (700) 123-45-67.';
}

function formatPhone(value) {
  if (/^\+(?!7)/.test(String(value))) return String(value).slice(0, 18);
  let digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (/^\+7/.test(String(value)) || digits.length === 11 && /^[78]/.test(digits)) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  return '+7' + (digits ? ' ' + [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(' ') : '');
}

// Проверка контрольной суммы номера не подтверждает существование карты в банке.
function cardNumberError(value) {
  const digits = String(value).replace(/ /g, '');
  if (!/^\d{16}$/.test(digits) || /^(\d)\1{15}$/.test(digits)) return 'Введите корректные 16 цифр номера карты';
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0 ? '' : 'Проверьте номер карты: контрольная сумма не совпадает';
}

function limitNumberInput(value, max, step = '1') {
  if (!/^\d*(?:\.\d*)?$/.test(value)) return '';
  const parts = value.split('.');
  const whole = parts[0].slice(0, String(max).split('.')[0].length);
  const precision = (step.split('.')[1] || '').length;
  return whole + (precision && parts.length > 1 ? '.' + parts[1].slice(0, precision) : '');
}

function formatExpiry(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  return digits.slice(0, 2) + (digits.length > 2 ? '/' + digits.slice(2) : '');
}

function cardExpiryError(value, today = new Date()) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return 'Укажите срок в формате ММ/ГГ';
  return new Date(2000 + Number(value.slice(3)), Number(value.slice(0, 2)), 1) > today
    ? '' : 'Срок действия карты истёк';
}

// Возвращает ошибки вида id поля → сообщение; пустой объект означает успех.
function membershipErrors(data, today = new Date()) {
  const errors = {};
  const age = birthAge(data.birth, today);
  if (fullNameError(data.name)) {
    errors['client-name'] = fullNameError(data.name);
  }
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors['client-email'] = 'Введите корректный email, например name@example.com.';
  }
  if (phoneError(data.phone)) {
    errors['client-phone'] = phoneError(data.phone);
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
  const valid = { name: 'Анна Иванова', email: 'anna@example.com', phone: '+7 (700) 123-45-67', birth: '2008-10-21', tariff: 'exp', months: '3', agree: true, guardian: false, accompanied: false, comment: '' };
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
  for (const name of ['Анна Иванова', 'Әлия Нұрланқызы', "Jean-Luc O’Neill"]) assert.equal(fullNameError(name), '');
  for (const name of ['Анна', 'Анна 123', 'Анна @Иванова']) assert.ok(fullNameError(name));
  assert.equal(formatPhone('87001234567'), '+7 700 123 45 67');
  assert.equal(formatPhone('7001234567'), '+7 700 123 45 67');
  assert.equal(formatPhone('+7 700 123 45'), '+7 700 123 45');
  assert.equal(formatPhone(''), '');
  let typed = '+7 ';
  for (const digit of '7001234567') typed = formatPhone(typed + digit);
  assert.equal(typed, '+7 700 123 45 67');
  assert.equal(phoneError(typed), '');
  for (const phone of ['1234567890', '+1 7001234567', '+7 BAD 7001234567', '+7']) assert.ok(phoneError(phone));
  assert.equal(cardNumberError('4242 4242 4242 4242'), '');
  for (const card of ['0000000000000000', '4242424242424241', '4242abcd42424242', '123']) assert.ok(cardNumberError(card));
  assert.equal(formatExpiry('1228'), '12/28');
  assert.equal(formatExpiry('12/28'), '12/28');
  assert.equal(formatExpiry('abc1'), '1');
  assert.equal(cardExpiryError('10/26', today), '');
  assert.ok(cardExpiryError('09/26', today));
  assert.ok(cardExpiryError('13/28', today));
  console.log('PASS: membership prices, discounts, validation and age boundaries.');
}

/*
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
'use strict';

/* Общий модуль Experience Fitness: справочные данные клуба и переиспользуемые функции.
   Подключается на всех страницах сайта; страницы обращаются к общему пространству имён window.EF. */

// Общий модуль сайта запускается только в браузере.
if (typeof window !== 'undefined') {
  window.EF = window.EF || {};

  (function (EF) {
    'use strict';

    /* Единый источник справочных данных сети клубов для всех страниц. */
    EF.CLUB = {
      name: 'Experience Fitness',
      city: 'Астана',
      callCenter: '+7 (778) 345-74-05',
      callCenterHref: 'tel:+77783457405',
      workdays: 'Пн – Сб: 07:00 – 23:00',
      weekend: 'Вс: выходной'
    };

    /* Массив филиалов: реальные данные клуба, совпадают с таблицей на странице «Филиалы». */
    EF.BRANCHES = [
      {
        id: 'baikonur',
        name: 'Филиал на Иманбаевой',
        district: 'Байконур',
        address: 'ул. Шолпан Иманбаевой, 8, корп. 2 (4-й этаж)',
        phone: '+7 (707) 238-80-00',
        phoneHref: 'tel:+77072388000',
        opensAt: 7,
        closesAt: 23,
        hasSauna: true,
        hasMartialArts: true,
        capacity: 320
      },
      {
        id: 'esil',
        name: 'Филиал на Асфендиярова',
        district: 'Есиль',
        address: 'ул. Санжара Асфендиярова, 6 (НП 18)',
        phone: '+7 (708) 647-53-83',
        phoneHref: 'tel:+77086475383',
        opensAt: 7,
        closesAt: 23,
        hasSauna: true,
        hasMartialArts: true,
        capacity: 280
      }
    ];

    /* Возвращает филиал по идентификатору (строгое сравнение ===). */
    EF.findBranchById = function (id) {
      const found = EF.BRANCHES.filter(function (branch) {
        return branch.id === id;
      });
      return found.length > 0 ? found[0] : null;
    };

    /* Преобразует число в цену формата «12 000 ₸». */
    EF.formatPrice = function (value) {
      const rounded = Math.round(Number(value));
      return rounded.toLocaleString('ru-RU') + ' ₸';
    };

    /* Преобразует длительность в минутах в читаемый вид: «1 ч 30 мин». */
    EF.formatMinutes = function (minutes) {
      const total = Number(minutes);
      if (total !== 60 && total % 60 === 0) {
        return total / 60 + ' ч';
      }
      const hours = Math.floor(total / 60);
      const rest = total % 60;
      if (hours === 0) {
        return rest + ' мин';
      }
      return hours + ' ч ' + rest + ' мин';
    };

    /* Демонстрационный номер заявки вида «EF-482913» на основе Math.random().
       Это условный номер, он не создаёт реальную запись на сервере. */
    EF.generateReference = function (prefix) {
      const code = Math.floor(100000 + Math.random() * 900000);
      return (prefix || 'EF') + '-' + code;
    };


    /* ===== Общие UI-функции для форм (используются на всех страницах сайта) ===== */


    /* Начало сегодняшнего дня — сравнение дат без учёта времени. */
    EF.startOfToday = function () {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };

    /* Форматирует дату для сводки: '2026-10-25' -> '25.10.2026'. */
    EF.formatDateRu = function (value) {
      if (!value) {
        return '—';
      }
      const parts = String(value).split('-');
      if (parts.length !== 3) {
        return value;
      }
      return parts[2] + '.' + parts[1] + '.' + parts[0];
    };

    /* Набор правил проверки полей: возвращают текст ошибки или пустую строку. */
    EF.rules = {
      fullName: fullNameError,
      required: function (value) {
        return String(value || '').trim() === '' ? 'Поле обязательно для заполнения' : '';
      },
      minLength: function (value, min) {
        return String(value || '').trim().length < min
          ? 'Слишком короткое значение (минимум ' + min + ' символов)'
          : '';
      },
      maxLength: function (value, max) {
        return String(value || '').length > max ? 'Максимум ' + max + ' символов' : '';
      },
      email: function (value) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return String(value || '').length <= 254 && pattern.test(String(value || '').trim()) ? '' : 'Укажите e-mail, например name@mail.kz';
      },
      phone: function (value) {
        return phoneError(value);
      },
      numberRange: function (value, min, max, integer = false) {
        if (String(value || '').trim() === '') {
          return 'Укажите числовое значение';
        }
        const number = Number(value);
        if (!Number.isFinite(number)) {
          return 'Введите число';
        }
        if (integer && !Number.isInteger(number)) return 'Введите целое число';
        return number < min || number > max ? 'Допустимо от ' + min + ' до ' + max : '';
      },
      notPastDate: function (value) {
        if (String(value || '').trim() === '') {
          return 'Выберите дату';
        }
        const picked = new Date(value + 'T00:00:00');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(picked.getTime()) || birthAge(value, picked) !== 0) return 'Укажите корректную дату';
        return picked.getTime() < EF.startOfToday().getTime() ? 'Дата не может быть в прошлом' : '';
      },
      withinDays: function (value, days) {
        const error = EF.rules.notPastDate(value);
        if (error) return error;
        const picked = new Date(value + 'T00:00:00');
        const limit = EF.startOfToday();
        limit.setDate(limit.getDate() + days);
        return picked.getTime() > limit.getTime()
          ? 'Выберите дату не позже чем через ' + days + ' дней'
          : '';
      },
      checked: function (isChecked) {
        return isChecked === true ? '' : 'Необходимо отметить этот пункт';
      }
    };


  })(window.EF);
}

// Capture: маска обновляет значение до обработчиков проверки jQuery.
if (typeof document !== 'undefined') {
  function prepareInput(field) {
    if (!field.matches || !field.matches('input')) return;
    const id = field.id;
    if (['visit-date', 'callback-date'].includes(id)) {
      const today = new Date();
      const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
      const localDate = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      field.min = localDate(today);
      field.max = localDate(limit);
    }
    if (['name', 'client-name', 'booking-name'].includes(id)) field.maxLength = 80;
    if (field.type === 'email') field.maxLength = 254;
    if (field.type === 'tel') field.maxLength = 18;
    if (field.type === 'search') field.maxLength = 100;
    if (id === 'client-dob') {
      field.autocomplete = 'bday';
      const now = new Date();
      field.max = (now.getFullYear() - 14) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      field.min = (now.getFullYear() - 100) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    }
    if (field.type === 'tel') {
      field.autocomplete = 'tel';
      field.inputMode = 'tel';
      field.placeholder = '+7 700 123 45 67';
    } else if (field.type === 'email') {
      field.autocomplete = 'email';
    } else if (['name', 'client-name', 'booking-name'].includes(id)) {
      field.autocomplete = 'name';
      field.placeholder = 'Имя Фамилия';
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input').forEach(prepareInput);
  });
  document.addEventListener('focus', function (event) {
    const field = event.target;
    prepareInput(field);
    if (field.matches('input[type="tel"]') && !field.value) field.value = '+7 ';
  }, true);
  document.addEventListener('blur', function (event) {
    if (event.target.matches('input[type="tel"]') && event.target.value.trim() === '+7') event.target.value = '';
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.target.matches('input[type="number"]') && ['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
  });
  document.addEventListener('input', function (event) {
    const field = event.target;
    if (event.isComposing) return;
    if (field.matches('input[type="number"]') && field.max && field.value) {
      const limited = limitNumberInput(field.value, field.max, field.step || '1');
      if (limited !== field.value) field.value = limited;
    }
    if (!field.matches('input[type="tel"]')) return;
    const oldValue = field.value;
    const position = field.selectionStart;
    const digitsAfter = oldValue.slice(position).replace(/\D/g, '').length;
    field.value = formatPhone(oldValue);
    if (position !== null && position < oldValue.length) {
      let caret = field.value.length;
      let remaining = digitsAfter;
      while (caret > 0 && remaining > 0) if (/\d/.test(field.value[--caret])) remaining--;
      field.setSelectionRange(caret, caret);
    }
  }, true);
}
