# Experience Fitness — Assignments 1–6

An existing educational website for a fitness club chain in Astana, built on semantic HTML5, adapted for Bootstrap 5.3.8, with client-side logic first in Vanilla JavaScript (Assignments 4–5) and then rewritten in jQuery 3.7.1 (Assignment 6).
Seven pages; the original texts, tables, forms, media content and semantic hierarchy are preserved and validated.

## End-to-end user scenarios (Three User Journeys)

The site provides 3 complete end-to-end user routes from the first screen to the target action:

1. **Scenario 1: Choosing a program and booking a trial session (Discovery & Booking)**
   - *Entry point*: `index.html` (the "Trial workout" button in the header or "Choose a service").
   - *Navigation*: Go to `pages/services.html` → review the areas (Gym, CrossFit, Martial arts, SPA) → go to the booking form `#consultation-form` or `pages/contacts.html#contact-form`.
   - *Target action*: Fill in the parameters (name, phone, date, branch, load level) with the status shown in the prepared interactive container `#booking-form-feedback` / `#contact-form-feedback`.

2. **Scenario 2: Calculating a membership and ordering a club card (Pricing & Membership)**
   - *Entry point*: `index.html` (the "Choose a membership" button) → go to `pages/pricing.html`.
   - *Navigation*: Compare tariffs (GYM/EXP, GYM/EXP+, BIG+/EXP) via responsive cards and a summary table → go to the order form `#order-form`.
   - *Target action*: Choose a tariff and a term (1, 3, 6, 12 months) using the prepared hooks for recalculating the price and the confirmation container `#pricing-order-feedback`.

3. **Scenario 3: Fitness diagnostics, calorie calculation and schedule selection (Diagnostic & Schedule)**
   - *Entry point*: `index.html` (the "Calculate your personal calorie intake and workout schedule" link) or the navigation menu → `pages/training.html`.
   - *Navigation*: Enter personal parameters (gender, age, height, weight, activity, goal) in the `#fitness-calculator` block → show the results in the `#calculator-results` container (BMR, TDEE, target kcal, workout frequency) → choose a convenient time in the filterable `#training-schedule` table.
   - *Target action*: Go to the form on the contacts page `pages/contacts.html#contact-form` with the status shown in `#contact-form-feedback`.

## Preparing for JavaScript ("Structure freeze" / Freeze State)

According to the Midterm Project rules, at this stage our own JavaScript is not executed in order to avoid penalty points for premature functionality (only the official `bootstrap.bundle.min.js` is active). All markup and styles are fully frozen so that JS can be plugged in instantly in the following assignments:

- **State classes (`assets/css/base.css`)**:
  - `.is-hidden` — hides result blocks and notifications (`display: none !important;`).
  - `.is-active` — active interactive state of elements (`opacity: 1; pointer-events: auto;`).
  - `.is-selected` — highlights the selected card or tariff with an accent glow.
  - `.is-error` / `.is-success` — color indication of input validation.
  - `.form-feedback-container` — standardized container for validation messages with a transition animation.
- **Calorie calculator hooks (`pages/training.html`)**:
  - Input fields: `#calc-gender`, `#calc-age`, `#calc-height`, `#calc-weight`, `#calc-activity`, `#calc-goal`.
  - Controls: `#calc-submit-btn`, `#calc-reset-btn`.
  - Output values: `#calculator-results`, `#result-bmr`, `#result-tdee`, `#result-target-calories`, `#result-workout-freq`, `#result-program-recommendation`.
- **Schedule filter hooks (`pages/training.html`)**:
  - Filter buttons: `[data-schedule-filter="all|gym|crossfit|cardio"]`.
  - Table rows: `[data-day="..."]` and `[data-category="gym|crossfit|cardio"]`.
- **Feedback containers in all forms**:
  - `pages/contacts.html`: `#contact-form-feedback`.
  - `pages/pricing.html`: `#pricing-order-feedback`.
  - `pages/services.html`: `#booking-form-feedback`.
  - All containers have the accessibility attribute `aria-live="polite"`.

