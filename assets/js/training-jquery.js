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

  /* --- Часть 3. Самостоятельная запись: тренеры по времени и групповые занятия недели. ---
     Список тренеров, их свободное время и групповые занятия недели строятся кодом и
     вставляются на страницу, поэтому HTML и CSS менять не нужно. Пользователь видит всё
     сам и записывается без менеджера: не нужно узнавать, какие групповые занятия сейчас
     есть и когда свободен тренер. Подтверждение записи открывается во всплывающем окне
     (Bootstrap modal), разметка которого тоже собирается кодом. Используются готовые
     Bootstrap-классы и классы состояний. */
  if ($scheduleSection.length > 0 && typeof EF !== 'undefined' && EF.TRAINERS && EF.GROUP_CLASSES) {

    /* Короткая фабрика элементов: тег, классы, текст. Текст задаётся через .text(),
       поэтому вставляемые данные не могут сломать разметку. */
    function make(tag, className, text) {
      const $node = $('<' + tag + '></' + tag + '>');
      if (className) {
        $node.addClass(className);
      }
      if (text !== undefined) {
        $node.text(text);
      }
      return $node;
    }

    /* Контейнер самостоятельной записи целиком создаётся кодом и вставляется после
       секции расписания (#training-schedule). */
    const $wrap = make('section', 'mb-5').attr('aria-label', 'Онлайн-запись к тренерам и на групповые занятия');
    $wrap.append(make('h2', 'h3 fw-bold mb-3', 'Онлайн-запись без менеджера'));
    $wrap.append(make('p', 'text-body-secondary mb-4',
      'Выберите тренера и удобное время или групповое занятие этой недели и запишитесь сами — ' +
      'уточнять расписание у менеджера не нужно.'));

    /* 3.1. Тренеры и свободное время на неделе. */
    const $trainersBlock = make('div', 'border rounded-3 p-3 p-md-4 bg-body-tertiary mb-4');
    $trainersBlock.append(make('h3', 'h4 fw-bold mb-3', 'Тренеры и свободное время'));
    $trainersBlock.append(make('p', 'text-body-secondary mb-3', 'Нажмите на тренера, чтобы увидеть его свободные окна на неделе.'));

    const $trainerButtons = make('div', 'd-flex flex-wrap gap-2 mb-3')
      .attr('role', 'group')
      .attr('aria-label', 'Выбор тренера');
    $(EF.TRAINERS).each(function () {
      const trainer = this;
      $trainerButtons.append(
        make('button', 'btn btn-sm btn-outline-light', trainer.name)
          .attr('type', 'button')
          .attr('data-trainer', trainer.id)
          .attr('aria-pressed', 'false')
      );
    });
    $trainersBlock.append($trainerButtons);

    const $trainerInfo = make('p', 'text-body-secondary mb-3', 'Выберите тренера, чтобы увидеть свободное время.');
    $trainersBlock.append($trainerInfo);

    const $slots = make('div', 'row g-3');
    $trainersBlock.append($slots);
    $wrap.append($trainersBlock);

    /* 3.2. Групповые занятия на этой неделе. */
    const $classesBlock = make('div', 'border rounded-3 p-3 p-md-4 bg-body-tertiary mb-4');
    $classesBlock.append(make('h3', 'h4 fw-bold mb-3', 'Групповые занятия на этой неделе'));
    const $classSummary = make('p', 'text-body-secondary mb-3', '');
    $classesBlock.append($classSummary);
    const $classList = make('div', 'row g-3');
    $classesBlock.append($classList);
    $wrap.append($classesBlock);

    /* 3.3. Всплывающее окно (Bootstrap modal) подтверждения записи. Разметка попапа
       целиком собирается кодом и вставляется в <body>, поэтому HTML страницы не меняется.
       Формой служит сам .modal-content — так работает родное событие submit с preventDefault(). */
    const $bookingModal = make('div', 'modal fade').attr('tabindex', '-1').attr('aria-hidden', 'true');
    const $bookingDialog = make('div', 'modal-dialog modal-dialog-centered').appendTo($bookingModal);
    const $bookingForm = make('form', 'modal-content').attr('action', '#').attr('method', 'post');
    $bookingDialog.append($bookingForm);

    const $bookingHeader = make('div', 'modal-header');
    $bookingHeader.append(make('h3', 'modal-title h5', 'Подтверждение записи'));
    $bookingHeader.append(
      make('button', 'btn-close').attr('type', 'button').attr('data-bs-dismiss', 'modal').attr('aria-label', 'Закрыть')
    );
    $bookingForm.append($bookingHeader);

    const $bookingBody = make('div', 'modal-body');
    const $target = make('p', 'fw-bold mb-3', 'Цель записи не выбрана.');
    $bookingBody.append($target);
    $bookingBody.append(make('p', 'text-body-secondary mb-3', 'Укажите имя и телефон — запись подтвердится автоматически, менеджер не нужен.'));

    const $nameGroup = make('div', 'mb-3');
    $nameGroup.append(make('label', 'form-label', 'Ваше имя:').attr('for', 'booking-name'));
    const $name = make('input', 'form-control')
      .attr('type', 'text')
      .attr('id', 'booking-name')
      .attr('name', 'booking-name')
      .attr('placeholder', 'Например, Алия');
    $nameGroup.append($name);
    $bookingBody.append($nameGroup);

    const $phoneGroup = make('div', 'mb-3');
    $phoneGroup.append(make('label', 'form-label', 'Телефон:').attr('for', 'booking-phone'));
    const $phone = make('input', 'form-control')
      .attr('type', 'tel')
      .attr('id', 'booking-phone')
      .attr('name', 'booking-phone')
      .attr('placeholder', '+7 (7XX) XXX-XX-XX');
    $phoneGroup.append($phone);
    $bookingBody.append($phoneGroup);

    const $bookingFeedback = make('div', 'form-feedback-container mt-3').attr('aria-live', 'polite');
    $bookingBody.append($bookingFeedback);
    $bookingForm.append($bookingBody);

    const $bookingFooter = make('div', 'modal-footer');
    $bookingFooter.append(make('button', 'btn btn-primary', 'Записаться').attr('type', 'submit'));
    $bookingFooter.append(
      make('button', 'btn btn-outline-light', 'Отмена').attr('type', 'button').attr('data-bs-dismiss', 'modal')
    );
    $bookingForm.append($bookingFooter);

    /* Одно переиспользуемое окно: добавляем в <body> и создаём экземпляр Bootstrap. */
    $('body').append($bookingModal);
    const bookingModal = new bootstrap.Modal($bookingModal.get(0));

    /* Вставляем готовый блок в страницу после секции расписания. */
    $scheduleSection.after($wrap);

    /* Текущая цель записи: персональное время тренера или групповое занятие. */
    let selected = null;

    /* Строит свободные окна выбранного тренера и подсвечивает его кнопку. */
    function renderTrainer(trainerId) {
      const trainer = EF.findTrainerById(trainerId);
      if (!trainer) {
        return;
      }
      /* Подсветка активной кнопки — по data-атрибуту, без inline onclick. */
      $trainerButtons.find('[data-trainer]').each(function () {
        const $button = $(this);
        const active = $button.attr('data-trainer') === trainerId;
        $button.toggleClass('is-selected', active).toggleClass('active', active)
          .attr('aria-pressed', active ? 'true' : 'false');
      });

      $trainerInfo.text(trainer.specialty + '. Опыт: ' + trainer.experienceYears + ' лет.');

      $slots.empty();
      $(trainer.slots).each(function () {
        const slot = this;
        const $col = make('div', 'col-12 col-md-6 col-lg-4');
        const $card = make('div', 'border rounded-3 p-3 bg-body h-100');
        $card.append(make('p', 'small text-body-secondary mb-1', slot.dayLabel));
        $card.append(make('p', 'fw-bold mb-2', slot.time));
        $card.append(
          make('button', 'btn btn-sm btn-outline-light w-100', 'Записаться на ' + slot.time)
            .attr('type', 'button')
            .attr('data-slot-trainer', trainer.id)
            .attr('data-slot-when', slot.dayLabel + ' в ' + slot.time)
        );
        $col.append($card);
        $slots.append($col);
      });
    }

    /* Строит список групповых занятий недели и счётчик доступных мест. */
    function renderClasses() {
      $classList.empty();
      $(EF.GROUP_CLASSES).each(function () {
        const item = this;
        const free = item.spotsLeft > 0;
        const $col = make('div', 'col-12 col-md-6 col-lg-4');
        const $card = make('div', 'border rounded-3 p-3 bg-body h-100 d-flex flex-column');
        $card.append(make('p', 'fw-bold mb-1', item.title));
        $card.append(make('p', 'small text-body-secondary mb-1', item.dayLabel + ' · ' + item.time));
        $card.append(make('p', 'small text-body-secondary mb-2', 'Тренер: ' + item.trainer));
        $card.append(make('p', 'small mb-2 ' + (free ? 'text-success' : 'text-danger'),
          free ? 'Свободных мест: ' + item.spotsLeft : 'Мест нет'));

        const $book = make('button', 'btn btn-sm w-100 mt-auto ' + (free ? 'btn-primary' : 'btn-outline-light'),
          free ? 'Записаться' : 'Недоступно').attr('type', 'button');
        if (free) {
          $book.attr('data-class-book', item.id);
        } else {
          $book.prop('disabled', true);
        }
        $card.append($book);
        $col.append($card);
        $classList.append($col);
      });
      $classSummary.text('Доступно на этой неделе: ' + EF.countAvailableClasses() + ' из ' + EF.GROUP_CLASSES.length + ' занятий.');
    }

    /* Сбрасывает предыдущее подтверждение перед новой записью. */
    function clearFeedback() {
      $bookingFeedback.empty().removeClass('is-success is-error');
    }

    /* Открывает попап записи для выбранной цели (тренер и время либо занятие). */
    function selectTarget(target) {
      selected = target;
      $target.text(target.label);
      clearFeedback();
      /* Сбрасываем поля и сообщения об ошибках перед новой записью. */
      $name.val('').removeClass('is-error is-success').removeAttr('aria-invalid');
      $phone.val('').removeClass('is-error is-success').removeAttr('aria-invalid');
      $bookingForm.find('.field-error').text('');
      /* Показываем модальное окно вместо выезжающей формы. */
      bookingModal.show();
    }

    /* Проверяет поля записи правилами из общего модуля EF.rules (без сервера). */
    function validateBooking() {
      let $firstInvalid = $();
      const checks = [
        { $field: $name, message: EF.rules.required($name.val()) || EF.rules.minLength($name.val(), 2) },
        { $field: $phone, message: EF.rules.required($phone.val()) || EF.rules.phone($phone.val()) }
      ];

      $(checks).each(function () {
        const check = this;
        const $field = check.$field;
        const $box = $field.closest('div');
        if (check.message === '') {
          $field.removeClass('is-error').addClass('is-success').removeAttr('aria-invalid');
          $box.find('.field-error').text('');
        } else {
          $field.addClass('is-error').removeClass('is-success').attr('aria-invalid', 'true');
          let $note = $box.find('.field-error');
          if ($note.length === 0) {
            $note = make('span', 'field-error d-block text-danger small mt-1');
            $box.append($note);
          }
          $note.text(check.message);
          if ($firstInvalid.length === 0) {
            $firstInvalid = $field;
          }
        }
      });

      return $firstInvalid;
    }

    /* Обрабатывает отправку: подтверждение записи и списание места у группового занятия. */
    function submitBooking() {
      if (!selected) {
        return;
      }
      const $firstInvalid = validateBooking();
      if ($firstInvalid.length > 0) {
        $firstInvalid.trigger('focus');
        return;
      }

      clearFeedback();
      const $alert = make('div', 'alert alert-success mb-0');
      $alert.append(make('p', 'fw-bold mb-2', 'Готово! Вы записаны. Номер записи: ' + EF.generateReference('EF')));
      $alert.append(make('p', 'mb-0', selected.confirmation + ' Мы ждём вас в Experience Fitness.'));
      $bookingFeedback.append($alert).addClass('is-success');

      /* Для группового занятия уменьшаем число свободных мест и перерисовываем список. */
      if (selected.classId) {
        const item = EF.findGroupClassById(selected.classId);
        if (item && item.spotsLeft > 0) {
          item.spotsLeft = item.spotsLeft - 1;
          renderClasses();
        }
      }

      /* Очищаем форму после успешной записи. */
      $name.val('');
      $phone.val('');
      $bookingForm.find('.is-error, .is-success, [aria-invalid]').removeClass('is-error is-success').removeAttr('aria-invalid');
      $bookingForm.find('.field-error').text('');
    }

    /* Делегированные обработчики: ловят и те кнопки, которые построены кодом позже.
       Селектор во втором аргументе .on() позволяет обслуживать все кнопки одним обработчиком. */
    $wrap.on('click', '[data-trainer]', function () {
      renderTrainer($(this).attr('data-trainer'));
    });

    $wrap.on('click', '[data-slot-trainer]', function () {
      const $button = $(this);
      const trainer = EF.findTrainerById($button.attr('data-slot-trainer'));
      const trainerName = trainer ? trainer.name : 'тренером';
      const when = $button.attr('data-slot-when');
      selectTarget({
        label: 'Персональная тренировка · ' + trainerName + ' · ' + when,
        confirmation: 'Ждём вас на персональной тренировке с ' + trainerName + ' (' + when + ').'
      });
    });

    $wrap.on('click', '[data-class-book]', function () {
      const item = EF.findGroupClassById($(this).attr('data-class-book'));
      if (!item) {
        return;
      }
      selectTarget({
        classId: item.id,
        label: 'Групповое занятие · ' + item.title + ' · ' + item.dayLabel + ' в ' + item.time,
        confirmation: 'Ждём вас на занятии «' + item.title + '» (' + item.dayLabel + ', ' + item.time + ').'
      });
    });

    $bookingForm.on('submit', function (event) {
      // preventDefault(): запись подтверждается на клиенте, серверу отправлять нечего.
      event.preventDefault();
      submitBooking();
    });

    /* Первичная отрисовка списка занятий недели. */
    renderClasses();
  }
});
