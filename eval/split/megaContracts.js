// Very long versions (~42,000 characters) of three existing contracts: the same definitions at the top and the same
// dependent clauses, but ~30,000 characters of neutral operational filler between them. Used to test bigger sections.
const { LONG_CONTRACTS } = require('./longContracts');
const { QUIET_CONTRACTS } = require('./quietContracts');

const TOPICS = ['document retention', 'reporting cadence', 'site access badges', 'vendor onboarding', 'data backups', 'holiday schedules', 'training records', 'equipment inventory', 'meeting minutes', 'courier deliveries', 'archive formats', 'signage', 'visitor logs', 'emergency contacts', 'calendar invitations', 'parking permits', 'key management', 'cleaning schedules', 'mail handling', 'recycling', 'document templates', 'file naming', 'version control', 'password rotation', 'device inventory', 'printing', 'stationery orders', 'travel bookings', 'expense reports', 'translation requests', 'courier labels', 'office hours', 'weather closures', 'fire drills', 'first aid kits', 'noise monitoring', 'pest inspections', 'lighting checks', 'elevator service', 'security patrols', 'meeting rooms', 'whiteboard supplies', 'coffee service', 'plant care', 'lost property', 'badge photos', 'contact lists', 'org charts', 'status dashboards', 'project codes', 'invoice formats', 'purchase order numbers', 'delivery windows', 'storage racks', 'labeling standards', 'photo archives', 'newsletter schedules', 'survey requests', 'feedback forms', 'event planning', 'volunteer days', 'charity matching', 'language preferences', 'accessibility reviews', 'ergonomic checks', 'noise-cancelling headsets', 'software updates', 'license inventories', 'cable management', 'spare parts', 'waste logs', 'energy readings', 'water meter readings', 'courtesy notices'];
const VERBS = ['coordinate', 'schedule', 'document', 'review', 'plan', 'track', 'organize', 'confirm'];
const FREQ = ['each month', 'each quarter', 'twice a year', 'once a year', 'every six weeks', 'each week'];

function filler(n) {
  return TOPICS.slice(0, n).map((topic, i) => {
    const verb = VERBS[i % VERBS.length];
    const freq = FREQ[i % FREQ.length];
    return `Schedule ${i + 1}, ${topic}. The parties will ${verb} arrangements for ${topic} in the ordinary course and will review them ${freq}. Each party will keep a short record of ${topic} and make it available to the other party on reasonable request during business hours. A change to the ${topic} arrangements is effective only when both parties confirm it in writing, and neither party is required to incur unreasonable cost in connection with ${topic}. Questions about ${topic} go first to the contacts named in the order form and then, if unresolved after ten (10) business days, to a senior representative of each party.`;
  }).join('\n\n');
}

function stretch(contract, n = 75) {
  const idx = contract.text.indexOf(contract.trapsDependent[0].excerpt.slice(0, 40));
  const start = contract.text.lastIndexOf('\n\n', idx) + 2;
  return { ...contract, id: `${contract.id}-mega`, text: `${contract.text.slice(0, start)}${filler(n)}\n\n${contract.text.slice(start)}` };
}

const pick = (list, id) => list.find(c => c.id === id);
const MEGA_CONTRACTS = [stretch(pick(LONG_CONTRACTS, 'long-lease')), stretch(pick(LONG_CONTRACTS, 'long-service')), stretch(pick(QUIET_CONTRACTS, 'quiet-lease'))];

module.exports = { MEGA_CONTRACTS };
