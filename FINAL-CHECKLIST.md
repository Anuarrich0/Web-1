# Final quality review

Reviewed on 2026-11-16 against the supplied final-project requirements.

## Fixed and checked automatically

- All seven pages share a consistent sales contact; placeholder telephone destinations, generic Instagram links and unsupported 11-branch claims were removed.
- Source fields have labels; images have alternatives and dimensions; ID references, local links, anchors and CSS resources pass checks.
- Telephone input is limited to 11 digits including country code 7. Name, email, message, comments, card and numeric fields have limits. Invalid dates, fractional ages, non-finite numbers and expired cards are rejected.
- Service selection is included in the prepared request and is available from the keyboard.
- Forms describe their local-only result honestly and provide a direct telephone contact. They do not claim a real booking or payment.
- Training no longer decrements real-looking availability after a local demo; duplicate submission is blocked. Sunday example sessions were removed to match the project's closed-Sunday schedule.
- Checkout supports native form submission, card checksum validation, focus restoration and clearing card inputs.
- Calculator results are cleared when their inputs change. It remains a standalone visible section.
- Photos were resized and recompressed. All remaining JPEGs are below 250 KB. Unreferenced photos/map and the unused old JavaScript implementation were removed; old content remains in Git history.
- Uncalled helper functions were removed. Bootstrap 5.3.8 and jQuery 3.7.1 are bundled locally with their license notices, so the interface does not depend on CDN availability.
- Run `node scripts/check-site.cjs` to reproduce the current checks.

## Requires manual or external confirmation

- Two-browser visual/keyboard testing, a real phone, browser console inspection and W3C validation. Browser automation of the local file URL was blocked by its URL policy in this session; no browser pass is claimed.
- Real delivery, payments, live availability and confirmation require a backend and authorized providers. No credentials, server or provider were supplied or invented.
- Current business hours, tariffs, promotions, trainer availability and the WhatsApp destination require confirmation by the club. The sales contact already present in the project is corroborated by [this public listing](https://as.ayle.ru/v-astane/708941-experience-fitness-spa/); that listing also differs on Saturday hours, so current hours are not treated as verified.
- Teacher-specific endterm issues cannot be exhaustively checked without the teacher's feedback list.
- Individual authorship and understanding must be demonstrated by the student. The AI log records generated code honestly; the supplied assignment policy prohibits AI-written code.
- Submission requires the same repository and a final commit tagged `final`. No `final` tag is added while manual checks and submission decisions remain outstanding.
