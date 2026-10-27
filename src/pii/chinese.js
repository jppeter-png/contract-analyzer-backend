// Chinese (Simplified) person-name detection.
//
// Chinese names have no capitals and no spaces, so the English approach (capitalized
// phrases scored by cues) cannot work. Instead a name is a SURNAME followed by one or two
// given-name characters, and is only accepted in a context that says "a person goes here":
// after a party or label word (甲方, 出租人, 姓名：), as surname + title (张先生), before a
// defined term (张三（以下简称"甲方"）), or before ID / address details (张三，男，身份证号…).
// Every later mention of an accepted full name is redacted too.

const CJK = '\\u4e00-\\u9fff';
const isCjk = ch => !!ch && /[一-鿿]/.test(ch);

const COMPOUND_SURNAMES = [
  '欧阳', '司马', '上官', '诸葛', '东方', '皇甫', '尉迟', '公孙', '慕容', '长孙', '宇文', '司徒', '令狐',
  '夏侯', '轩辕', '澹台', '端木', '南宫', '西门', '独孤', '呼延', '百里', '淳于', '赫连', '太史', '闻人',
];

const SINGLE_SURNAMES = new Set(
  ('王李张刘陈杨黄赵吴周徐孙马朱胡郭何林高罗郑梁谢宋唐许韩冯邓曹彭曾萧田董潘袁蔡蒋余于杜叶程魏苏吕丁任卢姚沈' +
   '钟姜崔谭陆范汪廖石金韦贾夏付方邹熊白孟秦邱侯江尹薛闫段雷龙黎史陶贺顾毛郝龚邵万钱严赖覃洪武莫孔汤向常温康施' +
   '文牛樊葛邢安齐易乔伍庞颜倪庄聂章鲁岳翟殷詹申欧耿关兰焦俞左柳甘祝包宁尚符舒阮柯纪梅童凌毕单季裴霍涂成苗谷盛' +
   '曲翁冉骆蓝路游辛靳管柴蒙鲍华喻祁蒲房滕屈饶解牟艾尤阳时穆农司卓古吉缪简车项连芦麦褚娄窦戴戚谈宗茅闵席麻强危' +
   '刁虞支昝经裘干应宣贲郁杭诸钮').split(''),
);

const SURNAME_ALT = `(?:${COMPOUND_SURNAMES.join('|')}|[${[...SINGLE_SURNAMES].join('')}])`;

// Words that start with a surname character but are ordinary contract vocabulary.
const NOT_NAME = new Set((
  '应当 应该 应付 应收 应按 付款 付费 付清 方式 方案 方面 方法 方可 任何 任意 余额 时间 时候 时限 金额 金融 费用 费率 文件 文本 ' +
  '文字 常规 高于 低于 万元 万一 白色 安全 安装 安排 成立 成本 成果 单位 单方 单独 季度 简称 简要 经营 经理 经济 经过 经双 ' +
  '于此 于本 干预 强制 强行 严重 严格 严禁 宁可 包括 包含 包装 华人 古代 吉利 车辆 车位 连带 连续 项目 项下 项内 管理 管辖 ' +
  '房屋 房产 房租 房东 房间 田地 石材 史上 毛利 毛重 江苏 江西 向其 向对 向乙 向甲 龙头 文化 武力 武器 魏晋 夏季 夏天 ' +
  '范围 范本 成交 成员 成为 盛大 路线 路径 路段 解除 解释 解决 解约 申请 申报 申明 申诉 季末 易于 易燃 艾滋 谈判 谈妥 ' +
  '曲线 古董 左右 右侧 查询 贺卡 席位 麻烦 强烈 危险 危害 危及 宣布 宣告 宣传 应收 应得 应有 应予 应对 应急 应诉 应聘 应届 ' +
  '干扰 干涉 郁闷 钟点 钟表 纪念 纪律 纪要 童年 童装 倪虹 谷物 谷类 屈服 饶恕 牟取 尤其 尤为 阳光 阳性 时代 时期 时效 时点 ' +
  '宁愿 常年 常用 常见 常务 简单 简易 简化 毕业 毕竟 邓论 戴上 戚戚 宗教 宗旨 茅盾 雷同 雷电 段落 段位 洪水 蒙受 蒙蔽 熊市 ' +
  '殷实 殷切 庞大 庄重 庄严 聂政 鲁莽 岳父 翟然 詹姆 凌晨 凌驾 季节 缪误 车间 车费 柴油 管道 管控 管制 管辖权'
).split(/\s+/).filter(Boolean));

