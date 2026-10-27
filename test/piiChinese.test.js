const { scrubPII } = require('../src/piiScrubber');
const { countWords } = require('../src/textStats');

const labels = findings => findings.map(f => f.label);

describe('Chinese names — recall (each must be redacted)', () => {
  const cases = [
    ['party label with colon', '甲方：张三，身份证号：110101199003078515', ['张三']],
    ['role word then name', '出租人王小明与承租人李四签订本合同。', ['王小明', '李四']],
    ['name label', '姓名：欧阳娜娜', ['欧阳娜娜']],
    ['signature label', '签字：刘洋', ['刘洋']],
    ['name in brackets after party', '乙方（陈静）同意按期支付租金。', ['陈静']],
    ['defined term', '赵伟（以下简称“甲方”）与孙丽（以下简称“乙方”）达成如下协议。', ['赵伟', '孙丽']],
    ['name before details', '周杰，男，汉族，现住北京市海淀区。', ['周杰']],
    ['surname with title', '张先生已于昨日付款，李女士将于明日到场。', ['张先生', '李女士']],
    ['three-character name followed by a verb', '出租人张三承租期限为一年。', ['张三']],
    ['employee', '员工：吴小红 入职日期：2025年1月1日', ['吴小红']],
    ['borrower', '借款人：郑国强（身份证号：440301198512129999）', ['郑国强']],
  ];
  test.each(cases)('%s', (_n, input, secrets) => {
    const { scrubbed, findings } = scrubPII(input);
    for (const s of secrets) expect(scrubbed).not.toContain(s);
    expect(labels(findings)).toContain('Person names');
  });

  test('later mentions of an accepted name are redacted too', () => {
    const { scrubbed } = scrubPII('出租人：马云飞。马云飞应按时交付房屋，马云飞不得转租。');
    expect(scrubbed).not.toContain('马云飞');
    expect(scrubbed.match(/\[NAME\]/g)).toHaveLength(3);
  });

  test('a name on its own line in a signature block is caught', () => {
    const { scrubbed } = scrubPII('特此证明。\n\n签字：\n黄志刚\n日期：2025年6月1日');
    expect(scrubbed).not.toContain('黄志刚');
  });
});

describe('Chinese names — precision (contract vocabulary is left alone)', () => {
  const boilerplate = [
    '房屋租赁合同',
    '甲方应当按时交付房屋，乙方应当按期支付租金。',
    '付款方式：银行转账。违约金按照合同金额的百分之二十计算。',
    '任何一方违约的，应当承担违约责任。',
    '本合同自双方签字盖章之日起生效，争议由上海市人民法院管辖。',
    '乙方应支付的费用包括水电费、物业费和房屋租金。',
    '第三条 租赁期限：自2025年1月1日起至2025年12月31日止。',
    '出租人应保证房屋符合安全标准，承租人应当爱护房屋及其附属设施。',
    '经营范围、项目管理及成本控制由双方另行约定。',
  ];
  test.each(boilerplate)('%s', input => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).toBe(input);
    expect(findings).toEqual([]);
  });
});

describe('Chinese identifiers — recall', () => {
  const cases = [
    ['resident ID with a valid checksum, unlabeled', '持有人证件 110101199003078515 已核验。', '110101199003078515', 'ID numbers'],
    ['resident ID, labeled', '身份证号码：440301198512129999', '440301198512129999', 'ID numbers'],
    ['mobile number', '联系电话：13812345678', '13812345678', 'Phone numbers'],
    ['mobile with +86 and spaces', '请拨打 +86 138 1234 5678 联系。', '138 1234 5678', 'Phone numbers'],
    ['landline', '电话：010-12345678', '010-12345678', 'Phone numbers'],
    ['date of birth', '出生日期：1990年3月7日', '1990年3月7日', 'Date of birth patterns'],
    ['bank account', '银行账号：6222021234567890123', '6222021234567890123', 'Bank account numbers'],
    ['labeled address', '住址：北京市朝阳区建国路88号3号楼2单元501室，邮编100022', '建国路88号', 'Street addresses'],
    ['address without a label', '房屋位于上海市浦东新区世纪大道100号。', '世纪大道100号', 'Street addresses'],
    ['email', '邮箱 zhangsan@example.com 为准', 'zhangsan@example.com', 'Email addresses'],
    ['company credit code', '统一社会信用代码：91110000MA01ABCD1X', '91110000MA01ABCD1X', 'EIN / Tax IDs'],
  ];
  test.each(cases)('%s', (_n, input, secret, label) => {
    const { scrubbed, findings } = scrubPII(input);
    expect(scrubbed).not.toContain(secret);
    expect(labels(findings)).toContain(label);
  });
});

