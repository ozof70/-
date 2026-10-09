import assert from 'node:assert/strict';

const oldOrigin = process.argv[2] || 'https://cos-closet-production.up.railway.app';
const newOrigin = 'https://closet.cozcos.com';
const local = new URL(oldOrigin).hostname === '127.0.0.1';
const headers = local ? {Host: 'cos-closet-production.up.railway.app'} : {};
for (const path of ['/', '/explore?item=ui-admin-costume&lang=en', '/about', '/login', '/brand-icon.png', '/robots.txt', '/sitemap.xml']) {
  const response = await fetch(oldOrigin + path, {redirect: 'manual', headers});
  assert.equal(response.status, 301, path);
  assert.equal(new URL(response.headers.get('location')).href, newOrigin + path, path);
}
const response = await fetch(oldOrigin + '/api/auth/logout', {method: 'POST', redirect: 'manual', headers});
assert.equal(response.status, 308);
assert.equal(response.headers.get('location'), newOrigin + '/api/auth/logout');
console.log('PASS domain migration: permanent redirects preserve paths and query parameters; POST requests are not processed on the old host.');
