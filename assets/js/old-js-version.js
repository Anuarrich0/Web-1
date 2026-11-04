'use strict';

/* ============================================================================
   old-js-version.js — архивная версия НА ЧИСТОМ JAVASCRIPT (Assignment 5).

   Здесь лежат четыре фичи, которые в Assignment 6 переписаны с Vanilla JS на
   jQuery:
     1) валидация формы обратной связи          (было в contacts.js);
     2) фильтр каталога услуг + поиск            (было в services.js);
     3) фильтр филиалов по районам               (было в locations.js);
     4) фильтр расписания и калькулятор калорий  (было в training.js).

   ВАЖНО: файл НИГДЕ не подключён к страницам (его нет ни в одном <script>).
   Он нужен только для сравнения «до / после» рядом с jQuery-версией, как
   требует задание. Код напрямую работает с DOM через getElementById /
   classList / addEventListener и вызывает общие функции window.EF (main.js).
   ============================================================================ */

/* ===== 1. Валидация формы обратной связи (contacts.html) — старая версия. ===== */
(function (EF) {
  'use strict';

  const feedback = document.getElementById('contact-form-feedback');
  if (!feedback) {
    return;
  }

  const form = feedback.closest('form');
  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    age: document.getElementById('client-age'),
    date: document.getElementById('callback-date'),
    topic: document.getElementById('topic'),
    replyPhone: document.getElementById('reply-phone'),
    replyEmail: document.getElementById('reply-email'),
    message: document.getElementById('message'),
    agree: document.getElementById('agree-contact')
  };
  form.noValidate = true;
  EF.enableSubmitButtons(form);

  /* Составное правило: телефон обязателен, если выбран ответ звонком. */
  function phoneCheck() {
    if (fields.replyPhone.checked && fields.phone.value.trim() === '') {
      return 'Укажите телефон для ответа звонком';
    }
    return fields.phone.value.trim() === '' ? '' : EF.rules.phone(fields.phone.value);
  }

  /* Проверяет поля формы; возвращает первое неверное поле или null. */
  function validateContact() {
    let firstInvalid = null;
    function check(field, checks, container) {
      const isOk = EF.validateField(field, checks, container);
      if (!isOk && !firstInvalid) {
        firstInvalid = field;
      }
    }
    check(fields.name, [
      function () { return EF.rules.required(fields.name.value); },
      function () { return EF.rules.minLength(fields.name.value, 2); }
    ]);
    check(fields.email, [
      function () { return EF.rules.required(fields.email.value); },
      function () { return EF.rules.email(fields.email.value); }
    ]);
    check(fields.phone, [phoneCheck]);
    check(fields.age, [
      function () {
        return fields.age.value.trim() === '' ? '' : EF.rules.numberRange(fields.age.value, 12, 99);
      }
    ]);
    check(fields.date, [
      function () {
        return fields.date.value === '' ? '' : EF.rules.notPastDate(fields.date.value);
      }
    ]);
    check(fields.message, [
      function () { return EF.rules.required(fields.message.value); },
      function () { return EF.rules.minLength(fields.message.value, 10); }
    ]);
    check(fields.agree, [
      function () { return EF.rules.checked(fields.agree.checked); }
    ], fields.agree.closest('.col-12'));
    return firstInvalid;
  }

  /* Собирает тексты ошибок, показанные рядом с полями. */
  function collectErrors() {
    const notes = form.querySelectorAll('.field-error');
    const messages = [];
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].textContent !== '') {
        messages.push(notes[i].textContent);
      }
    }
    return messages;
  }

  function clearOnEdit(event) {
    if (event.target && event.target.classList) {
      EF.clearFieldError(event.target, event.target.closest('.col-12, p'));
    }
  }
  form.addEventListener('input', clearOnEdit);
  form.addEventListener('change', clearOnEdit);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstInvalid = validateContact();
    if (firstInvalid) {
      EF.showFormFeedback(feedback, 'error', 'Форма заполнена неверно', collectErrors());
      firstInvalid.focus();
      return;
    }
    const method = fields.replyEmail.checked ? 'по электронной почте' : 'по телефону';
    const reference = EF.generateReference('MSG');
    EF.showFormFeedback(feedback, 'success', 'Сообщение ' + reference + ' принято', [
      'Имя: ' + fields.name.value.trim(),
      'Тема: ' + EF.describeTopic(fields.topic.value),
      'Способ ответа: ' + method,
      'Контакт: ' + fields.email.value.trim() +
        (fields.phone.value.trim() === '' ? '' : ', ' + fields.phone.value.trim()),
      'Демонстрационная форма: сообщение не отправлено на сервер и не создаёт реальное обращение.'
    ]);
  });

  form.addEventListener('reset', function () {
    EF.clearFormErrors(form);
    EF.clearFormFeedback(feedback);
  });
})(window.EF);

