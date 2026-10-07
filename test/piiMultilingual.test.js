const { scrubPII } = require('../src/piiScrubber');

const labels = findings => findings.map(f => f.label);

// Each row: a document snippet and every string that must NOT survive redaction.
describe('names — Spanish', () => {
  const cases = [
    ['partes con D. y Dña.', 'Contrato de arrendamiento entre D. Juan Pérez García y Dña. María López Fernández.',
      ['Juan', 'Pérez', 'García', 'María', 'López', 'Fernández']],
    ['arrendatario seguido de coma', 'El arrendatario, Carlos Ruiz Martínez, se obliga a pagar la renta.', ['Carlos', 'Ruiz', 'Martínez']],
    ['etiqueta con dos puntos', 'Arrendador: José Luis Hernández', ['José', 'Hernández']],
    ['saludo', 'Estimado Sr. Gómez: gracias por su carta.', ['Gómez']],
    ['firma', 'Firmado: Ana Belén Torres', ['Ana', 'Torres']],
    ['pareja de nombres sin cue', 'Reunidos María García y Pedro Navarro.', ['María', 'García', 'Pedro', 'Navarro']],
    ['de una parte', 'De una parte, Lucía Fernández Ortega, mayor de edad.', ['Lucía', 'Fernández', 'Ortega']],
    ['apellido con partícula', 'El inquilino Miguel Ángel de la Cruz abona la fianza.', ['Miguel', 'Cruz']],
  ];
  test.each(cases)('%s', (_n, input, secrets) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const s of secrets) expect(scrubbed).not.toContain(s);
    expect(labels(findings)).toContain('Person names');
  });
});

describe('names — French', () => {
  const cases = [
    ['entre M. et Mme', 'Entre M. Jean Dupont et Mme Marie Lefèvre, il est convenu ce qui suit.', ['Jean', 'Dupont', 'Marie', 'Lefèvre']],
    ['prénom composé', 'Le locataire, Pierre-Louis Moreau, s’engage à payer le loyer.', ['Pierre-Louis', 'Moreau']],
    ['étiquette avec espace avant deux-points', 'Bailleur : Sophie Martin', ['Sophie', 'Martin']],
    ['civilité complète', 'Madame Chloé Dubois a signé le bail.', ['Chloé', 'Dubois']],
    ['salutation', 'Cher Monsieur Rousseau, merci de votre courrier.', ['Rousseau']],
    ['signature', 'Signé : Antoine Girard', ['Antoine', 'Girard']],
    ['nom à particule', "Le garant, Hélène de la Fontaine, reste tenu.", ['Hélène', 'Fontaine']],
  ];
  test.each(cases)('%s', (_n, input, secrets) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const s of secrets) expect(scrubbed).not.toContain(s);
    expect(labels(findings)).toContain('Person names');
  });
});

describe('names — German', () => {
  const cases = [
    ['zwischen Herrn und Frau', 'Mietvertrag zwischen Herrn Hans Müller und Frau Anna Schmidt.', ['Hans', 'Müller', 'Anna', 'Schmidt']],
    ['Rollen mit Doppelpunkt', 'Vermieter: Klaus Weber, Mieter: Sabine Fischer', ['Klaus', 'Weber', 'Sabine', 'Fischer']],
    ['Anrede', 'Sehr geehrter Herr Schneider, vielen Dank für Ihr Schreiben.', ['Schneider']],
    ['Mieter ohne Doppelpunkt', 'Der Mieter Jürgen Hoffmann zahlt monatlich.', ['Jürgen', 'Hoffmann']],
    ['Unterschrift', 'Unterschrift: Lukas Meyer', ['Lukas', 'Meyer']],
    ['Umlaute und ß', 'Arbeitnehmerin: Jana Großmann-Böhm', ['Jana', 'Großmann-Böhm']],
  ];
  test.each(cases)('%s', (_n, input, secrets) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const s of secrets) expect(scrubbed).not.toContain(s);
    expect(labels(findings)).toContain('Person names');
  });
});

describe('names — Portuguese', () => {
  const cases = [
    ['entre o Sr. e a Sra.', 'Contrato celebrado entre o Sr. João Silva e a Sra. Maria Fernandes.', ['João', 'Silva', 'Maria', 'Fernandes']],
    ['locatário', 'Locatário: Pedro Gonçalves Almeida', ['Pedro', 'Gonçalves', 'Almeida']],
    ['locador com vírgula', 'O locador, Ricardo Santos, declara que o imóvel está livre.', ['Ricardo', 'Santos']],
    ['saudação', 'Prezado Sr. Costa, agradecemos o contacto.', ['Costa']],
    ['assinatura', 'Assinado por: Beatriz Oliveira Lima', ['Beatriz', 'Oliveira', 'Lima']],
  ];
  test.each(cases)('%s', (_n, input, secrets) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const s of secrets) expect(scrubbed).not.toContain(s);
    expect(labels(findings)).toContain('Person names');
  });
});

