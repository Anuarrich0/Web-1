# Semantic HTML and Bootstrap checklist

Проверено по Assignment 1, Assignment 2 и текущему Assignment 3. Номера строк относятся к текущим HTML-файлам.

Bootstrap-сетка назначена существующим семантическим элементам. В header/footer, вокруг article и форм нет добавленных layout-div.

## Страницы

| Файл | Автор | header | main | footer | div | span |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `index.html` | A. Maksat | 27 | 79 | 237 | 1 | 2 |
| `pages/contacts.html` | Z. Rysbek | 27 | 79 | 359 | 11 | 3 |
| `pages/locations.html` | A. Maksat | 27 | 79 | 228 | 1 | 1 |
| `pages/pricing.html` | N. Anuar | 27 | 79 | 429 | 1 | 28 |
| `pages/promotions.html` | N. Anuar | 27 | 79 | 238 | 1 | 2 |
| `pages/services.html` | A. Maksat | 27 | 79 | 341 | 0 | 1 |
| `pages/training.html` | Z. Rysbek | 27 | 79 | 415 | 14 | 2 |

## Обязательные теги: фактические примеры

| Тег | Файл | Строка | Автор |
| --- | --- | ---: | --- |
| `html` | `index.html` | 2 | A. Maksat |
| `head` | `index.html` | 5 | A. Maksat |
| `meta` | `index.html` | 6 | A. Maksat |
| `title` | `index.html` | 14 | A. Maksat |
| `header` | `index.html` | 27 | A. Maksat |
| `nav` | `index.html` | 55 | A. Maksat |
| `main` | `index.html` | 79 | A. Maksat |
| `footer` | `index.html` | 237 | A. Maksat |
| `h1` | `index.html` | 83 | A. Maksat |
| `h2` | `index.html` | 112 | A. Maksat |
| `h3` | `index.html` | 121 | A. Maksat |
| `section` | `index.html` | 82 | A. Maksat |
| `article` | `index.html` | 120 | A. Maksat |
| `aside` | `pages/contacts.html` | 227 | Z. Rysbek |
| `figure` | `index.html` | 96 | A. Maksat |
| `figcaption` | `index.html` | 104 | A. Maksat |
| `table` | `pages/contacts.html` | 177 | Z. Rysbek |
| `caption` | `pages/contacts.html` | 178 | Z. Rysbek |
| `thead` | `pages/contacts.html` | 181 | Z. Rysbek |
| `tbody` | `pages/contacts.html` | 187 | Z. Rysbek |
| `th` | `pages/contacts.html` | 183 | Z. Rysbek |
| `ul` | `index.html` | 56 | A. Maksat |
| `ol` | `index.html` | 114 | A. Maksat |
| `dl` | `index.html` | 182 | A. Maksat |
| `dt` | `index.html` | 183 | A. Maksat |
| `dd` | `index.html` | 184 | A. Maksat |
| `a` | `index.html` | 32 | A. Maksat |
| `img` | `index.html` | 39 | A. Maksat |
| `strong` | `index.html` | 87 | A. Maksat |
| `em` | `pages/contacts.html` | 95 | Z. Rysbek |
| `b` | `pages/contacts.html` | 91 | Z. Rysbek |
| `i` | `pages/contacts.html` | 98 | Z. Rysbek |
| `mark` | `pages/contacts.html` | 232 | Z. Rysbek |
| `small` | `pages/contacts.html` | 150 | Z. Rysbek |
| `sup` | `pages/contacts.html` | 140 | Z. Rysbek |
| `abbr` | `pages/contacts.html` | 215 | Z. Rysbek |
| `blockquote` | `index.html` | 196 | A. Maksat |
| `q` | `index.html` | 199 | A. Maksat |
| `cite` | `index.html` | 202 | A. Maksat |
| `hr` | `index.html` | 192 | A. Maksat |
| `br` | `pages/contacts.html` | 132 | Z. Rysbek |
| `div` | `index.html` | 119 | A. Maksat |
| `span` | `index.html` | 53 | A. Maksat |
| `form` | `pages/contacts.html` | 241 | Z. Rysbek |
| `fieldset` | `pages/contacts.html` | 246 | Z. Rysbek |
| `legend` | `pages/contacts.html` | 247 | Z. Rysbek |
| `label` | `pages/contacts.html` | 250 | Z. Rysbek |
| `input` | `pages/contacts.html` | 251 | Z. Rysbek |
| `select` | `pages/contacts.html` | 285 | Z. Rysbek |
| `option` | `pages/contacts.html` | 286 | Z. Rysbek |
| `textarea` | `pages/contacts.html` | 329 | Z. Rysbek |
| `button` | `index.html` | 51 | A. Maksat |

Теги, отсутствующие в текущих семи страницах: `sub`, `code`, `pre`, `kbd`, `samp`.
В исходном наборе отсутствует colophon.html; по Assignment 3 новые страницы не добавлялись. Этот checklist не подтверждает выполнение отсутствующих материалов прошлых недель.

## Обоснованные div/span

| Файл | div: строки | span: строки |
| --- | --- | --- |
| `index.html` | 119 | 53, 146 |
| `pages/contacts.html` | 175, 249, 254, 259, 270, 275, 283, 294, 319, 332, 344 | 53, 102, 296 |
| `pages/locations.html` | 114 | 53 |
| `pages/pricing.html` | 226 | 53, 107, 108, 112, 113, 117, 118, 122, 123, 134, 135, 139, 140, 144, 145, 149, 150, 161, 162, 166, 167, 171, 172, 176, 177, 262, 469, 471 |
| `pages/promotions.html` | 216 | 53, 120 |
| `pages/services.html` | нет | 53 |
| `pages/training.html` | 182, 287, 292, 297, 308, 313, 323, 335, 346, 360, 369, 382, 387, 400 | 53, 101 |

У каждого div/span есть соседний комментарий с причиной выбора; для пары «срок и цена» используется одно общее пояснение перед парой.

## Bootstrap и проверка

- Вложенная сетка: `pricing.html`, `article.col-*` содержит строки цен `li.row` с `span.col-*`.
- Три адаптивных блока: тарифы, услуги, галерея (дополнительно преимущества и footer).
- Текущие HTML-файлы: Nu HTML Checker 26.9.27, 0 ошибок и предупреждений.
- Исходные поля форм, их порядок и action/method сверены с Git-версией до миграции.
- Локальные ссылки и якоря проверены; 375/768/1440 px — без горизонтального переполнения страницы.
- Старые CSS-приёмы и их Bootstrap-замены описаны в CSS-REMOVALS.md.
