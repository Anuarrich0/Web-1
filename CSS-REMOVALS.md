# Замена собственного CSS на Bootstrap

Удалены ручные сетки, float-layout, отступы, правила кнопок, форм, таблиц и мобильного меню.
Четыре CSS-файла сократились с 2039 до 43 строк, включая комментарии.
Библиотечные CSS-файлы Bootstrap в эту цифру не входят и не редактировались.

| Старые правила | Замена в HTML |
| --- | --- |
| `base.css`: reset, размеры и отступы `.container`, `#main-content` | Bootstrap Reboot, `container`, `py-4 py-md-5` |
| `base.css`: flex и позиционирование header, `.nav-list`, `.menu-toggle` | `header.navbar.navbar-expand-xl.container-fluid`, `navbar-nav`, `navbar-toggler`, `collapse navbar-collapse` |
| `base.css`: ручная сетка footer | `footer.container-fluid.row.g-4`, существующие `section`/`nav` с `col-12 col-md-6 col-lg-4` |
| `base.css`: размеры и геометрия `.btn`, собственные outline/accent | `btn`, `btn-primary`, `btn-outline-light`, `btn-lg`, `btn-sm` |
| `base.css`: размеры полей, focus и reset форм | `form-control`, `form-select`, `form-check-input`, `form-label` |
| `anuar.css`: float вводного изображения и clearfix | исходный абзац с `clearfix`, изображение с `float-md-start me-md-4` (обтекание текста, не сетка) |
| `anuar.css`: flex `.pricing-plans` и размеры карточек | `section.row.g-4`, исходные `article.col-12.col-md-6.col-lg-4` без card-body |
| `anuar.css`: flex строк цены | вложенная `row g-2`, `col-5`, `col-7 text-end` |
| `anuar.css`: grid галереи и определения терминов | `row g-4`, `col-12 col-md-6`; `row g-3`, `col-md-4`, `col-md-8` |
| `anuar.css`: стили promo-tags, блока акции, details | `badge rounded-pill`, `border border-primary rounded-4 p-4`, `border rounded-3 p-3 mb-3` |
| `maksat.css`: сетки преимуществ и услуг, ручные карточки | `row` на section/ul, `col-*` на исходных article/li |
| `maksat.css`: заготовка слайдера, кнопки prev/next | `carousel slide`, `carousel-inner`, `carousel-item`, `data-bs-slide` |
| `roha.css`: размеры форм, таблиц, отступы, media queries | Bootstrap формы, `table`, `table-responsive`, `row`/`col-*`, responsive utilities |
| Все файлы: оформление таблиц | `table table-striped table-hover align-middle`, обёртка `table-responsive` |
| Все файлы: фиксированные плавающие CTA | обычные доступные ссылки `btn btn-outline-light btn-sm` |
| Inline style в HTML и два CSS `!important` | Bootstrap utilities; цвет заголовка премиального тарифа через атрибутный CSS-селектор |

Осталось: брендовые CSS variables и `.btn-primary` в `base.css`, лаймовый активный пункт меню,
коррекция чёрного SVG для тёмного фона, золотой заголовок премиального тарифа и цвет акцента акции в `anuar.css`.
`maksat.css` и `roha.css` оставлены с короткими поясняющими комментариями.

Дополнительная коррекция `.content-photo { aspect-ratio: 3 / 2; }` сохраняет пропорции фотографий без новых ratio-div.
