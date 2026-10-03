const { scrubPII } = require('../src/piiScrubber');

const labels = findings => findings.map(f => f.label);
const redactedFor = (findings, label) => (findings.find(f => f.label === label) || { redacted: [] }).redacted;

describe('names — recall (each must be redacted and must not leak)', () => {
  const cases = [
    ['party intro with defined terms',
      'This Lease is made between Maria Gonzalez ("Landlord") and Thomas Wright ("Tenant").',
      ['Maria Gonzalez', 'Thomas Wright']],
    ['ALL-CAPS label',
      'TENANT: JOHN A. SMITH',
      ['JOHN A. SMITH']],
    ['role noun before comma',
      'The Borrower, Priya Raman, agrees to repay the loan.',
      ['Priya Raman']],
    ['honorific + surname only',
      'Dear Mr. Okafor, thank you for your letter.',
      ['Okafor']],
    ['honorific + full name',
      'Please contact Dr. Wei Zhang about the results.',
      ['Wei Zhang']],
    ['slash signature',
      'By: /s/ Michael O\'Brien',
      ["Michael O'Brien"]],
    ['hyphenated surname',
      'Patient: Samuel Adeyemi-Cole was admitted on the date below.',
      ['Samuel Adeyemi-Cole']],
    ['name particle',
      'Employee: Nguyen Van Anh shall report to the manager.',
      ['Nguyen Van Anh']],
    ['guarantor',
      'Guarantor Emily Chen-Park shall remain liable.',
      ['Emily Chen-Park']],
    ['ALL-CAPS between clause',
      'THIS AGREEMENT IS MADE BETWEEN JANE DOE AND JOHN SMITH.',
      ['JANE DOE', 'JOHN SMITH']],
    ['name with suffix',
      'Landlord: Robert King Jr. will provide notice.',
      ['Robert King Jr.']],
    ['unknown surname, known first name, role cue',
      'Tenant Jane Doe shall pay rent monthly.',
      ['Jane Doe']],
  ];

  test.each(cases)('%s', (_name, input, mustRedact) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const secret of mustRedact) {
      expect(scrubbed).not.toContain(secret);
    }
    expect(scrubbed).toContain('[NAME]');
    expect(labels(findings)).toContain('Person names');
  });

  test('once a name is found, later mentions are redacted too (full name, surname, first name)', () => {
    const { scrubbed } = scrubPII('Tenant Jane Doe shall pay. Later, Ms. Doe agrees. Jane also signs. DOE signs.');
    expect(scrubbed).not.toMatch(/Jane|Doe|DOE/);
  });

  test('a signature block with no other cue is still caught', () => {
    const { scrubbed } = scrubPII('Executed on the date above.\n\n____________\nXin Qiu\nTenant\n');
    expect(scrubbed).not.toContain('Xin Qiu');
  });

  test('a name seen in an email address is redacted everywhere it appears', () => {
    const { scrubbed } = scrubPII('Email priya.raman@corp.com with questions. Priya Raman will respond within a day.');
    expect(scrubbed).not.toContain('Priya Raman');
    expect(scrubbed).not.toContain('priya.raman');
  });

  test('reversed "Last, First" form is caught once the name is known', () => {
    const { scrubbed } = scrubPII('Tenant Jane Doe signs. Index: Doe, Jane.');
    expect(scrubbed).not.toMatch(/Doe|Jane/);
  });
});

