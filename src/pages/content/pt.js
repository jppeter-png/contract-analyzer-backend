const note = 'Tradução fornecida por conveniência. Em caso de divergência, prevalece a versão em inglês.';
const appName = 'Document Risk Analyzer';

const privacy = {
  htmlLang: 'pt',
  title: `${appName} – Política de Privacidade`,
  iconAlt: 'Ícone do Document Risk Analyzer',
  eyebrow: 'Política de Privacidade',
  appName,
  effective: 'Em vigor desde',
  date: '3 de outubro de 2026',
  translationNote: note,
  appliesTo: 'Aplica-se ao Document Risk Analyzer no iOS e no Android.',
  disclaimer: 'Esta página descreve as práticas reais de dados do Document Risk Analyzer na data indicada acima. É fornecida por transparência e para conformidade com as lojas de aplicativos, e não substitui aconselhamento jurídico independente.',
  toc: {
    collect: 'O que coletamos',
    redaction: 'Ocultação de dados',
    'ai-sharing': 'Análise por IA',
    'not-stored': 'O que não armazenamos',
    'third-party': 'Terceiros',
    choices: 'Suas escolhas',
    security: 'Segurança',
    children: 'Crianças',
    changes: 'Alterações',
    contact: 'Contato',
  },
  summaryLabel: 'Em resumo',
  summary: [
    'Seu documento é verificado automaticamente em busca de identificadores pessoais antes de qualquer coisa ser enviada para a análise por IA. E-mails, números de telefone, números de previdência social e padrões semelhantes são substituídos, e os nomes também, quando detectados. A detecção não é perfeita, por isso você vê uma prévia exata do que será enviado.',
    'O texto com os dados ocultados é enviado à Groq, um serviço de IA de terceiros, para escrever sua análise, e somente depois que você toca em Permitir no app. Ativamos a configuração de retenção zero de dados da Groq, então a Groq não o armazena.',
    'Não armazenamos seus documentos. Textos e imagens são processados a cada solicitação e descartados assim que seu relatório é devolvido.',
    'O histórico das suas análises fica somente no seu dispositivo. Não o enviamos, não o sincronizamos e não o vemos.',
    'Os anúncios, quando exibidos, não são personalizados: sem rastreamento entre apps e sem pedido de permissão de rastreamento.',
    'Sem conta, sem cadastro, sem senha, nunca.',
  ],
  sections: {
    collect: {
      h2: 'O que coletamos',
      html: `      <p>O Document Risk Analyzer foi criado para precisar do mínimo possível dos seus dados. Isto é tudo o que passa pelo app:</p>
      <ul>
        <li><strong>O conteúdo do documento que você fornece</strong>: um arquivo que você envia, um texto que você cola ou uma página que você fotografa. O app o envia por HTTPS ao nosso servidor, que extrai o texto (usando reconhecimento de texto no caso de fotos) e localiza os identificadores pessoais.</li>
        <li><strong>Texto de análise com dados ocultados</strong>: após a ocultação, o restante do texto do documento é enviado à Groq, um serviço de IA de terceiros, para gerar seu relatório de riscos, e somente depois que você der permissão no app.</li>
        <li><strong>Histórico local</strong>: as análises anteriores são salvas no armazenamento do seu próprio dispositivo para que você possa revê-las. Elas nunca saem do seu celular.</li>
        <li><strong>Dados de publicidade</strong>: se um anúncio for exibido enquanto seu documento é analisado, o Google AdMob pode coletar dados limitados do dispositivo e de interação. Detalhes abaixo.</li>
        <li><strong>Registros básicos do servidor</strong>: nossa infraestrutura registra metadados padrão das solicitações (carimbos de data e hora, códigos de status) para confiabilidade e prevenção de abusos. Esses registros não incluem o conteúdo dos seus documentos.</li>
      </ul>`,
    },
    redaction: {
      h2: 'Como funciona a ocultação de dados',
      html: `      <p>Antes de o texto de um documento chegar a um modelo de IA, nosso servidor o verifica em busca de identificadores pessoais (endereços de e-mail, números de telefone, números de previdência social e padrões semelhantes, além de nomes de pessoas quando a detecção de nomes os reconhece) e os substitui por marcadores. Isso acontece automaticamente, em todos os documentos, e não há configuração para desativar. A detecção de nomes é feita da melhor forma possível e pode deixar nomes passarem; trate a ocultação como uma medida de proteção, não como uma garantia.</p>
      <p class="muted">A tela de revisão mostra exatamente o que foi encontrado e ocultado antes de você decidir continuar, para que você veja o que está sendo removido em vez de confiar apenas na nossa palavra.</p>`,
    },
    'not-stored': {
      h2: 'O que não armazenamos',
      html: `      <ul>
        <li>Não retemos seus documentos enviados, textos colados ou fotografias depois que seu relatório é gerado.</li>
        <li>A Groq não armazena o texto que enviamos: a retenção zero de dados está ativada em nossa conta.</li>
        <li>Não criamos contas de usuário, portanto não mantemos credenciais de acesso, nomes de usuário ou perfis permanentes ligados a você.</li>
        <li>Não vendemos seus dados a ninguém, por nenhum motivo.</li>
      </ul>
      <div class="data-table">
        <div class="col process">
          <div class="col-head">Enviado para análise</div>
          <dl>
            <dd>texto do documento com dados ocultados</dd>
            <dd>categoria de documento selecionada</dd>
            <dd>índice da seção do documento (somente arquivos longos)</dd>
          </dl>
        </div>
        <div class="col never">
          <div class="col-head">Nunca coletado</div>
          <dl>
            <dd>credenciais de conta</dd>
            <dd>informações de pagamento</dd>
            <dd>localização precisa</dd>
            <dd>atividade de navegação fora do app</dd>
          </dl>
        </div>
      </div>`,
    },
    'ai-sharing': {
      h2: 'Compartilhamento dos seus dados com um serviço de IA',
      html: `      <p>Para escrever sua análise de riscos, o app envia dados à <strong>Groq</strong>, um serviço de IA de terceiros. Antes da sua primeira análise, o app informa o que é enviado e a quem, e pede sua permissão. Se você tocar em “Não permitir”, nada é enviado à Groq e nenhuma análise é executada.</p>
      <ul>
        <li><strong>O que é enviado:</strong> o texto do seu documento com os dados ocultados, o tipo de documento que você selecionou (ou “auto”) e, para documentos longos analisados em seções, qual é a seção.</li>
        <li><strong>Quem recebe:</strong> a Groq, que executa o modelo de IA que lê o texto e escreve a análise.</li>
        <li><strong>Por quê:</strong> somente para produzir a análise que você pediu. Não usamos esses dados para publicidade, marketing ou criação de perfis, e não os vendemos.</li>
        <li><strong>O que não é enviado:</strong> seu arquivo ou foto original, seu nome ou dados de contato (não coletamos nenhum), identificadores do dispositivo ou o histórico das suas análises.</li>
      </ul>
      <p>A ocultação é automática e tem como alvo identificadores comuns, como nomes, endereços de e-mail, números de telefone e números de previdência social. Ela pode deixar passar detalhes, por exemplo formatos incomuns ou referências em texto livre a uma pessoa ou a um lugar; por isso a tela de revisão exibe uma prévia do texto exato que será enviado. Por favor, não envie um documento que você não se sinta à vontade para enviar.</p>
      <p>Ativamos a configuração de retenção zero de dados da Groq em nossa conta. Isso impede que a Groq armazene o texto que enviamos e a análise que ela devolve, de modo que a Groq não guarda o texto do seu documento depois que a análise é gerada. No mais, o tratamento de dados pela Groq é regido pelos próprios termos e pela política de privacidade da Groq, disponíveis em groq.com. Enviamos a ela somente o que está listado acima, e somente para gerar sua análise.</p>
      <p class="muted">Você pode desativar essa permissão a qualquer momento com o link “Gerenciar” na tela inicial do app. Você será perguntado novamente antes da sua próxima análise.</p>`,
    },
    'third-party': {
      h2: 'Serviços de terceiros',
      html: `      <p><strong>Groq (análise por IA).</strong> Descrita em detalhes acima. Somente a versão com os dados ocultados do texto do seu documento é enviada, nunca o original, e somente com a sua permissão.</p>
      <p><strong>Google AdMob (publicidade).</strong> O app pode exibir um anúncio curto enquanto seu documento é analisado, para manter o app gratuito. Solicitamos apenas anúncios não personalizados, o que significa que o AdMob não usa sua atividade em outros apps para direcionar anúncios a você, e a permissão de App Tracking Transparency não é necessária. O Google ainda pode processar um identificador do dispositivo e sinais aproximados, não precisos, para exibir o anúncio, medir o desempenho e prevenir fraudes, conforme a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política de Privacidade do Google</a>.</p>`,
    },
    choices: {
      h2: 'Suas escolhas',
      html: `      <ul>
        <li>Recuse a permissão de compartilhamento com a IA e nada é enviado à Groq. Você também pode desativá-la a qualquer momento com “Gerenciar” na tela inicial.</li>
        <li>Apague o histórico local das suas análises a qualquer momento, dentro do app.</li>
        <li>Desinstalar o app remove todo o histórico e as preferências armazenados no seu dispositivo.</li>
        <li>O acesso à câmera e à biblioteca de fotos é opcional: recuse-o e use simplesmente o envio de arquivos ou o texto colado.</li>
      </ul>`,
    },
    security: {
      h2: 'Segurança dos dados',
      html: `      <p>Todo o tráfego entre o app e nossos servidores é criptografado em trânsito (HTTPS). A ocultação acontece antes de o seu texto chegar a um provedor de IA, o que limita, desde o início, ao que qualquer serviço posterior fica exposto.</p>`,
    },
    children: {
      h2: 'Privacidade de crianças',
      html: `      <p>O Document Risk Analyzer não é direcionado a crianças menores de 13 anos, e não coletamos conscientemente informações de crianças.</p>`,
    },
    changes: {
      h2: 'Alterações nesta política',
      html: `      <p>Se esta política mudar, atualizaremos a data de vigência no topo desta página. As alterações relevantes serão refletidas aqui antes de entrarem em vigor.</p>`,
    },
    contact: {
      h2: 'Fale conosco',
      html: `      <p>Dúvidas sobre esta política ou sobre como seus dados são tratados podem ser enviadas para:</p>
      <p class="contact"><a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a></p>`,
    },
  },
};