### Markup fixes after the freeze

The structure and CSS stayed the same; only three targeted fixes found during review were made:

- `pages/services.html` — removed the non-working "Martial arts" tab item (the `#service-martial` section itself remained) and added a sauna photo to the `#service-spa` block.
- `index.html` — removed the duplicate "Back to top" link.
- On all pages, only the `<script>` tags for our own modules were added at the end of `<body>`.

## Cross-review quality protocol (Quality Pass Protocol)

Before locking the Midterm version, the team cross-tested the pages:

| Reviewer | Pages reviewed | Page author | Review results |
| --- | --- | --- | --- |
| **A. Maksat** | `pricing.html`, `promotions.html` | N. Anuar | Card grids are responsive at 375/768/1440px. Accordions and the carousel work without failures. The order container `#pricing-order-feedback` is integrated. |
| **N. Anuar** | `training.html`, `contacts.html` | Z. Rysbek | The calorie calculator `#fitness-calculator` and the schedule table `#training-schedule` are fully marked up with data attributes. The console is clean. |
| **Z. Rysbek** | `index.html`, `locations.html`, `services.html` | A. Maksat | Checked the Navbar/Collapse navigation, Hero-section buttons, the branch equipment table and the booking form `#consultation-form`. |

## Assignment 6 — converting functions from Vanilla JavaScript to jQuery

Assignment 6 rewrites the Assignment 5 interactivity in **jQuery 3.7.1**, loaded from a CDN. Within a single function you cannot mix jQuery and `document.getElementById`, so each page has a clean jQuery file, while the reference data and reusable functions stayed in the shared module `main.js` and in the per-page data files.

Rewritten functions:

| Function | New file (jQuery) | Old version |
| --- | --- | --- |
| "Contacts" form validation | `assets/js/contacts-jquery.js` | `old-js-version.js` (data — `assets/js/contacts.js`) |
| Service catalog filter and search + consultation form validation | `assets/js/services-jquery.js` | `old-js-version.js` (data — `assets/js/services.js`) |
| Branch filter by district | `assets/js/locations-jquery.js` | `old-js-version.js` (data — `assets/js/locations.js`) |
| Schedule filter + calorie calculator | `assets/js/training-jquery.js` | `old-js-version.js` (data — `assets/js/training.js`) |

The old Vanilla versions are kept for comparison in `assets/js/old-js-version.js`, which **is not linked to any page**. Above each rewritten function in the new file there is a comment: which jQuery methods replaced which lines of Vanilla JS and whether the code became shorter and clearer.

What was implemented per the requirements:

- **Loading**: on `pages/contacts.html`, `pages/services.html`, `pages/locations.html`, `pages/training.html` jQuery from the CDN is loaded before our own scripts; the code is wrapped in `$(function () { ... })` with a comment about the version and why the wrapper is needed.
- **Selectors**: by id, by class, by element, by attribute (`button[type="submit"]`, `[data-schedule-filter]`), plus the `:first`, `:checked`, `:not()` filters.
- **Traversal and chains**: `.find()`, `.closest()`, `.parent()`, `.siblings()`, `.each()`; `$(this)` in several handlers; chains of 3+ methods with an explanation of the links.
- **Page changes**: `.text()`, `.html()`, `.val()`, `.attr()`, `.prop()`; the appearance changes only through `.addClass()`, `.removeClass()`, `.toggleClass()` using existing classes.
- **List from an array**: service cards (`EF.SERVICES`) and branches (`EF.BRANCHES`) are built in code via `.appendTo()` — this markup is not in the HTML.
- **Events and delegation**: all handlers via `.on()`; events `click`, `input`, `change`, `submit`, `reset`; a delegated handler catches cards created in code; `event.preventDefault()` with an explanation of the consequences.
- **Effects**: `.slideDown()`, `.slideUp()`, `.slideToggle()`, `.fadeIn()` with a real task, duration and callback.
- **Form validation**: `preventDefault()`, checking each field, an error class and a message at the specific field, trimming values (`trim`), e-mail and phone format checks, clearing an error when the field is fixed, a success message only when everything is correct, reset after submission. The `required` attributes are kept as the first line of defense; a comment explains why browser validation does not replace server validation.