describe('names — precision (contract boilerplate must be left alone)', () => {
  const boilerplate = [
    'The Effective Date of this Agreement is January 1, 2025.',
    'Employee Handbook and Confidential Information are defined in Section 4.',
    'Tenant Responsibilities include the Security Deposit and the Grace Period.',
    'Will the Tenant pay? May the Landlord enter? Mark the date.',
    'Governed by the laws of the State of New York and the United States of America.',
    'This Software Development Agreement is between Acme Analytics, Inc. and Beta Holdings LLC.',
    'RESIDENTIAL LEASE AGREEMENT',
    'ARTICLE IV – TERMINATION AND NOTICE',
    'Exhibit A – Fee Schedule and Payment Terms',
    'Landlord Property Management Services shall maintain the Premises.',
    'The Disclosing Party and the Receiving Party agree to the Confidentiality Obligations.',
    'Governing Law and Dispute Resolution; Binding Arbitration before the American Arbitration Association.',
  ];

  test.each(boilerplate)('%s', input => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).toBe(input);
    expect(findings).toEqual([]);
  });
});

describe('structured identifiers — recall', () => {
  const cases = [
    ['street address with city/state/zip', 'Premises: 123 Main Street, Austin, TX 78701.', '123 Main Street', 'Street addresses'],
    ['address with unit', 'Send notice to 442 Alder St, Apt 3B.', '442 Alder', 'Street addresses'],
    ['ALL-CAPS address', 'ADDRESS: 900 OAK AVENUE', '900 OAK AVENUE', 'Street addresses'],
    ['PO box', 'Mail to P.O. Box 4521 for payment.', 'Box 4521', 'Street addresses'],
    ['parenthesized phone, no space', 'Call (415)555-2671 today.', '555-2671', 'Phone numbers'],
    ['labeled contiguous phone', 'Mobile: 4155552671', '4155552671', 'Phone numbers'],
    ['German number', 'Office +49 30 901820 hours 9 to 5.', '901820', 'Phone numbers'],
    ['valid credit card', 'Card 4111 1111 1111 1111 on file.', '4111', 'Credit card numbers'],
    ['card failing Luhn but labeled', 'Visa card 4111-1111-1111-1112 expires soon.', '4111', 'Credit card numbers'],
    ['valid IBAN', 'Pay to GB82 WEST 1234 5698 7654 32 by Friday.', 'GB82', 'Bank account numbers'],
    ['account number', 'Account number: 123456789012 at First Bank.', '123456789012', 'Bank account numbers'],
    ['routing number', 'ABA routing no. 021000021.', '021000021', 'Bank account numbers'],
    ['driver license', "Driver's License No. D1234567 issued in CA.", 'D1234567', 'ID numbers'],
    ['passport', 'Passport: X12345678', 'X12345678', 'ID numbers'],
    ['date of birth', 'The tenant was born on March 4, 1985 in Ohio.', 'March 4, 1985', 'Date of birth patterns'],
    ['labeled DOB', 'DOB: 04/12/1987', '04/12/1987', 'Date of birth patterns'],
    ['unseparated SSN, labeled', 'SSN: 123456789 on file.', '123456789', 'Social Security Numbers'],
    ['VIN', 'Vehicle VIN 1HGCM82633A004352 is leased.', '1HGCM82633A004352', 'Vehicle identification numbers'],
    ['IP address', 'Logged from 192.168.1.10 at noon.', '192.168.1.10', 'IP addresses'],
    ['social handle', 'Follow @jane_doe for updates.', '@jane_doe', 'Social media handles'],
    ['LinkedIn URL', 'Profile: https://www.linkedin.com/in/jane-doe', 'linkedin.com/in/jane-doe', 'Social media handles'],
    ['obfuscated email', 'Write to jane [at] example [dot] com please.', 'jane [at]', 'Email addresses'],
  ];

  test.each(cases)('%s', (_name, input, secret, label) => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).not.toContain(secret);
    expect(labels(findings)).toContain(label);
  });

  test('an address and its city/state/zip become one placeholder', () => {
    const { scrubbed } = scrubPII('Premises: 123 Main Street, Austin, TX 78701.');
    expect(scrubbed).toBe('Premises: [ADDRESS].');
  });
});

