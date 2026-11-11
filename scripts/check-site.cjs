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
console.log('PASS: all ' + pages.length + ' pages, local links, anchors, structure and JavaScript syntax.');
