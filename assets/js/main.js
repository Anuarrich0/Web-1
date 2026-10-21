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
      callCenter: '+7 (778) 345-00-00',
      callCenterHref: 'tel:+77783450000',
      email: 'info@experiencefitness.kz',
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

    /* Возвращает случайный элемент массива (для «выбора» одного пункта). */
    EF.pickRandom = function (list) {
      if (!Array.isArray(list) || list.length === 0) {
        return null;
      }
      const index = Math.floor(Math.random() * list.length);
      return list[index];
    };

    /* Суммирует значения массива по функции-селектору. */
    EF.sumBy = function (list, selector) {
      const items = Array.isArray(list) ? list : [];
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total = total + Number(selector(items[i]));
      }
      return total;
    };

    /* Среднее арифметическое массива чисел (0 для пустого массива).
       Вызывает другую функцию модуля — EF.sumBy. */
    EF.average = function (numbers) {
      const items = Array.isArray(numbers) ? numbers : [];
      if (items.length === 0) {
        return 0;
      }
      return EF.sumBy(items, function (value) {
        return value;
      }) / items.length;
    };

    /* ===== Общие UI-функции для форм (используются на всех страницах сайта) ===== */

    /* Приводит телефон к цифрам: '+7 (707) 238-80-00' -> '77072388000'. */
    EF.normalizeDigits = function (value) {
      return String(value || '').replace(/\D/g, '');
    };

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
      required: function (value) {
        return String(value || '').trim() === '' ? 'Поле обязательно для заполнения' : '';
      },
      minLength: function (value, min) {
        return String(value || '').trim().length < min
          ? 'Слишком короткое значение (минимум ' + min + ' символов)'
          : '';
      },
      email: function (value) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return pattern.test(String(value || '').trim()) ? '' : 'Укажите e-mail, например name@mail.kz';
      },
      phone: function (value) {
        const digits = EF.normalizeDigits(value);
        return digits.length >= 10 && digits.length <= 11 ? '' : 'Укажите телефон из 10–11 цифр';
      },
      numberRange: function (value, min, max) {
        if (String(value || '').trim() === '') {
          return 'Укажите числовое значение';
        }
        const number = Number(value);
        if (Number.isNaN(number)) {
          return 'Введите число';
        }
        return number < min || number > max ? 'Допустимо от ' + min + ' до ' + max : '';
      },
      notPastDate: function (value) {
        if (String(value || '').trim() === '') {
          return 'Выберите дату';
        }
        const picked = new Date(value + 'T00:00:00');
        return picked.getTime() < EF.startOfToday().getTime() ? 'Дата не может быть в прошлом' : '';
      },
      withinDays: function (value, days) {
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

    /* Создаёт (при необходимости) и заполняет сообщение об ошибке рядом с полем.
       container — необязательный контейнер (по умолчанию — родитель поля). */
    EF.setFieldError = function (field, message, container) {
      const box = container || (field ? field.parentElement : null);
      if (!box) {
        return;
      }
      if (field) {
        field.classList.add('is-error');
        field.classList.remove('is-success');
        field.setAttribute('aria-invalid', 'true');
      }
      let note = box.querySelector('.field-error');
      if (!note) {
        note = document.createElement('span');
        note.className = 'field-error d-block text-danger small mt-1';
        box.appendChild(note);
      }
      note.textContent = message;
    };

    /* Помечает поле как корректное (зелёная рамка) и убирает текст ошибки. */
    EF.markFieldValid = function (field, container) {
      const box = container || (field ? field.parentElement : null);
      if (field) {
        field.classList.remove('is-error');
        field.classList.add('is-success');
        field.removeAttribute('aria-invalid');
      }
      if (box) {
        const note = box.querySelector('.field-error');
        if (note) {
          note.textContent = '';
        }
      }
    };

    /* Убирает состояние ошибки у одного поля (например, когда пользователь правит значение). */
    EF.clearFieldError = function (field, container) {
      const box = container || (field ? field.parentElement : null);
      if (field) {
        field.classList.remove('is-error');
        field.removeAttribute('aria-invalid');
      }
      if (box) {
        const note = box.querySelector('.field-error');
        if (note) {
          note.textContent = '';
        }
      }
    };

    /* Проверяет одно поле набором правил и показывает первую найденную ошибку.
       checks — массив функций, возвращающих текст ошибки или пустую строку.
       Возвращает true, если поле прошло все проверки. */
    EF.validateField = function (field, checks, container) {
      if (!field) {
        return true;
      }
      const list = Array.isArray(checks) ? checks : [];
      for (let i = 0; i < list.length; i++) {
        const message = list[i]();
        if (message !== '') {
          EF.setFieldError(field, message, container);
          return false;
        }
      }
      EF.clearFieldError(field, container);
      return true;
    };

    /* Полностью очищает состояния и сообщения об ошибках внутри формы. */
    EF.clearFormErrors = function (form) {
      if (!form) {
        return;
      }
      const marked = form.querySelectorAll('.is-error, .is-success, [aria-invalid]');
      for (let i = 0; i < marked.length; i++) {
        marked[i].classList.remove('is-error');
        marked[i].classList.remove('is-success');
        marked[i].removeAttribute('aria-invalid');
      }
      const notes = form.querySelectorAll('.field-error');
      for (let j = 0; j < notes.length; j++) {
        if (notes[j].parentNode) {
          notes[j].parentNode.removeChild(notes[j]);
        }
      }
    };

    /* Включает кнопки submit, если они были отключены в разметке midterm. */
    EF.enableSubmitButtons = function (form) {
      if (!form) {
        return;
      }
      const buttons = form.querySelectorAll('button[type="submit"]');
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].removeAttribute('disabled');
      }
    };

    /* Показывает итоговое сообщение формы: успех или список ошибок. */
    EF.showFormFeedback = function (container, type, title, details) {
      if (!container) {
        return;
      }
      container.textContent = '';
      container.classList.remove('is-success', 'is-error');
      const box = document.createElement('div');
      box.className = type === 'success' ? 'alert alert-success mb-0' : 'alert alert-danger mb-0';
      const heading = document.createElement('p');
      heading.className = 'fw-bold mb-2';
      heading.textContent = title;
      box.appendChild(heading);
      if (Array.isArray(details) && details.length > 0) {
        const list = document.createElement('ul');
        list.className = 'mb-0 ps-3';
        for (let i = 0; i < details.length; i++) {
          const item = document.createElement('li');
          item.textContent = details[i];
          list.appendChild(item);
        }
        box.appendChild(list);
      }
      container.appendChild(box);
      container.classList.add(type === 'success' ? 'is-success' : 'is-error');
    };

    /* Убирает итоговое сообщение формы. */
    EF.clearFormFeedback = function (container) {
      if (!container) {
        return;
      }
      container.textContent = '';
      container.classList.remove('is-success', 'is-error');
    };
  })(window.EF);
}
