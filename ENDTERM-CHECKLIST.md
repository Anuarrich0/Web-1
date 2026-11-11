# Endterm checklist — Experience Fitness (Web-1)

Repo: `https://github.com/Anuarrich0/Web-1` · Spec: `endterm_project.md`
Goal: the same site, now working end-to-end on plain JavaScript **and** jQuery. Submit by committing and tagging **`endterm`**.

Legend: `[x]` = present in code, `[ ]` = to do / needs verification.

---

## 0. Freeze rules (penalties)
- [x] No `onclick` / inline handlers in the markup (handlers attached in code).
- [x] No new hand-written HTML blocks (new content built in code).
- [x] No new hand-written CSS rules (appearance changes only via existing classes).
- [ ] Click every button, link and tab on all 7 pages — no dead element (−5 each).
- [ ] Browser console clean on all 7 pages (−5 each).
- [x] No feature uses plain JS **and** jQuery together (each feature is one or the other).
- [x] Logic finishes: every flow a visitor starts can be completed and shows a result.

## 1. Plain JavaScript — weeks 6–8 (20 pts)
- [x] Real data in arrays / objects at the top of the file (`main.js`, page data modules).
- [x] Page items built from that data with a loop (`.each`/`for`), not hand-written markup.
- [x] Own functions with parameters and a return value, each called from more than one place.
- [x] Conditions where the project needs them (discount, "closed today", minor consents).
- [x] At least one number is calculated, not written by hand (BMR/TDEE, total, monthly price).

## 2. Events & interaction (14 pts)
- [x] Handlers attached in code; ≥3 different event types (`click`, `input`, `change`, `submit`, `reset`).
- [x] ≥1 delegated handler on a parent that also catches elements created later.
- [x] Event object used: `preventDefault()` on forms, `$(this)` / clicked element to identify the target.

## 3. Form validation (16 pts)
- [x] `preventDefault`, values trimmed, every field checked (contacts, pricing, services/consultation).
- [x] Error shown next to the specific wrong field (not one message for the whole form).
- [x] Error cleared as soon as the visitor fixes that field.
- [x] Confirmation shown only when every check passes.
- [x] E-mail shape and phone format checked.

## 4. jQuery — weeks 9–10 (18 pts)
- [x] Linked from CDN, all code wrapped in `$(function () { ... })`.
- [x] Different kinds of selectors (id, class, element, attribute, `:first`, `:checked`, `:not()`).
- [x] Traversal instead of extra ids (`.closest()`, `.find()`, `.siblings()`, `$(this)`).
- [x] At least one chain of 3+ methods with an explanation.
- [x] ≥2 effects tied to a real visitor action (`.slideDown`, `.slideUp`, `.slideToggle`, `.fadeIn`).
- [x] Plain-JS features and jQuery features kept in **separate files**.
- [ ] Each member can explain both a plain-JS and a jQuery feature at the defense.

## 5. Technical floor
- [ ] No console errors on any page (fixed the leftover debug block in `pricing-jquery.js`; re-check live).
- [ ] No dead buttons / dead links / empty containers left unfilled.
- [ ] Nothing overflows sideways at phone width (375 / 768 / 1440 px).
- [ ] Pages still pass the W3C (Nu) validator.
- [ ] Nothing that already worked is broken: Bootstrap layout, responsive behaviour, navigation.
- [x] Empty case handled: list/filter with no results shows a message, not a blank area.
- [x] Content is real (prices, hours, address, phone, own photos); no leftover debugging lines.

## 6. Team split — plain JS vs jQuery (do not let one person do only one)
Rysbek will **not** defend the project, so his former pages (`pages/training.html`, `pages/contacts.html`) are reassigned to Maksat and Anuar. HTML and CSS stay frozen — this only changes who owns / commits / defends each page, not the markup.

| Member | Pages owned | Plain JavaScript | jQuery |
| --- | --- | --- | --- |
| A. Maksat | `index.html`, `pages/locations.html`, `pages/services.html`, `pages/training.html` | `index.js` (promo carousel counter) | `locations-jquery.js`, `services-jquery.js`, `training-jquery.js` |
| N. Anuar | `pages/pricing.html`, `pages/promotions.html`, `pages/contacts.html` | `promotions.js` (offers filter) | `pricing-jquery.js`, `checkout-jquery.js`, `contacts-jquery.js` |
| ~~Z. Rysbek~~ | — not defending — | — | — |

- [x] Each remaining member (Maksat, Anuar) owns both a plain-JavaScript and a jQuery feature.

## 7. Quality pass (do it ≥2 days before the deadline)
- [ ] Each member opens the features written by someone else, clicks everything, submits every form with empty and wrong values, writes down what breaks, fixes it.

## 8. Freeze & submit
- [ ] Commit and tag the repo with the name **`endterm`**.
- [ ] README updated to say **which feature is plain JavaScript, which is jQuery, and who wrote what**.
- [ ] Each defender (Maksat, Anuar) commits from **their own account**, ≥4 commits across ≥3 different days.
  - [ ] Git log currently shows only `Anuarrich0` + `Maksat` — confirm both defenders have their own commits.

## 9. Defense (grade = project score × how well you explain it)
- [ ] Every line is explainable; a line you cannot explain scores nothing.
- [ ] Can explain a delegated handler and why it catches elements that did not exist yet.
- [ ] Can rewrite a short jQuery snippet in plain JavaScript.
- [ ] Can take a small live task (add a validation field, change what a loop builds, add a button action).
- [ ] Only the official docs / w3schools allowed at the defense — no AI, no other person.

---

## Known issues found in the current code
- [x] `assets/js/pricing-jquery.js` — leftover debug block (`img.transform('scale(1.9)')`, `img.trans`) thrown a `TypeError` on image hover → console errors on `pricing.html`. **Removed.**
- [ ] `pages/pricing.html` — stray blank line added after the script tags (cosmetic).
- [ ] `pages/services.html` — the `#service-martial` card has no matching filter tab (`CATEGORY_BY_HREF` has no `martial`); it only appears under "Все зоны".
- [ ] Duplicate `'use strict';` statement in `assets/js/main.js` (harmless, but sloppy).
