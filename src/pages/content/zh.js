const note = '本页为便利性翻译。如有出入，以英文版本为准。';
const appName = 'Document Risk Analyzer';

const privacy = {
  htmlLang: 'zh',
  title: `${appName} 隐私政策`,
  iconAlt: 'Document Risk Analyzer 图标',
  eyebrow: '隐私政策',
  appName,
  effective: '生效日期',
  date: '2026年10月3日',
  translationNote: note,
  appliesTo: '适用于 iOS 和 Android 上的 Document Risk Analyzer。',
  disclaimer: '本页说明截至上述生效日期 Document Risk Analyzer 实际的数据处理做法。提供本页是出于透明度和应用商店合规的目的，不能替代独立的法律意见。',
  toc: {
    collect: '我们收集什么',
    redaction: '信息遮盖',
    'ai-sharing': 'AI 分析',
    'not-stored': '我们不存储什么',
    'third-party': '第三方',
    choices: '您的选择',
    security: '安全',
    children: '儿童',
    changes: '变更',
    contact: '联系我们',
  },
  summaryLabel: '简而言之',
  summary: [
    '在任何内容被发送进行 AI 分析之前，您的文档会先被自动扫描个人标识信息。电子邮箱、电话号码、社会安全号码及类似格式会被替换，检测到的姓名也会被替换。检测并不完美，因此您会看到将要发送内容的预览。',
    '遮盖后的文本会发送给第三方 AI 服务 Groq 来撰写分析，并且只有在您于应用中点按“允许”之后才会发送。我们已开启 Groq 的零数据保留设置，因此 Groq 不会存储这些内容。',
    '我们不存储您的文档。文本和图片按每次请求处理，在报告返回后即被丢弃。',
    '您的分析历史仅保存在您的设备上。我们不会上传、同步或查看它。',
    '广告（如有展示）为非个性化广告——不进行跨应用跟踪，也无需跟踪授权提示。',
    '没有账号，无需注册，没有密码，永远如此。',
  ],
  sections: {
    collect: {
      h2: '我们收集什么',
      html: `      <p>Document Risk Analyzer 的设计目标是尽可能少地需要您的数据。以下是经过应用的全部内容：</p>
      <ul>
        <li><strong>您提供的文档内容</strong>——您上传的文件、粘贴的文本或拍摄的页面。应用通过 HTTPS 将其发送到我们的服务器，由服务器提取文本（照片使用文字识别）并定位个人标识信息。</li>
        <li><strong>遮盖后的分析文本</strong>——遮盖之后，文档的其余文本会发送给第三方 AI 服务 Groq 以生成您的风险报告——且仅在您于应用中授权之后才会发送。</li>
        <li><strong>本地历史记录</strong>——过往的分析保存在您设备自身的存储空间中，方便您再次查看。这些记录绝不会离开您的手机。</li>
        <li><strong>广告数据</strong>——如果在分析您的文档时展示了广告，Google AdMob 可能会收集有限的设备和互动数据。详情见下文。</li>
        <li><strong>基本服务器日志</strong>——我们的基础设施会记录标准的请求元数据（时间戳、状态码），用于保障可靠性和防止滥用。这些日志不包含您的文档内容。</li>
      </ul>`,
    },
    redaction: {
      h2: '遮盖如何运作',
      html: `      <p>在文档文本到达任何 AI 模型之前，我们的服务器会扫描其中的个人标识信息——电子邮箱地址、电话号码、社会安全号码及类似格式，以及姓名检测功能能够识别的人名——并将其替换为占位符。这一过程会对每份文档自动执行，且没有关闭它的设置。姓名检测只能尽力而为，可能会漏掉姓名，因此请把遮盖视为一种保护措施，而不是保证。</p>
      <p class="muted">在您选择继续之前，审阅界面会准确显示发现并遮盖了什么，让您亲眼看到被移除的内容，而不是只听我们说。</p>`,
    },
    'not-stored': {
      h2: '我们不存储什么',
      html: `      <ul>
        <li>报告生成后，我们不会保留您上传的文档、粘贴的文本或拍摄的照片。</li>
        <li>Groq 不会存储我们发送给它的文本：我们的账户已启用零数据保留。</li>
        <li>我们不创建用户账号，因此不持有与您相关的登录凭据、用户名或长期档案。</li>
        <li>我们不会出于任何原因向任何人出售您的数据。</li>
      </ul>
      <div class="data-table">
        <div class="col process">
          <div class="col-head">发送用于分析的内容</div>
          <dl>
            <dd>遮盖后的文档文本</dd>
            <dd>所选的文档类别</dd>
            <dd>文档分段序号（仅限较长的文件）</dd>
          </dl>
        </div>
        <div class="col never">
          <div class="col-head">从不收集</div>
          <dl>
            <dd>账号凭据</dd>
            <dd>支付信息</dd>
            <dd>精确位置</dd>
            <dd>应用之外的浏览活动</dd>
          </dl>
        </div>
      </div>`,
    },
    'ai-sharing': {
      h2: '与 AI 服务共享您的数据',
      html: `      <p>为了撰写您的风险分析，应用会将数据发送给第三方 AI 服务 <strong>Groq</strong>。在您首次分析之前，应用会告知您发送什么内容、发送给谁，并征求您的许可。如果您点按“不允许”，则不会向 Groq 发送任何内容，也不会进行任何分析。</p>
      <ul>
        <li><strong>发送什么：</strong>您文档遮盖后的文本、您选择的文档类型（或“自动”），以及对于分段分析的长文档，当前是第几段。</li>
        <li><strong>谁接收：</strong>Groq——它运行读取文本并撰写分析的 AI 模型。</li>
        <li><strong>为什么：</strong>仅用于生成您所要求的分析。我们不会将这些数据用于广告、营销或用户画像，也不会出售。</li>
        <li><strong>不发送什么：</strong>您的原始文件或照片、您的姓名或联系方式（我们不收集任何这类信息）、设备标识符，或您的分析历史。</li>
      </ul>
      <p>遮盖是自动进行的，针对姓名、电子邮箱地址、电话号码和社会安全号码等常见标识信息。它可能会漏掉一些细节，例如不常见的格式，或在自由文本中提到某个人或地点的内容，因此审阅界面会显示将要发送的确切文本的预览。如果您不放心发送某份文档，请不要提交。</p>
      <p>我们已在账户上开启 Groq 的零数据保留设置。这意味着 Groq 不会存储我们发送的文本及其返回的分析，因此在分析生成之后，Groq 不会保留您的文档文本。除此之外，Groq 对数据的处理受其自身条款和隐私政策约束，详见 groq.com。我们只发送上面列出的内容，且仅用于生成您的分析。</p>
      <p class="muted">您可以随时通过应用主屏幕上的“管理”链接关闭此授权。下次分析之前会再次询问您。</p>`,
    },
    'third-party': {
      h2: '第三方服务',
      html: `      <p><strong>Groq（AI 分析）。</strong>上文已详细说明。只会发送您文档文本遮盖后的版本，绝不会发送原文，且仅在获得您许可的情况下发送。</p>
      <p><strong>Google AdMob（广告）。</strong>为了让应用保持免费，应用可能会在分析您的文档时展示一条简短的广告。我们只请求非个性化广告，这意味着 AdMob 不会利用您在其他应用中的活动来向您投放广告，也不需要 App Tracking Transparency 授权。Google 仍可能处理设备标识符和粗略、非精确的信号，用于投放广告、衡量效果和防止欺诈，这些均受 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google 隐私政策</a>约束。</p>`,
    },
    choices: {
      h2: '您的选择',
      html: `      <ul>
        <li>拒绝 AI 共享授权，则不会向 Groq 发送任何内容。您也可以随时通过主屏幕上的“管理”将其关闭。</li>
        <li>您可以随时在应用内清除本地分析历史。</li>
        <li>卸载应用会删除存储在您设备上的所有历史记录和偏好设置。</li>
        <li>相机和照片库权限是可选的——拒绝后，只需改用文件上传或粘贴文本即可。</li>
      </ul>`,
    },
    security: {
      h2: '数据安全',
      html: `      <p>应用与我们服务器之间的所有流量在传输过程中均经过加密（HTTPS）。遮盖在您的文本到达任何 AI 服务提供方之前完成，从源头上限制了下游服务能够接触到的内容。</p>`,
    },
    children: {
      h2: '儿童隐私',
      html: `      <p>Document Risk Analyzer 并非面向 13 岁以下儿童，我们也不会有意收集儿童的信息。</p>`,
    },
    changes: {
      h2: '本政策的变更',
      html: `      <p>如果本政策发生变更，我们会更新本页顶部的生效日期。重大变更会在生效之前体现在此处。</p>`,
    },
    contact: {
      h2: '联系我们',
      html: `      <p>如对本政策或您的数据处理方式有疑问，请发送至：</p>
      <p class="contact"><a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a></p>`,
    },
  },
};

