'use strict';

/* ============================================================================
   Assignment 6 (продолжение), страница «Абонементы» на jQuery 3.7.1.

   Переписано со старой Vanilla-версии (см. old-js-version.js, бывший pricing.js):
     document.querySelector('#id')        ->  $('#id')
     querySelectorAll('[data-tariff]')    ->  $('#pricing-plans').find('[data-tariff]')
     addEventListener('input'/'change')   ->  .on('input') / .on('change')
     classList.toggle('is-hidden', bool)  ->  .toggleClass('is-hidden', bool)
     createElement + appendChild          ->  $('<...>') + .append() / .appendTo()
     ручные циклы for по массиву          ->  .each() по jQuery-набору

   Дополнительно: успешная отправка формы открывает попап оформления
   (window.EFCheckout из checkout-jquery.js). Так путь пользователя
   «тариф → форма → оплата → подтверждение» завершается на сайте, без переходов.
   ============================================================================ */

/* jQuery 3.7.1. Обёртка $(function () { ... }) — короткая запись $(document).ready():
   ждём готовности DOM, иначе селекторы вроде $('#pricing-plans') не найдут элементы. */
$(function () {
  'use strict';

  /* --- Часть 1. Фильтр тарифов: поиск по названию + выбор срока. --- */
  const $section = $('#pricing-plans');
  if ($section.length === 0) {
    return;
  }

  const $cards = $section.find('[data-tariff]');

  /* Панель фильтров собирается кодом (разметку руками не меняем). */
  const $controls = $('<div class="col-12"></div>');
  $('<label class="form-label" for="tariff-search"></label>').text('Поиск тарифа').appendTo($controls);
  const $search = $('<input type="search" id="tariff-search" class="form-control mb-3" />').appendTo($controls);

  const $durationWrap = $('<div class="mb-3"></div>').appendTo($controls);
  $('<label class="form-label" for="duration-filter"></label>').text('Показать цены на срок').appendTo($durationWrap);
  const $duration = $('<select id="duration-filter" class="form-select"></select>').appendTo($durationWrap);
  $.each([['', 'Все сроки'], ['1', '1 месяц'], ['3', '3 месяца'], ['6', '6 месяцев'], ['12', '12 месяцев']], function (index, pair) {
    $('<option></option>').attr('value', pair[0]).text(pair[1]).appendTo($duration);
  });

  const $reset = $('<button type="button" class="btn btn-outline-light mb-3"></button>').text('Сбросить фильтры').appendTo($controls);
  const $count = $('<p role="status"></p>').appendTo($controls);
  $section.find('h2').after($controls);

  const $empty = $('<p class="col-12 is-hidden"></p>')
    .text('Ничего не найдено. Измените запрос или сбросьте фильтры.')
    .appendTo($section);

  /* Одна строка цены внутри карточки: срок и стоимость. */
  function priceRow(item) {
    const $row = $('<li class="row g-2 border-bottom py-2"></li>');
    $('<span class="col-5 text-body-secondary small"></span>').text(item.months + ' мес.').appendTo($row);
    $('<span class="col-7 fw-bold text-end"></span>').text(money(item.price)).appendTo($row);
    return $row;
  }

  /* Совмещает поиск и срок: обновляет список цен, видимость карточек и счётчик. */
  function filterTariffs() {
    const query = String($search.val()).trim().toLocaleLowerCase('ru-RU');
    const pickedDuration = $duration.val();
    let visible = 0;

    $cards.each(function () {
      const $card = $(this);
      const tariff = $card.attr('data-tariff');
      const items = memberships.filter(function (item) {
        const matchesCard = item.tariff === tariff;
        const matchesSearch = item.name.toLocaleLowerCase('ru-RU').indexOf(query) !== -1;
        const matchesDuration = pickedDuration === '' || item.months === Number(pickedDuration);
        return matchesCard && matchesSearch && matchesDuration;
      });

      $card.toggleClass('is-hidden', items.length === 0);

      const $list = $card.find('.price-list').empty();
      if (items.length === 0) {
        $('<li></li>').text('Ничего не найдено. Измените условия или сбросьте фильтры.').appendTo($list);
      } else {
        $(items).each(function () {
          $list.append(priceRow(this));
        });
      }
      if (items.length > 0) {
        visible += 1;
      }
    });

    $count.text('Найдено тарифов: ' + visible);
    $empty.toggleClass('is-hidden', visible !== 0);
  }

  $search.on('input', filterTariffs);
  $duration.on('change', filterTariffs);
  $reset.on('click', function () {
    $search.val('');
    $duration.val('');
    filterTariffs();
  });

  /* --- Часть 2. Форма оформления абонемента. --- */
  const $form = $('#order-form form');
  const $tariff = $('#tariff-select');
  const $feedback = $('#pricing-order-feedback');
  const $fieldsets = $form.find('fieldset');

  /* Возраст считаем по дате рождения, поэтому поле #client-age из разметки убираем. */
  $('#client-age').parent().remove();
  const $birth = $('#client-dob');
  $birth.prop('required', true);
  const $ageOutput = $('<span class="small d-block"></span>').attr('aria-live', 'polite');
  $birth.after($ageOutput);

  $form.prop('novalidate', true);
  $form.find('button[type="submit"]').prop('disabled', false);
  $('#form-note-0').text('Учебная заявка: данные не отправляются на сервер, реальный заказ, оплата и бронирование не создаются.');

  /* Дополнительные галочки, скидка и блок текущего расчёта. */
  function createCheckbox($parent, id, title) {
    const $group = $('<div class="form-check mb-3"></div>').appendTo($parent);
    const $input = $('<input type="checkbox" class="form-check-input" />').attr('id', id).appendTo($group);
    $('<label class="form-check-label"></label>').attr('for', id).text(title).appendTo($group);
    return $input;
  }

  const $summary = $('<p class="col-12"></p>').attr('aria-live', 'polite');
  $fieldsets.eq(1).append($summary);
  const $student = createCheckbox($fieldsets.eq(1), 'student-discount', 'Студенческий билет: предварительная скидка 15% (проверяется менеджером)');
  const $guardian = createCheckbox($fieldsets.eq(2), 'guardian-agree', 'Есть согласие законного представителя (до 18 лет)');
  const $accompanied = createCheckbox($fieldsets.eq(2), 'accompanied-agree', 'Буду заниматься с представителем или тренером (до 15 лет)');

  const $comment = $('#client-comment');
  const $counter = $('<span class="small d-block"></span>');
  $comment.after($counter);

  /* До первой отправки не показываем ошибки незаполненной формы. */
  let attempted = false;

  /* Собирает текущие значения формы в один объект. */
  function readOrder() {
    const term = $form.find('input[name="term"]:checked').val();
    return {
      name: $('#client-name').val(),
      email: $('#client-email').val(),
      phone: $('#client-phone').val(),
      age: birthAge($birth.val()),
      birth: $birth.val(),
      tariff: $tariff.val(),
      months: term === undefined ? '' : term,
      agree: $('#client-agree').prop('checked'),
      guardian: $guardian.prop('checked'),
      accompanied: $accompanied.prop('checked'),
      comment: $comment.val()
    };
  }

  /* Удаляет старые ошибки и показывает актуальные рядом с полями. */
  function showErrors(errors) {
    $form.find('[data-field-error]').each(function () {
      const $message = $(this);
      $('#' + $message.attr('data-field-error'))
        .removeClass('is-error').removeAttr('aria-invalid').removeAttr('aria-describedby');
      $message.remove();
    });

    $.each(errors, function (id, text) {
      const $input = $('#' + id);
      const $message = $('<span class="d-block text-danger small"></span>').text(text)
        .attr('id', id + '-error').attr('data-field-error', id);
      $input.parent().append($message);
      $input.addClass('is-error').attr('aria-invalid', 'true').attr('aria-describedby', id + '-error');
    });
  }

  /* Обновляет расчёт цены, возраст, подсветку карточек и проверки формы. */
  function updateOrder() {
    const data = readOrder();
    const item = findMembership(data.tariff, data.months);

    if (item) {
      const price = membershipPrice(item, $student.prop('checked'));
      let text = item.name + ', ' + item.months + ' мес. Цена: ' + money(item.price) +
        '. Скидка: ' + money(price.discount) + '. Итого: ' + money(price.total) +
        ' (≈ ' + money(price.monthly) + '/мес.).';
      if ($student.prop('checked')) {
        text += ' Студенческий билет проверяется в клубе.';
      }
      $summary.text(text);
    } else {
      $summary.text('Выберите тариф и срок для расчёта стоимости.');
    }

    /* Подсветить карточку выбранного тарифа, у остальных — снять выделение. */
    $cards.each(function () {
      const $card = $(this);
      $card.toggleClass('is-selected', $card.attr('data-tariff') === data.tariff);
    });

    if (Number.isInteger(data.age)) {
      $ageOutput.text('Возраст: ' + data.age + ' (рассчитан автоматически)');
    } else {
      $ageOutput.text('');
    }

    /* Согласия несовершеннолетних показываем только по возрасту. */
    $guardian.closest('.form-check').toggleClass('is-hidden', !(data.age >= 14 && data.age < 18));
    $accompanied.closest('.form-check').toggleClass('is-hidden', !(data.age >= 14 && data.age < 15));

    $counter.text($comment.val().length + ' / 500 символов');

    if (attempted) {
      const errors = membershipErrors(data);
      showErrors(errors);
      if (Object.keys(errors).length === 0 && $feedback.hasClass('is-error')) {
        $feedback.removeClass('is-error').text('Ошибки исправлены. Можно отправить демонстрационную заявку.');
      }
    }
  }

  /* Клик по «Оформить абонемент» в карточке выбирает тариф и срок в форме. */
  $cards.each(function () {
    const $card = $(this);
    $card.find('a').on('click', function (event) {
      // Ссылка ведёт к форме на этой же странице, а не на другой ресурс: preventDefault()
      // отменяет прыжок к якорю, чтобы страница не «улетала» и фильтр снова не прокручивал экран.
      event.preventDefault();
      $tariff.val($card.attr('data-tariff'));
      const months = $duration.val() || readOrder().months || '1';
      $('#term-' + months).prop('checked', true);
      updateOrder();
      $tariff.trigger('focus');
    });
  });

  /* Изменения полей сразу обновляют расчёт. */
  $form.on('input change', updateOrder);

  /* Отправка: проверяем поля и открываем попап оформления. */
  $form.on('submit', function (event) {
    // preventDefault(): форма демонстрационная, сервера нет. Без него браузер перезагрузит
    // страницу, и весь вывод (классы is-error/is-success, расчёт) будет потерян.
    event.preventDefault();
    attempted = true;

    const data = readOrder();
    const errors = membershipErrors(data);
    showErrors(errors);
    $feedback.removeClass('is-error is-success');

    if (Object.keys(errors).length > 0) {
      $feedback.text('Исправьте ошибки у полей. Заявка не сформирована.').addClass('is-error');
      $('#' + Object.keys(errors)[0]).trigger('focus');
      return;
    }

    /* Данные верны — открываем попап оплаты. Путь пользователя остаётся на сайте. */
    const item = findMembership(data.tariff, data.months);
    const price = membershipPrice(item, $student.prop('checked'));
    $feedback.empty();
    window.EFCheckout.open({
      title: 'Оформление абонемента',
      reference: EF.generateReference('EF'),
      summary: [
        'Клиент: ' + data.name.trim(),
        'Тариф: ' + item.name + ', ' + item.months + ' мес.',
        'Итого к оплате: ' + money(price.total),
        'Контакт: ' + data.phone + ', ' + data.email
      ],
      onSuccess: function (reference) {
        const $box = $('<div class="alert alert-success mb-0"></div>');
        $('<p class="fw-bold mb-2"></p>').text('Заявка ' + reference + ' оформлена').appendTo($box);
        $('<p class="mb-0"></p>')
          .text('Оплата подтверждена (демонстрация). Абонемент активируется после проверки менеджером.')
          .appendTo($box);
        $feedback.empty().removeClass('is-error').addClass('is-success').append($box);
      }
    });
  });

  /* Сброс очищает ошибки; пересчёт идёт после стандартного сброса полей. */
  $form.on('reset', function () {
    attempted = false;
    showErrors({});
    $feedback.empty().removeClass('is-error is-success');
    // Нативные поля сбрасываются после этого обработчика — пересчитываем чуть позже.
    setTimeout(updateOrder, 0);
  });

  /* Читаем тариф, срок и скидку из ссылки со страницы акций. */
  const params = new URLSearchParams(window.location.search);
  const requested = findMembership(params.get('tariff'), params.get('months'));
  if (requested) {
    $tariff.val(requested.tariff);
    $('#term-' + requested.months).prop('checked', true);
    $student.prop('checked', params.get('student') === '1');
  }

  /* Первый вывод при открытии страницы. */
  filterTariffs();
  updateOrder();
});