// A third (given-name) character that is really the start of a verb or particle after the name.
const VERBISH = new Set('承租付收须应均并负拥委授出买卖借贷持另以按由被把让使经且则即所将已于在向对同与和及或之的为是签'.split(''));

// CJK characters that may directly follow a name (particles, "and", common verbs); anything
// that is not an ideograph (punctuation, space, digit, Latin letter, end of text) also counts.
const NAME_FOLLOWERS = new Set('与和及或同对向将已于在之的为是签承租付收须并负拥委授出买卖借贷持另以按由被把让使经且则即所、'.split(''));

// Surnames that are also everyday words (应 "should", 于 "at", 向 "toward", 付 "pay", 方 "side"...).
// Straight after a role word with no punctuation ("乙方应支付"), they are read as words, not names.
const AMBIGUOUS_SURNAMES = new Set('应于向任方付时文成单经干常安易白项连简解强宁包路管申车危盛季'.split(''));

// Field labels that start right after a name in form layouts ("王建国联系电话", "李梅身份证号"),
// including after OCR has removed the spaces that used to separate them.
const FIELD_WORDS = ['联系', '电话', '手机', '身份', '住址', '地址', '出生', '性别', '邮箱', '甲方', '乙方', '丙方', '承租', '出租',
  '日期', '签字', '签名', '盖章', '法定', '职务', '职位', '民族', '国籍', '学历', '银行', '账号', '邮编'];
const afterName = (text, end) => {
  const ch = text[end];
  return ch === undefined || !isCjk(ch) || NAME_FOLLOWERS.has(ch) || FIELD_WORDS.some(w => text.startsWith(w, end));
};

/** The surname-led name starting at `idx`, or null. Prefers the 2-character given name. */
function nameAt(text, idx, { strict = false } = {}) {
  if (strict && AMBIGUOUS_SURNAMES.has(text[idx])) return null;
  const surnames = [];
  const two = text.slice(idx, idx + 2);
  if (COMPOUND_SURNAMES.includes(two)) surnames.push(2);
  if (SINGLE_SURNAMES.has(text[idx])) surnames.push(1);
  for (const sLen of surnames) {
    for (const gLen of [2, 1]) {
      const end = idx + sLen + gLen;
      const given = text.slice(idx + sLen, end);
      if (given.length !== gLen || ![...given].every(isCjk)) continue;
      const name = text.slice(idx, end);
      if (NOT_NAME.has(name)) continue;
      if (gLen === 2 && VERBISH.has(given[1])) continue; // "张三承" + "租": read it as 张三 + 承租
      if (!afterName(text, end)) continue;
      return name;
    }
  }
  return null;
}

const ROLE_WORDS = [
  '甲方', '乙方', '丙方', '丁方', '出租方', '承租方', '出租人', '承租人', '房东', '房主', '租客', '租户', '业主', '买方', '卖方',
  '买受人', '出卖人', '委托人', '受托人', '雇主', '用人单位', '员工', '劳动者', '雇员', '借款人', '贷款人', '出借人', '担保人',
  '保证人', '抵押人', '抵押权人', '债务人', '债权人', '申请人', '被申请人', '投保人', '被保险人', '受益人', '签约人', '签署人',
  '签字人', '当事人', '法定代表人', '授权代表', '联系人', '收件人', '患者', '病人', '立约人', '供方', '需方', '服务方', '受让方',
  '转让方', '许可方', '被许可方', '披露方', '接收方', '本人', '签名人', '见证人', '代理人', '监护人',
].sort((a, b) => b.length - a.length);

const LABEL_WORDS = [
  '姓名', '名字', '全名', '签名', '签字', '签署', '签章', '代表人', '负责人', '联系人', '收件人', '经办人', '申请人', '委托人',
  '出租人', '承租人', '甲方', '乙方', '丙方', '法定代表人', '紧急联系人', '持卡人', '户名', '开户名', '收款人', '付款人',
  '被保险人', '投保人', '受益人', '患者姓名', '员工姓名', '租户姓名',
].sort((a, b) => b.length - a.length);

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ROLE_ALT = ROLE_WORDS.map(escapeRe).join('|');
const LABEL_ALT = LABEL_WORDS.map(escapeRe).join('|');

