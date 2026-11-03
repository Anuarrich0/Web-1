'use strict';

/* ============================================================================
   Assignment 6, фича 2: фильтр каталога услуг + поиск и валидация формы записи
   на консультацию (страница «Услуги и Зоны»). Подключён jQuery 3.7.1.

   Что заменили (сравнение со старой Vanilla-версией из old-js-version.js):
     document.getElementById('id')          ->  $('#id')
     document.querySelectorAll('.card')     ->  $('.card')
     addEventListener('click'/'input')      ->  .on('click') / .on('input')
     classList.toggle('is-hidden', bool)    ->  .toggleClass('is-hidden', bool)
     document.createElement + append        ->  $('<div>') + .append() / .appendTo()
     цикл for по карточкам                  ->  .each() по jQuery-набору

   Код стал короче: разметка панели поиска собирается цепочкой методов, а фильтр
   карточек и подсчёт видимых элементов выполняются средствами jQuery.
   ============================================================================ */

/* jQuery 3.7.1. Обёртка $(function () { ... }) — короткая запись $(document).ready():
   ждём готовности DOM, иначе селекторы вроде $('#services-articles') не найдут элементы. */
$(function () {
  'use strict';

  /* --- Часть 1. Фильтр каталога услуг и поиск. --- */
  const $section = $('#services-articles');
  if ($section.length === 0) {
    return;
  }

  /* Соответствие ссылки вкладки и категории услуг. */
  const CATEGORY_BY_HREF = {
    '#services-articles': 'all',
    '#service-strength': 'strength',
    '#service-group': 'group',
    '#service-spa': 'spa'
  };
  let activeCategory = 'all';

  /* Панель поиска целиком собирается через jQuery (разметку руками не меняли). */
  const $panel = $('<div class="col-12 mb-3"></div>');
  const $searchLabel = $('<label for="services-search" class="form-label"></label>')
    .text('Поиск услуги:');
  const $searchInput = $('<input type="search" id="services-search" class="form-control mb-2" />')
    .attr('placeholder', 'Например: кроссфит, сауна, стретчинг');
  const $resetButton = $('<button type="button" id="services-reset" class="btn btn-outline-light btn-sm me-2"></button>')
    .text('Сбросить фильтры');
  const $status = $('<span class="small text-body-secondary"></span>').attr('role', 'status');
  /* Цепочка из методов: собрать панель и вставить её сразу после заголовка секции
     (селектор :first берёт только первый h2 внутри секции). */
  $panel.append($searchLabel).append($searchInput).append($resetButton).append($status);
  $section.find('h2:first').after($panel);

  /* Список компактных карточек услуг строится из массива EF.SERVICES. */
  const $list = $('<div id="services-results" class="col-12 mb-3"></div>');
  $(EF.SERVICES).each(function () {
    const service = this;
    /* Каждая карточка собирается через $('<...>') и .appendTo() родителя. */
    const $card = $('<article class="service-result-card border rounded-3 p-3 mb-2"></article>')
      .attr('data-category', service.category)
      .attr('data-name', service.name);
    $('<h3 class="h6 fw-semibold mb-1 text-primary"></h3>').text(service.name).appendTo($card);
    $('<p class="small mb-1"></p>').text(service.description).appendTo($card);
    $('<p class="small text-body-secondary mb-0"></p>').text(EF.describeService(service)).appendTo($card);
    $card.appendTo($list);
  });
  $panel.after($list);

  /* Сообщение для пустого результата — тоже создаётся скриптом.
     Прячем его через .hide(), а не классом is-hidden: у класса display:none !important,
     и анимация jQuery (slideDown) не смогла бы его раскрыть. */
  const $empty = $('<p class="col-12 text-body-secondary"></p>')
    .text('Ничего не найдено. Измените поисковый запрос или сбросьте фильтры.')
    .hide();
  $section.append($empty);

  /* Делегированный обработчик клика по карточке услуги. Карточки .service-result-card
     созданы кодом выше — в HTML их нет. Прямая привязка $('.service-result-card').on(...)
     не сработала бы для них: в момент навешивания таких элементов ещё не существовало,
     и клики по ним никто бы не поймал. Поэтому слушаем всегда существующий контейнер $list. */
  $list.on('click', '.service-result-card', function () {
    const $card = $(this); // $(this) — карточка, по которой кликнули
    /* Цепочка из 3 звеньев: переключить выделение карточки, снять его у соседних, показать имя. */
    $card.toggleClass('is-selected').siblings('.service-result-card').removeClass('is-selected');
    $status.hide().text('Выбрана услуга: ' + $card.attr('data-name')).fadeIn(200);
  });

  /* Пересчитывает видимость карточек по активной категории и поисковой строке. */
  function applyCatalogFilter() {
    const query = $searchInput.val().trim().toLowerCase();

    $section.find('.service-card').each(function () {
      const $card = $(this);
      const inCategory = activeCategory === 'all' || $card.attr('data-category') === activeCategory;
      const inQuery = query === '' || $card.text().toLowerCase().indexOf(query) !== -1;
      $card.toggleClass('is-hidden', !(inCategory && inQuery));
    });

    $list.find('.service-result-card').each(function () {
      const $card = $(this);
      const inCategory = activeCategory === 'all' || $card.attr('data-category') === activeCategory;
      const inQuery = query === '' || $card.text().toLowerCase().indexOf(query) !== -1;
      $card.toggleClass('is-hidden', !(inCategory && inQuery));
    });

    /* Фильтр :not() оставляет в наборе только видимые элементы — по ним и считаем. */
    const visibleZones = $section.find('.service-card').filter(':not(.is-hidden)').length;
    const visibleServices = $list.find('.service-result-card').filter(':not(.is-hidden)').length;
    $status.text('Показано зон: ' + visibleZones + ', услуг: ' + visibleServices);

    /* Эффект с длительностью: плавно показываем/прячем подсказку о пустом результате. */
    if (visibleZones + visibleServices > 0) {
      $empty.stop(true, true).slideUp(150);
    } else {
      $empty.stop(true, true).slideDown(150);
    }
  }

  /* Переключает активную категорию и подсвечивает нужную вкладку. */
  function selectCategory(category) {
    activeCategory = category;
    $('.tabs-list a').each(function () {
      const $link = $(this);
      const linkCategory = CATEGORY_BY_HREF[$link.attr('href')] || 'all';
      $link.toggleClass('is-selected', linkCategory === category);
    });
    applyCatalogFilter();
  }

  /* Делегированный обработчик: слушаем контейнер вкладок .tabs-list, а реагируем на
     клик по ссылке-вкладке. Прямая привязка к каждой ссылке потребовала бы перебора;
     делегирование через второй аргумент .on() покрывает все вкладки одним обработчиком. */
  $('.tabs-list').on('click', 'a', function (event) {
    const category = CATEGORY_BY_HREF[$(this).attr('href')];
    if (category === undefined) {
      return;
    }
    // Ссылка-вкладка меняет фильтр, а не переходит по якорю: без preventDefault()
    // браузер прыгнет к разделу и фильтр будет выглядеть «сломанным».
    event.preventDefault();
    selectCategory(category);
  });

  $searchInput.on('input', applyCatalogFilter);

  $resetButton.on('click', function () {
    $searchInput.val('');
    selectCategory('all');
    // Эффект fadeIn возвращает каталог в исходный вид после сброса фильтров.
    $list.hide().fadeIn(250);
  });

  selectCategory('all');

  /* --- Часть 2. Валидация формы записи на консультацию (#consultation-form). --- */
  const $feedback = $('#booking-form-feedback');
  if ($feedback.length === 0) {
    return;
  }

  const $form = $feedback.closest('form');
  const $output = $('#calc-output');
  /* Кнопка submit отключена в разметке midterm — включаем её через .prop(). */
  $form.find('button[type="submit"]').prop('disabled', false);

  /* Соответствие option филиала и id района из общей модели данных. */
  const BRANCH_BY_OPTION = { imanbayeva: 'baikonur', asfendiyarova: 'esil' };

  /* Куда класть текст ошибки: ближайший <p>, а если его нет — прямой родитель. */
  function errorTarget($field) {
    const $p = $field.closest('p');
    return $p.length > 0 ? $p : $field.parent();
  }

  /* Цепочка из 3 методов: подсветить ошибку, снять «успех», пометить для скринридера. */
  function setFieldError($field, message) {
    $field.addClass('is-error').removeClass('is-success').attr('aria-invalid', 'true');
    const $target = errorTarget($field);
    let $note = $target.find('.field-error');
    if ($note.length === 0) {
      $note = $('<span class="field-error d-block text-danger small mt-1"></span>').appendTo($target);
    }
    $note.text(message);
  }

  function markFieldValid($field) {
    $field.removeClass('is-error').addClass('is-success').removeAttr('aria-invalid');
    errorTarget($field).find('.field-error').text('');
  }

  /* Проверяет все поля и возвращает jQuery-набор с первым неверным полем. */
  function validateConsultation() {
    let $firstInvalid = $();

    const plan = [
      { $field: $('#client-name'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.minLength(value, 3); }
      ] },
      { $field: $('#subscriber-email'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.email(value); }
      ] },
      { $field: $('#client-phone'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.phone(value); }
      ] },
      { $field: $('#client-age'), checks: [
        function (value) { return value.trim() === '' ? '' : EF.rules.numberRange(value, 14, 90); }
      ] },
      { $field: $('#visit-date'), checks: [
        function (value) { return value === '' ? '' : EF.rules.notPastDate(value); }
      ] },
      { $field: $('#branch-select'), checks: [
        function (value) { return EF.rules.required(value); }
      ] },
      { $field: $('#health-agree'), checks: [
        function () { return EF.rules.checked($('#health-agree').prop('checked')); }
      ] }
    ];

    /* .each() проходит по плану; внутри this — очередной пункт плана. */
    $(plan).each(function () {
      const item = this;
      let error = '';
      $(item.checks).each(function () {
        if (error === '') {
          error = this(item.$field.val());
        }
      });
      if (error === '') {
        markFieldValid(item.$field);
      } else {
        setFieldError(item.$field, error);
        if ($firstInvalid.length === 0) {
          $firstInvalid = item.$field;
        }
      }
    });

    return $firstInvalid;
  }

  function collectErrors() {
    const messages = [];
    $form.find('.field-error').each(function () {
      const text = $(this).text();
      if (text !== '') {
        messages.push(text);
      }
    });
    return messages;
  }

  /* Итоговое сообщение формы: разметка через .append()/.text(), затем slideDown с callback. */
  function showFeedback(type, title, details) {
    const isSuccess = type === 'success';
    const $box = $('<div></div>').addClass(isSuccess ? 'alert alert-success mb-0' : 'alert alert-danger mb-0');
    $('<p class="fw-bold mb-2"></p>').text(title).appendTo($box);
    if (details.length > 0) {
      const $ul = $('<ul class="mb-0 ps-3"></ul>');
      $(details).each(function () {
        $('<li></li>').text(this).appendTo($ul);
      });
      $box.append($ul);
    }
    // Цепочка из 4 звеньев: очистить контейнер, сменить состояние, задать класс, вставить блок.
    $feedback.html('').removeClass('is-error is-success').addClass(isSuccess ? 'is-success' : 'is-error').append($box);
    $feedback.hide().slideDown(300, function () {
      // callback после анимации: делаем блок фокусируемым и переводим на него фокус.
      $(this).attr('tabindex', '-1').trigger('focus');
    });
  }

  /* Делегированный обработчик полей: снимаем ошибку сразу, как только поле исправляют. */
  $form.on('input change', 'input, select, textarea', function () {
    const $field = $(this); // $(this) — поле, которое только что изменил пользователь
    $field.removeClass('is-error').removeAttr('aria-invalid');
    errorTarget($field).find('.field-error').text('');
  });

  /* Атрибуты required оставлены в разметке как первая линия защиты: браузер сам не
     даст отправить пустые обязательные поля. Но проверка в браузере не заменяет
     проверку на сервере: её легко обойти (отключить JavaScript, отправить запрос
     вручную), поэтому сервер обязан повторить все проверки заново. */
  $form.on('submit', function (event) {
    // preventDefault(): сервера нет и форма учебная. Без него браузер перезагрузит
    // страницу и весь вывод (классы is-error/is-success, сообщение) потеряется.
    event.preventDefault();

    const $firstInvalid = validateConsultation();
    if ($firstInvalid.length > 0) {
      showFeedback('error', 'Форма заполнена неверно', collectErrors());
      if ($output.length > 0) {
        $output.text('Проверьте выделенные поля формы');
      }
      $firstInvalid.trigger('focus');
      return;
    }

    const branch = EF.findBranchById(BRANCH_BY_OPTION[$('#branch-select').val()]);
    const reference = EF.generateReference('EF');
    showFeedback('success', 'Заявка ' + reference + ' принята', [
      'Клиент: ' + $('#client-name').val().trim(),
      'Филиал: ' + EF.describeBranch(branch),
      'Дата визита: ' + EF.formatDateRu($('#visit-date').val()),
      'Возраст: ' + $('#client-age').val() + ' лет',
      'Контакт: ' + $('#client-phone').val().trim() + ', ' + $('#subscriber-email').val().trim(),
      'Демонстрационная заявка: данные не отправлены на сервер, реальная запись не создана.'
    ]);
    if ($output.length > 0) {
      $output.text('Заявка ' + reference + ' сформирована (демонстрация)');
    }
  });

  $form.on('reset', function () {
    // .find() собирает все помеченные поля и тексты ошибок внутри формы.
    $form.find('.is-error, .is-success, [aria-invalid]').removeClass('is-error is-success').removeAttr('aria-invalid');
    $form.find('.field-error').remove();
    $feedback.html('').removeClass('is-error is-success');
    if ($output.length > 0) {
      $output.text('Заполните обязательные поля формы');
    }
  });
});
