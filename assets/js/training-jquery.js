'use strict';

/* ============================================================================
   Assignment 6, фича 4: фильтр расписания, калькулятор калорий и валидация
   формы подписки (страница «Тренировки»). Подключён jQuery 3.7.1.

   Что заменили (сравнение со старой Vanilla-версией из old-js-version.js):
     document.getElementById('id')        ->  $('#id')
     querySelectorAll('[data-...]')       ->  $('[data-...]')
     addEventListener('click'/'input')    ->  .on('click') / .on('input')
     classList.add/remove/toggle          ->  .addClass() / .removeClass() / .toggleClass()
     element.textContent = value          ->  .text(value)
     ручной цикл по строкам for           ->  .each() по набору строк

   Код компактнее: результат расчёта появляется эффектом, а фильтр строк расписания
   и подсветка кнопок описаны цепочками jQuery.
   ============================================================================ */

/* jQuery 3.7.1. Обёртка $(function () { ... }) — короткая запись $(document).ready():
   ждём готовности DOM, иначе селекторы вроде $('#training-schedule') не найдут элементы. */
$(function () {
  'use strict';

  /* --- Часть 1. Фильтр расписания тренировочной недели. --- */
  const $scheduleSection = $('#training-schedule');
  if ($scheduleSection.length > 0) {
    const $rows = $scheduleSection.find('tbody tr[data-category]');
    const $status = $('<p class="small text-body-secondary mb-0"></p>').attr('role', 'status');
    $scheduleSection.find('.table-responsive:first').after($status);

    function applyScheduleFilter(category) {
      $rows.each(function () {
        const $row = $(this);
        $row.toggleClass('is-hidden', !(category === 'all' || $row.attr('data-category') === category));
      });

      /* Кнопка считается активной, если её data-schedule-filter совпал с выбранной категорией. */
      $scheduleSection.find('[data-schedule-filter]').each(function () {
        const $button = $(this);
        const active = $button.attr('data-schedule-filter') === category;
        $button.toggleClass('is-selected', active).toggleClass('active', active);
      });

      const visible = $rows.filter(':not(.is-hidden)').length;
      $status.text('Показано занятий: ' + visible + ' из ' + $rows.length);
    }

    /* Делегированный обработчик на секции: реагируем на клик по кнопке фильтра.
       Прямая привязка к каждой кнопке требовала бы перебора; делегирование через
       второй аргумент .on() обслуживает все кнопки одним обработчиком и работает,
       даже если кнопки появятся позже. */
    $scheduleSection.on('click', '[data-schedule-filter]', function () {
      applyScheduleFilter($(this).attr('data-schedule-filter')); // $(this) — нажатая кнопка
    });

    applyScheduleFilter('all');
  }

  /* --- Часть 2. Калькулятор калорий и графика тренировок. --- */
  const $calcForm = $('#calculator-form');
  if ($calcForm.length > 0) {
    const $results = $('#calculator-results');
    const $outputs = {
      bmr: $('#result-bmr'),
      tdee: $('#result-tdee'),
      target: $('#result-target-calories'),
      frequency: $('#result-workout-freq'),
      program: $('#result-program-recommendation')
    };

    /* Склоняет «тренировка/тренировки/тренировок» по числу. */
    function frequencyText(count) {
      if (count === 1) {
        return '1 тренировка в неделю';
      }
      if (count >= 2 && count <= 4) {
        return count + ' тренировки в неделю';
      }
      return count + ' тренировок в неделю';
    }

    /* Показать результаты эффектом: снимаем is-hidden, затем .slideDown() с callback. */
    function revealResults() {
      $results.removeClass('is-hidden').hide().slideDown(300, function () {
        // callback после анимации: переводим фокус на блок результатов для скринридера.
        $(this).attr('tabindex', '-1').trigger('focus');
      });
    }

    function calculatePlan() {
      const plan = EF.buildFitnessPlan({
        gender: $('#calc-gender').val() === 'female' ? 'female' : 'male',
        age: Number($('#calc-age').val()),
        height: Number($('#calc-height').val()),
        weight: Number($('#calc-weight').val()),
        activity: $('#calc-activity').val(),
        goal: $('#calc-goal').val()
      });
      $outputs.bmr.text(String(plan.bmr));
      $outputs.tdee.text(String(plan.tdee));
      $outputs.target.text(String(plan.targetCalories));
      $outputs.frequency.text(frequencyText(plan.workoutFrequency));
      $outputs.program.text(plan.program);
      revealResults();
    }

    /* Шаг 1: проверка числовых полей калькулятора правилами из общего модуля.
       Если поле неверное — подсвечиваем и раскрываем сообщение, не показывая результат. */
    function validateCalculator() {
      let $firstInvalid = $();
      const ranges = [
        { $field: $('#calc-age'), min: 14, max: 90 },
        { $field: $('#calc-height'), min: 120, max: 230 },
        { $field: $('#calc-weight'), min: 35, max: 250 }
      ];

      $(ranges).each(function () {
        const range = this;
        const message = EF.rules.numberRange(range.$field.val(), range.min, range.max);
        if (message === '') {
          range.$field.removeClass('is-error').addClass('is-success').removeAttr('aria-invalid');
          range.$field.closest('div').find('.field-error').text('');
        } else {
          range.$field.addClass('is-error').removeClass('is-success').attr('aria-invalid', 'true');
          let $note = range.$field.closest('div').find('.field-error');
          if ($note.length === 0) {
            $note = $('<span class="field-error d-block text-danger small mt-1"></span>')
              .appendTo(range.$field.closest('div'));
          }
          $note.text(message);
          if ($firstInvalid.length === 0) {
            $firstInvalid = range.$field;
          }
        }
      });

      return $firstInvalid;
    }

    function runCalculator() {
      const $firstInvalid = validateCalculator();
      if ($firstInvalid.length > 0) {
        // Эффект slideUp возвращает блок результатов в скрытое состояние (класс is-hidden).
        $results.slideUp(200, function () {
          $(this).addClass('is-hidden');
        });
        $firstInvalid.trigger('focus');
        return;
      }
      calculatePlan();
    }

    $calcForm.on('click', '#calc-submit-btn', runCalculator);
    $calcForm.on('submit', function (event) {
      // preventDefault(): расчёт выполняется в браузере, серверу отправлять нечего.
      // Без него страница перезагрузится и результат расчёта исчезнет.
      event.preventDefault();
      runCalculator();
    });

    $calcForm.on('reset', function () {
      $calcForm.find('.is-error, .is-success, [aria-invalid]').removeClass('is-error is-success').removeAttr('aria-invalid');
      $calcForm.find('.field-error').remove();
      // slideUp с callback возвращает блок результатов в исходное скрытое состояние.
      $results.slideUp(200, function () {
        $(this).addClass('is-hidden');
      });
    });
  }

  /* --- Часть 3. Валидация формы подписки (#signup-form-feedback). --- */
  const $feedback = $('#signup-form-feedback');
  if ($feedback.length === 0) {
    return;
  }

  const $form = $feedback.closest('form');
  /* Кнопка submit отключена в разметке midterm — включаем её через .prop(). */
  $form.find('button[type="submit"]').prop('disabled', false);

  function errorTarget($field) {
    const $box = $field.closest('.col-12');
    return $box.length > 0 ? $box : $field.parent();
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

  /* Направление тренировки: описание выбранной радиокнопки. */
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
    let $firstInvalid = $();

    const plan = [
      { $field: $('#full-name'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.minLength(value, 2); }
      ] },
      { $field: $('#train-email'), checks: [
        function (value) { return EF.rules.required(value); },
        function (value) { return EF.rules.email(value); }
      ] },
      { $field: $('#train-phone'), checks: [
        function (value) { return value.trim() === '' ? '' : EF.rules.phone(value); }
      ] },
      { $field: $('#train-age'), checks: [
        function (value) { return value.trim() === '' ? '' : EF.rules.numberRange(value, 12, 99); }
      ] },
      { $field: $('#preferred-date'), checks: [
        function (value) { return value === '' ? '' : EF.rules.notPastDate(value); }
      ] },
      { $field: $('#agree'), checks: [
        function () { return EF.rules.checked($('#agree').prop('checked')); }
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
    // preventDefault(): сервера нет, форма учебная. Без него браузер перезагрузит
    // страницу и весь вывод (классы is-error/is-success, сообщение) потеряется.
    event.preventDefault();

    const $firstInvalid = validateSignup();
    if ($firstInvalid.length > 0) {
      showFeedback('error', 'Форма заполнена неверно', collectErrors());
      $firstInvalid.trigger('focus');
      return;
    }

    const direction = $form.find('input[name="direction"]:checked').val();
    const reference = EF.generateReference('TR');
    const visitDate = $('#preferred-date').val();
    showFeedback('success', 'Запись ' + reference + ' принята', [
      'Имя: ' + $('#full-name').val().trim(),
      'Контакт: ' + $('#train-email').val().trim() +
        ($('#train-phone').val().trim() === '' ? '' : ', ' + $('#train-phone').val().trim()),
      'Направление: ' + describeDirection(direction),
      'Пробная тренировка: ' + (visitDate === '' ? 'дата не выбрана' : EF.formatDateRu(visitDate)),
      'Демонстрационная форма: данные не отправлены на сервер, запись на тренировку не создана.'
    ]);
  });

  $form.on('reset', function () {
    // .find() собирает все помеченные поля и тексты ошибок внутри формы.
    $form.find('.is-error, .is-success, [aria-invalid]').removeClass('is-error is-success').removeAttr('aria-invalid');
    $form.find('.field-error').remove();
    $feedback.html('').removeClass('is-error is-success');
  });
});