Prohibitions observed: no third-party plugins or ready-made sliders/galleries, no new hand-written HTML/CSS markup (new elements are created in code, appearance uses existing classes), no inline `onclick`.

## Endterm — final version (plain JavaScript + jQuery)

The final version keeps the interactivity split into two non-mixed parts: some pages run on plain JavaScript, others on jQuery. Each part has its own file, and technologies are not mixed within a single feature. Every defending member has both parts.

| Page | Feature | Technology | File | Owner |
| --- | --- | --- | --- | --- |
| `index.html` | Promotions carousel slide counter | plain JS | `assets/js/index.js` | Maksat |
| `pages/promotions.html` | Promotions filter and search | plain JS | `assets/js/promotions.js` | Anuar |
| `pages/locations.html` | Branch filter by district | jQuery | `assets/js/locations-jquery.js` | Maksat |
| `pages/services.html` | Service catalog filter, search and booking form validation | jQuery | `assets/js/services-jquery.js` | Maksat |
| `pages/training.html` | Schedule filter, calorie calculator, trainer booking by time and this week's group classes (self-service, no manager) | jQuery | `assets/js/training-jquery.js` | Maksat |
| `pages/pricing.html` | Tariff filter, price calculation, order form and payment popup | jQuery | `assets/js/pricing-jquery.js`, `assets/js/checkout-jquery.js` | Anuar |
| `pages/contacts.html` | Feedback form validation | jQuery | `assets/js/contacts-jquery.js` | Anuar |

Service modules: `assets/js/main.js` — the shared `window.EF` namespace, club data and reusable plain-JS functions (loaded on every page); `assets/js/services.js`, `locations.js`, `training.js`, `contacts.js` — only reference data and functions for their own page; `old-js-version.js` — an archived Vanilla version for comparison, not linked anywhere.

Page assignment at the defense: Rysbek is not defending the project, so his original pages are led by Maksat (`training.html`) and Anuar (`contacts.html`). HTML and CSS were not changed after the freeze — this assignment concerns only code, files and the defense.

## Running

Open `index.html` in a browser. No package installation, server or hosting needed.
An internet connection is required to load Bootstrap and jQuery from the CDN. Our own CSS files are loaded after Bootstrap.
Our own JavaScript is in `assets/js/`: the shared module `main.js` is loaded on every page, while the per-page modules (`index.js`, `services.js`, `locations.js`, `training.js`, `contacts.js`) are loaded only on their own pages.
The Assignment 6 interactivity is moved into separate jQuery files (`contacts-jquery.js`, `services-jquery.js`, `locations-jquery.js`, `training-jquery.js`), and the comparison with the old Vanilla version is in `old-js-version.js` (not linked to any page).

## Pages and authorship

| Author of the original pages | Files |
| --- | --- |
| A. Maksat | `index.html`, `pages/locations.html`, `pages/services.html` |
| N. Anuar | `pages/pricing.html`, `pages/promotions.html` |
| Z. Rysbek | `pages/training.html`, `pages/contacts.html` |

## Implementation of the requirements

