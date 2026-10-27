const { digitsOf, luhn, validIpv4, validIban, validDni, validNie, validCpf, validNifPt, validNir, validChineseId } = require('./validators');

const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DATE = `(?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|${MONTH}\\.?[ \\t]+\\d{1,2}(?:st|nd|rd|th)?,?[ \\t]+\\d{4}|\\d{1,2}(?:st|nd|rd|th)?[ \\t]+${MONTH}\\.?,?[ \\t]+\\d{4})`;

const variants = words => words.split(/\s+/).map(w => `(?:${w}|${w.toUpperCase()}|${w.charAt(0).toUpperCase()}${w.slice(1)})`).join('|');
const STREET_SUFFIX = `(?:${variants('street st avenue ave road rd boulevard blvd lane ln drive dr court ct way place pl terrace ter circle cir highway hwy parkway pkwy square sq trail trl plaza row alley loop pike crescent')})`;
const DIRECTION = '(?:N|S|E|W|NE|NW|SE|SW|North|South|East|West|NORTH|SOUTH|EAST|WEST)';
const STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';
const CITY_STATE_ZIP = `[A-Z][A-Za-z.'’\\-]+(?:[ \\t]+[A-Z][A-Za-z.'’\\-]+){0,2},?[ \\t]+(?:${STATES})\\.?,?[ \\t]+\\d{5}(?:-\\d{4})?`;
const UNIT = '(?:Apt|Apartment|Suite|Ste|Unit|Floor|Fl|Room|Rm|Bldg|Building|APT|SUITE|STE|UNIT)';

const SECTION_CONTEXT = /(?:section|sec\.?|clause|article|§|paragraph|para\.?|schedule|exhibit|item|step|version|ver\.?|v|art[ií]culo|art\.|cl[aá]usula|apartado|punto|anexo|artikel|abs\.|absatz|ziffer|artigo|cl[aá]usula|n[ºo°]\.?)\s*$/i;
const CARD_CONTEXT = /(?:card|visa|mastercard|master card|amex|american express|discover|debit|credit|tarjeta|carte|karte|kreditkarte|cart[ãa]o|d[ée]bito|cr[ée]dito|银行卡|信用卡|储蓄卡|借记卡|卡号)[^\n]{0,30}$/i;


