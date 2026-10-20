'use strict';

(() => {
  const section = document.querySelector('#pricing-plans');
  const cards = [...section.querySelectorAll('[data-tariff]')];
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

  function priceRow(item) {
    const row = element('li', '', 'row g-2 border-bottom py-2');
    row.append(element('span', `${item.months} мес.`, 'col-5 text-body-secondary small'),
      element('span', money(item.price), 'col-7 fw-bold text-end'));
    return row;
  }

  function filterTariffs() {
    const query = search.value.trim().toLocaleLowerCase('ru-RU');
    let visible = 0;
    for (const card of cards) {
      const items = memberships.filter(item => item.tariff === card.dataset.tariff &&
        item.name.toLocaleLowerCase('ru-RU').includes(query) &&
        (duration.value === '' || item.months === Number(duration.value)));
      card.classList.toggle('is-hidden', items.length === 0);
      renderList(card.querySelector('.price-list'), items, priceRow);
      if (items.length > 0) visible += 1;
    }
    count.textContent = `Найдено тарифов: ${visible}`;
    empty.classList.toggle('is-hidden', visible !== 0);
  }
  search.addEventListener('input', filterTariffs);
  duration.addEventListener('change', filterTariffs);
  reset.addEventListener('click', () => {
    search.value = '';
    duration.value = '';
    filterTariffs();
  });

  const form = document.querySelector('#order-form form');
  const tariff = document.querySelector('#tariff-select');
  const feedback = document.querySelector('#pricing-order-feedback');
  const fields = [...form.querySelectorAll('fieldset')];
  form.noValidate = true;
  form.querySelector('[type="submit"]').disabled = false;
  document.querySelector('#form-note-0').textContent = 'Учебная заявка: данные не отправляются на сервер, реальный заказ, оплата и бронирование не создаются.';
  const student = checkboxField(fields[1], 'student-discount', 'Студенческий билет: предварительная скидка 15% (проверяется менеджером)');
  const guardian = checkboxField(fields[2], 'guardian-agree', 'Есть согласие законного представителя (до 18 лет)');
  const accompanied = checkboxField(fields[2], 'accompanied-agree', 'Буду заниматься с представителем или тренером (до 15 лет)');
  const summary = element('p', '', 'col-12');
  summary.setAttribute('aria-live', 'polite');
  fields[1].append(summary);
  const comment = document.querySelector('#client-comment');
  const counter = element('span', '', 'small d-block');
  comment.after(counter);
  let attempted = false;
  let confirmed = false;

  function readOrder() {
    return {
      name: document.querySelector('#client-name').value,
      email: document.querySelector('#client-email').value,
      phone: document.querySelector('#client-phone').value,
      age: document.querySelector('#client-age').value,
      birth: document.querySelector('#client-dob').value,
      tariff: tariff.value, months: form.querySelector('[name="term"]:checked')?.value || '',
      agree: document.querySelector('#client-agree').checked,
      guardian: guardian.checked, accompanied: accompanied.checked, comment: comment.value
    };
  }

  function showErrors(errors) {
    for (const message of form.querySelectorAll('[data-field-error]')) {
      const input = document.getElementById(message.dataset.fieldError);
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
      message.remove();
    }
    for (const [id, text] of Object.entries(errors)) {
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

  function updateOrder() {
    const data = readOrder();
    const item = findMembership(data.tariff, data.months);
    if (item) {
      const price = membershipPrice(item, student.checked);
      summary.textContent = `${item.name}, ${item.months} мес. Цена: ${money(item.price)}. Скидка: ${money(price.discount)}. Итого: ${money(price.total)} (≈ ${money(price.monthly)}/мес.).${student.checked ? ' Студенческий билет проверяется в клубе.' : ''}`;
    } else summary.textContent = 'Выберите тариф и срок для расчёта стоимости.';
    for (const card of cards) card.classList.toggle('is-selected', card.dataset.tariff === data.tariff);
    guardian.parentElement.classList.toggle('is-hidden', !data.age || Number(data.age) >= 18);
    accompanied.parentElement.classList.toggle('is-hidden', !data.age || Number(data.age) >= 15);
    counter.textContent = `${comment.value.length} / 500 символов`;
    if (confirmed) {
      feedback.textContent = 'Данные изменены. Отправьте заявку снова для нового демонстрационного подтверждения.';
      feedback.classList.remove('is-success');
      confirmed = false;
    }
    if (attempted) {
      const errors = membershipErrors(data);
      showErrors(errors);
      if (Object.keys(errors).length === 0 && feedback.classList.contains('is-error')) {
        feedback.classList.remove('is-error');
        feedback.textContent = 'Ошибки исправлены. Можно отправить демонстрационную заявку.';
      }
    }
  }

  for (const card of cards) card.querySelector('a').addEventListener('click', event => {
    event.preventDefault();
    tariff.value = card.dataset.tariff;
    const months = duration.value || readOrder().months || '1';
    document.getElementById(`term-${months}`).checked = true;
    updateOrder();
    tariff.focus();
  });
  form.addEventListener('input', updateOrder);
  form.addEventListener('change', updateOrder);
  form.addEventListener('submit', event => {
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
    const item = findMembership(data.tariff, data.months);
    const price = membershipPrice(item, student.checked);
    const reference = `DEMO-${Math.floor(Math.random() * 900000) + 100000}`;
    feedback.replaceChildren(
      element('h3', `Демонстрационная заявка ${reference}`, 'h5'),
      element('p', `${data.name.trim()}, ${item.name}, ${item.months} мес. Итого: ${money(price.total)}. Email: ${data.email.trim()}. Телефон: ${data.phone.trim()}.`),
      element('p', data.comment.trim() ? `Комментарий: ${data.comment.trim()}` : 'Без комментария.'),
      element('p', 'Данные не отправлены на сервер. Реальный заказ, оплата или бронирование не созданы.'),
      element('p', student.checked ? 'Скидка предварительная: менеджер проверит студенческий билет.' : 'Расчёт без студенческой скидки.')
    );
    feedback.classList.add('is-success');
    confirmed = true;
  });
  form.addEventListener('reset', () => {
    attempted = false;
    confirmed = false;
    showErrors({});
    feedback.replaceChildren();
    feedback.classList.remove('is-error', 'is-success');
    // Native fields are reset after this event finishes.
    setTimeout(updateOrder, 0);
  });
  const params = new URLSearchParams(window.location.search);
  const requested = findMembership(params.get('tariff'), params.get('months'));
  if (requested) {
    tariff.value = requested.tariff;
    document.getElementById(`term-${requested.months}`).checked = true;
    student.checked = params.get('student') === '1';
  }
  filterTariffs();
  updateOrder();
})();
