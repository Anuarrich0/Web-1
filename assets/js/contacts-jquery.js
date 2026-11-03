'use strict';

/* ============================================================================
   Assignment 6, фича 1: валидация формы обратной связи (страница «Контакты»).
   Подключён jQuery 3.7.1.

   Что заменили (сравнение со старой Vanilla-версией из old-js-version.js):
     document.getElementById('id')            ->  $('#id')
     addEventListener('submit'/'input'/'change')->  .on('submit') / .on('input change', ...)
     classList.add / remove / toggle          ->  .addClass() / .removeClass() / .toggleClass()
     element.value        ->  .val()          element.checked  ->  .prop('checked')
     ручной перебор полей циклом for          ->  .each() по массиву-плану проверок

   Код стал короче и читабельнее: показ ошибок и сборка итогового сообщения собраны
   в цепочки методов, а делегирование убрало обработчик на каждом поле.
   ============================================================================ */

/* jQuery 3.7.1. Обёртка $(function () { ... }) — короткая запись $(document).ready():
   ждём, пока браузер построит DOM, иначе селекторы вроде $('#contact-form-feedback')
   не найдут элементы и код выполнится впустую. */
$(function () {
  'use strict';

  /* Селектор по id: контейнер вывода формы. Если его нет на странице — выходим. */
  const $feedback = $('#contact-form-feedback');
  if ($feedback.length === 0) {
    return;
  }

  /* .closest('form') — обход вверх по дереву от контейнера к самой форме. */
  const $form = $feedback.closest('form');

  /* Кнопка submit отключена в разметке midterm — включаем её через .prop(). */
  $form.find('button[type="submit"]').prop('disabled', false);

  /* Телефон обязателен, если выбран ответ звонком. Используем .prop('checked') и .val(). */
  function phoneMessage() {
    const wantsCall = $('#reply-phone').prop('checked');
    const value = $('#phone').val();
    if (wantsCall && value.trim() === '') {
      return 'Укажите телефон для ответа звонком';
    }
    return value.trim() === '' ? '' : EF.rules.phone(value);
  }

  /* Помечает поле ошибочным и выводит текст рядом.
     Цепочка из 3 методов: подсветить ошибку, снять «успех», пометить для скринридера. */
  function setFieldError($field, message) {
    $field.addClass('is-error').removeClass('is-success').attr('aria-invalid', 'true');
    let $note = $field.parent().find('.field-error');
    if ($note.length === 0) {
      $note = $('<span class="field-error d-block text-danger small mt-1"></span>').appendTo($field.parent());
    }
    $note.text(message);
  }

  /* Помечает поле корректным и убирает текст ошибки. */
  function markFieldValid($field) {
    $field.removeClass('is-error').addClass('is-success').removeAttr('aria-invalid');
    $field.parent().find('.field-error').text('');
  }

  /* Проверяет все поля. Возвращает jQuery-набор с первым неверным полем. */
  function validateContact() {
    let $firstInvalid = $();

    /* План проверок: поле + список функций-правил; каждая возвращает текст ошибки. */
    const plan = [
      { $field: $('#name'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.minLength(value, 2); }
      ] },
      { $field: $('#email'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.email(value); }
      ] },
      { $field: $('#phone'), checks: [
        function () { return phoneMessage(); }
      ] },
      { $field: $('#client-age'), checks: [
        function (value) { return value.trim() === '' ? '' : EF.rules.numberRange(value, 12, 99); }
      ] },
      { $field: $('#callback-date'), checks: [
        function (value) { return value === '' ? '' : EF.rules.notPastDate(value); }
      ] },
      { $field: $('#message'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.minLength(value, 10); }
      ] },
      { $field: $('#agree-contact'), checks: [
        function () { return EF.rules.checked($('#agree-contact').prop('checked')); }
      ] }
    ];

    /* .each() проходит по плану; внутри .each() this — очередной пункт плана. */
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

  /* Собирает тексты всех показанных ошибок (для итогового блока). */
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

  /* Показывает итоговое сообщение: разметка собирается через .append() и .text(),
     затем контейнер плавно раскрывается эффектом .slideDown(duration, callback). */
  function showFeedback(type, title, details) {
    const isSuccess = type === 'success';
    const $box = $('<div></div>').addClass(isSuccess ? 'alert alert-success mb-0' : 'alert alert-danger mb-0');
    $('<p class="fw-bold mb-2"></p>').text(title).appendTo($box);
    if (details.length > 0) {
      const $list = $('<ul class="mb-0 ps-3"></ul>');
      $(details).each(function () {
        $('<li></li>').text(this).appendTo($list);
      });
      $box.append($list);
    }
    // Цепочка из 4 звеньев: очистить контейнер, сменить состояние, вставить блок, задать класс.
    $feedback.html('').removeClass('is-error is-success').addClass(isSuccess ? 'is-success' : 'is-error').append($box);
    $feedback.hide().slideDown(300, function () {
      // callback после анимации: делаем блок фокусируемым и переводим на него фокус.
      $(this).attr('tabindex', '-1').trigger('focus');
    });
  }

  /* Делегированный обработчик: слушаем форму, а реагируем на конкретном поле.
     Прямая привязка к каждому input/select/textarea потребовала бы перебора всех полей;
     делегирование через второй аргумент .on() покрывает все поля одной строкой. */
  $form.on('input change', 'input, select, textarea', function () {
    const $field = $(this); // $(this) — поле, которое только что изменил пользователь
    $field.removeClass('is-error').removeAttr('aria-invalid');
    $field.parent().find('.field-error').text('');
  });

  /* Атрибуты required оставлены в разметке как первая линия защиты: браузер сам не
     даст отправить пустые обязательные поля. Но проверка в браузере не заменяет
     проверку на сервере: её легко обойти (отключить JavaScript, отправить запрос
     вручную), поэтому сервер обязан повторить все проверки заново. */
  $form.on('submit', function (event) {
    // preventDefault(): форма демонстрационная, сервера нет. Без него браузер перезагрузит
    // страницу и весь вывод и состояния классов (is-error/is-success) будут потеряны.
    event.preventDefault();

    const $firstInvalid = validateContact();
    if ($firstInvalid.length > 0) {
      showFeedback('error', 'Форма заполнена неверно', collectErrors());
      $firstInvalid.trigger('focus');
      return;
    }

    /* Фильтр :checked вместе с селектором по атрибуту name определяет способ ответа. */
    const replyMethod = $('input[name="reply-method"]:checked').val();
    const method = replyMethod === 'email' ? 'по электронной почте' : 'по телефону';
    const reference = EF.generateReference('MSG');
    showFeedback('success', 'Сообщение ' + reference + ' принято', [
      'Имя: ' + $('#name').val().trim(),
      'Тема: ' + EF.describeTopic($('#topic').val()),
      'Способ ответа: ' + method,
      'Контакт: ' + $('#email').val().trim() +
        ($('#phone').val().trim() === '' ? '' : ', ' + $('#phone').val().trim()),
      'Демонстрационная форма: сообщение не отправлено на сервер и не создаёт реальное обращение.'
    ]);
  });

  $form.on('reset', function () {
    // .find() собирает все помеченные поля и тексты ошибок внутри формы и очищает их.
    $form.find('.is-error, .is-success, [aria-invalid]').removeClass('is-error is-success').removeAttr('aria-invalid');
    $form.find('.field-error').remove();
    $feedback.html('').removeClass('is-error is-success');
  });
});
