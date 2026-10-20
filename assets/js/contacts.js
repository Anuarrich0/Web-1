'use strict';

/* Логика страницы «Контакты» (contacts.html): темы обращений и график работы.
   Использует общий модуль window.EF (main.js). */

(function (EF) {
  'use strict';

  /* Темы обращений: value совпадает со значениями <option> в форме обратной связи.
     responseHours — ориентировочное время ответа отдела (демонстрационные данные). */
  EF.CONTACT_TOPICS = [
    { value: 'training', label: 'Тренировки', department: 'Тренерский отдел', responseHours: 2 },
    { value: 'membership', label: 'Абонементы', department: 'Отдел продаж', responseHours: 1 },
    { value: 'locations', label: 'Филиалы', department: 'Ресепшн', responseHours: 3 },
    { value: 'services', label: 'Услуги', department: 'Клиентский сервис', responseHours: 4 },
    { value: 'other', label: 'Другое', department: 'Call-центр', responseHours: 6 }
  ];

  /* График работы сети (совпадает с таблицей на странице контактов). */
  EF.WORKING_HOURS = [
    { days: 'Понедельник — Суббота', from: 7, to: 23 },
    { days: 'Воскресенье', from: 10, to: 20 }
  ];

  /* Возвращает тему обращения по её значению (строгое сравнение ===). */
  EF.getTopicByValue = function (value) {
    const found = EF.CONTACT_TOPICS.filter(function (topic) {
      return topic.value === value;
    });
    return found.length > 0 ? found[0] : null;
  };

  /* Тема с самым быстрым ответом (минимальное responseHours). */
  EF.getFastestTopic = function () {
    if (EF.CONTACT_TOPICS.length === 0) {
      return null;
    }
    return EF.CONTACT_TOPICS.reduce(function (fastest, topic) {
      return topic.responseHours < fastest.responseHours ? topic : fastest;
    });
  };

  /* Среднее время ответа по всем темам, в часах (функция вызывает EF.average). */
  EF.getAverageResponseHours = function () {
    const hours = EF.CONTACT_TOPICS.map(function (topic) {
      return topic.responseHours;
    });
    return Math.round(EF.average(hours) * 10) / 10;
  };

  /* Открыт ли call-центр в указанный час (быстрый ответ с 10:00 до 19:00). */
  EF.isCallCenterFastResponse = function (hour) {
    return hour >= 10 && hour < 19;
  };

  /* Описание темы обращения для подтверждения отправки. */
  EF.describeTopic = function (value) {
    const topic = EF.getTopicByValue(value);
    if (!topic) {
      return 'Тема обращения не выбрана';
    }
    return topic.label + ' — обрабатывает ' + topic.department + ', ориентировочно за ' + topic.responseHours + ' ч.';
  };

  /* Сводка по графику: суммарная длительность рабочей недели в часах. */
  EF.getWeeklyOpenHours = function () {
    const dailyHours = EF.WORKING_HOURS.map(function (slot) {
      const perDay = slot.to - slot.from;
      const days = slot.days.indexOf('—') !== -1 ? 6 : 1;
      return perDay * days;
    });
    return EF.sumBy(dailyHours, function (hours) {
      return hours;
    });
  };
})(window.EF);
