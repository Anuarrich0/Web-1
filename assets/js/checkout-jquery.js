'use strict';

/* ============================================================================
   checkout-jquery.js — всплывающее окно оформления заказа на jQuery 3.7.1.

   Зачем: пользователь должен пройти путь «форма → оплата → подтверждение» целиком
   на сайте, без перехода на внешний платёжный сервис. Внутри попапа — ввод
   банковских данных, согласие на обработку персональных данных и согласие с
   офертой, предупреждение «проверьте, правильно ли заполнена форма» и кнопка
   «Оформить». Оплата демонстрационная: страница не перезагружается и никуда
   не переходит — сценарий заканчивается на сайте.

   HTML и CSS страниц заморожены (Midterm), поэтому разметка попапа целиком
   собирается кодом и вставляется в <body> через .append().
   Используется на страницах pricing.html и training.html.

   Что заменяет Vanilla-подход:
     document.createElement + appendChild  ->  $('<div>') + .append() / .appendTo()
     element.textContent = '...'           ->  .text('...')
     addEventListener('click' / 'input')   ->  .on('click') / .on('input')
     classList.add / remove / toggle       ->  .addClass() / .removeClass() / .toggleClass()
   ============================================================================ */

/* jQuery 3.7.1 (файл подключается после библиотеки). Определяем общий объект
   window.EFCheckout; страницы вызывают EFCheckout.open(options) при успешной
   отправке своей формы. */