/* ===== 2. Фильтр каталога услуг + поиск и валидация формы записи (services.html). ===== */
(function (EF) {
  'use strict';

  const section = document.getElementById('services-articles');
  if (!section) {
    return;
  }

  const cards = section.querySelectorAll('.service-card');
  const tabLinks = document.querySelectorAll('.tabs-list a');
  const CATEGORY_BY_HREF = {
    '#services-articles': 'all',
    '#service-strength': 'strength',
    '#service-group': 'group',
    '#service-spa': 'spa'
  };
  let activeCategory = 'all';

  /* Панель поиска и счётчик результата (создаются через DOM). */
  const panel = document.createElement('div');
  panel.className = 'col-12 mb-3';
  const searchLabel = document.createElement('label');
  searchLabel.className = 'form-label';
  searchLabel.htmlFor = 'services-search';
  searchLabel.textContent = 'Поиск услуги:';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.id = 'services-search';
  searchInput.className = 'form-control mb-2';
  searchInput.placeholder = 'Например: кроссфит, сауна, стретчинг';
  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.id = 'services-reset';
  resetButton.className = 'btn btn-outline-light btn-sm me-2';
  resetButton.textContent = 'Сбросить фильтры';
  const status = document.createElement('span');
  status.className = 'small text-body-secondary';
  status.setAttribute('role', 'status');
  panel.append(searchLabel, searchInput, resetButton, status);
  section.querySelector('h2').after(panel);

  const empty = document.createElement('p');
  empty.className = 'col-12 text-body-secondary is-hidden';
  empty.textContent = 'Ничего не найдено. Измените поисковый запрос или сбросьте фильтры.';
  section.appendChild(empty);

  function matchesQuery(service, query) {
    if (query === '') {
      return true;
    }
    const haystack = (service.name + ' ' + service.description).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function countServices(category, query) {
    const inCategory = category === 'all' ? EF.SERVICES : EF.getServicesByCategory(category);
    return inCategory.filter(function (service) {
      return matchesQuery(service, query);
    }).length;
  }

  function applyCatalogFilter() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCards = 0;
    let visibleServices = 0;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const category = card.dataset.category;
      const count = countServices(category, query);
      const show = (activeCategory === 'all' || category === activeCategory) && count > 0;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visibleCards = visibleCards + 1;
        visibleServices = visibleServices + count;
      }
    }
    status.textContent = 'Показано зон: ' + visibleCards + ', услуг: ' + visibleServices;
    empty.classList.toggle('is-hidden', visibleCards > 0);
  }

  function selectCategory(category) {
    activeCategory = category;
    for (let i = 0; i < tabLinks.length; i++) {
      const link = tabLinks[i];
      const linkCategory = CATEGORY_BY_HREF[link.getAttribute('href')] || 'all';
      link.classList.toggle('is-selected', linkCategory === category);
    }
    applyCatalogFilter();
  }

  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].addEventListener('click', function (event) {
      const href = this.getAttribute('href');
      if (CATEGORY_BY_HREF[href] === undefined) {
        return;
      }
      event.preventDefault();
      selectCategory(CATEGORY_BY_HREF[href]);
    });
  }
  searchInput.addEventListener('input', applyCatalogFilter);
  resetButton.addEventListener('click', function () {
    searchInput.value = '';
    selectCategory('all');
  });

  /* --- Валидация формы записи на консультацию (#consultation-form). --- */
  const form = document.getElementById('consultation-form');
  if (form) {
    const feedback = document.getElementById('booking-form-feedback');
    const output = document.getElementById('calc-output');
    const BRANCH_BY_OPTION = { imanbayeva: 'baikonur', asfendiyarova: 'esil' };
    form.noValidate = true;
    EF.enableSubmitButtons(form);

    const fields = {
      name: document.getElementById('client-name'),
      email: document.getElementById('subscriber-email'),
      phone: document.getElementById('client-phone'),
      age: document.getElementById('client-age'),
      date: document.getElementById('visit-date'),
      branch: document.getElementById('branch-select'),
      health: document.getElementById('health-agree'),
      goals: document.getElementById('client-goals')
    };

    function validateConsultation() {
      let firstInvalid = null;
      function remember(field, isOk) {
        if (!isOk && !firstInvalid) {
          firstInvalid = field;
        }
      }
      remember(fields.name, EF.validateField(fields.name, [
        function () { return EF.rules.required(fields.name.value); },
        function () { return EF.rules.minLength(fields.name.value, 3); }
      ]));
      remember(fields.email, EF.validateField(fields.email, [
        function () { return EF.rules.required(fields.email.value); },
        function () { return EF.rules.email(fields.email.value); }
      ]));
      remember(fields.phone, EF.validateField(fields.phone, [
        function () { return EF.rules.required(fields.phone.value); },
        function () { return EF.rules.phone(fields.phone.value); }
      ]));
      remember(fields.age, EF.validateField(fields.age, [
        function () { return EF.rules.numberRange(fields.age.value, 14, 90); }
      ]));
      remember(fields.date, EF.validateField(fields.date, [
        function () { return EF.rules.notPastDate(fields.date.value); },
        function () { return EF.rules.withinDays(fields.date.value, 90); }
      ]));
      remember(fields.branch, EF.validateField(fields.branch, [
        function () { return EF.rules.required(fields.branch.value); }
      ]));
      remember(fields.health, EF.validateField(fields.health, [
        function () { return EF.rules.checked(fields.health.checked); }
      ], fields.health.closest('p')));
      return firstInvalid;
    }

    function collectErrors() {
      const notes = form.querySelectorAll('.field-error');
      const messages = [];
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].textContent !== '') {
          messages.push(notes[i].textContent);
        }
      }
      return messages;
    }

    function clearOnEdit(event) {
      if (event.target && event.target.classList) {
        EF.clearFieldError(event.target, event.target.closest('.form-field, .form-field-checkbox, .col-12, p'));
      }
    }
    form.addEventListener('input', clearOnEdit);
    form.addEventListener('change', clearOnEdit);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const firstInvalid = validateConsultation();
      if (firstInvalid) {
        EF.showFormFeedback(feedback, 'error', 'Форма заполнена неверно', collectErrors());
        if (output) {
          output.textContent = 'Проверьте выделенные поля формы';
        }
        firstInvalid.focus();
        return;
      }
      const branch = EF.findBranchById(BRANCH_BY_OPTION[fields.branch.value]);
      const reference = EF.generateReference('EF');
      EF.showFormFeedback(feedback, 'success', 'Заявка ' + reference + ' принята', [
        'Клиент: ' + fields.name.value.trim(),
        'Филиал: ' + EF.describeBranch(branch),
        'Дата визита: ' + EF.formatDateRu(fields.date.value),
        'Возраст: ' + fields.age.value + ' лет',
        'Контакт: ' + fields.phone.value.trim() + ', ' + fields.email.value.trim(),
        'Демонстрационная заявка: данные не отправлены на сервер, реальная запись не создана.'
      ]);
      if (output) {
        output.textContent = 'Заявка ' + reference + ' сформирована (демонстрация)';
      }
    });

    form.addEventListener('reset', function () {
      EF.clearFormErrors(form);
      EF.clearFormFeedback(feedback);
      if (output) {
        output.textContent = 'Заполните обязательные поля формы';
      }
    });
  }

  selectCategory('all');
})(window.EF);

