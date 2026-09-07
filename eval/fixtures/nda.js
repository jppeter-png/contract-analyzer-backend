module.exports = [
  {
    id: 'nda-01',
    category: 'nda',
    clean: false,
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

Between Vertex Analytics ("Disclosing Party") and Recipient.

1. Confidential Information means any and all information disclosed by Disclosing Party, in any form, including information that is publicly known, information Recipient already possessed prior to disclosure, and information independently developed by Recipient.

2. Term. The obligations of confidentiality under this Agreement shall survive in perpetuity and have no expiration date.

3. Obligations. Recipient shall not disclose or use Confidential Information for any purpose other than evaluating a potential business relationship. Disclosing Party has no reciprocal confidentiality obligations regarding any information Recipient may share.

4. Remedies. Any breach entitles Disclosing Party to liquidated damages of $500,000 per incident, in addition to injunctive relief, without any requirement to prove actual harm.`,
    trap_clauses: [
      {
        id: 'overbroad-definition',
        description: 'Confidential Information definition includes public and independently-developed information, with no carve-outs — far broader than a standard NDA definition.',
        signal_terms: ['definition', 'confidential information', 'carve-out', 'carve out', 'public', 'independently developed', 'overbroad', 'broad'],
      },
      {
        id: 'perpetual-duration',
        description: 'Confidentiality obligations never expire, which is unusual and often unenforceable — most NDAs specify 2-5 years.',
        signal_terms: ['perpetual', 'indefinite', 'duration', 'expire', 'expiration', 'term', 'unenforceable'],
      },
    ],
  },
  {
    id: 'nda-02',
    category: 'nda',
    clean: false,
    text: `NON-DISCLOSURE AGREEMENT

Between Sable Robotics Inc. and Contractor.

Contractor acknowledges that all information shared by Sable Robotics is proprietary and confidential and agrees not to disclose it to any third party.

Non-Compete: During the engagement and for 3 years thereafter, Contractor shall not provide services, in any capacity, to any company operating in the robotics, automation, or AI industries anywhere in the world.

Governing Law: This Agreement is governed by the laws of a jurisdiction to be selected by Sable Robotics at its sole discretion at the time of any dispute.

Return of Materials: Upon request, Contractor shall return or destroy all Confidential Information; however, Sable Robotics may retain copies of any Confidential Information indefinitely for "internal recordkeeping."`,
    trap_clauses: [
      {
        id: 'hidden-noncompete',
        description: 'A worldwide, industry-wide 3-year non-compete is buried inside what is nominally an NDA — a much broader restriction than confidentiality alone.',
        signal_terms: ['non-compete', 'noncompete', 'worldwide', 'industry', 'restriction', 'hidden'],
      },
      {
        id: 'jurisdiction-selected-later',
        description: 'Governing law/jurisdiction is left to be unilaterally chosen by one party at the time a dispute arises, rather than fixed in advance — removes predictability and fairness.',
        signal_terms: ['governing law', 'jurisdiction', 'sole discretion', 'unilateral', 'selected'],
      },
    ],
  },
  {
    id: 'nda-03',
    category: 'nda',
    clean: false,
    text: `CONFIDENTIALITY AGREEMENT

Between Pinecrest Health Systems and Vendor.

Vendor agrees to maintain the confidentiality of all Company information disclosed under this engagement.

Publicity: Vendor grants Company the right to publicly disclose the existence and general nature of this engagement, and Vendor may not object to or restrict such disclosures in any way.

Injunctive Relief: In the event of any actual or threatened breach, Company shall be entitled to seek injunctive relief without the need to post any bond or provide any security, notwithstanding standard legal requirements to do so.

Assignment: Company may assign this Agreement, and all of Vendor's confidentiality obligations under it, to any third party at any time without Vendor's consent.`,
    trap_clauses: [
      {
        id: 'assignment-without-consent',
        description: 'Company can assign the agreement — and Vendor’s confidentiality obligations — to any third party without Vendor’s consent, potentially binding Vendor to obligations toward parties it never agreed to.',
        signal_terms: ['assignment', 'assign', 'consent', 'third party', 'transfer'],
      },
      {
        id: 'no-bond-injunctive-relief',
        description: 'Company can obtain injunctive relief without posting a bond, removing a normal protection against wrongful injunctions.',
        signal_terms: ['injunctive relief', 'bond', 'security', 'injunction'],
      },
    ],
  },
];
