'use strict';

/* Каталог услуг и зон Experience Fitness (страница services.html).
   Значения category совпадают с атрибутами data-category карточек на странице услуг.
   Использует общий модуль window.EF (main.js).
   Здесь остались только справочные данные и функции; интерактив каталога в Assignment 6
   перенесён в services-jquery.js, а старая Vanilla-версия — в Git history (Vanilla version). */

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
