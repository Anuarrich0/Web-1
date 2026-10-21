'use strict';

(function () {
  // Находим блок тарифов и карточки, создаём поиск и фильтр срока.
  const section = document.querySelector('#pricing-plans');
  const cards = section.querySelectorAll('[data-tariff]');
  const controls = element('div', '', 'col-12');
  const label = element('label', 'Поиск тарифа', 'form-label');
  label.htmlFor = 'tariff-search';
  const search = element('input', '', 'form-control mb-3');
  search.id = 'tariff-search';
  search.type = 'search';
  controls.append(label, search);
  const duration = selectField(controls, 'duration-filter', 'Показать цены на срок', [
    ['', 'Все сроки'], ['1', '1 месяц'], ['3', '3 месяца'], ['6', '6 месяцев'], ['12', '12 месяцев']
  ]);
  const reset = element('button', 'Сбросить фильтры', 'btn btn-outline-light mb-3');
  reset.type = 'button';
  const count = element('p');
  count.setAttribute('role', 'status');
  controls.append(reset, count);
  section.querySelector('h2').after(controls);
  const empty = element('p', 'Ничего не найдено. Измените запрос или сбросьте фильтры.', 'col-12 is-hidden');
  section.append(empty);

  // Создаёт одну строку срока и цены внутри карточки.
  function priceRow(item) {
    const row = element('li', '', 'row g-2 border-bottom py-2');
    row.append(element('span', `${item.months} мес.`, 'col-5 text-body-secondary small'),
      element('span', money(item.price), 'col-7 fw-bold text-end'));
    return row;
  }

  // Совмещает поиск и срок, обновляет цены, видимость и число тарифов.
  function filterTariffs() {
    const query = search.value.trim().toLocaleLowerCase('ru-RU');
    let visible = 0;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const items = memberships.filter(function (item) {
        const matchesCard = item.tariff === card.dataset.tariff;
        const matchesSearch = item.name.toLocaleLowerCase('ru-RU').includes(query);
        const matchesDuration = duration.value === '' || item.months === Number(duration.value);
        return matchesCard && matchesSearch && matchesDuration;
      });
      card.classList.toggle('is-hidden', items.length === 0);
      renderList(card.querySelector('.price-list'), items, priceRow);
      if (items.length > 0) {
        visible += 1;
      }
    }
    count.textContent = `Найдено тарифов: ${visible}`;
    empty.classList.toggle('is-hidden', visible !== 0);
  }
  // Ввод и выбор запускают фильтрацию; сброс очищает оба фильтра.
  search.addEventListener('input', filterTariffs);
  duration.addEventListener('change', filterTariffs);
  reset.addEventListener('click', function () {
    search.value = '';
    duration.value = '';
    filterTariffs();
  });

  // Подготовка формы: возраст вычисляется по обязательной дате рождения.
  const form = document.querySelector('#order-form form');
  const tariff = document.querySelector('#tariff-select');
  const feedback = document.querySelector('#pricing-order-feedback');
  const fields = form.querySelectorAll('fieldset');
  document.querySelector('#client-age').parentElement.remove();
  const birth = document.querySelector('#client-dob');
  birth.required = true;
  const ageOutput = element('span', '', 'small d-block');
  ageOutput.setAttribute('aria-live', 'polite');
  birth.after(ageOutput);
  form.noValidate = true;
  form.querySelector('[type="submit"]').disabled = false;
  document.querySelector('#form-note-0').textContent = 'Учебная заявка: данные не отправляются на сервер, реальный заказ, оплата и бронирование не создаются.';
  // Дополнительные согласия, скидка и блок текущего расчёта.
  const student = checkboxField(fields[1], 'student-discount', 'Студенческий билет: предварительная скидка 15% (проверяется менеджером)');
  const guardian = checkboxField(fields[2], 'guardian-agree', 'Есть согласие законного представителя (до 18 лет)');
  const accompanied = checkboxField(fields[2], 'accompanied-agree', 'Буду заниматься с представителем или тренером (до 15 лет)');
  const summary = element('p', '', 'col-12');
  summary.setAttribute('aria-live', 'polite');
  fields[1].append(summary);
  const comment = document.querySelector('#client-comment');
  const counter = element('span', '', 'small d-block');
  comment.after(counter);
  // До первой отправки не показываем ошибки незаполненной формы.
  let attempted = false;

  // Собирает текущие значения формы в один объект.
  function readOrder() {
    const selectedTerm = form.querySelector('[name="term"]:checked');
    let months = '';
    if (selectedTerm) {
      months = selectedTerm.value;
    }
    return {
      name: document.querySelector('#client-name').value,
      email: document.querySelector('#client-email').value,
      phone: document.querySelector('#client-phone').value,
      age: birthAge(birth.value),
      birth: birth.value,
      tariff: tariff.value,
      months: months,
      agree: document.querySelector('#client-agree').checked,
      guardian: guardian.checked,
      accompanied: accompanied.checked,
      comment: comment.value
    };
  }

  // Удаляет старые ошибки и показывает актуальные рядом с полями.
  function showErrors(errors) {
    const oldMessages = form.querySelectorAll('[data-field-error]');
    for (let i = 0; i < oldMessages.length; i++) {
      const message = oldMessages[i];
      const input = document.getElementById(message.dataset.fieldError);
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      message.remove();
    }
    const errorIds = Object.keys(errors);
    for (let i = 0; i < errorIds.length; i++) {
      const id = errorIds[i];
      const text = errors[id];
      const input = document.getElementById(id);
      const message = element('span', text, 'd-block text-danger small');
      message.id = `${id}-error`;
      message.dataset.fieldError = id;
      input.parentElement.append(message);
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', message.id);
    }
  }

  // Обновляет цену, возраст, подсветку карточек и проверки формы.
  function updateOrder() {
    const data = readOrder();
    const item = findMembership(data.tariff, data.months);
    if (item) {
      const price = membershipPrice(item, student.checked);
      summary.textContent = `${item.name}, ${item.months} мес. Цена: ${money(item.price)}. Скидка: ${money(price.discount)}. Итого: ${money(price.total)} (≈ ${money(price.monthly)}/мес.).`;
      if (student.checked) {
        summary.textContent += ' Студенческий билет проверяется в клубе.';
      }
    } else {
      summary.textContent = 'Выберите тариф и срок для расчёта стоимости.';
    }
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.dataset.tariff === data.tariff) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    }
    if (Number.isInteger(data.age)) {
      ageOutput.textContent = `Возраст: ${data.age} (рассчитан автоматически)`;
    } else {
      ageOutput.textContent = '';
    }
    guardian.parentElement.classList.toggle('is-hidden', !(data.age >= 14 && data.age < 18));
    accompanied.parentElement.classList.toggle('is-hidden', !(data.age >= 14 && data.age < 15));
    counter.textContent = `${comment.value.length} / 500 символов`;
    if (attempted) {
      const errors = membershipErrors(data);
      showErrors(errors);
      if (Object.keys(errors).length === 0 && feedback.classList.contains('is-error')) {
        feedback.classList.remove('is-error');
        feedback.textContent = 'Ошибки исправлены. Можно отправить демонстрационную заявку.';
      }
    }
  }

  // Кнопка карточки выбирает тариф и срок в форме.
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.querySelector('a').addEventListener('click', function (event) {
      event.preventDefault();
      tariff.value = card.dataset.tariff;
      const months = duration.value || readOrder().months || '1';
      document.getElementById(`term-${months}`).checked = true;
      updateOrder();
      tariff.focus();
    });
  }
  // Изменения полей сразу обновляют расчёт.
  form.addEventListener('input', updateOrder);
  form.addEventListener('change', updateOrder);
  // Останавливаем отправку на сервер, проверяем поля и фокусируем ошибку.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    attempted = true;
    const data = readOrder();
    const errors = membershipErrors(data);
    showErrors(errors);
    feedback.classList.remove('is-error', 'is-success');
    if (Object.keys(errors).length > 0) {
      feedback.textContent = 'Исправьте ошибки у полей. Заявка не сформирована.';
      feedback.classList.add('is-error');
      document.getElementById(Object.keys(errors)[0]).focus();
      return;
    }
    feedback.replaceChildren();
  });
  // Сброс очищает ошибки; пересчёт идёт после стандартного сброса полей.
  form.addEventListener('reset', function () {
    attempted = false;
    showErrors({});
    feedback.replaceChildren();
    feedback.classList.remove('is-error', 'is-success');
    // Native fields are reset after this event finishes.
    setTimeout(updateOrder, 0);
  });
  // Читаем тариф, срок и скидку из ссылки со страницы акций.
  const params = new URLSearchParams(window.location.search);
  const requested = findMembership(params.get('tariff'), params.get('months'));
  if (requested) {
    tariff.value = requested.tariff;
    document.getElementById(`term-${requested.months}`).checked = true;
    student.checked = params.get('student') === '1';
  }
  // Первый вывод при открытии страницы.
  filterTariffs();
  updateOrder();
})();

/*
section — блок тарифов; cards — карточки; controls — контейнер фильтров.
search — текстовый поиск; duration — срок; reset — сброс; count — число результатов.
priceRow — одна строка цены; filterTariffs — поиск и вывод подходящих тарифов.
form — форма; tariff — выбранный тариф; birth — дата рождения; ageOutput — возраст.
student — скидка; guardian/accompanied — согласие и сопровождение несовершеннолетних.
summary — расчёт цены; comment/counter — комментарий и счётчик; feedback — сообщения.
readOrder — прочитать поля; showErrors — показать ошибки; updateOrder — обновить экран.
attempted — была ли попытка отправки; value — значение поля; checked — галочка.
querySelector — найти элемент; querySelectorAll — найти все; dataset — data-атрибуты.
input — ввод; change — смена выбора; click — нажатие; submit — отправка; reset — сброс.
preventDefault — отменить обычное действие; focus — перевести курсор в поле.
URLSearchParams — параметры ссылки; is-hidden — скрыть; is-selected — подсветить.
Путь: изменение поля → updateOrder → readOrder → поиск тарифа → расчёт → вывод.
*/
