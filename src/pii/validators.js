function digitsOf(str) {
  return str.replace(/\D/g, '');
}

function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function validIpv4(str) {
  const parts = str.split('.');
  return parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

// ISO 13616 mod-97 check, done in chunks to avoid BigInt.
function validIban(raw) {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
}

// Spanish DNI / NIE: the final letter is a mod-23 check of the number.
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
function validDni(raw) {
  const v = raw.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  const m = /^(\d{8})([A-Z])$/.exec(v);
  return !!m && DNI_LETTERS[Number(m[1]) % 23] === m[2];
}
function validNie(raw) {
  const v = raw.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  const m = /^([XYZ])(\d{7})([A-Z])$/.exec(v);
  return !!m && DNI_LETTERS[Number('XYZ'.indexOf(m[1]) + m[2]) % 23] === m[3];
}

// Brazilian CPF: two mod-11 check digits.
function validCpf(raw) {
  const d = digitsOf(raw);
  if (d.length !== 11 || new Set(d).size === 1) return false;
  const check = len => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    return ((sum * 10) % 11) % 10;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

// Portuguese NIF: one mod-11 check digit.
function validNifPt(raw) {
  const d = digitsOf(raw);
  if (d.length !== 9 || !'12356789'.includes(d[0])) return false;
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(d[i]) * (9 - i);
  const c = 11 - (sum % 11);
  return (c >= 10 ? 0 : c) === Number(d[8]);
}

// French social security number (NIR): 13 digits plus a 2-digit key = 97 - (n mod 97).
function validNir(raw) {
  const d = digitsOf(raw);
  if (d.length !== 15 || !'12'.includes(d[0])) return false;
  return 97 - (Number(d.slice(0, 13)) % 97) === Number(d.slice(13));
}

// Chinese resident ID (18 characters): the last one is an ISO 7064 mod 11-2 check, and the
// embedded birth date must be a real date.
function validChineseId(raw) {
  const v = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(v)) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += Number(v[i]) * weights[i];
  return '10X98765432'[sum % 11] === v[17];
}

module.exports = { digitsOf, luhn, validIpv4, validIban, validDni, validNie, validCpf, validNifPt, validNir, validChineseId };
