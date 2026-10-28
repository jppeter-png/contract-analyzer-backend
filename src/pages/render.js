const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const PAGES = ['privacy', 'terms', 'support'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '简体中文' },
];
const CODES = LANGUAGES.map(l => l.code);
const EMAIL = 'contractanalyzer@icloud.com';

const LANGBAR_CSS = `
  .langbar { margin-top: 1.5rem; font-size: 0.85rem; color: var(--ink-faint); }
  .langbar a { margin-right: 0.9rem; }
  .langbar a[aria-current="page"] { color: var(--ink); font-weight: 600; text-decoration: none; }
  footer .credit { color: var(--ink-faint); font-size: 0.85rem; margin-top: 0.5rem; }
  .translation-note { color: var(--ink-faint); font-size: 0.85rem; margin-top: 0.5rem; }
</style>`;

// The English pages are the source of the styles and icon; translations reuse them.
const english = {};
for (const page of PAGES) english[page] = fs.readFileSync(path.join(PUBLIC_DIR, `${page}.html`), 'utf8');

const iconOf = html => (html.match(/<img class="masthead-icon" src="([^"]+)"/) || [])[1] || '';
const headOf = html => html.slice(0, html.indexOf('</head>'));
const scriptOf = html => (html.match(/<script>[\s\S]*<\/script>/) || [''])[0];

const li = items => items.map(x => `        <li>${x}</li>`).join('\n');

function langbar(page, lang) {
  const links = LANGUAGES.map(l => {
    const href = l.code === 'en' ? `/${page}` : `/${page}?lang=${l.code}`;
    const current = l.code === lang ? ' aria-current="page"' : '';
    return `<a href="${href}" hreflang="${l.code}"${current}>${l.label}</a>`;
  }).join('');
  return `<div class="langbar">${links}</div>`;
}

function mastheadHtml(c, extra) {
  return `<header class="masthead">
  <div class="masthead-inner">
    <img class="masthead-icon" src="${extra.icon}" alt="${c.iconAlt}" width="56" height="56">
    <div class="masthead-text">
      <span class="eyebrow">${c.eyebrow}</span>
      <h1>${c.appName}</h1>
${extra.meta}
    </div>
  </div>
</header>`;
}

const metaLine = c => `      <div class="masthead-meta">
        <span>${c.effective} <strong>${c.date}</strong></span>
      </div>
      <p class="translation-note">${c.translationNote}</p>`;

const tocHtml = (order, labels) => `  <nav class="toc" id="toc">
${order.map(id => `    <a href="#${id}">${labels[id]}</a>`).join('\n')}
  </nav>`;

const sectionsHtml = (ids, sections) =>
  ids.map(id => `    <section class="policy-section" id="${id}">
      <h2>${sections[id].h2}</h2>
${sections[id].html}
    </section>`).join('\n\n');

function policyBody(c, bar, icon, script, ids, tocOrder, footer) {
  return `<body>

${mastheadHtml(c, { icon, meta: metaLine(c) })}

<div class="shell">
${tocHtml(tocOrder, c.toc)}

  <main>
    <div class="summary">
      <span class="eyebrow">${c.summaryLabel}</span>
      <ul>
${li(c.summary)}
      </ul>
    </div>

${sectionsHtml(ids, c.sections)}

${bar}

    <footer>
${footer}
    </footer>
  </main>
</div>

${script}
</body>
</html>
`;
}

const PRIVACY_IDS = ['collect', 'redaction', 'not-stored', 'ai-sharing', 'third-party', 'choices', 'security', 'children', 'changes', 'contact'];
const PRIVACY_TOC = ['collect', 'redaction', 'ai-sharing', 'not-stored', 'third-party', 'choices', 'security', 'children', 'changes', 'contact'];
const TERMS_IDS = ['no-legal-advice', 'ai-content', 'no-relationship', 'acceptable-use', 'warranty', 'liability', 'changes', 'contact'];

function privacyBody(c, bar, icon) {
  const footer = `      <div class="contact"><a href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div>${c.effective} ${c.date} · ${c.appliesTo}</div>
      <div class="disclaimer">${c.disclaimer}</div>`;
  return policyBody(c, bar, icon, scriptOf(english.privacy), PRIVACY_IDS, PRIVACY_TOC, footer);
}

function termsBody(c, bar, icon) {
  const links = `      <div class="links"><a href="${c.privacyHref}">${c.privacyLabel}</a><a href="${c.supportHref}">${c.supportLabel}</a></div>`;
  const footer = `      <div class="contact">${c.questions} <a href="mailto:${EMAIL}">${EMAIL}</a></div>
      <div>${c.effective} ${c.date} · ${c.appliesTo}</div>
${links}
      <div class="disclaimer">${c.disclaimer}</div>`;
  return policyBody(c, bar, icon, scriptOf(english.terms), TERMS_IDS, TERMS_IDS, footer);
}

function supportBody(c, bar, icon) {
  const faq = c.faq.map(f => `  <div class="faq-item" id="${f.id}">
    <h3>${f.q}</h3>
    <p>${f.a}</p>
  </div>`).join('\n\n');
  return `<body>

<header class="masthead">
  <div class="masthead-inner">
    <img class="masthead-icon" src="${icon}" alt="${c.iconAlt}">
    <div class="masthead-text">
      <span class="eyebrow">${c.eyebrow}</span>
      <h1>${c.appName}</h1>
      <p class="masthead-tagline">${c.tagline}</p>
      <p class="translation-note">${c.translationNote}</p>
    </div>
  </div>
</header>

<div class="shell">

  <div class="contact-card">
    <div>
      <span class="eyebrow">${c.contactLabel}</span>
      <p>${c.contactText}</p>
    </div>
    <a class="email-btn" href="mailto:${EMAIL}">${EMAIL}</a>
  </div>

  <h2 class="faq-heading">${c.faqHeading}</h2>

${faq}

${bar}

  <footer>
    <div>${c.appName}</div>
    <div><a href="${c.privacyHref}">${c.privacyLabel}</a> · <a href="${c.termsHref}">${c.termsLabel}</a></div>
    <div class="credit">${c.credit}</div>
  </footer>

</div>

</body>
</html>
`;
}

const BODIES = { privacy: privacyBody, terms: termsBody, support: supportBody };

const contentCache = {};
const contentFor = (lang, page) => {
  const key = `${lang}/${page}`;
  if (!contentCache[key]) contentCache[key] = require(`./content/${lang}`)[page];
  return contentCache[key];
};

function renderPage(page, lang) {
  const html = english[page];
  const bar = langbar(page, lang);
  if (lang === 'en') return html.replace(/(\s*)<footer>/, `$1${bar}\n$1<footer>`).replace('</style>', LANGBAR_CSS);
  const href = p => `/${p}?lang=${lang}`;
  const c = { ...contentFor(lang, page), privacyHref: href('privacy'), termsHref: href('terms'), supportHref: href('support') };
  const head = headOf(html)
    .replace('<html lang="en">', `<html lang="${c.htmlLang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${c.title}</title>`)
    .replace('</style>', LANGBAR_CSS);
  return `${head}</head>\n${BODIES[page](c, bar, iconOf(html))}`;
}

/** Cache of finished pages: they only depend on files that are read once at startup. */
const rendered = {};
function getPage(page, requested) {
  const lang = CODES.includes(requested) ? requested : 'en';
  const key = `${lang}/${page}`;
  if (!rendered[key]) rendered[key] = renderPage(page, lang);
  return rendered[key];
}

module.exports = { getPage, renderPage, PAGES, LANGUAGES, CODES, EMAIL };