(function ($) {
  'use strict';

  const CARD_NUMBER_DIGITS = 16;
  const CARD_CVV_DIGITS = 3;

  /* Оставляет только цифры: '0000 1111' -> '00001111'. */
  function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  /* Поле ввода с подписью. Разметка создаётся jQuery, классы — только готовые Bootstrap. */
  function textField(id, label, type, placeholder) {
    const $wrap = $('<p class="col-12 mb-3"></p>');
    $('<label class="form-label"></label>').attr('for', id).text(label).appendTo($wrap);
    $('<input class="form-control" />')
      .attr('id', id)
      .attr('name', id)
      .attr('type', type)
      .attr('placeholder', placeholder)
      .attr('autocomplete', 'off')
      .appendTo($wrap);
    return $wrap;
  }

  /* Галочка согласия с подписью (классы как у штатных чекбоксов Bootstrap). */
  function checkField(id, label) {
    const $wrap = $('<p class="form-check col-12 mb-3"></p>');
    $('<input type="checkbox" class="form-check-input me-2" />').attr('id', id).attr('name', id).appendTo($wrap);
    $('<label class="form-check-label"></label>').attr('for', id).text(label).appendTo($wrap);
    return $wrap;
  }

  /* Помечает поле ошибочным и выводит текст рядом.
     Цепочка из 3 методов: подсветить ошибку, снять «успех», пометить для скринридера. */
  function setFieldError($field, message) {
    $field.addClass('is-error').removeClass('is-success').attr('aria-invalid', 'true');
    const $target = $field.closest('p');
    let $note = $target.find('.field-error');
    if ($note.length === 0) {
      $note = $('<span class="field-error d-block text-danger small mt-1"></span>').appendTo($target);
    }
    $note.text(message);
  }

  /* Помечает поле корректным и убирает текст ошибки. */
  function markFieldValid($field) {
    $field.removeClass('is-error').addClass('is-success').removeAttr('aria-invalid');
    $field.closest('p').find('.field-error').text('');
  }

  /* Строит DOM попапа под конкретный заказ (title + summary уже подставлены). */
  function buildModal(options) {
    const $modal = $('<div class="modal fade" tabindex="-1" aria-hidden="true"></div>');
    /* Цепочка из 3 звеньев: диалог, внутри него контент, у контента — шапка/тело/подвал. */
    const $dialog = $('<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"></div>').appendTo($modal);
    const $content = $('<div class="modal-content"></div>').appendTo($dialog);

    /* Шапка с заголовком и кнопкой закрытия (кнопка — стандартный Bootstrap-компонент). */
    const $header = $('<div class="modal-header"></div>').appendTo($content);
    $('<h2 class="modal-title h5"></h2>').text(options.title).appendTo($header);
    $('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>').appendTo($header);

    const $body = $('<div class="modal-body"></div>').appendTo($content);

    /* Предупреждение + сводка данных, введённых в форме, — пользователь проверяет их перед оплатой. */
    const $warning = $('<div class="alert alert-warning"></div>').appendTo($body);
    $('<p class="fw-bold mb-2"></p>')
      .text('Проверьте, правильно ли вы оформили данные в форме.')
      .appendTo($warning);
    const $summary = $('<ul class="mb-0 ps-3"></ul>').appendTo($warning);
    $(options.summary).each(function () {
      $('<li></li>').text(this).appendTo($summary);
    });

    /* Банковские данные. */
    const $cardFields = $('<div class="row g-2" id="checkout-card-fields"></div>').appendTo($body);
    $cardFields.append(
      textField('checkout-card-number', 'Номер карты', 'text', '0000 0000 0000 0000'),
      textField('checkout-card-name', 'Имя и фамилия на карте', 'text', 'IVAN IVANOV'),
      textField('checkout-card-expiry', 'Срок действия', 'text', 'ММ/ГГ'),
      textField('checkout-card-cvv', 'CVV', 'password', '•••')
    );

    /* Согласия: обработка персональных данных и оферта. */
    const $consents = $('<div class="row g-2" id="checkout-consents"></div>').appendTo($body);
    $consents.append(
      checkField('checkout-consent-data', 'Я согласен на обработку персональных данных'),
      checkField('checkout-consent-offer', 'Я ознакомлен и согласен с условиями оферты')
    );

    /* Контейнер итогового сообщения. */
    $('<div class="form-feedback-container mt-3"></div>').appendTo($body);

    /* Подвал с кнопками. «Готово» скрыто до успешной оплаты. */
    const $footer = $('<div class="modal-footer"></div>').appendTo($content);
    $('<button type="button" id="checkout-submit" class="btn btn-primary btn-lg"></button>')
      .text('Оформить').appendTo($footer);
    $('<button type="button" id="checkout-done" class="btn btn-primary btn-lg is-hidden" data-bs-dismiss="modal"></button>')
      .text('Готово').appendTo($footer);
    $('<button type="button" id="checkout-cancel" class="btn btn-outline-light" data-bs-dismiss="modal"></button>')
      .text('Отмена').appendTo($footer);

    return $modal;
  }

  /* Проверяет банковские поля и оба согласия. Возвращает первое неверное поле. */
  function validateCheckout($modal) {
    let $firstInvalid = $();

    const $number = $modal.find('#checkout-card-number');
    const $name = $modal.find('#checkout-card-name');
    const $expiry = $modal.find('#checkout-card-expiry');
    const $cvv = $modal.find('#checkout-card-cvv');
    const $consentData = $modal.find('#checkout-consent-data');
    const $consentOffer = $modal.find('#checkout-consent-offer');

    const checks = [
      { $field: $number, message: onlyDigits($number.val()).length === CARD_NUMBER_DIGITS ? '' : 'Введите 16 цифр номера карты' },
      { $field: $name, message: $name.val().trim().length >= 2 ? '' : 'Укажите имя и фамилию как на карте' },
      { $field: $expiry, message: /^(0[1-9]|1[0-2])\/\d{2}$/.test($expiry.val().trim()) ? '' : 'Укажите срок в формате ММ/ГГ' },
      { $field: $cvv, message: new RegExp('^\\d{' + CARD_CVV_DIGITS + '}$').test($cvv.val().trim()) ? '' : 'Введите 3 цифры CVV' },
      { $field: $consentData, message: $consentData.prop('checked') ? '' : 'Отметьте согласие на обработку персональных данных' },
      { $field: $consentOffer, message: $consentOffer.prop('checked') ? '' : 'Отметьте согласие с офертой' }
    ];

    /* .each() проходит по плану проверок; this — очередной пункт. */
    $(checks).each(function () {
      const item = this;
      if (item.message === '') {
        markFieldValid(item.$field);
      } else {
        setFieldError(item.$field, item.message);
        if ($firstInvalid.length === 0) {
          $firstInvalid = item.$field;
        }
      }
    });

    return $firstInvalid;
  }

  /* Открывает попап. options: { title, reference, summary: [...], onSuccess(reference) }. */
  function openCheckout(options) {
    const settings = options || {};
    const lines = settings.summary || [];
    const reference = settings.reference || 'EF-000000';

    const $modal = buildModal({ title: settings.title || 'Оформление заказа', summary: lines });
    $('body').append($modal);

    const modal = new bootstrap.Modal($modal.get(0));

    /* Автоформат номера карты группами по 4 цифры — .on('input') реагирует на каждый ввод. */
    $modal.on('input', '#checkout-card-number', function () {
      const value = onlyDigits($(this).val()).slice(0, CARD_NUMBER_DIGITS);
      const groups = value.match(/.{1,4}/g);
      $(this).val(groups ? groups.join(' ') : '');
    });

    /* Делегированный обработчик: пока пользователь правит любое поле, снимаем с него ошибку.
       Прямая привязка к каждому полю не нужна — .on() со вторым аргументом ловит все поля. */
    $modal.on('input change', 'input', function () {
      const $field = $(this); // $(this) — поле, которое изменил пользователь
      $field.removeClass('is-error').removeAttr('aria-invalid');
      $field.closest('p').find('.field-error').text('');
    });

    /* Кнопка «Оформить»: проверяем карту и согласия; при ошибке ничего не оплачиваем. */
    $modal.on('click', '#checkout-submit', function () {
      const $feedback = $modal.find('.form-feedback-container');
      const $firstInvalid = validateCheckout($modal);

      if ($firstInvalid.length > 0) {
        $feedback.text('Проверьте выделенные поля — оплата не выполнена.')
          .addClass('is-error').removeClass('is-success');
        $firstInvalid.trigger('focus');
        return;
      }

      /* Успех: сообщение показывается внутри попапа, страница не перезагружается. */
      $modal.find('#checkout-card-fields, #checkout-consents').addClass('is-hidden');
      $modal.find('#checkout-submit, #checkout-cancel').addClass('is-hidden');
      $modal.find('#checkout-done').removeClass('is-hidden');
      $feedback
        .text('Заявка ' + reference + ' оформлена. Оплата подтверждена (демонстрация).')
        .removeClass('is-error').addClass('is-success');

      if (typeof settings.onSuccess === 'function') {
        settings.onSuccess(reference);
      }
    });

    /* Когда попап закрыт — убираем его из DOM, чтобы не копить дубли id при повторном открытии. */
    $modal.on('hidden.bs.modal', function () {
      $(this).remove();
    });

    modal.show();
  }

  window.EFCheckout = { open: openCheckout };
})(jQuery);
