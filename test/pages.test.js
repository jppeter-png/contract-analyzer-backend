const request = require('supertest');
const app = require('../index');
const { renderPage, PAGES, CODES, EMAIL } = require('../src/pages/render');

// Reduces a page to its structure (tags, ids, classes, links) so translations can be
// checked against the English page without comparing any wording.
const skeleton = html => {
  const body = html
    .slice(html.indexOf('<body>'))
    .replace(/<script>[\s\S]*?<\/script>/g, '')
    .replace(/<div class="langbar">[\s\S]*?<\/div>/, '')
    .replace(/<p class="translation-note">[\s\S]*?<\/p>/, '');
  return (body.match(/<[a-z][^>]*>/gi) || [])
    .map(tag => tag
      .replace(/\s(alt|src|width|height)="[^"]*"/g, '')
      .replace(/\?lang=[a-z]{2}/, '')
      .replace(/\s+/g, ' '));
};

const OTHER = CODES.filter(code => code !== 'en');

describe('translated legal pages', () => {
  for (const page of PAGES) {
    for (const lang of OTHER) {
      test(`${page} (${lang}) has the same structure as English`, () => {
        expect(skeleton(renderPage(page, lang))).toEqual(skeleton(renderPage(page, 'en')));
      });

      test(`${page} (${lang}) keeps the contact address and sets the page language`, () => {
        const html = renderPage(page, lang);
        expect(html).toContain(`mailto:${EMAIL}`);
        expect(html).toContain(`<html lang="${lang}">`);
        expect(html).not.toMatch(/undefined|\[object/);
      });

      test(`${page} (${lang}) links to the other pages in the same language`, () => {
        const body = renderPage(page, lang).replace(/<div class="langbar">[\s\S]*?<\/div>/, '');
        const links = body.match(/href="\/(privacy|terms|support)[^"]*"/g) || [];
        for (const link of links) expect(link).toContain(`?lang=${lang}`);
      });
    }
  }

  test('privacy pages keep the facts the English policy states', () => {
    for (const lang of OTHER) {
      const html = renderPage('privacy', lang);
      expect(html).toContain('Groq');
      expect(html).toContain('AdMob');
      expect(html).toContain('policies.google.com/privacy');
      expect(html).toContain('groq.com');
    }
  });

  test('every privacy page explains the names and addresses users can ask to hide', () => {
    for (const lang of ['en', ...OTHER]) {
      const html = renderPage('privacy', lang);
      expect(html).toContain('[HIDDEN 1]');
      expect(html).not.toMatch(/no setting to turn it off/i);
    }
  });
});

describe('page routes', () => {
  test('English is the default and an unknown language falls back to it', async () => {
    const plain = await request(app).get('/privacy');
    const unknown = await request(app).get('/privacy?lang=xx');
    expect(plain.status).toBe(200);
    expect(plain.text).toContain('<html lang="en">');
    expect(unknown.text).toBe(plain.text);
  });

  test('?lang serves the translation', async () => {
    for (const page of PAGES) {
      for (const lang of OTHER) {
        const res = await request(app).get(`/${page}?lang=${lang}`);
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
        expect(res.text).toContain(`<html lang="${lang}">`);
      }
    }
  });

  test('every page offers every language', async () => {
    const res = await request(app).get('/support');
    for (const code of OTHER) expect(res.text).toContain(`hreflang="${code}"`);
  });
});

describe('app-ads.txt', () => {
  test('is served as plain text at the root with the AdMob publisher line', async () => {
    const res = await request(app).get('/app-ads.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text.trim()).toBe('google.com, pub-4330297206877846, DIRECT, f08c47fec0942fa0');
  });
});

describe('landing page', () => {
  test('serves an HTML page at the root that links to the legal pages', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    for (const page of PAGES) expect(res.text).toContain(`href="/${page}"`);
  });
});

describe('robots.txt', () => {
  test('lets crawlers read the whole site (needed for app-ads.txt)', async () => {
    const res = await request(app).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text).not.toMatch(/^Disallow:\s*\/\s*$/m);
    expect(res.text).not.toMatch(/^Disallow:\s*\S/m);
    expect(res.text).toMatch(/^Allow:\s*\/\s*$/m);
  });
});
