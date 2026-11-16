  'use strict';

/* ============================================================================
   Assignment 6 (продолжение), страница «Абонементы» на jQuery 3.7.1.

   Переписано со старой Vanilla-версии (см. Git history (Vanilla version), бывший pricing.js):
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

  /* Карточки тарифов и форма оформления. */
  const $section = $('#pricing-plans');
  if ($section.length === 0) {
    return;
  }

  const $cards = $section.find('[data-tariff]');

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
  $('#form-note-0').text('Проверьте контактные данные. Оформление и активация абонемента завершаются в клубе.');

  /* Дополнительные галочки, скидка и блок текущего расчёта. */
  function createCheckbox($parent, id, title) {
    const $group = $('<div class="form-check mb-3"></div>').appendTo($parent);
    const $input = $('<input type="checkbox" class="form-check-input" />').attr('id', id).appendTo($group);
    $('<label class="form-check-label"></label>').attr('for', id).text(title).appendTo($group);
    return $input;
  }

  const $summary = $('<p class="col-12 pricing-summary"></p>').attr('aria-live', 'polite');
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
      const selected = $card.attr('data-tariff') === data.tariff;
      $card.toggleClass('is-selected', selected);
      $card.find('a').toggleClass('btn-primary', selected).toggleClass('btn-outline-light', !selected);
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
        $feedback.removeClass('is-error').text('Данные исправлены. Можно продолжить оформление.');
      }
    }
  }

  /* Клик по любой части карточки выбирает тариф; ссылка доступна с клавиатуры. */
  $cards.each(function () {
    const $card = $(this);
    $card.on('click', function (event) {
      // Ссылка ведёт к форме на этой же странице, а не на другой ресурс: preventDefault()
      // отменяет прыжок к якорю, чтобы страница не «улетала» и фильтр снова не прокручивал экран.
      event.preventDefault();
      $tariff.val($card.attr('data-tariff'));
      const months = readOrder().months || '1';
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
        $('<p class="fw-bold mb-2"></p>').text('Заявка подготовлена: ' + reference).appendTo($box);
        $('<p class="mb-0"></p>')
          .text('Данные проверены. Для завершения покупки и активации абонемента свяжитесь с клубом.')
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
  updateOrder();
});
