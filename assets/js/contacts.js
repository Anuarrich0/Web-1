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

/* ===== Интерактив страницы «Контакты»: валидация формы обратной связи. ===== */

(function (EF) {
  'use strict';

  const feedback = document.getElementById('contact-form-feedback');
  if (!feedback) {
    return;
  }

  const form = feedback.closest('form');
  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    age: document.getElementById('client-age'),
    date: document.getElementById('callback-date'),
    topic: document.getElementById('topic'),
    replyPhone: document.getElementById('reply-phone'),
    replyEmail: document.getElementById('reply-email'),
    message: document.getElementById('message'),
    agree: document.getElementById('agree-contact')
  };
  form.noValidate = true;
  EF.enableSubmitButtons(form);

  /* Составное правило: телефон обязателен, если выбран ответ звонком. */
  function phoneCheck() {
    if (fields.replyPhone.checked && fields.phone.value.trim() === '') {
      return 'Укажите телефон для ответа звонком';
    }
    return fields.phone.value.trim() === '' ? '' : EF.rules.phone(fields.phone.value);
  }

  /* Проверяет поля формы; возвращает первое неверное поле или null. */
  function validateContact() {
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
    check(fields.phone, [phoneCheck]);
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
    check(fields.message, [
      function () { return EF.rules.required(fields.message.value); },
      function () { return EF.rules.minLength(fields.message.value, 10); }
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
    const firstInvalid = validateContact();
    if (firstInvalid) {
      EF.showFormFeedback(feedback, 'error', 'Форма заполнена неверно', collectErrors());
      firstInvalid.focus();
      return;
    }
    const method = fields.replyEmail.checked ? 'по электронной почте' : 'по телефону';
    const reference = EF.generateReference('MSG');
    EF.showFormFeedback(feedback, 'success', 'Сообщение ' + reference + ' принято', [
      'Имя: ' + fields.name.value.trim(),
      'Тема: ' + EF.describeTopic(fields.topic.value),
      'Способ ответа: ' + method,
      'Контакт: ' + fields.email.value.trim() +
        (fields.phone.value.trim() === '' ? '' : ', ' + fields.phone.value.trim()),
      'Демонстрационная форма: сообщение не отправлено на сервер и не создаёт реальное обращение.'
    ]);
  });

  form.addEventListener('reset', function () {
    EF.clearFormErrors(form);
    EF.clearFormFeedback(feedback);
  });
})(window.EF);
