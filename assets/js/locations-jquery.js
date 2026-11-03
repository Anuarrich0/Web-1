'use strict';

/* ============================================================================
   Assignment 6, фича 3: фильтр филиалов по районам (страница «Филиалы»).
   Подключён jQuery 3.7.1.

   Что заменили (сравнение со старой Vanilla-версией из old-js-version.js):
     document.getElementById('id')        ->  $('#id')
     querySelectorAll('a')                ->  .find('a') / .siblings('a')
     addEventListener('click', ...)       ->  .on('click', 'a', ...)
     classList.toggle('is-hidden', bool)  ->  .toggleClass('is-hidden', bool)
     ручной цикл по строкам for           ->  .each() по набору строк
     createElement + appendChild          ->  $('<div>') + .append() / .appendTo()

   Код читается компактнее: карточки филиалов собираются цепочками, а подсветка
   активной вкладки сделана через .siblings() вместо отдельного перебора ссылок.
   ============================================================================ */

/* jQuery 3.7.1. Обёртка $(function () { ... }) — короткая запись $(document).ready():
   ждём готовности DOM, иначе селекторы вроде $('#branch-filters') не найдут элементы. */
$(function () {
  'use strict';

  const $filters = $('#branch-filters');
  const $tableSection = $('#locations-table-section');
  if ($filters.length === 0 || $tableSection.length === 0) {
    return;
  }

  /* Соответствие ссылки-вкладки и района. */
  const DISTRICT_BY_HREF = {
    '#locations-table-section': 'all',
    '#branch-baikonur': 'baikonur',
    '#branch-esil': 'esil'
  };

  /* Счётчик результата создаётся скриптом и вставляется в блок фильтров. */
  const $status = $('<p class="small text-body-secondary mb-0"></p>').attr('role', 'status');
  $filters.append($status);

  /* Набор карточек филиалов строится из массива EF.BRANCHES. */
  const $cardsWrap = $('<div id="branch-cards" class="row g-3 mb-4"></div>');
  $(EF.BRANCHES).each(function () {
    const branch = this;
    /* Каждая карточка собирается через $('<...>') и .appendTo() родителя. */
    const $card = $('<article class="branch-card col-12 col-md-6 border rounded-3 p-3"></article>')
      .attr('data-district', branch.id);
    $('<h3 class="h5 fw-semibold mb-2 text-primary"></h3>').text(branch.name).appendTo($card);
    $('<p class="small mb-1"></p>').text('Район: ' + branch.district).appendTo($card);
    $('<p class="small mb-1"></p>').text(branch.address).appendTo($card);
    $('<a class="small d-block mb-1 text-decoration-none"></a>')
      .attr('href', branch.phoneHref)
      .text(branch.phone)
      .appendTo($card);
    $('<p class="small text-body-secondary mb-0"></p>')
      .text('Вместимость: ' + branch.capacity + ' гостей. Есть: сауна/SPA, зона единоборств')
      .appendTo($card);
    $card.appendTo($cardsWrap);
  });
  $tableSection.after($cardsWrap);

  /* Кнопка и скрытая сводка по сети — пример эффекта .slideToggle(). */
  const $summaryButton = $('<button type="button" class="btn btn-outline-light btn-sm mb-3"></button>')
    .text('Показать сводку по сети');
  const $summary = $('<p class="small text-body-secondary"></p>')
    .text(EF.getNetworkSummary())
    .hide();
  $tableSection.before($summaryButton);
  $summaryButton.after($summary);

  /* Пересчитывает видимость строк таблицы и карточек по выбранному району. */
  function applyDistrictFilter(district) {
    /* .find() выбирает строки таблицы и карточки внутри своих контейнеров. */
    $tableSection.find('tbody tr[data-district]').each(function () {
      const $row = $(this);
      $row.toggleClass('is-hidden', !(district === 'all' || $row.attr('data-district') === district));
    });

    $cardsWrap.find('.branch-card').each(function () {
      const $card = $(this);
      $card.toggleClass('is-hidden', !(district === 'all' || $card.attr('data-district') === district));
    });

    const visible = $cardsWrap.find('.branch-card').filter(':not(.is-hidden)').length;
    $status.text('Показано филиалов: ' + visible + ' из ' + EF.BRANCHES.length);
  }

  /* Делегированный обработчик на блоке фильтров: реагируем на клик по ссылке-вкладке.
     Прямая привязка к каждой ссылке потребовала бы перебора; делегирование через
     второй аргумент .on() обслуживает все вкладки одним обработчиком. */
  $filters.on('click', 'a', function (event) {
    const district = DISTRICT_BY_HREF[$(this).attr('href')];
    if (district === undefined) {
      return;
    }
    // Ссылка-вкладка — это фильтр, а не переход к якорю: без preventDefault() браузер
    // прокрутит страницу к таблице и фильтр будет выглядеть «случайным».
    event.preventDefault();
    /* Подсветить текущую вкладку и снять выделение у соседних через .siblings(). */
    $(this).addClass('is-selected').siblings('a').removeClass('is-selected');
    applyDistrictFilter(district);
    // Эффект: плавно перерисовать карточки после смены района.
    $cardsWrap.stop(true, true).fadeIn(200);
  });

  $summaryButton.on('click', function () {
    // slideToggle с длительностью плавно раскрывает и сворачивает сводку по сети.
    $summary.slideToggle(200, function () {
      // callback после анимации: по состоянию видимости меняем подпись кнопки.
      $(this).is(':visible')
        ? $summaryButton.text('Скрыть сводку по сети')
        : $summaryButton.text('Показать сводку по сети');
    });
  });

  /* Стартовое состояние: показываем все филиалы и подсвечиваем вкладку «Все районы». */
  $filters.find('a').first().addClass('is-selected');
  applyDistrictFilter('all');
});
