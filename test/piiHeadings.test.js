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