const terms = {
  htmlLang: 'pt',
  title: `${appName} – Termos de Uso`,
  iconAlt: 'Ícone do Document Risk Analyzer',
  eyebrow: 'Termos de Uso',
  appName,
  effective: 'Em vigor desde',
  date: '20 de setembro de 2026',
  translationNote: note,
  appliesTo: 'Aplica-se ao Document Risk Analyzer no iOS e no Android.',
  questions: 'Dúvidas?',
  privacyLabel: 'Política de Privacidade',
  supportLabel: 'Suporte',
  disclaimer: 'Esta página descreve os termos sob os quais o Document Risk Analyzer é oferecido. É fornecida por transparência e para conformidade com as lojas de aplicativos, e não substitui aconselhamento jurídico independente.',
  toc: {
    'no-legal-advice': 'Sem aconselhamento jurídico',
    'ai-content': 'Conteúdo gerado por IA',
    'no-relationship': 'Sem relação advogado-cliente',
    'acceptable-use': 'Uso aceitável',
    warranty: 'Sem garantia',
    liability: 'Responsabilidade',
    changes: 'Alterações',
    contact: 'Contato',
  },
  summaryLabel: 'Em resumo',
  summary: [
    'O Document Risk Analyzer fornece informações gerais e automatizadas sobre um documento: não é aconselhamento jurídico, e usá-lo não cria uma relação advogado-cliente.',
    'As análises são geradas por um modelo de IA e podem ser incompletas, desatualizadas ou erradas. Sempre confirme qualquer coisa importante com um advogado habilitado antes de confiar nela.',
    'O app é fornecido “como está”, sem garantia, e o uso é por sua conta e risco.',
  ],
  sections: {
    'no-legal-advice': {
      h2: 'Não é aconselhamento jurídico',
      html: `      <p>O Document Risk Analyzer é uma ferramenta informativa. Ele usa um modelo de IA para destacar cláusulas que podem merecer uma análise mais atenta e para apontar proteções padrão que um documento não menciona. São informações gerais, não aconselhamento jurídico adaptado à sua situação específica, e não devem ser tratadas como substituto do conselho de um advogado habilitado na sua jurisdição.</p>
      <p>As leis variam conforme o local e mudam com o tempo. Somente um advogado qualificado que conheça os detalhes da sua situação e da sua jurisdição pode dizer como um documento realmente se aplica a você.</p>`,
    },
    'ai-content': {
      h2: 'O conteúdo gerado por IA pode estar errado',
      html: `      <p>As análises são produzidas por um grande modelo de linguagem, não por um revisor humano. Como qualquer sistema de IA, ele pode deixar de perceber problemas que realmente existem, apontar coisas que na verdade não são um problema ou interpretar mal uma linguagem ambígua. Ele não conhece suas circunstâncias pessoais, as leis do seu local nem fatos externos ao texto que você fornece.</p>
      <p>Trate cada análise como um ponto de partida para a sua própria revisão, não como uma resposta final.</p>`,
    },
    'no-relationship': {
      h2: 'Sem relação advogado-cliente',
      html: `      <p>Usar este app, incluindo qualquer interação com o resultado gerado por IA, não cria uma relação advogado-cliente entre você e o desenvolvedor do app ou qualquer outra parte. Nenhuma informação que você fornecer é protegida pelo sigilo profissional entre advogado e cliente.</p>`,
    },
    'acceptable-use': {
      h2: 'Uso aceitável',
      html: `      <p>Você concorda em usar o app somente para a finalidade pretendida (revisar seus próprios documentos, ou documentos que você tenha o direito legítimo de revisar) e não para qualquer fim ilícito. Você é responsável pelos documentos e textos que enviar.</p>`,
    },
    warranty: {
      h2: 'Sem garantia',
      html: `      <p>O app é fornecido “como está” e “conforme disponível”, sem garantias de qualquer tipo, expressas ou implícitas, incluindo qualquer garantia de que a análise seja precisa, completa ou adequada a uma finalidade específica.</p>`,
    },
    liability: {
      h2: 'Limitação de responsabilidade',
      html: `      <p>Na máxima extensão permitida por lei, o desenvolvedor do Document Risk Analyzer não é responsável por qualquer decisão tomada ou ação realizada com base no resultado do app, nem por qualquer perda ou dano decorrente do seu uso do app.</p>`,
    },
    changes: {
      h2: 'Alterações nestes termos',
      html: `      <p>Estes termos podem ser atualizados de tempos em tempos conforme o app mudar. A data de vigência no topo desta página corresponde à versão mais recente.</p>`,
    },
    contact: {
      h2: 'Contato',
      html: `      <p>Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>.</p>`,
    },
  },
};