describe('Chinese identifiers — precision', () => {
  const clean = [
    '租金为人民币13800000000元整。',
    '合同金额：1,234,567.89元，分三期支付。',
    '编号：2025-0001 号文件见附件。',
    '本合同一式两份，甲乙双方各执一份。',
    '上海市人民法院和北京市第一中级人民法院均有管辖权。',
  ];
  test.each(clean)('%s', input => {
    expect(scrubPII(input).scrubbed).toBe(input);
  });

  test('an ID-shaped number with a wrong checksum is not redacted without a label', () => {
    const text = '参考号 110101199003078510 备查。';
    expect(scrubPII(text).scrubbed).toBe(text);
  });
});

describe('mixed Chinese and English documents', () => {
  test('both languages are redacted at once', () => {
    const { scrubbed } = scrubPII('Tenant: Jane Doe. 承租人：李四，电话 13812345678, email li4@example.com.');
    for (const s of ['Jane', 'Doe', '李四', '13812345678', 'li4@example.com']) expect(scrubbed).not.toContain(s);
  });
});

describe('word count', () => {
  test('counts Chinese characters individually and other words by spaces', () => {
    expect(countWords('房屋租赁合同')).toBe(6);
    expect(countWords('Lease 房屋租赁 agreement')).toBe(6);
    expect(countWords('plain english words')).toBe(3);
    expect(countWords('')).toBe(0);
  });
});

describe('regressions found while testing realistic Chinese contracts', () => {
  test('a bracketed party word between the role and the colon does not hide the name', () => {
    const { scrubbed } = scrubPII('出租人（甲方）：王建国\n承租人（乙方）：李梅\n甲方（签字）：王建国    乙方（签字）：李梅');
    expect(scrubbed).not.toMatch(/王建国|李梅/);
    expect(scrubbed.match(/\[NAME\]/g)).toHaveLength(4);
  });

  test('a birth date written before the cue is redacted', () => {
    expect(scrubPII('张晓红，女，1992年3月15日出生，').scrubbed).toBe('[NAME]，女，[DOB]，');
  });

  test('a checksum-valid resident ID is an ID, not a credit card', () => {
    const { findings } = scrubPII('身份证号：440301199203150028');
    expect(labels(findings)).toContain('ID numbers');
    expect(labels(findings)).not.toContain('Credit card numbers');
  });

  test('an address leaves the words before it ("位于", "现住") in place', () => {
    expect(scrubPII('甲方将位于上海市浦东新区世纪大道100号的房屋出租给乙方。').scrubbed).toBe('甲方将位于[ADDRESS]的房屋出租给乙方。');
    expect(scrubPII('乙方以其位于广州市天河区珠江新城华夏路10号的房产作抵押。').scrubbed).toBe('乙方以其位于[ADDRESS]的房产作抵押。');
    expect(scrubPII('现住深圳市南山区科技园路1号。').scrubbed).toBe('现住[ADDRESS]。');
  });

  test('a court and a company named in the contract are not personal data', () => {
    const text = '用人单位：北京云帆科技有限公司，争议提交上海市浦东新区人民法院管辖。';
    expect(scrubPII(text).scrubbed).toBe(text);
  });

  test('a surname that is also a common word is not a name straight after a role word', () => {
    const text = '乙方应支付的费用包括水电费。甲方于签约当日交付钥匙。';
    expect(scrubPII(text).scrubbed).toBe(text);
  });
});

describe('OCR spacing between Chinese characters', () => {
  const { removeCjkSpacing } = require('../src/textStats');
  test('removes the spaces Tesseract inserts between Chinese characters, digits and punctuation', () => {
    expect(removeCjkSpacing('房屋 租赁 合同')).toBe('房屋租赁合同');
    expect(removeCjkSpacing('承租 人 : 李 梅')).toBe('承租人:李梅');
    expect(removeCjkSpacing('月 租金 为 人 民 币 8000 元 ， 押 金')).toBe('月租金为人民币8000元，押金');
  });
  test('keeps the spaces between Latin words, including next to Chinese text', () => {
    expect(removeCjkSpacing('Lease start date: 1 January 2026')).toBe('Lease start date: 1 January 2026');
    expect(removeCjkSpacing('Lease 房屋 agreement')).toBe('Lease 房屋 agreement');
  });
  test('names that OCR split with spaces are then found', () => {
    const { scrubbed } = scrubPII(removeCjkSpacing('出租人 : 王建 国 联系 电话 : 13912345678'));
    expect(scrubbed).not.toMatch(/王建国|13912345678/);
  });
});