- `container`: the main text has a limited width; `container-fluid`: wide header and footer. The choice is explained in the HTML.
- Tariffs and benefits: `col-12 col-md-6 col-lg-4` — one column on a phone, two from 768px, three from 992px.
- Services, gallery and forms use additional responsive grids. `row` and `col-*` sit directly on the original `section`, `article`, `figure`, `fieldset` and field groups.
- Nested grid: `li.row` with the term and price is inside `article.col-12.col-md-6.col-lg-4`; the `span`s inside the row are columns. There are no extra divs for this.
- Navigation: `navbar-expand-xl`, the menu collapses below 1200px. The toggler uses Bootstrap Collapse.
- Responsive utilities: the header contacts block `d-none d-xxl-flex`; headings `text-center text-md-start`; back-to-top links `text-center text-md-end`.
- Typography: `display-5`, `lead`, `h3`, `h4`, `fw-bold`, `small`, `text-body-secondary`.
- Buttons: `btn`, `btn-primary`, `btn-outline-light`, `btn-lg`, `btn-sm`; a real `disabled` on the unavailable form submit.
- Utilities: `py-4`, `py-md-5`, `mb-4`, `gap-3`, `g-4`, `text-primary`, `bg-body-tertiary`, `border`, `rounded-3`, `shadow-sm`, `d-flex`, `flex-wrap` and others.
- Components: Bootstrap Table with the original caption/thead/tbody, Navbar/Collapse on every page, a manual Carousel on the home page. Sources and adaptations are noted in the comments.
- Wide tables scroll inside `table-responsive` without overflowing the page.
- Own CSS: 43 lines in total, only colors and a small logo contrast correction. List of removals: `CSS-REMOVALS.md`.

## Forms and controls

The forms are educational: there is no server handler, so submission is disabled and labeled.
The fields are fillable, standard radio/select/checkbox and reset work.
Booking is available via the existing phone links.
"Trial workout" leads to the contact form. Service categories and branch selection lead to the corresponding sections.
The non-working theme switcher was removed; the site uses a permanent dark theme.

## Verification and submission

- All seven pages were checked with a local Nu HTML Checker 26.9.27: 0 errors, 0 warnings.
- Local links, anchors and images were checked.
- Widths 375, 768 and 1440px were checked: the page does not scroll horizontally.
- Four screenshots of one page are in `screenshots/`: `pricing-375.jpg`, `pricing-768.jpg`, `pricing-1440.jpg`, `menu-collapsed-375.jpg`.
- Assignment 6: the browser console is clean on all jQuery pages; delegation, effects and validation can be demonstrated live.

Before submitting, each participant must study their own changes and make real commits from their own account:
at least four commits across three different days (six for solo work).
The history and commit dates were not changed within this revision. The defense is mandatory.
At the defense you must explain the breakpoints, `container`/`container-fluid`, the chosen classes and the removed CSS.
At the Assignment 6 defense you must show the delegated handler, the effects and the validation, explain the difference between `.text()`/`.html()`, `.attr()`/`.prop()`, and why delegation catches elements that were not in the DOM yet.

## Official component sources

- https://getbootstrap.com/docs/5.3/content/tables/
- https://getbootstrap.com/docs/5.3/components/navbar/
- https://getbootstrap.com/docs/5.3/components/carousel/

## Semantic structure of weeks 1–3

Assignment 1 requires using div/span only when a semantic tag is not suitable and explaining the choice nearby.
Assignment 2 forbids adding divs purely for layout. Assignment 3 allows the necessary
grid wrappers, however here the grid is mostly assigned to the existing semantic elements.
The added header/footer shells, card-body, row/col around articles and forms, and ratio around photos were removed.
The photo is again in its original paragraph and is wrapped by text via Bootstrap float-md-start/clearfix.
All original form fields, their order and method/action are restored. Every remaining div/span has an explanation.
Remaining divs: the original field/button groups, the carousel track, the note, and the isolated table scroll.
The week 2 requirements about manual CSS, inline style and !important were replaced by the week 3 requirements about Bootstrap.

## How to navigate the HTML

All seven files have the same block order and short separator comments:

0. Page settings and styles.
1. Header: logo, menu, contacts.
2. Main content; subsections are numbered `2.1`, `2.2` and so on by headings.
3. Footer: brand, links, contacts, copyright.
4. Bootstrap JS loading.

In the editor search for `2.1.` or a section name with Ctrl+F; section/article/fieldset blocks can be collapsed.
Two-space indentation is used. Long attributes are moved to separate lines.
Explanations of div/span and Bootstrap are left next to the corresponding elements, briefly and in Russian.
During this revision the element order, attributes and page texts were not changed.
