'use strict';

/* ============================================================================
   Assignment 6, фича 4: фильтр расписания и калькулятор калорий
   (страница «Тренировки»). Подключён jQuery 3.7.1.

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
});
