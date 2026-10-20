'use strict';

/* Каталог услуг и зон Experience Fitness (страница services.html).
   Значения category совпадают с атрибутами data-category карточек на странице услуг.
   Использует общий модуль window.EF (main.js). */

(function (EF) {
  'use strict';

  /* Категории услуг: те же идентификаторы, что и data-category в разметке. */
  EF.SERVICE_CATEGORIES = [
    { id: 'strength', label: 'Силовой тренинг' },
    { id: 'group', label: 'Групповые программы' },
    { id: 'martial', label: 'Боевые искусства' },
    { id: 'spa', label: 'Сауна и SPA' }
  ];

  /* Массив услуг клуба (12 реальных направлений) — 4+ значимых свойства на объект.
     price = 0 означает, что услуга входит в абонемент. */
  EF.SERVICES = [
    { id: 'gym', name: 'Тренажёрный зал', category: 'strength', level: 'любой', durationMin: 60, price: 0, description: 'Просторный зал с силовыми рамами, помостами и гантельным рядом 1–60 кг.' },
    { id: 'free-weights', name: 'Зона свободных весов', category: 'strength', level: 'средний', durationMin: 60, price: 0, description: 'Тяжелоатлетические помосты и полный гантельный ряд для базовых упражнений.' },
    { id: 'personal', name: 'Персональная тренировка', category: 'strength', level: 'любой', durationMin: 55, price: 8000, description: 'Индивидуальная программа с сертифицированным тренером.' },
    { id: 'crossfit', name: 'Кроссфит', category: 'group', level: 'продвинутый', durationMin: 50, price: 0, description: 'Высокоинтенсивная тренировка: тяжёлая атлетика, гимнастика и кардио.' },
    { id: 'stretching', name: 'Стретчинг', category: 'group', level: 'новичок', durationMin: 45, price: 0, description: 'Мягкое развитие гибкости и снятие мышечного напряжения.' },
    { id: 'pilates', name: 'Пилатес', category: 'group', level: 'новичок', durationMin: 50, price: 0, description: 'Укрепление мышц кора и улучшение осанки.' },
    { id: 'zumba', name: 'Зумба', category: 'group', level: 'новичок', durationMin: 50, price: 0, description: 'Танцевальная аэробика под зажигательную музыку.' },
    { id: 'aerobic', name: 'Аэробика', category: 'group', level: 'средний', durationMin: 45, price: 0, description: 'Динамичная кардио-нагрузка в группе.' },
    { id: 'boxing', name: 'Бокс', category: 'martial', level: 'любой', durationMin: 60, price: 0, description: 'Постановка ударной техники и работа на мешках.' },
    { id: 'martial-arts', name: 'Единоборства', category: 'martial', level: 'любой', durationMin: 60, price: 0, description: 'Функциональная выносливость и спарринги на татами.' },
    { id: 'sauna', name: 'Финская сауна', category: 'spa', level: 'любой', durationMin: 30, price: 0, description: 'Восстановление и детоксикация после интенсивной тренировки.' },
    { id: 'spa', name: 'SPA-зона', category: 'spa', level: 'любой', durationMin: 60, price: 3500, description: 'Комплекс процедур для полного расслабления.' }
  ];

  /* Возвращает услуги выбранной категории (строгое сравнение ===). */
  EF.getServicesByCategory = function (category) {
    return EF.SERVICES.filter(function (service) {
      return service.category === category;
    });
  };

  /* Поиск услуг по подстроке в названии или описании (без учёта регистра). */
  EF.searchServices = function (query) {
    const needle = String(query || '').trim().toLowerCase();
    if (needle === '') {
      return EF.SERVICES.slice();
    }
    return EF.SERVICES.filter(function (service) {
      const haystack = (service.name + ' ' + service.description).toLowerCase();
      return haystack.indexOf(needle) !== -1;
    });
  };

  /* Отбирает платные услуги (price > 0). */
  EF.getPaidServices = function () {
    return EF.SERVICES.filter(function (service) {
      return service.price > 0;
    });
  };

  /* Итоговая стоимость выбранного списка услуг. */
  EF.getServicesTotal = function (list) {
    const items = Array.isArray(list) ? list : [];
    return EF.sumBy(items, function (service) {
      return service.price;
    });
  };

  /* Средняя длительность занятий в списке (округлённые минуты). */
  EF.getAverageDuration = function (list) {
    const items = Array.isArray(list) ? list : [];
    const durations = items.map(function (service) {
      return service.durationMin;
    });
    return Math.round(EF.average(durations));
  };

  /* Самая доступная платная услуга; null, если платных услуг нет. */
  EF.getCheapestPaidService = function () {
    const paid = EF.getPaidServices();
    if (paid.length === 0) {
      return null;
    }
    return paid.reduce(function (cheapest, service) {
      return service.price < cheapest.price ? service : cheapest;
    });
  };

  /* Услуга недели по категории — демонстрационный выбор через Math.random().
     category = 'all' (или пусто) берёт из всего каталога. */
  EF.getServiceOfTheWeek = function (category) {
    const pool = category && category !== 'all'
      ? EF.getServicesByCategory(category)
      : EF.SERVICES;
    return EF.pickRandom(pool);
  };

  /* Краткое описание услуги для карточки или подтверждения. */
  EF.describeService = function (service) {
    if (!service) {
      return 'Услуга не найдена';
    }
    const priceText = service.price > 0
      ? EF.formatPrice(service.price)
      : 'включено в абонемент';
    return service.name + ' — ' + EF.formatMinutes(service.durationMin) + ', ' + priceText;
  };
})(window.EF);
