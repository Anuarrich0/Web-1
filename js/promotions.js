'use strict';

(() => {
  const offers = [
    { title: 'Тренировка в подарок', audience: 'new', student: false, months: 12, text: 'Персональная тренировка в подарок при покупке годового абонемента.' },
    { title: 'Студенческая скидка 15%', audience: 'all', student: true, months: 1, text: 'При наличии действующего студенческого билета. Право на скидку проверяет менеджер клуба.' },
    { title: 'Приведи друга', audience: 'existing', student: false, months: 1, text: 'Месяц занятий бесплатно после оформления абонемента приглашённым другом. Бонус на сайте не активируется.' },
    { title: 'Продление в день рождения', audience: 'existing', student: false, months: 1, text: 'Размер и условия скидки уточняйте в клубе: они не опубликованы на сайте.' }
  ];
  const section = document.querySelector('#current-promos');
  const controls = element('div');
  const audience = selectField(controls, 'promo-audience', 'Показать предложения', [
    ['all', 'Все предложения'], ['new', 'Для новых клиентов'], ['existing', 'Для действующих участников']
  ]);
  const label = element('label', 'Поиск акции', 'form-label');
  label.htmlFor = 'promo-search';
  const search = element('input', '', 'form-control mb-3');
  search.id = 'promo-search';
  search.type = 'search';
  controls.append(label, search);
  const studentOnly = checkboxField(controls, 'promo-student-only', 'Только студенческие предложения');
  const reset = element('button', 'Сбросить фильтры', 'btn btn-outline-light mb-3');
  reset.type = 'button';
  const count = element('p');
  count.setAttribute('role', 'status');
  controls.append(reset, count);
  section.querySelector('h2').after(controls);
  const list = section.querySelector('ul');
  list.classList.add('list-unstyled');

  function offerCard(offer) {
    const card = element('li', '', 'border rounded-3 p-3 mb-3');
    const link = element('a', 'Подобрать абонемент', 'btn btn-outline-light');
    link.href = `pricing.html?tariff=exp&months=${offer.months}&student=${offer.student ? '1' : '0'}#order-form`;
    card.append(element('h3', offer.title, 'h5'), element('p', offer.text), link);
    return card;
  }

  function filterOffers() {
    const query = search.value.trim().toLocaleLowerCase('ru-RU');
    const items = offers.filter(offer =>
      (audience.value === 'all' || offer.audience === 'all' || offer.audience === audience.value) &&
      (!studentOnly.checked || offer.student) &&
      `${offer.title} ${offer.text}`.toLocaleLowerCase('ru-RU').includes(query));
    count.textContent = `Найдено акций: ${items.length}`;
    renderList(list, items, offerCard);
  }
  audience.addEventListener('change', filterOffers);
  search.addEventListener('input', filterOffers);
  studentOnly.addEventListener('change', filterOffers);
  reset.addEventListener('click', () => {
    audience.value = 'all';
    search.value = '';
    studentOnly.checked = false;
    filterOffers();
  });

  const calculator = element('section', '', 'border rounded-3 p-3 mb-4');
  calculator.append(element('h3', 'Рассчитать студенческую скидку', 'h4'));
  const tariff = selectField(calculator, 'discount-tariff', 'Тариф', [
    ['exp', 'GYM/EXP'], ['exp-plus', 'GYM/EXP+'], ['big-plus', 'BIG+/EXP']
  ]);
  const months = selectField(calculator, 'discount-months', 'Срок', [
    ['1', '1 месяц'], ['3', '3 месяца'], ['6', '6 месяцев'], ['12', '12 месяцев']
  ]);
  const student = checkboxField(calculator, 'discount-student', 'Есть действующий студенческий билет');
  const result = element('p');
  result.setAttribute('aria-live', 'polite');
  const proceed = element('a', 'Перейти к заявке', 'btn btn-primary');
  calculator.append(result, element('p', 'Предварительный расчёт: менеджер проверяет билет. Другие акции здесь не суммируются.'), proceed);
  section.append(calculator);

  function updateDiscount() {
    const item = findMembership(tariff.value, months.value);
    const price = membershipPrice(item, student.checked);
    result.textContent = `Обычная цена: ${money(item.price)}. Экономия: ${money(price.discount)}. Итого: ${money(price.total)} за ${item.months} мес.${student.checked ? '' : ' Без студенческого билета применяется обычная цена.'}`;
    const params = new URLSearchParams({ tariff: item.tariff, months: String(item.months), student: student.checked ? '1' : '0' });
    proceed.href = `pricing.html?${params}#order-form`;
  }
  calculator.addEventListener('change', updateDiscount);
  filterOffers();
  updateDiscount();
})();
