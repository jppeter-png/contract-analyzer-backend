const fs = require('fs');
const path = require('path');
const { scrubPII } = require('../src/piiScrubber');

// An employee handbook is full of capitalized headings and of words like "employee" and "member". None of that is
// a person (a user's real 15,000-word handbook was reported with 66 "names" such as "Workplace" and "Job Performance").
const nameHits = text => {
  const found = scrubPII(text).findings.find(f => f.label === 'Person names');
  return found ? [...new Set(found.redacted)] : [];
};

describe('headings in long documents are not names', () => {
  const handbook = fs.readFileSync(path.join(__dirname, 'fixtures', 'handbook-headings.txt'), 'utf8');

  test('a handbook full of headings and role words produces only the one real name', () => {
    expect(nameHits(handbook)).toEqual(['Josef Peter']);
  });

  test.each([
    'Workplace Guidelines', 'Smoke-Free Workplace', 'Workplace Violence', 'Job Performance', 'Paid Time Off (PTO)',
    'PTO Accrual Method', 'Domestic Violence Leave', 'Long-Term Disability', 'Employer Identification Number',
    'Member Services', 'Employee Assistance Program', 'TriNet HR III', 'Human Resources',
  ])('"%s" is left alone', heading => {
    const text = `${heading}\nEvery employee should read this section. The employee assistance program is free.\n\n${heading}\nMore text about the ${heading.toLowerCase()} follows here for each employee.`;
    expect(nameHits(text)).toEqual([]);
  });

  test('lowercase mentions of a heading are not redacted either', () => {
    const { scrubbed: scrubbedText } = scrubPII(handbook);
    expect(scrubbedText).toContain('job performance');
    expect(scrubbedText).toContain('domestic violence');
    expect(scrubbedText).not.toMatch(/\[NAME[^\]]*\]\s+performance/i);
  });
});

describe('real names still found next to role words and in signature blocks', () => {
  test('a role cue before a name', () => {
    expect(nameHits('Tenant Bill Cook agrees to pay the rent. The tenant must pay the utility bill and may cook on site.')).toContain('Bill Cook');
  });

  test('a short role label on the line above or below a name', () => {
    expect(nameHits('Tenant:\nBill Cook\n\nLandlord\nMaria Gonzalez\n')).toEqual(expect.arrayContaining(['Bill Cook', 'Maria Gonzalez']));
  });

  test('a signature marker near a signature block', () => {
    expect(nameHits('Signature: ______________\nThomas Becker\nKatharina Wagner\n')).toEqual(expect.arrayContaining(['Thomas Becker', 'Katharina Wagner']));
  });

  test('a role word inside a sentence no longer turns the next heading into a name', () => {
    expect(nameHits('Each employee must read the policy.\nWorkplace Guidelines\nThe company expects the employee to comply.')).toEqual([]);
  });
});

describe('a document title under a repeated page header is not a name', () => {
  // The lease repeats "Initials: Tenant___ Landlord/Agent___" on every page, which sits within two lines of the title.
  const header = 'Initials:   Tenant_________           Landlord/Agent____________    1';
  const lease = [
    header,
    'Virginia Residential Lease Agreement',
    '(hereinafter known as "Lease")',
    'In compliance with Virginia Code 55-248.13, Landlord shall maintain the premises.',
    'This Lease is governed by applicable Virginia law and the Virginia National Guard provisions.',
  ].join('\n');

  test('the state in a lease title and in its legal citations is left alone', () => {
    expect(nameHits(lease)).toEqual([]);
    expect(scrubPII(lease).scrubbed).toContain('Virginia Residential Lease Agreement');
  });

  test('a real name on its own line in a signature block is still found', () => {
    const signed = `${lease}\n\nTenant signature:\nJordan Ellis\n`;
    expect(nameHits(signed)).toContain('Jordan Ellis');
  });
});

describe('street addresses that contain human names are hidden as one address', () => {
  const run = text => scrubPII(text).scrubbed;

  test.each([
    ['78 Jordan Ellis Drive, Springfield, VA 22150', 'The premises are at '],
    ['1200 Martin Luther King Jr Blvd, Fairfax, VA 22030', 'Landlord address: '],
    ['450 Casey Rivera Lane, Reston, VA 20191', 'Send notices to '],
    ['22 Charlotte Street, Charlotte, NC 28202', 'The office is at '],
  ])('"%s" leaves no part of the address behind', (address, lead) => {
    const out = run(`${lead}${address} and rent is due monthly.`);
    expect(out).toBe(`${lead}[ADDRESS] and rent is due monthly.`);
  });

  test('a person named in the same sentence is still hidden separately', () => {
    const out = run('Landlord: Jordan Ellis, 450 Casey Rivera Lane, Reston, VA 20191.');
    expect(out).toBe('Landlord: [NAME], [ADDRESS].');
  });
});

describe('street and place names are not people', () => {
  const left = name => {
    const text = `The building is called ${name} and it is near the river.`;
    return scrubPII(text).scrubbed === text;
  };

  test.each([
    'Willow Creek', 'Grant Avenue', 'Martin Luther King Jr Blvd', 'Washington Street', 'Jackson Heights',
    'Lincoln Park', 'Brookside Manor', 'Victoria Gardens', 'Kingston Plaza',
  ])('"%s" is left alone', name => {
    expect(left(name)).toBe(true);
  });

  test('a person whose surname is also a street word is still found when something marks them as a person', () => {
    for (const name of ['Sung Park', 'Mary Street', 'Jordan Hill', 'Kim Grant']) {
      expect(nameHits(`Tenant: ${name}. The tenant pays rent monthly.`)).toContain(name);
    }
  });
});