describe('structured identifiers — precision', () => {
  const clean = [
    'Payment of $1,500,000.00 is due on January 1, 2025 under Section 4.2.1.3 of this Agreement.',
    'See Clause 10.2.3.4 for the notice period.',
    'The invalid address 999.1.1.1 is not an IP.',
    'Account balance is due upon receipt of the Fee Schedule.',
    'Agreement No. 20250101 governs this engagement.',
    'The loan amount is 4111111111111112 units of credit.',
    'GB00 TEST 0000 0000 0000 00 is not a valid IBAN.',
    'Case 2:24-cv-01234 was heard on March 4, 2025.',
  ];

  test.each(clean)('%s', input => {
    const { scrubbed } = scrubPII(input);
    expect(scrubbed).toBe(input);
  });

  test('a plain date is not treated as a date of birth', () => {
    const { findings } = scrubPII('This Lease commences on March 4, 1985 and ends in 2030.');
    expect(labels(findings)).not.toContain('Date of birth patterns');
  });
});

describe('overlap handling', () => {
  test('a name inside an email is consumed by the email, not double-counted', () => {
    const { scrubbed, findings } = scrubPII('Write to jane.doe@example.com.');
    expect(scrubbed).toBe('Write to [EMAIL].');
    expect(labels(findings)).toEqual(['Email addresses']);
  });

  test('placeholders from one detector are never re-read by another', () => {
    const { scrubbed } = scrubPII('Call 415-555-2671 or 415-555-2672.');
    expect(scrubbed).toBe('Call [PHONE] or [PHONE].');
  });
});

describe('robustness', () => {
  test('empty and whitespace-only input are returned unchanged', () => {
    expect(scrubPII('').scrubbed).toBe('');
    expect(scrubPII('   \n  ').scrubbed).toBe('   \n  ');
  });

  test('a large document is processed quickly', () => {
    const block = 'Tenant Jane Doe lives at 123 Main Street, Austin, TX 78701 and may be reached at 415-555-2671. '
      + 'The Effective Date is January 1, 2025 and the Security Deposit is due. ';
    const big = block.repeat(1500); // ~250k characters
    const started = Date.now();
    const { scrubbed, findings } = scrubPII(big);
    expect(Date.now() - started).toBeLessThan(5000);
    expect(scrubbed).not.toContain('Jane Doe');
    expect(redactedFor(findings, 'Phone numbers')).toEqual(['415-555-2671']);
  });

  test('pathological input does not hang the name matcher', () => {
    const evil = 'Aaaa Bbbb '.repeat(20000) + '!';
    const started = Date.now();
    scrubPII(evil);
    expect(Date.now() - started).toBeLessThan(5000);
  });
});

describe('regressions found while hardening the detector', () => {
  test.each([
    'Insured by John Hancock Insurance and Bank of America.',
    'Observed on Martin Luther King Jr. Day and Memorial Day.',
    'Held at Lincoln Park near Lake Tahoe, Los Angeles County, and Mount Rushmore.',
    'Meets the Fair Housing Act and Equal Employment Opportunity Commission rules.',
  ])('titles, places and organizations are not people: %s', input => {
    expect(scrubPII(input).scrubbed).toBe(input);
  });

  test('hyphenated ID values are caught (employee and policy numbers)', () => {
    const { scrubbed } = scrubPII('Reference employee ID: E-48213 and policy number HX-99120034.');
    expect(scrubbed).toBe('Reference employee ID: [ID] and policy number [ID].');
  });

  test('a street address does not swallow the sentence-ending period', () => {
    expect(scrubPII('Mail it to 12 Birch Lane.').scrubbed).toBe('Mail it to [ADDRESS].');
  });

  test('a surname ending in -ing is not mistaken for a company', () => {
    expect(scrubPII('Landlord: Robert King shall give notice.').scrubbed).not.toContain('King');
  });

  test('all-zero digit runs are not credit cards', () => {
    expect(scrubPII('Ref 0000 0000 0000 0000 only.').scrubbed).toBe('Ref 0000 0000 0000 0000 only.');
  });
});
