'use strict';

/* Логика страницы «Филиалы» (locations.html).
   Работает с общим массивом EF.BRANCHES из main.js.
   Здесь остались только справочные данные и функции; интерактив фильтра в Assignment 6
   перенесён в locations-jquery.js, а старая Vanilla-версия — в Git history (Vanilla version). */

(function (EF) {
  'use strict';


  /* Текстовое описание филиала для карточки или подтверждения. */
  EF.describeBranch = function (branch) {
    if (!branch) {
      return 'Филиал не найден';
    }
    const amenities = [];
    if (branch.hasSauna) {
      amenities.push('сауна/SPA');
    }
    if (branch.hasMartialArts) {
      amenities.push('зона единоборств');
    }
    const extras = amenities.length > 0 ? ' Есть: ' + amenities.join(', ') + '.' : '';
    return branch.name + ' (' + branch.district + ') — ' + branch.address + '.' + extras;
  };


})(window.EF);