/* ===== 3. Фильтр филиалов по районам (locations.html) — старая версия. ===== */
(function (EF) {
  'use strict';

  const filters = document.getElementById('branch-filters');
  const tableSection = document.getElementById('locations-table-section');
  if (!filters || !tableSection) {
    return;
  }

  const links = filters.querySelectorAll('a');
  const rows = tableSection.querySelectorAll('tbody tr[data-district]');
  const DISTRICT_BY_HREF = {
    '#locations-table-section': 'all',
    '#branch-baikonur': 'baikonur',
    '#branch-esil': 'esil'
  };

  const status = document.createElement('p');
  status.className = 'small text-body-secondary mb-0';
  status.setAttribute('role', 'status');
  filters.appendChild(status);

  function applyDistrictFilter(district) {
    let visible = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const show = district === 'all' || row.dataset.district === district;
      row.classList.toggle('is-hidden', !show);
      if (show) {
        visible = visible + 1;
      }
    }
    for (let j = 0; j < links.length; j++) {
      const linkDistrict = DISTRICT_BY_HREF[links[j].getAttribute('href')] || 'all';
      links[j].classList.toggle('is-selected', linkDistrict === district);
    }
    status.textContent = 'Показано филиалов: ' + visible + ' из ' + EF.BRANCHES.length;
  }

  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (event) {
      const district = DISTRICT_BY_HREF[this.getAttribute('href')];
      if (district === undefined) {
        return;
      }
      event.preventDefault();
      applyDistrictFilter(district);
    });
  }

  applyDistrictFilter('all');
})(window.EF);