describe('names — precision: boilerplate in other languages is left alone', () => {
  const boilerplate = [
    'CONTRATO DE ARRENDAMIENTO DE VIVIENDA',
    'El arrendatario deberá abonar la renta mensual dentro de los primeros cinco días de cada mes.',
    'Cláusula Primera. Objeto del Contrato.',
    'Ley de Arrendamientos Urbanos y Código Civil.',
    'Los Tribunales de Madrid serán competentes.',
    'CONTRAT DE BAIL D’HABITATION',
    'Le locataire s’engage à payer le loyer. Article 3 – Durée du bail.',
    'Dépôt de garantie et Charges locatives.',
    'MIETVERTRAG FÜR WOHNRAUM',
    'Der Mieter zahlt die Kaution und die Nebenkosten. Kündigungsfrist und Schönheitsreparaturen.',
    'Gerichtsstand ist Berlin. Es gilt das Bürgerliche Gesetzbuch.',
    'CONTRATO DE ARRENDAMENTO URBANO',
    'O locatário obriga-se a pagar a renda. Cláusula Segunda – Prazo do Contrato.',
    'Aplica-se o Código Civil e o Tribunal de Lisboa.',
  ];
  test.each(boilerplate)('%s', input => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).toBe(input);
    expect(findings).toEqual([]);
  });
});

describe('identifiers — recall in other languages', () => {
  const cases = [
    // Spanish
    ['DNI con letra válida, sin etiqueta', 'Identificado con 12345678Z en el presente contrato.', '12345678Z', 'ID numbers'],
    ['NIE válido', 'Titular del NIE X1234567L.', 'X1234567L', 'ID numbers'],
    ['teléfono etiquetado', 'Teléfono: 612 345 678', '612 345 678', 'Phone numbers'],
    ['teléfono fijo etiquetado', 'Tel. 91 234 56 78 para avisos.', '91 234 56 78', 'Phone numbers'],
    ['teléfono con prefijo', 'Llame al +34 612 345 678 hoy.', '612 345 678', 'Phone numbers'],
    ['dirección completa', 'Domicilio: Calle Mayor, 12, 3º B, 28013 Madrid.', 'Calle Mayor', 'Street addresses'],
    ['IBAN español', 'Cuenta ES91 2100 0418 4502 0005 1332 para el pago.', 'ES91', 'Bank account numbers'],
    ['fecha de nacimiento', 'El arrendatario, nacido el 4 de marzo de 1985, declara.', '4 de marzo de 1985', 'Date of birth patterns'],
    // French
    ['adresse française', 'Domicile : 12 rue de la Paix, 75002 Paris.', 'rue de la Paix', 'Street addresses'],
    ['mobile français', 'Joignable au 06 12 34 56 78.', '06 12 34 56 78', 'Phone numbers'],
    ['mobile avec indicatif', 'Appelez le +33 6 12 34 56 78.', '6 12 34 56 78', 'Phone numbers'],
    ['numéro de sécurité sociale valide', 'N° 2 84 08 75 123 456 23 de la salariée.', '75 123 456', 'Social Security Numbers'],
    ['date de naissance', 'Le locataire, né le 4 mars 1985, déclare.', '4 mars 1985', 'Date of birth patterns'],
    ['IBAN français', 'RIB FR14 2004 1010 0505 0001 3M02 606.', 'FR14', 'Bank account numbers'],
    // German
    ['deutsche Adresse', 'Wohnhaft in der Hauptstraße 12, 10115 Berlin.', 'Hauptstraße 12', 'Street addresses'],
    ['Adresse mit Str.', 'Anschrift: Berliner Str. 5a, 10115 Berlin', 'Berliner Str. 5a', 'Street addresses'],
    ['Telefon', 'Telefon: 030 12345678', '030 12345678', 'Phone numbers'],
    ['Geburtsdatum', 'Der Mieter, geboren am 4. März 1985, erklärt.', '4. März 1985', 'Date of birth patterns'],
    ['Steuer-ID', 'Steuer-ID: 12 345 678 901', '12 345 678 901', 'ID numbers'],
    ['deutsche IBAN', 'IBAN DE89 3704 0044 0532 0130 00', 'DE89', 'Bank account numbers'],
    // Portuguese
    ['morada portuguesa', 'Morada: Rua das Flores, 45, 1000-001 Lisboa.', 'Rua das Flores', 'Street addresses'],
    ['NIF válido', 'NIF 123456789 do arrendatário.', '123456789', 'ID numbers'],
    ['telemóvel', 'Telemóvel: 912 345 678', '912 345 678', 'Phone numbers'],
    ['CPF válido', 'CPF 529.982.247-25 do locador.', '529.982.247-25', 'ID numbers'],
    ['data de nascimento', 'O locatário, nascido em 4 de março de 1985, declara.', '4 de março de 1985', 'Date of birth patterns'],
  ];
  test.each(cases)('%s', (_n, input, secret, label) => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).not.toContain(secret);
    expect(labels(findings)).toContain(label);
  });

  test('a Spanish address with postal code becomes one placeholder', () => {
    expect(scrubPII('Calle Mayor, 12, 3º B, 28013 Madrid').scrubbed).toBe('[ADDRESS]');
  });
});

