'use strict';

/* Каталог услуг и зон Experience Fitness (страница services.html).
   Значения category совпадают с атрибутами data-category карточек на странице услуг.
   Использует общий модуль window.EF (main.js). */

(function (EF) {
  'use strict';

  /* Категории услуг: те же идентификаторы, что и data-category в разметке. */
  EF.SERVICE_CATEGORIES = [
    { id: 'strength', label: 'Силовой тренинг' },
    { id: 'group', label: 'Групповые программы' },
    { id: 'martial', label: 'Боевые искусства' },
    { id: 'spa', label: 'Сауна и SPA' }
  ];

  /* Массив услуг клуба (12 реальных направлений) — 4+ значимых свойства на объект.
     price = 0 означает, что услуга входит в абонемент. */
  EF.SERVICES = [
    { id: 'gym', name: 'Тренажёрный зал', category: 'strength', level: 'любой', durationMin: 60, price: 0, description: 'Просторный зал с силовыми рамами, помостами и гантельным рядом 1–60 кг.' },
    { id: 'free-weights', name: 'Зона свободных весов', category: 'strength', level: 'средний', durationMin: 60, price: 0, description: 'Тяжелоатлетические помосты и полный гантельный ряд для базовых упражнений.' },
    { id: 'personal', name: 'Персональная тренировка', category: 'strength', level: 'любой', durationMin: 55, price: 8000, description: 'Индивидуальная программа с сертифицированным тренером.' },
    { id: 'crossfit', name: 'Кроссфит', category: 'group', level: 'продвинутый', durationMin: 50, price: 0, description: 'Высокоинтенсивная тренировка: тяжёлая атлетика, гимнастика и кардио.' },
    { id: 'stretching', name: 'Стретчинг', category: 'group', level: 'новичок', durationMin: 45, price: 0, description: 'Мягкое развитие гибкости и снятие мышечного напряжения.' },
    { id: 'pilates', name: 'Пилатес', category: 'group', level: 'новичок', durationMin: 50, price: 0, description: 'Укрепление мышц кора и улучшение осанки.' },
    { id: 'zumba', name: 'Зумба', category: 'group', level: 'новичок', durationMin: 50, price: 0, description: 'Танцевальная аэробика под зажигательную музыку.' },
    { id: 'aerobic', name: 'Аэробика', category: 'group', level: 'средний', durationMin: 45, price: 0, description: 'Динамичная кардио-нагрузка в группе.' },
    { id: 'boxing', name: 'Бокс', category: 'martial', level: 'любой', durationMin: 60, price: 0, description: 'Постановка ударной техники и работа на мешках.' },
    { id: 'martial-arts', name: 'Единоборства', category: 'martial', level: 'любой', durationMin: 60, price: 0, description: 'Функциональная выносливость и спарринги на татами.' },
    { id: 'sauna', name: 'Финская сауна', category: 'spa', level: 'любой', durationMin: 30, price: 0, description: 'Восстановление и детоксикация после интенсивной тренировки.' },
    { id: 'spa', name: 'SPA-зона', category: 'spa', level: 'любой', durationMin: 60, price: 3500, description: 'Комплекс процедур для полного расслабления.' }
  ];

  /* Возвращает услуги выбранной категории (строгое сравнение ===). */
  EF.getServicesByCategory = function (category) {
    return EF.SERVICES.filter(function (service) {
      return service.category === category;
    });
  };

  /* Поиск услуг по подстроке в названии или описании (без учёта регистра). */
  EF.searchServices = function (query) {
    const needle = String(query || '').trim().toLowerCase();
    if (needle === '') {
      return EF.SERVICES.slice();
    }
    return EF.SERVICES.filter(function (service) {
      const haystack = (service.name + ' ' + service.description).toLowerCase();
      return haystack.indexOf(needle) !== -1;
    });
  };

  /* Отбирает платные услуги (price > 0). */
  EF.getPaidServices = function () {
    return EF.SERVICES.filter(function (service) {
      return service.price > 0;
    });
  };

  /* Итоговая стоимость выбранного списка услуг. */
  EF.getServicesTotal = function (list) {
    const items = Array.isArray(list) ? list : [];
    return EF.sumBy(items, function (service) {
      return service.price;
    });
  };

  /* Средняя длительность занятий в списке (округлённые минуты). */
  EF.getAverageDuration = function (list) {
    const items = Array.isArray(list) ? list : [];
    const durations = items.map(function (service) {
      return service.durationMin;
    });
    return Math.round(EF.average(durations));
  };

  /* Самая доступная платная услуга; null, если платных услуг нет. */
  EF.getCheapestPaidService = function () {
    const paid = EF.getPaidServices();
    if (paid.length === 0) {
      return null;
    }
    return paid.reduce(function (cheapest, service) {
      return service.price < cheapest.price ? service : cheapest;
    });
  };

  /* Услуга недели по категории — демонстрационный выбор через Math.random().
     category = 'all' (или пусто) берёт из всего каталога. */
  EF.getServiceOfTheWeek = function (category) {
    const pool = category && category !== 'all'
      ? EF.getServicesByCategory(category)
      : EF.SERVICES;
    return EF.pickRandom(pool);
  };

  /* Краткое описание услуги для карточки или подтверждения. */
  EF.describeService = function (service) {
    if (!service) {
      return 'Услуга не найдена';
    }
    const priceText = service.price > 0
      ? EF.formatPrice(service.price)
      : 'включено в абонемент';
    return service.name + ' — ' + EF.formatMinutes(service.durationMin) + ', ' + priceText;
  };
})(window.EF);

/* ===== Интерактив страницы «Услуги»: фильтр каталога, поиск и валидация формы записи. ===== */

(function (EF) {
  'use strict';

  const section = document.getElementById('services-articles');
  if (!section) {
    return;
  }

  const cards = section.querySelectorAll('.service-card');
  const tabLinks = document.querySelectorAll('.tabs-list a');
  /* Соответствие ссылки-вкладки идентификатору категории каталога. */
  const CATEGORY_BY_HREF = {
    '#services-articles': 'all',
    '#service-strength': 'strength',
    '#service-group': 'group',
    '#service-spa': 'spa'
  };
  let activeCategory = 'all';

  /* Панель поиска и счётчик результата (создаются через DOM, разметка midterm не менялась). */
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

  /* Сообщение об отсутствии результатов (скрывается классом is-hidden). */
  const empty = document.createElement('p');
  empty.className = 'col-12 text-body-secondary is-hidden';
  empty.textContent = 'Ничего не найдено. Измените поисковый запрос или сбросьте фильтры.';
  section.appendChild(empty);

  /* Проверяет, содержится ли запрос в названии или описании услуги. */
  function matchesQuery(service, query) {
    if (query === '') {
      return true;
    }
    const haystack = (service.name + ' ' + service.description).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  /* Количество услуг категории, подходящих под поисковый запрос. */
  function countServices(category, query) {
    const inCategory = category === 'all' ? EF.SERVICES : EF.getServicesByCategory(category);
    return inCategory.filter(function (service) {
      return matchesQuery(service, query);
    }).length;
  }

  /* Применяет активную категорию и поисковый запрос ко всем карточкам каталога. */
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

  /* Переключает активную категорию и подсвечивает соответствующую вкладку. */
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
    /* Значения <option> филиала переводятся в id из EF.BRANCHES. */
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

    /* Проверяет все поля формы; возвращает первое неверное поле или null. */
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
      /* Составное правило: дата не в прошлом и не позже 90 дней вперёд. */
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

    /* Очищает ошибку поля, которое пользователь начал исправлять. */
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