/* ===== 4. Фильтр расписания, калькулятор калорий и форма записи (training.html). ===== */
(function (EF) {
  'use strict';

  /* --- Фильтр расписания тренировочной недели. --- */
  const scheduleSection = document.getElementById('training-schedule');
  if (scheduleSection) {
    const buttons = scheduleSection.querySelectorAll('[data-schedule-filter]');
    const rows = scheduleSection.querySelectorAll('tbody tr[data-category]');
    const status = document.createElement('p');
    status.className = 'small text-body-secondary mb-0';
    status.setAttribute('role', 'status');
    scheduleSection.querySelector('.table-responsive').after(status);

    function applyScheduleFilter(category) {
      let visible = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const show = category === 'all' || row.dataset.category === category;
        row.classList.toggle('is-hidden', !show);
        if (show) {
          visible = visible + 1;
        }
      }
      for (let j = 0; j < buttons.length; j++) {
        const active = buttons[j].dataset.scheduleFilter === category;
        buttons[j].classList.toggle('is-selected', active);
        buttons[j].classList.toggle('active', active);
      }
      status.textContent = 'Показано занятий: ' + visible + ' из ' + rows.length;
    }

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        applyScheduleFilter(this.dataset.scheduleFilter);
      });
    }
    applyScheduleFilter('all');
  }

  /* --- Калькулятор калорий и графика тренировок (#calculator-form). --- */
  const calcForm = document.getElementById('calculator-form');
  if (calcForm) {
    const results = document.getElementById('calculator-results');
    const submitButton = document.getElementById('calc-submit-btn');
    const fields = {
      gender: document.getElementById('calc-gender'),
      age: document.getElementById('calc-age'),
      height: document.getElementById('calc-height'),
      weight: document.getElementById('calc-weight'),
      activity: document.getElementById('calc-activity'),
      goal: document.getElementById('calc-goal')
    };
    const outputs = {
      bmr: document.getElementById('result-bmr'),
      tdee: document.getElementById('result-tdee'),
      target: document.getElementById('result-target-calories'),
      frequency: document.getElementById('result-workout-freq'),
      program: document.getElementById('result-program-recommendation')
    };
    calcForm.noValidate = true;

    function frequencyText(count) {
      if (count === 1) {
        return '1 тренировка в неделю';
      }
      if (count >= 2 && count <= 4) {
        return count + ' тренировки в неделю';
      }
      return count + ' тренировок в неделю';
    }

    function validateCalculator() {
      let firstInvalid = null;
      const ranges = [
        [fields.age, 14, 90],
        [fields.height, 120, 230],
        [fields.weight, 35, 250]
      ];
      for (let i = 0; i < ranges.length; i++) {
        const field = ranges[i][0];
        const min = ranges[i][1];
        const max = ranges[i][2];
        const isOk = EF.validateField(field, [
          function () { return EF.rules.numberRange(field.value, min, max); }
        ]);
        if (!isOk && !firstInvalid) {
          firstInvalid = field;
        }
      }
      return firstInvalid;
    }

    function calculatePlan() {
      const firstInvalid = validateCalculator();
      if (firstInvalid) {
        results.classList.add('is-hidden');
        firstInvalid.focus();
        return;
      }
      const plan = EF.buildFitnessPlan({
        gender: fields.gender.value === 'female' ? 'female' : 'male',
        age: Number(fields.age.value),
        height: Number(fields.height.value),
        weight: Number(fields.weight.value),
        activity: fields.activity.value,
        goal: fields.goal.value
      });
      outputs.bmr.textContent = String(plan.bmr);
      outputs.tdee.textContent = String(plan.tdee);
      outputs.target.textContent = String(plan.targetCalories);
      outputs.frequency.textContent = frequencyText(plan.workoutFrequency);
      outputs.program.textContent = plan.program;
      results.classList.remove('is-hidden');
    }

    submitButton.addEventListener('click', calculatePlan);
    calcForm.addEventListener('submit', function (event) {
      event.preventDefault();
      calculatePlan();
    });
    calcForm.addEventListener('reset', function () {
      EF.clearFormErrors(calcForm);
      results.classList.add('is-hidden');
    });
  }

  /* --- Валидация формы подписки (#signup-form-feedback). --- */
  const signupFeedback = document.getElementById('signup-form-feedback');
  if (signupFeedback) {
    const form = signupFeedback.closest('form');
    const fields = {
      name: document.getElementById('full-name'),
      email: document.getElementById('train-email'),
      phone: document.getElementById('train-phone'),
      age: document.getElementById('train-age'),
      date: document.getElementById('preferred-date'),
      agree: document.getElementById('agree')
    };
    form.noValidate = true;
    EF.enableSubmitButtons(form);

    function describeDirection(value) {
      if (value === 'crossfit') {
        return 'Кроссфит';
      }
      if (value === 'group') {
        return 'Групповые занятия';
      }
      return 'Тренажёрный зал';
    }

    function validateSignup() {
      let firstInvalid = null;
      function check(field, checks, container) {
        const isOk = EF.validateField(field, checks, container);
        if (!isOk && !firstInvalid) {
          firstInvalid = field;
        }
      }
      check(fields.name, [
        function () { return EF.rules.required(fields.name.value); },
        function () { return EF.rules.minLength(fields.name.value, 2); }
      ]);
      check(fields.email, [
        function () { return EF.rules.required(fields.email.value); },
        function () { return EF.rules.email(fields.email.value); }
      ]);
      check(fields.phone, [
        function () {
          return fields.phone.value.trim() === '' ? '' : EF.rules.phone(fields.phone.value);
        }
      ]);
      check(fields.age, [
        function () {
          return fields.age.value.trim() === '' ? '' : EF.rules.numberRange(fields.age.value, 12, 99);
        }
      ]);
      check(fields.date, [
        function () {
          return fields.date.value === '' ? '' : EF.rules.notPastDate(fields.date.value);
        }
      ]);
      check(fields.agree, [
        function () { return EF.rules.checked(fields.agree.checked); }
      ], fields.agree.closest('.col-12'));
      return firstInvalid;
    }

    function collectErrors() {
      const notes = form.querySelectorAll('.field-error');
      const messages = [];
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].textContent !== '') {
          messages.push(notes[i].textContent);
        }
      }
      return messages;
    }

    function clearOnEdit(event) {
      if (event.target && event.target.classList) {
        EF.clearFieldError(event.target, event.target.closest('.col-12, p'));
      }
    }
    form.addEventListener('input', clearOnEdit);
    form.addEventListener('change', clearOnEdit);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const firstInvalid = validateSignup();
      if (firstInvalid) {
        EF.showFormFeedback(signupFeedback, 'error', 'Форма заполнена неверно', collectErrors());
        firstInvalid.focus();
        return;
      }
      const direction = form.querySelector('[name="direction"]:checked');
      const reference = EF.generateReference('TR');
      EF.showFormFeedback(signupFeedback, 'success', 'Запись ' + reference + ' принята', [
        'Имя: ' + fields.name.value.trim(),
        'Контакт: ' + fields.email.value.trim() +
          (fields.phone.value.trim() === '' ? '' : ', ' + fields.phone.value.trim()),
        'Направление: ' + describeDirection(direction ? direction.value : ''),
        'Пробная тренировка: ' + (fields.date.value === '' ? 'дата не выбрана' : EF.formatDateRu(fields.date.value)),
        'Демонстрационная форма: данные не отправлены на сервер, запись на тренировку не создана.'
      ]);
    });

    form.addEventListener('reset', function () {
      EF.clearFormErrors(form);
      EF.clearFormFeedback(signupFeedback);
    });
  }
})(window.EF);


