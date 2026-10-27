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