const terms = {
  htmlLang: 'zh',
  title: `${appName} 使用条款`,
  iconAlt: 'Document Risk Analyzer 图标',
  eyebrow: '使用条款',
  appName,
  effective: '生效日期',
  date: '2026年9月20日',
  translationNote: note,
  appliesTo: '适用于 iOS 和 Android 上的 Document Risk Analyzer。',
  questions: '有疑问？',
  privacyLabel: '隐私政策',
  supportLabel: '支持',
  disclaimer: '本页说明 Document Risk Analyzer 的提供条款。提供本页是出于透明度和应用商店合规的目的，不能替代独立的法律意见。',
  toc: {
    'no-legal-advice': '不构成法律意见',
    'ai-content': 'AI 生成的内容',
    'no-relationship': '不建立律师与客户关系',
    'acceptable-use': '可接受的使用',
    warranty: '不提供担保',
    liability: '责任',
    changes: '变更',
    contact: '联系我们',
  },
  summaryLabel: '简而言之',
  summary: [
    'Document Risk Analyzer 提供关于文档的一般性、自动化信息——它不是法律意见，使用它也不会建立律师与客户的关系。',
    '分析由 AI 模型生成，可能不完整、已过时或存在错误。在依赖任何重要内容之前，请务必向执业律师核实。',
    '本应用按“现状”提供，不附带任何担保，使用风险由您自行承担。',
  ],
  sections: {
    'no-legal-advice': {
      h2: '不构成法律意见',
      html: `      <p>Document Risk Analyzer 是一款信息工具。它使用 AI 模型来标出值得进一步留意的条款，并指出文档中未提及的常见保护措施。这些是一般性信息，并非针对您具体情况的法律意见，不应被视为您所在司法辖区执业律师意见的替代品。</p>
      <p>各地法律不尽相同，并会随时间变化。只有了解您的具体情况和所在司法辖区的合格律师，才能告诉您某份文档实际上如何适用于您。</p>`,
    },
    'ai-content': {
      h2: 'AI 生成的内容可能有误',
      html: `      <p>分析由大型语言模型生成，而不是由人工审阅者完成。与任何 AI 系统一样，它可能遗漏确实存在的问题、标出并非真正问题的内容，或误解含义模糊的措辞。它不了解您的个人情况、您所在地的法律，也不了解您提供的文本之外的事实。</p>
      <p>请将每一份分析视为您自行审阅的起点，而不是最终答案。</p>`,
    },
    'no-relationship': {
      h2: '不建立律师与客户关系',
      html: `      <p>使用本应用，包括与其 AI 生成的输出进行任何互动，均不会在您与本应用的开发者或任何其他方之间建立律师与客户关系。您提供的任何信息都不受律师与客户之间保密特权的保护。</p>`,
    },
    'acceptable-use': {
      h2: '可接受的使用',
      html: `      <p>您同意仅将本应用用于其预期用途——审阅您自己的文档，或您有正当权利审阅的文档——且不得用于任何非法目的。您对自己提交的文档和文本负责。</p>`,
    },
    warranty: {
      h2: '不提供担保',
      html: `      <p>本应用按“现状”和“可用状态”提供，不附带任何明示或默示的担保，包括对分析准确、完整或适用于特定目的的任何担保。</p>`,
    },
    liability: {
      h2: '责任限制',
      html: `      <p>在法律允许的最大范围内，Document Risk Analyzer 的开发者不对依赖本应用输出所作出的任何决定或采取的任何行动负责，也不对因您使用本应用而产生的任何损失或损害负责。</p>`,
    },
    changes: {
      h2: '本条款的变更',
      html: `      <p>随着应用的变化，本条款可能会不时更新。本页顶部的生效日期对应最新版本。</p>`,
    },
    contact: {
      h2: '联系我们',
      html: `      <p>如对本条款有疑问，请发送至 <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>。</p>`,
    },
  },
};