const support = {
  htmlLang: 'pt',
  title: `${appName} – Suporte`,
  iconAlt: 'Ícone do Document Risk Analyzer',
  eyebrow: 'Suporte',
  appName,
  tagline: 'Respostas para perguntas comuns e como falar conosco se você tiver problemas.',
  translationNote: note,
  contactLabel: 'Fale conosco',
  contactText: 'Relatos de erros, sugestões de recursos ou qualquer coisa que não esteja abaixo: lemos todos os e-mails.',
  faqHeading: 'Perguntas frequentes',
  privacyLabel: 'Política de Privacidade',
  termsLabel: 'Termos de Uso',
  credit: 'Ideia original de Chrystal Ding',
  faq: [
    { id: 'account', q: 'Preciso criar uma conta?', a: 'Não. Não há cadastro, login nem perfil: abra o app e comece a analisar um documento na hora.' },
    { id: 'file-types', q: 'Quais tipos de arquivo são aceitos?', a: 'Arquivos PDF e DOCX, texto colado e páginas fotografadas com a câmera.' },
    { id: 'privacy', q: 'Minhas informações pessoais estão seguras?', a: 'E-mails, números de telefone, números de previdência social e identificadores semelhantes são ocultados automaticamente, e os nomes também, quando detectados, antes de o seu documento ser enviado para a análise por IA. A detecção não é perfeita, por isso você pode ver uma prévia exata do que será enviado e decidir se continua. Consulte a <a href="/privacy?lang=pt">Política de Privacidade</a> completa para mais detalhes.' },
    { id: 'ads', q: 'Por que vejo um anúncio?', a: 'O app é gratuito, mantido por um único anúncio discreto exibido enquanto seu relatório é gerado. Os anúncios não são personalizados: eles não usam sua atividade em outros apps para direcionar anúncios a você.' },
    { id: 'history', q: 'Posso apagar o histórico das minhas análises?', a: 'Sim. Na aba Histórico, você pode excluir entradas individuais ou limpar tudo de uma vez, a qualquer momento.' },
    { id: 'report', q: 'Como relato um erro ou peço um recurso?', a: 'Escreva para <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>; se puder, inclua o modelo do seu dispositivo e a versão do iOS nos relatos de erros.' },
  ],
};

module.exports = { privacy, terms, support };