describe('identifiers — precision in other languages', () => {
  const clean = [
    'Artículo 12. Cláusula 3.1.2.4 del presente contrato.',
    'La renta es de 1.500,00 euros al mes, pagadera por adelantado.',
    'Plazo de 12 meses a partir del 1 de enero de 2025.',
    'Der Betrag beträgt 12.500,00 € gemäß § 5 Abs. 2.',
    'Le montant est de 1 500 000 euros TTC.',
    'O valor total é de 250 000 euros, conforme o artigo 7.',
    'Número de páginas: 123456789 según el anexo.',
    'Vigencia desde el 4 de marzo de 2025 hasta el 3 de marzo de 2026.',
  ];
  test.each(clean)('%s', input => {
    expect(scrubPII(input).scrubbed).toBe(input);
  });

  test('a DNI-shaped number with a wrong check letter is not redacted without a label', () => {
    expect(scrubPII('Referencia 12345678A del expediente.').scrubbed).toBe('Referencia 12345678A del expediente.');
  });
});

describe('mixed-language documents', () => {
  test('a bilingual contract is redacted in both languages at once', () => {
    const text = 'Tenant: Jane Doe. Arrendatario: Carlos Ruiz Martínez. Mieter: Hans Müller. Phone 415-555-2671, Tel. 612 345 678.';
    const { scrubbed } = scrubPII(text);
    for (const s of ['Jane', 'Doe', 'Carlos', 'Ruiz', 'Martínez', 'Hans', 'Müller', '415-555-2671', '612 345 678']) {
      expect(scrubbed).not.toContain(s);
    }
  });

  test('later mentions of an accented surname are redacted too (accent- and case-insensitive)', () => {
    const { scrubbed } = scrubPII('Arrendatario: Carlos Pérez Gómez. Más adelante, PÉREZ GÓMEZ firma. Carlos paga.');
    expect(scrubbed).not.toMatch(/Carlos|Pérez|PÉREZ|Gómez|GÓMEZ/);
  });
});

describe('regressions found while testing realistic contracts', () => {
  test('two names set apart by a wide gap (signature block) are redacted separately', () => {
    const { scrubbed } = scrubPII('Thomas Becker                Katharina Wagner\nVermieter                    Mieterin');
    expect(scrubbed).toBe('[NAME]                [NAME]\nVermieter                    Mieterin');
  });

  test('a label word such as "Firmado" is not absorbed into the name next to it', () => {
    const { scrubbed } = scrubPII('Firmado: Alejandro Fernández Ruiz        Firmado: Lucía Martín Gómez');
    expect(scrubbed).toBe('Firmado: [NAME]        Firmado: [NAME]');
  });

  test('an address with two linking words ("de la") is fully redacted', () => {
    expect(scrubPII('sita en Avenida de la Constitución, 8, 2º A, 41001 Sevilla.').scrubbed).toBe('sita en [ADDRESS].');
  });

  test('a checksum-valid IBAN is not broken up by phone-number look-alikes', () => {
    expect(scrubPII('IBAN DE89 3704 0044 0532 0130 00').scrubbed).toBe('IBAN [ACCOUNT]');
  });

  test('a labeled account number does not swallow the words after it', () => {
    expect(scrubPII('Cuenta ES91 2100 0418 4502 0005 1332 para el pago.').scrubbed).toBe('Cuenta [ACCOUNT] para el pago.');
  });

  test('a surname with two particles ("de la Fontaine") is redacted whole', () => {
    expect(scrubPII('Le garant, Hélène de la Fontaine, reste tenu.').scrubbed).toBe('Le garant, [NAME], reste tenu.');
  });
});