const support = {
  htmlLang: 'zh',
  title: `${appName} 支持`,
  iconAlt: 'Document Risk Analyzer 图标',
  eyebrow: '支持',
  appName,
  tagline: '常见问题的解答，以及遇到困难时如何联系我们。',
  translationNote: note,
  contactLabel: '联系我们',
  contactText: '错误报告、功能建议，或下面没有涉及的任何问题——我们会阅读每一封邮件。',
  faqHeading: '常见问题',
  privacyLabel: '隐私政策',
  termsLabel: '使用条款',
  faq: [
    { id: 'account', q: '我需要创建账号吗？', a: '不需要。没有注册、登录或个人档案——打开应用即可立即开始分析文档。' },
    { id: 'file-types', q: '支持哪些文件类型？', a: '支持上传 PDF 和 DOCX 文件、粘贴文本，以及用相机拍摄的页面。' },
    { id: 'privacy', q: '我的个人信息安全吗？', a: '在您的文档被发送进行 AI 分析之前，电子邮箱、电话号码、社会安全号码及类似标识信息会被自动遮盖，检测到的姓名也会被遮盖。检测并不完美，因此您可以预览将要发送的确切内容，并决定是否继续。详情请参阅完整的<a href="/privacy?lang=zh">隐私政策</a>。' },
    { id: 'ads', q: '为什么我会看到广告？', a: '本应用免费，由生成报告时展示的一条不打扰的广告支持。广告为非个性化广告——不会利用您在其他应用中的活动来向您投放。' },
    { id: 'history', q: '我可以删除分析历史吗？', a: '可以。在“历史”标签页中，您可以随时删除单条记录，或一次性清除全部记录。' },
    { id: 'report', q: '如何报告错误或提出功能建议？', a: '请发送邮件至 <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>——如果可以，报告错误时请附上您的设备型号和 iOS 版本。' },
  ],
};

module.exports = { privacy, terms, support };