// After a label with a colon or space ("姓名：张三"), after a role word ("出租人张三", "甲方（张三）").
const AFTER_LABEL = new RegExp(`(?:${LABEL_ALT})[ \\t]*[:：\\-－]?[ \\t]*[（(]?[ \\t]*(?=[${CJK}])`, 'g');
const AFTER_LABEL_BRACKETED = new RegExp(`(?:${LABEL_ALT})[（(][^）)\\n]{1,6}[）)][ \\t]*[:：\\-－]?[ \\t]*[（(]?[ \\t]*(?=[${CJK}])`, 'g');
const AFTER_ROLE = new RegExp(`(?:${ROLE_ALT})[ \\t]*[:：,，、]?[ \\t]*[（(“"「]?[ \\t]*(?=[${CJK}])`, 'g');
const AFTER_ROLE_BRACKETED = new RegExp(`(?:${ROLE_ALT})[（(][^）)\\n]{1,6}[）)][ \\t]*[:：,，、]?[ \\t]*[（(“"「]?[ \\t]*(?=[${CJK}])`, 'g');
const SURNAME_TITLE = new RegExp(`(?<![${CJK}])(${SURNAME_ALT}[${CJK}]{0,2})(?=先生|女士|小姐)`, 'g');
// Phrases that follow a person's name: "（以下简称…", ", 男", ", 汉族", ", 身份证…", ", 35岁".
const DEFINED_ANCHOR = new RegExp(`(?<=[${CJK}])(?=[（(][ \\t]*(?:以下)?(?:简称|称|下称))`, 'g');
const DETAILS_ANCHOR = new RegExp(`(?<=[${CJK}])(?=[，,、][ \\t]*(?:男|女)[，,、]|[，,、]?[ \\t]*(?:汉族|身份证|出生|住址|住所地?)|[，,、]?\\d{1,3}岁)`, 'g');

/** The name that ends exactly at `end` (looking back 4, 3, then 2 characters), or null. */
function nameEndingAt(text, end) {
  for (const len of [4, 3, 2]) {
    const start = end - len;
    if (start < 0) continue;
    const name = text.slice(start, end);
    if (nameAt(text, start) === name) return name;
  }
  return null;
}

function collect(text, names) {
  const add = name => { if (name) names.add(name); };

  for (const re of [AFTER_LABEL, AFTER_LABEL_BRACKETED, AFTER_ROLE, AFTER_ROLE_BRACKETED]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      // the match ends in a delimiter (colon, bracket, space) unless the name follows the word directly
      const delimited = !isCjk(m[0][m[0].length - 1]);
      add(nameAt(text, m.index + m[0].length, { strict: !delimited }));
    }
  }

  for (const re of [DEFINED_ANCHOR, DETAILS_ANCHOR]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) re.lastIndex++; // zero-width match
      add(nameEndingAt(text, m.index));
    }
  }

  // A line holding nothing but a name, in a signature block.
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().replace(/[（(].*[）)]$/, '').trim();
    if (!/^[一-鿿]{2,4}$/.test(line) || NOT_NAME.has(line)) continue;
    const near = [lines[i - 2], lines[i - 1], lines[i + 1], lines[i + 2]].filter(Boolean).join('\n');
    if (/签字|签名|盖章|签章|日期|甲方|乙方|代表/.test(near)) add(nameAt(line, 0) === line ? line : null);
  }
}

/** Spans for every Chinese person name found in `text` (offsets into the original text). */
function detectChineseNames(text) {
  if (!/[一-鿿]/.test(text)) return [];

  const names = new Set();
  collect(text, names);

  const spans = [];
  const push = (start, end, priority) => spans.push({ start, end, label: 'Person names', tag: '[NAME]', priority });

  // surname + title ("张先生"): the whole thing is a way of naming one person
  SURNAME_TITLE.lastIndex = 0;
  let t;
  while ((t = SURNAME_TITLE.exec(text)) !== null) {
    const base = t[1];
    if (NOT_NAME.has(base)) continue;
    push(t.index, t.index + base.length + 2, 52);
  }

  // every mention of an accepted full name
  for (const name of names) {
    let from = 0;
    for (;;) {
      const at = text.indexOf(name, from);
      if (at === -1) break;
      from = at + name.length;
      // not the middle of a longer word that merely contains the same characters
      push(at, at + name.length, 55);
    }
  }
  return spans;
}

module.exports = { detectChineseNames, nameAt, SURNAME_ALT };
