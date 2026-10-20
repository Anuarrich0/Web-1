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
