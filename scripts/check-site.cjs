const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', ...fs.readdirSync(path.join(root, 'pages')).filter(f => f.endsWith('.html')).map(f => 'pages/' + f)];
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, file + ': duplicate IDs');
  for (const tag of ['main', 'h1', 'header', 'footer']) assert.equal((html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length, 1, file + ': ' + tag);
  assert.ok(!/\?{3,}|<<<<<<<|>>>>>>>|undefined/.test(html), file + ': invalid content');
  assert.ok(html.includes('assets/css/site.css'), file + ': shared styles');
  assert.ok(html.includes('class="skip-link"'), file + ': keyboard skip link');
  const labelTargets = [...html.matchAll(/<label\b[^>]*for="([^"]+)"/g)].map(match => match[1]);
  for (const field of html.matchAll(/<(?:input|select|textarea|output)\b[^>]*>/g)) {
    const id = /\bid="([^"]+)"/.exec(field[0]);
    if (!/type="(?:hidden|button|submit|reset)"/.test(field[0])) assert.ok(id && labelTargets.includes(id[1]) || /aria-label=/.test(field[0]), file + ': unlabelled field');
    if (/type="tel"/.test(field[0])) assert.ok(/maxlength="18"/.test(field[0]), file + ': unlimited phone');
  }
  for (const reference of html.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g)) {
    for (const id of reference[1].split(/\s+/)) assert.ok(ids.includes(id), file + ': missing accessible description ' + id);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    for (const attr of ['alt', 'width', 'height']) assert.ok(new RegExp('\\b' + attr + '=\x22[^\x22]+\x22').test(image[0]), file + ': image missing ' + attr);
  }
  for (const link of html.matchAll(/<a\b[^>]*href="tel:([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const labelDigits = link[2].replace(/<[^>]+>/g, '').replace(/\D/g, '');
    if (labelDigits) assert.equal(link[1].replace(/\D/g, ''), labelDigits, file + ': phone label and destination differ');
  }
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|tel:)/.test(m[1])) continue;
    const [target, fragment] = m[1].split('#');
    const local = path.resolve(root, path.dirname(file), target.split('?')[0] || path.basename(file));
    assert.ok(fs.existsSync(local), file + ': missing ' + m[1]);
    if (fragment && local.endsWith('.html')) {
      const destination = fs.readFileSync(local, 'utf8');
      // The training booking section is created by its existing jQuery module.
      assert.ok(destination.includes('id="' + fragment + '"') || fragment === 'training-booking', file + ': broken anchor ' + m[1]);
    }
  }
}
for (const file of fs.readdirSync(path.join(root, 'assets/js')).filter(f => f.endsWith('.js'))) execFileSync(process.execPath, ['--check', path.join(root, 'assets/js', file)]);
execFileSync(process.execPath, [path.join(root, 'assets/js/main.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(root, 'scripts/check-flows.cjs')], { stdio: 'inherit' });
for (const file of fs.readdirSync(path.join(root, 'assets/css'))) {
  const css = fs.readFileSync(path.join(root, 'assets/css', file), 'utf8');
  for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
    if (!/^(?:https?:|data:)/.test(match[1])) assert.ok(fs.existsSync(path.resolve(root, 'assets/css', match[1])), file + ': missing background ' + match[1]);
  }
}
for (const file of fs.readdirSync(path.join(root, 'assets/images')).filter(file => /\.jpg$/.test(file))) assert.ok(fs.statSync(path.join(root, 'assets/images', file)).size < 250000, file + ': oversized photo');
console.log('PASS: all ' + pages.length + ' pages, local links, anchors, structure and JavaScript syntax.');
