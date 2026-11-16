'use strict';

/* Логика страницы «Контакты» (contacts.html): темы обращений и график работы.
   Использует общий модуль window.EF (main.js).
   Здесь остались только справочные данные и функции; интерактив формы в Assignment 6
   перенесён в contacts-jquery.js, а старая Vanilla-версия — в Git history (Vanilla version). */

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
    { days: 'Воскресенье', from: 0, to: 0 }
  ];

  /* Возвращает тему обращения по её значению (строгое сравнение ===). */
  EF.getTopicByValue = function (value) {
    const found = EF.CONTACT_TOPICS.filter(function (topic) {
      return topic.value === value;
    });
    return found.length > 0 ? found[0] : null;
  };


  /* Описание темы обращения для подтверждения отправки. */
  EF.describeTopic = function (value) {
    const topic = EF.getTopicByValue(value);
    if (!topic) {
      return 'Тема обращения не выбрана';
    }
    return topic.label + ' — обрабатывает ' + topic.department + ', ориентировочно за ' + topic.responseHours + ' ч.';
  };


})(window.EF);
