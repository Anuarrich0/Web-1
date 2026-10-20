'use strict';

/* Логика страницы «Филиалы» (locations.html).
   Работает с общим массивом EF.BRANCHES из main.js. */

(function (EF) {
  'use strict';

  /* Возвращает филиалы выбранного района (строгое сравнение ===). */
  EF.getBranchesByDistrict = function (district) {
    return EF.BRANCHES.filter(function (branch) {
      return branch.district === district;
    });
  };

  /* Суммарная вместимость всех филиалов сети. */
  EF.getTotalCapacity = function () {
    return EF.sumBy(EF.BRANCHES, function (branch) {
      return branch.capacity;
    });
  };

  /* Самый вместительный филиал (по полю capacity). */
  EF.getLargestBranch = function () {
    if (EF.BRANCHES.length === 0) {
      return null;
    }
    return EF.BRANCHES.reduce(function (largest, branch) {
      return branch.capacity > largest.capacity ? branch : largest;
    });
  };

  /* Открыт ли филиал в указанный час (целое число 0–23). */
  EF.isBranchOpenAt = function (branch, hour) {
    if (!branch) {
      return false;
    }
    return hour >= branch.opensAt && hour < branch.closesAt;
  };

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

  /* Сравнивает два филиала по вместимости.
     Возвращает описание того, какой филиал больше. */
  EF.compareBranches = function (firstId, secondId) {
    const first = EF.findBranchById(firstId);
    const second = EF.findBranchById(secondId);
    if (!first || !second) {
      return 'Недостаточно данных для сравнения';
    }
    if (first.capacity === second.capacity) {
      return first.name + ' и ' + second.name + ' вмещают одинаково гостей';
    }
    const larger = first.capacity > second.capacity ? first : second;
    const smaller = larger === first ? second : first;
    const diff = larger.capacity - smaller.capacity;
    return larger.name + ' вмещает на ' + diff + ' гостей больше, чем ' + smaller.name;
  };

  /* Сводка по сети: количество филиалов и суммарная вместимость. */
  EF.getNetworkSummary = function () {
    const count = EF.BRANCHES.length;
    const capacity = EF.getTotalCapacity();
    return 'В сети ' + count + ' филиала с общей вместимостью ' + capacity + ' гостей';
  };
})(window.EF);
