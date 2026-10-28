const { scrubPII } = require('../src/piiScrubber');

describe('numbered placeholders', () => {
  test('different people get different numbers and repeats reuse them', () => {
    const { scrubbed } = scrubPII('Landlord Jane Doe and Tenant Mark Lee agree. Jane Doe may enter. Rent is payable to Jane Doe.');
    expect(scrubbed).toBe('Landlord [NAME 1] and Tenant [NAME 2] agree. [NAME 1] may enter. Rent is payable to [NAME 1].');
  });

  test('a surname or "Last, First" form is the same person as the full name', () => {
    const { scrubbed } = scrubPII('Landlord Jane Doe and Tenant Mark Lee agree. Doe may enter. Lee, Mark signs.');
    expect(scrubbed).toBe('Landlord [NAME 1] and Tenant [NAME 2] agree. [NAME 1] may enter. [NAME 2] signs.');
  });

  test('a single person keeps the plain tag', () => {
    const { scrubbed } = scrubPII('Tenant Jane Doe, jane@x.com, phone 555-123-4567. Jane Doe signs.');
    expect(scrubbed).toBe('Tenant [NAME], [EMAIL], phone [PHONE]. [NAME] signs.');
  });

  test('numbering is per kind, in order of first appearance', () => {
    const { scrubbed } = scrubPII('Write to a@x.com or b@y.com, then a@x.com again. Tenant Jane Doe.');
    expect(scrubbed).toBe('Write to [EMAIL 1] or [EMAIL 2], then [EMAIL 1] again. Tenant [NAME].');
  });

  test('the same phone number in different formats is one number', () => {
    const { scrubbed } = scrubPII('Call (555) 123-4567 or 555-123-4567, or the office at 555-987-6543.');
    expect(scrubbed).toBe('Call [PHONE 1] or [PHONE 1], or the office at [PHONE 2].');
  });

  test('a surname that fits two different people is not merged into either', () => {
    const { scrubbed } = scrubPII('Landlord Anna Smith and Tenant John Smith agree. Smith may enter.');
    expect(scrubbed).toMatch(/^Landlord \[NAME 1\] and Tenant \[NAME 2\] agree\. \[NAME 3\] may enter\.$/);
  });

  test('findings still list each original once, whatever the numbering', () => {
    const { findings } = scrubPII('Landlord Jane Doe and Tenant Mark Lee agree. Jane Doe may enter.');
    const names = findings.find(f => f.label === 'Person names');
    expect(names.count).toBe(3);
    expect(names.redacted).toEqual(['Jane Doe', 'Mark Lee']);
  });

  test('no original text leaks through the numbering', () => {
    const { scrubbed } = scrubPII('Landlord Jane Doe and Tenant Mark Lee agree. Doe may enter.');
    expect(scrubbed).not.toMatch(/Jane|Doe|Mark|Lee/);
  });
});
