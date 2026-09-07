module.exports = [
  {
    id: 'tos-01',
    category: 'tos',
    clean: false,
    text: `TERMS OF SERVICE

These Terms govern your use of the Nimbus App.

Modifications: We may modify these Terms at any time, for any reason, effective immediately upon posting to our website, without direct notice to you. Your continued use of the App constitutes acceptance of the modified Terms.

Content License: By posting any content through the App, you grant us a perpetual, irrevocable, worldwide, royalty-free, sublicensable license to use, reproduce, modify, distribute, and create derivative works from your content for any purpose, including commercial purposes unrelated to the App.

Arbitration: You agree that any dispute will be resolved through binding individual arbitration. You waive any right to participate in a class action, class arbitration, or representative action of any kind.

Account Termination: We may suspend or terminate your account at any time, for any reason or no reason, without notice, and without any obligation to refund any fees paid.`,
    trap_clauses: [
      {
        id: 'unilateral-modification-no-notice',
        description: 'Terms can be changed at any time with no direct notice to users — just silently posting the change is deemed sufficient, and continued use means automatic acceptance.',
        signal_terms: ['modification', 'modify', 'notice', 'unilateral', 'without notice', 'change'],
      },
      {
        id: 'perpetual-irrevocable-content-license',
        description: 'Content license is perpetual, irrevocable, and allows commercial use unrelated to the app itself — far broader than what\'s needed to operate the service.',
        signal_terms: ['content license', 'perpetual', 'irrevocable', 'license', 'commercial use', 'derivative works'],
      },
    ],
  },
  {
    id: 'tos-02',
    category: 'tos',
    clean: false,
    text: `PRIVACY POLICY & TERMS

Welcome to Halcyon Fitness App.

Data Collection: We collect your location data continuously, even when the app is not in use, and share this data with "marketing partners" without specifying who those partners are or how they will use the data.

Data Deletion: Users may request deletion of their account, but certain data, including location history and usage analytics, will be retained indefinitely "for business purposes," and this retained data is not subject to deletion requests, including under GDPR or CCPA.

Third-Party Sharing: We may share your personal information, including health and fitness data, with any third party we choose, for any purpose, without further notice or consent from you.

Cancellation: Subscriptions renew automatically. To cancel, you must call our support line during specific business hours and provide 30 days' advance notice; email or in-app cancellation is not available.`,
    trap_clauses: [
      {
        id: 'no-real-deletion-right',
        description: 'Deletion requests don\'t actually delete location history or analytics, and the policy claims this data is exempt from GDPR/CCPA deletion rights — that exemption claim is itself dubious and worth flagging.',
        signal_terms: ['deletion', 'delete', 'gdpr', 'ccpa', 'retain', 'retention'],
      },
      {
        id: 'difficult-cancellation',
        description: 'Cancellation requires calling during limited business hours with 30 days notice, with no email or in-app option — a "dark pattern" making it deliberately hard to cancel an auto-renewing subscription.',
        signal_terms: ['cancellation', 'cancel', 'auto-renew', 'auto renew', 'subscription', 'dark pattern'],
      },
    ],
  },
  {
    id: 'tos-03',
    category: 'tos',
    clean: false,
    text: `TERMS OF USE

For the Quicklist marketplace platform.

Account Suspension: We reserve the right to suspend or terminate your account and withhold any funds in your account balance for up to 180 days after termination, for any reason, including suspected but unproven violations of these Terms.

Fees: Platform fees are 15% of each transaction. We may change this fee at any time without notice; the new fee applies immediately to all transactions, including ones already in progress.

Liability: Our total liability to you for any claim arising from your use of the platform is limited to $50, regardless of the actual amount of any transaction or damages incurred.

Indemnification: You agree to indemnify and hold us harmless from any claim arising from your use of the platform, including claims caused by our own negligence or platform errors.`,
    trap_clauses: [
      {
        id: 'withhold-funds-on-suspicion',
        description: 'Platform can withhold user funds for up to 180 days based on mere "suspected but unproven" violations — no due process before funds are frozen.',
        signal_terms: ['withhold', 'funds', 'suspend', 'suspicion', 'unproven', 'due process'],
      },
      {
        id: 'liability-cap-fifty-dollars',
        description: '$50 liability cap regardless of transaction size, combined with a one-sided indemnification clause covering even the platform\'s own negligence — Users bear essentially all risk.',
        signal_terms: ['liability', 'cap', 'indemnification', 'indemnify', 'negligence', 'one-sided'],
      },
    ],
  },
];
