'use strict';

/* Логика страницы «Тренировки» (training.html): расписание недели и расчёт калорий.
   Данные расписания совпадают с таблицей тренировочной недели на странице.
   Использует общий модуль window.EF (main.js). */

(function (EF) {
  'use strict';

  /* Расписание тренировочной недели (7 занятий) — совпадает с data-day/data-category в таблице. */
  EF.SCHEDULE = [
    { day: 'monday', dayLabel: 'Понедельник', category: 'gym', program: 'Силовая тренировка', time: '19:00', durationMin: 60, trainer: 'Арман С.', intensity: 'средняя' },
    { day: 'tuesday', dayLabel: 'Вторник', category: 'cardio', program: 'Кардио и выносливость', time: '08:00', durationMin: 40, trainer: 'Дина К.', intensity: 'лёгкая' },
    { day: 'wednesday', dayLabel: 'Среда', category: 'gym', program: 'Тренировка на всё тело', time: '19:00', durationMin: 60, trainer: 'Арман С.', intensity: 'средняя' },
    { day: 'thursday', dayLabel: 'Четверг', category: 'crossfit', program: 'Кроссфит WOD', time: '20:00', durationMin: 50, trainer: 'Ержан Т.', intensity: 'высокая' },
    { day: 'friday', dayLabel: 'Пятница', category: 'crossfit', program: 'Кроссфит', time: '19:30', durationMin: 50, trainer: 'Ержан Т.', intensity: 'высокая' },
    { day: 'saturday', dayLabel: 'Суббота', category: 'cardio', program: 'Кардио', time: '10:00', durationMin: 30, trainer: 'Дина К.', intensity: 'лёгкая' },
    { day: 'sunday', dayLabel: 'Воскресенье', category: 'gym', program: 'Свободная тренировка', time: '11:00', durationMin: 60, trainer: '—', intensity: 'средняя' }
  ];

  /* Направления расписания: те же идентификаторы, что и data-schedule-filter. */
  EF.SCHEDULE_CATEGORIES = [
    { id: 'all', label: 'Все направления' },
    { id: 'gym', label: 'Тренажерный зал' },
    { id: 'crossfit', label: 'Кроссфит' },
    { id: 'cardio', label: 'Кардио' }
  ];

  /* Возвращает занятия выбранного направления (=== для сравнения категорий). */
  EF.getScheduleByCategory = function (category) {
    if (category === 'all' || !category) {
      return EF.SCHEDULE.slice();
    }
    return EF.SCHEDULE.filter(function (session) {
      return session.category === category;
    });
  };

  /* Суммарная длительность занятий недели в минутах. */
  EF.getTotalWeeklyMinutes = function (list) {
    const items = Array.isArray(list) ? list : EF.SCHEDULE;
    return EF.sumBy(items, function (session) {
      return session.durationMin;
    });
  };

  /* Средняя длительность одного занятия (округлённые минуты). */
  EF.getAverageSessionMinutes = function (list) {
    const items = Array.isArray(list) ? list : EF.SCHEDULE;
    const durations = items.map(function (session) {
      return session.durationMin;
    });
    return Math.round(EF.average(durations));
  };

  /* Самое продолжительное занятие недели. */
  EF.getLongestSession = function () {
    if (EF.SCHEDULE.length === 0) {
      return null;
    }
    return EF.SCHEDULE.reduce(function (longest, session) {
      return session.durationMin > longest.durationMin ? session : longest;
    });
  };

  /* Количество занятий по каждому направлению: { gym: 3, crossfit: 2, cardio: 2 }. */
  EF.countScheduleByCategory = function () {
    const counts = {};
    for (let i = 0; i < EF.SCHEDULE.length; i++) {
      const category = EF.SCHEDULE[i].category;
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  };

  /* --- Расчёт калорий и плана тренировок (формула Миффлина — Сан-Жеора) --- */

  /* Коэффициенты активности для расчёта TDEE. */
  EF.ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725
  };

  /* Коррекция калорий под цель: дефицит, поддержание, профицит. */
  EF.GOAL_ADJUSTMENT = {
    lose: -400,
    maintain: 0,
    gain: 350
  };

  /* Базовый метаболизм (BMR), ккал/день. Ожидает { gender, age, height, weight }. */
  EF.calcBmr = function (params) {
    const base = 10 * params.weight + 6.25 * params.height - 5 * params.age;
    return Math.round(params.gender === 'female' ? base - 161 : base + 5);
  };

  /* Суточный расход с учётом активности (TDEE). */
  EF.calcTdee = function (bmr, activity) {
    const factor = EF.ACTIVITY_FACTORS[activity];
    const safeFactor = factor === undefined ? EF.ACTIVITY_FACTORS.sedentary : factor;
    return Math.round(bmr * safeFactor);
  };

  /* Рекомендуемая норма калорий под цель тренировки. */
  EF.calcTargetCalories = function (tdee, goal) {
    const adjustment = EF.GOAL_ADJUSTMENT[goal];
    const delta = adjustment === undefined ? 0 : adjustment;
    return Math.round(tdee + delta);
  };

  /* Рекомендуемая частота тренировок в неделю (условия if/else + логические операторы). */
  EF.recommendWorkoutFrequency = function (goal, activity) {
    if (activity === 'high' && goal === 'gain') {
      return 5;
    }
    if (activity === 'high' || goal === 'gain') {
      return 4;
    }
    if (activity === 'sedentary' || goal === 'maintain') {
      return 2;
    }
    return 3;
  };

  /* Рекомендация направления тренировок под цель и активность. */
  EF.recommendProgram = function (goal, activity) {
    if (goal === 'lose') {
      return 'Кардио и групповые программы (зумба, аэробика)';
    }
    if (goal === 'gain') {
      return 'Силовой тренинг и кроссфит';
    }
    if (activity === 'sedentary') {
      return 'Групповые занятия и стретчинг';
    }
    return 'Смешанная программа: тренажёрный зал и кардио';
  };

  /* Полный расчёт плана: вызывает другие функции модуля (функция вызывает функцию).
     Ожидает { gender, age, height, weight, activity, goal }. */
  EF.buildFitnessPlan = function (input) {
    const bmr = EF.calcBmr(input);
    const tdee = EF.calcTdee(bmr, input.activity);
    const target = EF.calcTargetCalories(tdee, input.goal);
    const frequency = EF.recommendWorkoutFrequency(input.goal, input.activity);
    const program = EF.recommendProgram(input.goal, input.activity);
    return {
      bmr: bmr,
      tdee: tdee,
      targetCalories: target,
      workoutFrequency: frequency,
      program: program
    };
  };
})(window.EF);

/* ===== Интерактив страницы «Тренировки»: фильтр расписания, калькулятор и форма записи. ===== */

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

    /* Показывает только занятия выбранного направления. */
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

    /* Текст частоты тренировок с правильным окончанием. */
    function frequencyText(count) {
      if (count === 1) {
        return '1 тренировка в неделю';
      }
      if (count >= 2 && count <= 4) {
        return count + ' тренировки в неделю';
      }
      return count + ' тренировок в неделю';
    }

    /* Проверяет числовые поля калькулятора; возвращает первое неверное поле или null. */
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

    /* Считает план и выводит результаты в заготовленный контейнер. */
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

    /* Читаемое название выбранного направления тренировки. */
    function describeDirection(value) {
      if (value === 'crossfit') {
        return 'Кроссфит';
      }
      if (value === 'group') {
        return 'Групповые занятия';
      }
      return 'Тренажёрный зал';
    }

    /* Проверяет поля формы; возвращает первое неверное поле или null. */
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