// ---- shared pieces for the Spanish / French / German / Portuguese rules -------------------
const ciw = w => w.split('').map(c => (/\p{L}/u.test(c) && c.toLowerCase() !== c.toUpperCase() && c.toUpperCase().length === 1
  ? `[${c.toLowerCase()}${c.toUpperCase()}]` : c.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'))).join('');
const alts = list => list.map(ciw).join('|');

const MONTH_INTL = `(?:${alts([
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'setiembre', 'octubre', 'noviembre', 'diciembre',
  'janvier', 'février', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'aout', 'septembre', 'octobre', 'novembre', 'décembre', 'decembre',
  'januar', 'februar', 'märz', 'maerz', 'april', 'juni', 'juli', 'august', 'oktober', 'dezember',
  'janeiro', 'fevereiro', 'março', 'marco', 'maio', 'junho', 'julho', 'setembro', 'outubro', 'dezembro',
])})`;
const DATE_INTL =
  `(?:\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|` +
  `\\d{1,2}(?:\\.|º|°|er|\\.º)?[ \\t]+(?:de[ \\t]+|d['’])?${MONTH_INTL}\\.?[ \\t]+(?:de[ \\t]+)?\\d{4}|` +
  `${MONTH_INTL}[ \\t]+\\d{1,2},?[ \\t]+\\d{4})`;
const INTL_DOB_CUES = `(?:fecha[ \\t]+de[ \\t]+nacimiento|f\\.[ \\t]*(?:de[ \\t]+)?nac\\.?|nacid[oa](?:[ \\t]+(?:el|en))?|` +
  `date[ \\t]+de[ \\t]+naissance|n[ée]e?(?:\\(e\\))?[ \\t]+le|geburtsdatum|geboren(?:[ \\t]+am)?|geb\\.(?:[ \\t]+am)?|` +
  `data[ \\t]+de[ \\t]+nascimento|nascid[oa](?:[ \\t]+em)?|nasc\\.)`;

const INTL_ID_LABELS = [
  'DNI', 'NIE', 'NIF', 'CIF', 'NIPC', 'CPF', 'CNPJ', 'CNH', 'CNI', 'pasaporte', 'passaporte', 'passeport', 'Reisepass',
  'Personalausweis', 'Ausweis', 'Führerschein', 'Fuhrerschein', 'Steuer-?ID', 'Steueridentifikationsnummer', 'Steuernummer',
  'St\\.?-?Nr', 'Sozialversicherungsnummer', 'SV-Nummer', 'seguridad[ \\t]+social', 's[ée]curit[ée][ \\t]+sociale',
  'seguran[çc]a[ \\t]+social', 'carte[ \\t]+(?:nationale[ \\t]+)?d[\'’]identit[ée]', 'c[ée]dula', 'cart[ãa]o[ \\t]+de[ \\t]+cidad[ãa]o',
  'bilhete[ \\t]+de[ \\t]+identidade', 'documento[ \\t]+de[ \\t]+identidad', 'contribuinte', 'matr[ií]cula',
  'n[úu]mero[ \\t]+de[ \\t]+(?:documento|afiliaci[óo]n|socio|cliente|p[óo]liza|ap[óo]lice|contribuinte)',
  'num[ée]ro[ \\t]+de[ \\t]+(?:client|police|membre|dossier|s[ée]curit[ée])',
  'Kundennummer', 'Mitgliedsnummer', 'Versicherungsnummer', 'Policennummer', 'Patientennummer', 'Mitarbeiternummer',
].join('|');
const INTL_BANK_LABELS = [
  'cuenta(?:[ \\t]+bancaria)?', 'n[úu]mero[ \\t]+de[ \\t]+cuenta', 'c\\/c', 'compte(?:[ \\t]+bancaire)?', 'RIB', 'Konto(?:nummer)?',
  'Bankverbindung', 'BLZ', 'Bankleitzahl', 'conta(?:[ \\t]+banc[áa]ria|[ \\t]+corrente)?', 'NIB', 'ag[êe]ncia', 'CLABE', 'IBAN',
].join('|');
const INTL_PHONE_LABELS = [
  'tel[ée]fono', 'tfno', 'tlf', 'm[óo]vil', 'celular', 't[ée]l[ée]phone', 'portable', 'mobil', 'handy', 'telefon', 'telem[óo]vel', 'contacto',
  'tel', 'fax', 'phone', 'mobile', 'cell', 'whatsapp',
].join('|');

const NAME_WORD = `[\\p{Lu}\\d][\\p{L}\\d'’\\-]*`;
const LOWER_LINK = `(?:(?:de(?:l)?|da|do|das|dos|la|las|los|y|e|d['’])[ \\t]+)`;
const POSTAL_CITY = `(?:\\d{5}|\\d{4}-\\d{3})[ \\t]+\\p{Lu}[\\p{L}'’\\-]+(?:[ \\t]+\\p{Lu}[\\p{L}'’\\-]+){0,2}`;
const IBERIAN_STREET = alts([
  'calle', 'c/', 'avenida', 'avda', 'av', 'paseo', 'plaza', 'pza', 'camino', 'carretera', 'ctra', 'ronda', 'travesía',
  'travesia', 'glorieta', 'urbanización', 'urbanizacion', 'urb', 'carrer', 'calzada', 'bulevar', 'callejón', 'callejon',
  'rua', 'travessa', 'praça', 'praca', 'largo', 'estrada', 'alameda', 'beco', 'rodovia', 'caminho',
]);
const FRENCH_STREET = alts([
  'rue', 'avenue', 'av', 'boulevard', 'bd', 'chemin', 'impasse', 'allée', 'allee', 'place', 'quai', 'route', 'cours',
  'passage', 'square', 'cité', 'cite', 'rond-point', 'voie', 'villa', 'sentier', 'esplanade',
]);
const GERMAN_STREET_END = 'straße|strasse|str\\.|weg|allee|platz|gasse|ring|damm|ufer|chaussee|steig|pfad|markt|hof|park|STRASSE|STRAßE|STR\\.';

// A Chinese address regex starts wherever the earliest city-like word starts, which can drag in
// the words before it ("乙方以其位于广州市…"). Drop everything up to a "located at"-type marker.
const ADDRESS_LEAD = /^[一-鿿]{0,10}?(?:位于|坐落于|座落于|地处|现住|住在|居住于|住于|设于|搬至|迁至|送至|寄至|[在于至到从往])(?=[一-鿿0-9])/;
function trimChineseAddressLead(value) {
  const m = ADDRESS_LEAD.exec(value);
  return m && value.length - m[0].length >= 6 ? m[0].length : 0;
}

// Each rule: regex (matched against the ORIGINAL text), label shown in the app,
// placeholder tag, overlap priority (higher wins), optional capture group that
// holds the sensitive value (so the label stays readable), optional validator.
const RULES = [
  { label: 'Email addresses', tag: '[EMAIL]', priority: 100,
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { label: 'Email addresses', tag: '[EMAIL]', priority: 100,
    regex: /\b[A-Za-z0-9._%+\-]+[ \t]*(?:\[at\]|\(at\)|\{at\})[ \t]*[A-Za-z0-9.\-]+[ \t]*(?:\[dot\]|\(dot\)|\{dot\})[ \t]*[A-Za-z]{2,}/gi },

  { label: 'Social Security Numbers', tag: '[SSN]', priority: 100,
    regex: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g },
  { label: 'Social Security Numbers', tag: '[SSN]', priority: 100, group: 1,
    regex: /\b(?:SSN|SS#|Social[ \t]+Security(?:[ \t]+(?:Number|No\.?|#))?)\b[ \t]*(?:is|:|#|-)?[ \t]*(\d{9})(?!\d)/gi },

  { label: 'Credit card numbers', tag: '[CC]', priority: 98,
    regex: /(?<![\d-])(?:\d[ -]?){12,18}\d(?![\d-])/g,
    validate: (value, _m, text, start) => {
      const digits = digitsOf(value);
      if (digits.length < 13 || digits.length > 19) return false;
      if (new Set(digits).size === 1) return false; // 0000 0000 0000 0000 passes Luhn but is not a card
      const plausibleIssuer = /^[2-6]/.test(digits);
      return (luhn(digits) && plausibleIssuer) || CARD_CONTEXT.test(text.slice(Math.max(0, start - 40), start));
    } },

  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<!\d)(?:\+?1[ \t.\-]?)?\(?\d{3}\)?[ \t.\-]\d{3}[ \t.\-]\d{4}(?!\d)/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<!\d)\(\d{3}\)[ \t]?\d{3}[ \t.\-]?\d{4}(?!\d)/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\w+])\+\d[\d \t().\-]{7,18}\d(?!\d)/g,
    validate: value => { const n = digitsOf(value).length; return n >= 8 && n <= 15; } },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95, group: 1,
    regex: /\b(?:phone|tel|telephone|cell|mobile|fax|call|text|whatsapp)\b[^\n\d]{0,15}?(\+?\d{10,11})(?!\d)/gi,
    validate: value => { const d = digitsOf(value); return d.length === 10 || (d.length === 11 && d[0] === '1'); } },

  { label: 'Date of birth patterns', tag: '[DOB]', priority: 92,
    regex: new RegExp(`\\b(?:DOB|D\\.O\\.B\\.?|Date[ \\t]+of[ \\t]+Birth|Birth[ \\t]?date|Birthday|born(?:[ \\t]+on)?)\\b[ \\t]*[:\\-]?[ \\t]*${DATE}`, 'gi') },

  { label: 'Medical record numbers', tag: '[MRN]', priority: 90, regex: /\b(?:MRN|MR#?)\s*:?\s*\d+/gi },
  { label: 'NPI numbers', tag: '[NPI]', priority: 90, regex: /\bNPI\s*:?\s*\d{10}\b/gi },
  { label: 'DEA numbers', tag: '[DEA]', priority: 90, regex: /\bDEA\s*:?\s*[A-Z]{2}\d{7}\b/gi },

  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 90, group: 1,
    regex: /\b(?:(?:bank[ \t]+)?account|acct|a\/c|routing|ABA|sort[ \t]+code|IBAN|SWIFT|BIC)\b\.?[ \t]*(?:number|no\.?|num|#|code)?[ \t]*[:#\-]?[ \t]*(\d[\d \-]{4,30}\d|[A-Z]{2}\d{2}[A-Z0-9 ]{10,30})/gi,
    validate: value => digitsOf(value).length >= 6 },
  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 96, // a checksum-valid IBAN beats look-alike phone fragments
    regex: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,4})?\b/g,
    validate: validIban },

  { label: 'ID numbers', tag: '[ID]', priority: 88, group: 1,
    regex: /\b(?:driver'?s?[ \t]+licen[sc]e|DL|licen[sc]e|passport|national[ \t]+ID|tax[ \t]+ID|TIN|ITIN|ID|policy|member|claim|patient|student|employee|customer)\b\.?[ \t]*(?:number|no\.?|num|#|id)?[ \t]*[:#\-]?[ \t]*([A-Z0-9][A-Z0-9\-]{3,19})(?![A-Za-z0-9])/gi,
    validate: value => digitsOf(value).length >= 4 },

  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `\\b\\d{1,6}(?:-\\d{1,6})?[ \\t]+(?:${DIRECTION}\\.?[ \\t]+)?(?:[A-Z0-9][A-Za-z0-9'’.\\-]*[ \\t]+){0,4}${STREET_SUFFIX}\\b` +
      `(?:[ \\t]+${DIRECTION}\\b\\.?)?` +
      `(?:,?[ \\t]+${UNIT}\\.?[ \\t]*#?[A-Za-z0-9\\-]+|,?[ \\t]*#[A-Za-z0-9\\-]+)?` +
      `(?:,[ \\t]*${CITY_STATE_ZIP})?`, 'g') },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 78,
    regex: new RegExp(`\\b${CITY_STATE_ZIP}\\b`, 'g') },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: /\bP\.?[ \t]?O\.?[ \t]+Box[ \t]+\d+\b/gi },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 70,
    regex: /\b[A-Z]\d[A-Z][ ]?\d[A-Z]\d\b|\b[A-Z]{1,2}\d[A-Z\d]?[ ]\d[A-Z]{2}\b/g },

  { label: 'Vehicle identification numbers', tag: '[VIN]', priority: 75,
    regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g,
    validate: value => /\d/.test(value) && /[A-Z]/.test(value) },

  { label: 'IP addresses', tag: '[IP]', priority: 70, group: 1,
    regex: /(?<![\d.])((?:\d{1,3}\.){3}\d{1,3})(?!\d|\.\d)/g,
    validate: (value, _m, text, start) =>
      validIpv4(value) && !SECTION_CONTEXT.test(text.slice(Math.max(0, start - 20), start)) },
  { label: 'IP addresses', tag: '[IP]', priority: 70,
    regex: /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g },
  { label: 'Device identifiers', tag: '[MAC]', priority: 70,
    regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g },

  { label: 'Social media handles', tag: '[SOCIAL]', priority: 70,
    regex: /\bhttps?:\/\/(?:www\.)?(?:linkedin\.com\/in|facebook\.com|fb\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com\/@|github\.com|t\.me)\/[\w.\-@]+\/?/gi },
  { label: 'Social media handles', tag: '[SOCIAL]', priority: 65,
    regex: /(?<![\w@.])@[A-Za-z_][A-Za-z0-9_]{2,14}\b/g },

  { label: 'EIN / Tax IDs', tag: '[EIN]', priority: 60, regex: /\b\d{2}-\d{7}\b/g },

  // ---- Spanish, French, German and Portuguese ------------------------------------------

  // National IDs that carry their own checksum are recognized without any label.
  { label: 'ID numbers', tag: '[ID]', priority: 88,
    regex: /(?<![\w-])\d{8}[ \-]?[A-Za-z](?!\w)/g, validate: validDni },
  { label: 'ID numbers', tag: '[ID]', priority: 88,
    regex: /(?<![\w-])[XYZxyz][ \-]?\d{7}[ \-]?[A-Za-z](?!\w)/g, validate: validNie },
  { label: 'ID numbers', tag: '[ID]', priority: 88,
    regex: /(?<![\d.])\d{3}\.\d{3}\.\d{3}-\d{2}(?!\d)/g, validate: validCpf },
  { label: 'Social Security Numbers', tag: '[SSN]', priority: 100,
    regex: /(?<!\d)[12](?:[ .]?\d{2}){2}[ .]?\d{2}[ .]?\d{3}[ .]?\d{3}[ .]?\d{2}(?!\d)/g, validate: validNir },
  { label: 'EIN / Tax IDs', tag: '[EIN]', priority: 60, regex: /(?<![\d.])\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}(?!\d)/g },

  // The same kinds of numbers when a label names them (DNI, NIF, Steuer-ID, passeport...).
  { label: 'ID numbers', tag: '[ID]', priority: 88, group: 1,
    regex: new RegExp(
      `(?<!\\p{L})(?:${INTL_ID_LABELS})(?!\\p{L})\\.?[ \\t]*(?:n[úuº°o]\\.?|nr\\.?|no\\.?|num\\.?|número|numero|numéro|nummer|#)?[ \\t]*[:#\\-]?[ \\t]*` +
      `(\\d[\\d .\\-]{2,22}\\d|[A-Z]{1,2}\\d[A-Z0-9\\-]{3,18})`, 'giu'),
    validate: value => digitsOf(value).length >= 4 },
  { label: 'ID numbers', tag: '[ID]', priority: 88, group: 1,
    regex: /(?<!\p{L})(?:NIF|NIPC|contribuinte)(?!\p{L})\.?[ \t]*[:#\-]?[ \t]*(\d{9})(?!\d)/giu, validate: validNifPt },

  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 90, group: 1,
    regex: new RegExp(
      `(?<!\\p{L})(?:${INTL_BANK_LABELS})(?!\\p{L})\\.?[ \\t]*(?:n[úuº°o]\\.?|nr\\.?|no\\.?|num\\.?|número|numero|numéro|nummer|#)?[ \\t]*[:#\\-]?[ \\t]*` +
      `(\\d[\\d \\-.]{4,30}\\d)`, 'giu'),
    validate: value => digitsOf(value).length >= 6 },

  // Local phone formats: French 01 23 45 67 89, Spanish/Portuguese 612 345 678, and labeled numbers.
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\d.])0[1-9](?:[ .\-]?\d{2}){4}(?!\d)/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\d.,])[26789]\d{2}[ \-]\d{3}[ \-]\d{3}(?![\d.,])/g,
    validate: value => !/(?:^|[ \-])000$/.test(value) },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\d.,])[6789]\d{2}[ ]\d{2}[ ]\d{2}[ ]\d{2}(?![\d.,])/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95, group: 1,
    regex: new RegExp(`(?<!\\p{L})(?:${INTL_PHONE_LABELS})(?!\\p{L})\\.?[^\\n\\d]{0,15}?(\\+?\\d[\\d ().\\-\\/]{7,18}\\d)(?![\\d])`, 'giu'),
    validate: value => { const n = digitsOf(value).length; return n >= 9 && n <= 15; } },

  // Date of birth with local cue words ("nacido el 4 de marzo de 1985", "né le 4 mars 1985", "geboren am 4. März 1985").
  { label: 'Date of birth patterns', tag: '[DOB]', priority: 92,
    regex: new RegExp(`(?<!\\p{L})${INTL_DOB_CUES}[ \\t]*[:\\-]?[ \\t]*${DATE_INTL}`, 'giu') },

  // Street addresses.
  // Spanish / Portuguese: "Calle Mayor, 12, 3º B, 28013 Madrid" · "Rua das Flores, 45, 1000-001 Lisboa"
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `(?<!\\p{L})(?:${IBERIAN_STREET})\\.?[ \\t]+${LOWER_LINK}{0,2}${NAME_WORD}(?:[ \\t]+${LOWER_LINK}{0,2}${NAME_WORD}){0,4}` +
      `[,.]?[ \\t]*(?:(?:n[ºo°]\\.?|núm\\.?|num\\.?)[ \\t]*)?\\d{1,5}(?:[ \\t]*[-–][ \\t]*\\d{1,5})?` +
      `(?:[ \\t]*[,º°ª.]*[ \\t]*(?:\\d{1,2}[º°ª.]{0,2}[ \\t]*[A-Za-z](?![\\p{L}])|\\d{1,2}[º°ª]|bajo|bis|esq\\.?|dto\\.?|[A-Z](?!\\p{L})))?` +
      `(?:,?[ \\t]*${POSTAL_CITY})?`, 'gu') },
  // French: "12 rue de la Paix, 75002 Paris"
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `(?<!\\d)\\d{1,4}(?:[ \\t]?(?:bis|ter))?,?[ \\t]+(?:${FRENCH_STREET})[ \\t]+(?:(?:des?|du|la|le|les|l['’]|d['’])[ \\t]*)?${NAME_WORD}` +
      `(?:[ \\t]+(?:(?:des?|du|la|le|les|et)[ \\t]+|[dl]['’])?${NAME_WORD}){0,4}(?:,?[ \\t]*${POSTAL_CITY})?`, 'giu') },
  // German: "Hauptstraße 12", "Berliner Str. 5a, 10115 Berlin", "Am Markt 3"
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `(?<!\\p{L})(?:(?:Am|An|Auf|Im|In|Zum|Zur|Unter|Hinter|Vor)[ \\t]+(?:der|dem|den|die|das)?[ \\t]*)?\\p{Lu}[\\p{L}\\-]*(?:${GERMAN_STREET_END})[ \\t]+\\d{1,4}[ \\t]?[a-z]?(?![\\p{L}\\d])` +
      `(?:,?[ \\t]*${POSTAL_CITY})?`, 'gu') },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80,
    regex: new RegExp(
      `(?<!\\p{L})\\p{Lu}[\\p{L}\\-]+[ \\t]+(?:Straße|Strasse|Str\\.|Weg|Allee|Platz|Gasse|Ring|Damm|Ufer|Chaussee)[ \\t]+\\d{1,4}[ \\t]?[a-z]?(?![\\p{L}\\d])` +
      `(?:,?[ \\t]*${POSTAL_CITY})?`, 'gu') },
  // Postal codes named by a label ("CP 28013", "PLZ 10115", "CEP 01310-100")
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 78, group: 1,
    regex: /(?<!\p{L})(?:C\.?P\.?|PLZ|CEP|Postleitzahl|c[óo]digo[ \t]+postal|code[ \t]+postal)(?!\p{L})[ \t]*[:.]?[ \t]*(\d{4,5}(?:-\d{3,4})?)/giu },

  // ---- Chinese (Simplified) ---------------------------------------------------------------

  // Resident ID numbers carry a checksum, so a valid one is recognized without any label.
  { label: 'ID numbers', tag: '[ID]', priority: 99, // above cards (98): 18 digits can pass the card checksum by chance
    regex: /(?<![0-9A-Za-z])[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx](?![0-9A-Za-z])/g,
    validate: validChineseId },
  // The same, labeled (also catches typos and the old 15-digit form).
  { label: 'ID numbers', tag: '[ID]', priority: 99, group: 1,
    regex: /(?:身份证(?:号码?|号)?|居民身份证|证件号码?|护照(?:号码?|号)?|驾驶证(?:号码?|号)?|港澳通行证(?:号码?)?|社保(?:卡)?号|社会保险号|医保(?:卡)?号|工号|学号|员工编号)[ \t]*[:：]?[ \t]*([0-9A-Za-z][0-9A-Za-z\-]{5,20})(?![0-9A-Za-z])/g,
    validate: value => digitsOf(value).length >= 5 },
  // Mobile numbers (11 digits, 13x-19x), optionally with +86, and landlines (area code + number).
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\d.])(?:\+?86[ \-]?)?1[3-9]\d[ \-]?\d{4}[ \-]?\d{4}(?![\d元万%])/g },
  { label: 'Phone numbers', tag: '[PHONE]', priority: 95,
    regex: /(?<![\d.])0\d{2,3}[-－ ]\d{7,8}(?:[-－]\d{1,5})?(?![\d元万%])/g },
  { label: 'Date of birth patterns', tag: '[DOB]', priority: 92,
    regex: /(?:出生日期|出生年月日?|出生于|出生|生日)[ \t]*[:：]?[ \t]*\d{4}[ \t]*[年\-/.][ \t]*\d{1,2}[ \t]*[月\-/.][ \t]*\d{1,2}[ \t]*[日号]?/g },
  { label: 'Date of birth patterns', tag: '[DOB]', priority: 92,
    regex: /\d{4}[ \t]*[年\-/.][ \t]*\d{1,2}[ \t]*[月\-/.][ \t]*\d{1,2}[ \t]*[日号]?[ \t]*(?:出生|生)(?![一-鿿])/g },
  { label: 'Bank account numbers', tag: '[ACCOUNT]', priority: 90, group: 1,
    regex: /(?:银行账号|银行账户|开户账号|银行卡号|储蓄卡号|信用卡号|账号|账户号|账户|卡号)[ \t]*[:：]?[ \t]*(\d[\d \-]{7,28}\d)/g,
    validate: value => digitsOf(value).length >= 8 },
  { label: 'EIN / Tax IDs', tag: '[EIN]', priority: 60, group: 1,
    regex: /(?:统一社会信用代码|纳税人识别号|税号)[ \t]*[:：]?[ \t]*([0-9A-Z]{15,20})(?![0-9A-Z])/g },
  // Addresses: a labeled address up to the next punctuation, or a street with a house number
  // ("朝阳区建国路88号3号楼2单元501室"). Names of cities alone ("上海市人民法院") are left alone.
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 80, group: 1,
    regex: /(?:住址|住所地?|地址|通讯地址|联系地址|居住地|送达地址|注册地址)[ \t]*[:：][ \t]*([一-鿿A-Za-z0-9\-－()（）#号]{6,60})/g },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 78, trimStart: trimChineseAddressLead,
    regex: /(?:[一-鿿]{2,9}(?:省|自治区))?(?:[一-鿿]{2,9}(?:市|州|盟))?(?:[一-鿿]{1,9}(?:区|县|旗))?[一-鿿0-9]{1,12}(?:大道|路|街道|街|巷|弄|胡同|道|村|镇|乡)[一-鿿0-9]{0,8}?\d+(?:-\d+)?号(?:院|楼)?(?:[一-鿿A-Za-z0-9\-]{1,10}?(?:栋|幢|座|单元|室|楼|层|号楼|号院|门))*/g },
  { label: 'Street addresses', tag: '[ADDRESS]', priority: 78, group: 1,
    regex: /(?:邮编|邮政编码)[ \t]*[:：]?[ \t]*(\d{6})(?!\d)/g },
];

// Order in which finding labels are reported to the app (names come last).
const LABEL_ORDER = [...new Set(RULES.map(r => r.label))];

function findStructured(text) {
  const spans = [];
  for (const rule of RULES) {
    const flags = rule.regex.flags.replace(/[gd]/g, '') + 'g' + (rule.group ? 'd' : '');
    const re = new RegExp(rule.regex.source, flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      let start = m.index;
      let end = m.index + m[0].length;
      if (rule.group) {
        if (m[rule.group] === undefined) continue;
        [start, end] = m.indices[rule.group];
      }
      if (rule.trimStart) start += rule.trimStart(text.slice(start, end));
      const value = text.slice(start, end);
      if (rule.validate && !rule.validate(value, m, text, start, end)) continue;
      spans.push({ start, end, label: rule.label, tag: rule.tag, priority: rule.priority });
    }
  }
  return spans;
}

module.exports = { findStructured, LABEL_ORDER };