/* ===== 5. Страница «Абонементы» (pricing.html) — старая версия на чистом JavaScript.

   В Assignment 6 переписана на jQuery и лежит в pricing-jquery.js (фильтр тарифов,
   форма оформления и попап оплаты). Ниже сохранён прежний код для сравнения «до / после». ===== */
'use strict';

(function () {
  // Находим блок тарифов и карточки, создаём поиск и фильтр срока.
  const section = document.querySelector('#pricing-plans');
  const cards = section.querySelectorAll('[data-tariff]');
  const controls = element('div', '', 'col-12');
  const label = element('label', 'Поиск тарифа', 'form-label');
  label.htmlFor = 'tariff-search';
  const search = element('input', '', 'form-control mb-3');
  search.id = 'tariff-search';
  search.type = 'search';
  controls.append(label, search);
  const duration = selectField(controls, 'duration-filter', 'Показать цены на срок', [
    ['', 'Все сроки'], ['1', '1 месяц'], ['3', '3 месяца'], ['6', '6 месяцев'], ['12', '12 месяцев']
  ]);
  const reset = element('button', 'Сбросить фильтры', 'btn btn-outline-light mb-3');
  reset.type = 'button';
  const count = element('p');
  count.setAttribute('role', 'status');
  controls.append(reset, count);
  section.querySelector('h2').after(controls);
  const empty = element('p', 'Ничего не найдено. Измените запрос или сбросьте фильтры.', 'col-12 is-hidden');
  section.append(empty);

  // Создаёт одну строку срока и цены внутри карточки.
  function priceRow(item) {
    const row = element('li', '', 'row g-2 border-bottom py-2');
    row.append(element('span', `${item.months} мес.`, 'col-5 text-body-secondary small'),
      element('span', money(item.price), 'col-7 fw-bold text-end'));
    return row;
  }

  // Совмещает поиск и срок, обновляет цены, видимость и число тарифов.
  function filterTariffs() {
    const query = search.value.trim().toLocaleLowerCase('ru-RU');
    let visible = 0;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const items = memberships.filter(function (item) {
        const matchesCard = item.tariff === card.dataset.tariff;
        const matchesSearch = item.name.toLocaleLowerCase('ru-RU').includes(query);
        const matchesDuration = duration.value === '' || item.months === Number(duration.value);
        return matchesCard && matchesSearch && matchesDuration;
      });
      card.classList.toggle('is-hidden', items.length === 0);
      renderList(card.querySelector('.price-list'), items, priceRow);
      if (items.length > 0) {
        visible += 1;
      }
    }
    count.textContent = `Найдено тарифов: ${visible}`;
    empty.classList.toggle('is-hidden', visible !== 0);
  }
  // Ввод и выбор запускают фильтрацию; сброс очищает оба фильтра.
  search.addEventListener('input', filterTariffs);
  duration.addEventListener('change', filterTariffs);
  reset.addEventListener('click', function () {
    search.value = '';
    duration.value = '';
    filterTariffs();
  });

  // Подготовка формы: возраст вычисляется по обязательной дате рождения.
  const form = document.querySelector('#order-form form');
  const tariff = document.querySelector('#tariff-select');
  const feedback = document.querySelector('#pricing-order-feedback');
  const fields = form.querySelectorAll('fieldset');
  document.querySelector('#client-age').parentElement.remove();
  const birth = document.querySelector('#client-dob');
  birth.required = true;
  const ageOutput = element('span', '', 'small d-block');
  ageOutput.setAttribute('aria-live', 'polite');
  birth.after(ageOutput);
  form.noValidate = true;
  form.querySelector('[type="submit"]').disabled = false;
  document.querySelector('#form-note-0').textContent = 'Учебная заявка: данные не отправляются на сервер, реальный заказ, оплата и бронирование не создаются.';
  // Дополнительные согласия, скидка и блок текущего расчёта.
  const student = checkboxField(fields[1], 'student-discount', 'Студенческий билет: предварительная скидка 15% (проверяется менеджером)');
  const guardian = checkboxField(fields[2], 'guardian-agree', 'Есть согласие законного представителя (до 18 лет)');
  const accompanied = checkboxField(fields[2], 'accompanied-agree', 'Буду заниматься с представителем или тренером (до 15 лет)');
  const summary = element('p', '', 'col-12');
  summary.setAttribute('aria-live', 'polite');
  fields[1].append(summary);
  const comment = document.querySelector('#client-comment');
  const counter = element('span', '', 'small d-block');
  comment.after(counter);
  // До первой отправки не показываем ошибки незаполненной формы.
  let attempted = false;

  // Собирает текущие значения формы в один объект.
  function readOrder() {
    const selectedTerm = form.querySelector('[name="term"]:checked');
    let months = '';
    if (selectedTerm) {
      months = selectedTerm.value;
    }
    return {
      name: document.querySelector('#client-name').value,
      email: document.querySelector('#client-email').value,
      phone: document.querySelector('#client-phone').value,
      age: birthAge(birth.value),
      birth: birth.value,
      tariff: tariff.value,
      months: months,
      agree: document.querySelector('#client-agree').checked,
      guardian: guardian.checked,
      accompanied: accompanied.checked,
      comment: comment.value
    };
  }

  // Удаляет старые ошибки и показывает актуальные рядом с полями.
  function showErrors(errors) {
    const oldMessages = form.querySelectorAll('[data-field-error]');
    for (let i = 0; i < oldMessages.length; i++) {
      const message = oldMessages[i];
      const input = document.getElementById(message.dataset.fieldError);
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      message.remove();
    }
    const errorIds = Object.keys(errors);
    for (let i = 0; i < errorIds.length; i++) {
      const id = errorIds[i];
      const text = errors[id];
      const input = document.getElementById(id);
      const message = element('span', text, 'd-block text-danger small');
      message.id = `${id}-error`;
      message.dataset.fieldError = id;
      input.parentElement.append(message);
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', message.id);
    }
  }

  // Обновляет цену, возраст, подсветку карточек и проверки формы.
  function updateOrder() {
    const data = readOrder();
    const item = findMembership(data.tariff, data.months);
    if (item) {
      const price = membershipPrice(item, student.checked);
      summary.textContent = `${item.name}, ${item.months} мес. Цена: ${money(item.price)}. Скидка: ${money(price.discount)}. Итого: ${money(price.total)} (≈ ${money(price.monthly)}/мес.).`;
      if (student.checked) {
        summary.textContent += ' Студенческий билет проверяется в клубе.';
      }
    } else {
      summary.textContent = 'Выберите тариф и срок для расчёта стоимости.';
    }
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.dataset.tariff === data.tariff) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    }
    if (Number.isInteger(data.age)) {
      ageOutput.textContent = `Возраст: ${data.age} (рассчитан автоматически)`;
    } else {
      ageOutput.textContent = '';
    }
    guardian.parentElement.classList.toggle('is-hidden', !(data.age >= 14 && data.age < 18));
    accompanied.parentElement.classList.toggle('is-hidden', !(data.age >= 14 && data.age < 15));
    counter.textContent = `${comment.value.length} / 500 символов`;
    if (attempted) {
      const errors = membershipErrors(data);
      showErrors(errors);
      if (Object.keys(errors).length === 0 && feedback.classList.contains('is-error')) {
        feedback.classList.remove('is-error');
        feedback.textContent = 'Ошибки исправлены. Можно отправить демонстрационную заявку.';
      }
    }
  }

  // Кнопка карточки выбирает тариф и срок в форме.
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.querySelector('a').addEventListener('click', function (event) {
      event.preventDefault();
      tariff.value = card.dataset.tariff;
      const months = duration.value || readOrder().months || '1';
      document.getElementById(`term-${months}`).checked = true;
      updateOrder();
      tariff.focus();
    });
  }
  // Изменения полей сразу обновляют расчёт.
  form.addEventListener('input', updateOrder);
  form.addEventListener('change', updateOrder);
  // Останавливаем отправку на сервер, проверяем поля и фокусируем ошибку.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    attempted = true;
    const data = readOrder();
    const errors = membershipErrors(data);
    showErrors(errors);
    feedback.classList.remove('is-error', 'is-success');
    if (Object.keys(errors).length > 0) {
      feedback.textContent = 'Исправьте ошибки у полей. Заявка не сформирована.';
      feedback.classList.add('is-error');
      document.getElementById(Object.keys(errors)[0]).focus();
      return;
    }
    feedback.replaceChildren();
  });
  // Сброс очищает ошибки; пересчёт идёт после стандартного сброса полей.
  form.addEventListener('reset', function () {
    attempted = false;
    showErrors({});
    feedback.replaceChildren();
    feedback.classList.remove('is-error', 'is-success');
    // Native fields are reset after this event finishes.
    setTimeout(updateOrder, 0);
  });
  // Читаем тариф, срок и скидку из ссылки со страницы акций.
  const params = new URLSearchParams(window.location.search);
  const requested = findMembership(params.get('tariff'), params.get('months'));
  if (requested) {
    tariff.value = requested.tariff;
    document.getElementById(`term-${requested.months}`).checked = true;
    student.checked = params.get('student') === '1';
  }
  // Первый вывод при открытии страницы.
  filterTariffs();
  updateOrder();
})();

/*
section — блок тарифов; cards — карточки; controls — контейнер фильтров.
search — текстовый поиск; duration — срок; reset — сброс; count — число результатов.
priceRow — одна строка цены; filterTariffs — поиск и вывод подходящих тарифов.
form — форма; tariff — выбранный тариф; birth — дата рождения; ageOutput — возраст.
student — скидка; guardian/accompanied — согласие и сопровождение несовершеннолетних.
summary — расчёт цены; comment/counter — комментарий и счётчик; feedback — сообщения.
readOrder — прочитать поля; showErrors — показать ошибки; updateOrder — обновить экран.
attempted — была ли попытка отправки; value — значение поля; checked — галочка.
querySelector — найти элемент; querySelectorAll — найти все; dataset — data-атрибуты.
input — ввод; change — смена выбора; click — нажатие; submit — отправка; reset — сброс.
preventDefault — отменить обычное действие; focus — перевести курсор в поле.
URLSearchParams — параметры ссылки; is-hidden — скрыть; is-selected — подсветить.
Путь: изменение поля → updateOrder → readOrder → поиск тарифа → расчёт → вывод.
*/
