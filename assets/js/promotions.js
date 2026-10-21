'use strict';

(function () {
  // Данные акций: название, аудитория, студенческий статус, срок и условия.
  const offers = [
    { title: 'Тренировка в подарок', audience: 'new', student: false, months: 12, text: 'Персональная тренировка в подарок при покупке годового абонемента.' },
    { title: 'Студенческая скидка 15%', audience: 'all', student: true, months: 1, text: 'При наличии действующего студенческого билета. Право на скидку проверяет менеджер клуба.' },
    { title: 'Приведи друга', audience: 'existing', student: false, months: 1, text: 'Месяц занятий бесплатно после оформления абонемента приглашённым другом. Бонус на сайте не активируется.' },
    { title: 'Продление в день рождения', audience: 'existing', student: false, months: 1, text: 'Размер и условия скидки уточняйте в клубе: они не опубликованы на сайте.' }
  ];
  // Находим блок акций и создаём элементы фильтрации.
  const section = document.querySelector('#current-promos');
  const controls = element('div');
  const audience = selectField(controls, 'promo-audience', 'Показать предложения', [
    ['all', 'Все предложения'], ['new', 'Для новых клиентов'], ['existing', 'Для действующих участников']
  ]);
  // Названия для выпадающего списка берём из того же массива акций.
  const offerOptions = [['', 'Все акции']];
  for (let i = 0; i < offers.length; i++) {
    offerOptions.push([offers[i].title, offers[i].title]);
  }
  const search = selectField(controls, 'promo-search', 'Выберите акцию', offerOptions);
  const studentOnly = checkboxField(controls, 'promo-student-only', 'Только студенческие предложения');
  const reset = element('button', 'Сбросить фильтры', 'btn btn-outline-light mb-3');
  reset.type = 'button';
  const count = element('p');
  count.setAttribute('role', 'status');
  controls.append(reset, count);
  section.querySelector('h2').after(controls);
  const list = section.querySelector('ul');
  list.classList.add('list-unstyled');

  // Создаёт карточку и ссылку на форму с выбранными параметрами.
  function offerCard(offer) {
    const card = element('li', '', 'border rounded-3 p-3 mb-3');
    const link = element('a', 'Подобрать абонемент', 'btn btn-outline-light');
    let studentValue = '0';
    if (offer.student) {
      studentValue = '1';
    }
    link.href = `pricing.html?tariff=exp&months=${offer.months}&student=${studentValue}#order-form`;
    card.append(element('h3', offer.title, 'h5'), element('p', offer.text), link);
    return card;
  }

  // Одновременно учитывает аудиторию, студенческий фильтр и название.
  function filterOffers() {
    const items = offers.filter(function (offer) {
      const matchesAudience = audience.value === 'all' || offer.audience === 'all' || offer.audience === audience.value;
      const matchesStudent = !studentOnly.checked || offer.student;
      const matchesTitle = search.value === '' || offer.title === search.value;
      return matchesAudience && matchesStudent && matchesTitle;
    });
    count.textContent = `Найдено акций: ${items.length}`;
    renderList(list, items, offerCard);
  }
  // Любое изменение выбора обновляет список; сброс возвращает все акции.
  audience.addEventListener('change', filterOffers);
  search.addEventListener('change', filterOffers);
  studentOnly.addEventListener('change', filterOffers);
  reset.addEventListener('click', function () {
    audience.value = 'all';
    search.value = '';
    studentOnly.checked = false;
    filterOffers();
  });

  // Показываем акции сразу после открытия страницы.
  filterOffers();
})();

/*
offers — массив акций; audience — выбор аудитории; search — выбор конкретной акции.
studentOnly — только студенческие предложения; reset — сброс; count — количество.
list — список на странице; offerOptions — варианты для выпадающего списка.
offerCard — создать карточку; filterOffers — выбрать подходящие акции и показать.
filter — получить массив подходящих объектов; push — добавить в массив.
change — изменение выбора; addEventListener — назначить обработчик события.
link.href — адрес перехода; tariff/months/student в ссылке — параметры для заявки.
new/existing/all — новый клиент / действующий / любая аудитория.
Путь: выбор фильтра → change → filterOffers → renderList → offerCard.
*/
