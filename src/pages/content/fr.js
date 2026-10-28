const note = 'Traduction fournie à titre indicatif. En cas de divergence, la version anglaise fait foi.';
const appName = 'Document Risk Analyzer';

const privacy = {
  htmlLang: 'fr',
  title: `${appName} – Politique de confidentialité`,
  iconAlt: 'Icône de Document Risk Analyzer',
  eyebrow: 'Politique de confidentialité',
  appName,
  effective: 'En vigueur depuis le',
  date: '3 octobre 2026',
  translationNote: note,
  appliesTo: 'S’applique à Document Risk Analyzer sur iOS et Android.',
  disclaimer: 'Cette page décrit les pratiques réelles de Document Risk Analyzer en matière de données à la date indiquée ci-dessus. Elle est fournie par souci de transparence et pour la conformité aux boutiques d’applications, et ne remplace pas un conseil juridique indépendant.',
  toc: {
    collect: 'Ce que nous collectons',
    redaction: 'Masquage des données',
    'ai-sharing': 'Analyse par IA',
    'not-stored': 'Ce que nous ne conservons pas',
    'third-party': 'Tiers',
    choices: 'Vos choix',
    security: 'Sécurité',
    children: 'Enfants',
    changes: 'Modifications',
    contact: 'Contact',
  },
  summaryLabel: 'En bref',
  summary: [
    'Votre document est analysé automatiquement pour repérer les identifiants personnels avant que quoi que ce soit ne soit envoyé à l’analyse par IA. Les adresses e-mail, numéros de téléphone, numéros de sécurité sociale et motifs similaires sont remplacés, ainsi que les noms lorsqu’ils sont détectés. La détection n’est pas parfaite : vous voyez donc un aperçu exact de ce qui sera envoyé.',
    'Le texte masqué est envoyé à Groq, un service d’IA tiers, pour rédiger votre analyse, et seulement après que vous avez appuyé sur Autoriser dans l’app. Nous avons activé le paramètre de rétention zéro des données de Groq : Groq ne le conserve donc pas.',
    'Nous ne conservons pas vos documents. Les textes et les images sont traités à chaque requête, puis supprimés dès que votre rapport est renvoyé.',
    'L’historique de vos analyses reste uniquement sur votre appareil. Nous ne le téléversons pas, ne le synchronisons pas et ne le voyons pas.',
    'Les publicités, lorsqu’elles s’affichent, ne sont pas personnalisées : pas de suivi entre applications, et aucune demande d’autorisation de suivi.',
    'Pas de compte, pas d’inscription, pas de mot de passe, jamais.',
  ],
  sections: {
    collect: {
      h2: 'Ce que nous collectons',
      html: `      <p>Document Risk Analyzer est conçue pour avoir besoin d’un minimum de vos données. Voici tout ce qui transite par l’app :</p>
      <ul>
        <li><strong>Le contenu du document que vous fournissez</strong> : un fichier que vous importez, un texte que vous collez ou une page que vous photographiez. L’app l’envoie en HTTPS à notre serveur, qui en extrait le texte (par reconnaissance de texte pour les photos) et repère les identifiants personnels.</li>
        <li><strong>Texte d’analyse masqué</strong> : après le masquage, le reste du texte du document est envoyé à Groq, un service d’IA tiers, pour générer votre rapport de risques, et seulement après que vous en avez donné l’autorisation dans l’app.</li>
        <li><strong>Historique local</strong> : les analyses passées sont enregistrées dans le stockage de votre propre appareil afin que vous puissiez les consulter à nouveau. Elles ne quittent jamais votre téléphone.</li>
        <li><strong>Données publicitaires</strong> : si une publicité s’affiche pendant l’analyse de votre document, Google AdMob peut collecter des données limitées sur l’appareil et les interactions. Détails ci-dessous.</li>
        <li><strong>Journaux de serveur de base</strong> : notre infrastructure enregistre des métadonnées de requête standard (horodatages, codes d’état) pour la fiabilité et la prévention des abus. Ces journaux ne contiennent pas le contenu de vos documents.</li>
      </ul>`,
    },
    redaction: {
      h2: 'Comment fonctionne le masquage',
      html: `      <p>Avant que le texte d’un document n’atteigne un modèle d’IA, notre serveur l’analyse pour repérer les identifiants personnels (adresses e-mail, numéros de téléphone, numéros de sécurité sociale et motifs similaires, ainsi que les noms de personnes lorsque sa détection de noms les reconnaît) et les remplace par des marqueurs. Cela se fait automatiquement, pour chaque document, sans possibilité de le désactiver. La détection des noms est faite au mieux et peut en manquer : considérez le masquage comme une protection, pas comme une garantie.</p>
      <p class="muted">L’écran de vérification vous montre exactement ce qui a été trouvé et masqué avant que vous ne choisissiez de continuer, pour que vous voyiez ce qui est retiré plutôt que de nous croire sur parole.</p>`,
    },
    'not-stored': {
      h2: 'Ce que nous ne conservons pas',
      html: `      <ul>
        <li>Nous ne conservons ni vos documents importés, ni le texte collé, ni les photographies une fois votre rapport généré.</li>
        <li>Groq ne conserve pas le texte que nous lui envoyons : la rétention zéro des données est activée sur notre compte.</li>
        <li>Nous ne créons pas de comptes utilisateur ; nous ne détenons donc ni identifiants de connexion, ni noms d’utilisateur, ni profils permanents vous concernant.</li>
        <li>Nous ne vendons vos données à personne, pour aucune raison.</li>
      </ul>
      <div class="data-table">
        <div class="col process">
          <div class="col-head">Envoyé pour l’analyse</div>
          <dl>
            <dd>texte du document masqué</dd>
            <dd>catégorie de document sélectionnée</dd>
            <dd>numéro de section du document (fichiers longs uniquement)</dd>
          </dl>
        </div>
        <div class="col never">
          <div class="col-head">Jamais collecté</div>
          <dl>
            <dd>identifiants de compte</dd>
            <dd>informations de paiement</dd>
            <dd>position précise</dd>
            <dd>activité de navigation en dehors de l’app</dd>
          </dl>
        </div>
      </div>`,
    },
    'ai-sharing': {
      h2: 'Partage de vos données avec un service d’IA',
      html: `      <p>Pour rédiger votre analyse de risques, l’app envoie des données à <strong>Groq</strong>, un service d’IA tiers. Avant votre première analyse, l’app vous indique ce qui est envoyé et à qui, et vous demande votre autorisation. Si vous appuyez sur « Ne pas autoriser », rien n’est envoyé à Groq et aucune analyse n’est réalisée.</p>
      <ul>
        <li><strong>Ce qui est envoyé :</strong> le texte masqué de votre document, le type de document que vous avez sélectionné (ou « auto ») et, pour les longs documents analysés par sections, de quelle section il s’agit.</li>
        <li><strong>Qui le reçoit :</strong> Groq, qui exécute le modèle d’IA qui lit le texte et rédige l’analyse.</li>
        <li><strong>Pourquoi :</strong> uniquement pour produire l’analyse que vous avez demandée. Nous n’utilisons pas ces données à des fins publicitaires, de marketing ou de profilage, et nous ne les vendons pas.</li>
        <li><strong>Ce qui n’est pas envoyé :</strong> votre fichier ou photo d’origine, votre nom ou vos coordonnées (nous n’en collectons aucune), les identifiants de l’appareil ou l’historique de vos analyses.</li>
      </ul>
      <p>Le masquage est automatique et cible les identifiants courants tels que les noms, adresses e-mail, numéros de téléphone et numéros de sécurité sociale. Il peut laisser passer certains détails, par exemple des formats inhabituels ou des mentions en texte libre d’une personne ou d’un lieu ; c’est pourquoi l’écran de vérification affiche un aperçu du texte exact qui sera envoyé. Veuillez ne pas soumettre un document que vous n’êtes pas à l’aise d’envoyer.</p>
      <p>Nous avons activé le paramètre de rétention zéro des données de Groq sur notre compte. Cela empêche Groq de conserver le texte que nous lui envoyons et l’analyse qu’il renvoie : Groq ne garde donc pas le texte de votre document après la génération de votre analyse. Pour le reste, le traitement des données par Groq est régi par ses propres conditions et sa politique de confidentialité, disponibles sur groq.com. Nous ne lui envoyons que ce qui est indiqué ci-dessus, et uniquement pour générer votre analyse.</p>
      <p class="muted">Vous pouvez retirer cette autorisation à tout moment avec le lien « Gérer » de l’écran d’accueil de l’app. Elle vous sera redemandée avant votre prochaine analyse.</p>`,
    },
    'third-party': {
      h2: 'Services tiers',
      html: `      <p><strong>Groq (analyse par IA).</strong> Décrit en détail ci-dessus. Seule la version masquée du texte de votre document est envoyée, jamais l’original, et uniquement avec votre autorisation.</p>
      <p><strong>Google AdMob (publicité).</strong> L’app peut afficher une courte publicité pendant l’analyse de votre document, afin de rester gratuite. Nous ne demandons que des publicités non personnalisées : AdMob n’utilise donc pas votre activité dans d’autres apps pour vous cibler, et aucune autorisation App Tracking Transparency n’est nécessaire. Google peut tout de même traiter un identifiant d’appareil et des signaux approximatifs, non précis, pour diffuser la publicité, mesurer ses performances et prévenir la fraude, conformément à la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Politique de confidentialité de Google</a>.</p>`,
    },
    choices: {
      h2: 'Vos choix',
      html: `      <ul>
        <li>Refusez l’autorisation de partage avec l’IA et rien n’est envoyé à Groq. Vous pouvez aussi la retirer à tout moment avec « Gérer » sur l’écran d’accueil.</li>
        <li>Effacez l’historique local de vos analyses à tout moment depuis l’app.</li>
        <li>La désinstallation de l’app supprime tout l’historique et toutes les préférences stockés sur votre appareil.</li>
        <li>L’accès à l’appareil photo et à la photothèque est facultatif : refusez-le et utilisez simplement l’import de fichier ou le texte collé.</li>
      </ul>`,
    },
    security: {
      h2: 'Sécurité des données',
      html: `      <p>Tout le trafic entre l’app et nos serveurs est chiffré en transit (HTTPS). Le masquage a lieu avant que votre texte n’atteigne un fournisseur d’IA, ce qui limite dès le départ ce à quoi tout service en aval est exposé.</p>`,
    },
    children: {
      h2: 'Confidentialité des enfants',
      html: `      <p>Document Risk Analyzer ne s’adresse pas aux enfants de moins de 13 ans et nous ne collectons pas sciemment d’informations auprès d’enfants.</p>`,
    },
    changes: {
      h2: 'Modifications de cette politique',
      html: `      <p>Si cette politique change, nous mettrons à jour la date d’entrée en vigueur en haut de cette page. Les modifications importantes y figureront avant leur prise d’effet.</p>`,
    },
    contact: {
      h2: 'Nous contacter',
      html: `      <p>Les questions sur cette politique ou sur le traitement de vos données peuvent être envoyées à :</p>
      <p class="contact"><a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a></p>`,
    },
  },
};

const terms = {
  htmlLang: 'fr',
  title: `${appName} – Conditions d’utilisation`,
  iconAlt: 'Icône de Document Risk Analyzer',
  eyebrow: 'Conditions d’utilisation',
  appName,
  effective: 'En vigueur depuis le',
  date: '20 septembre 2026',
  translationNote: note,
  appliesTo: 'S’applique à Document Risk Analyzer sur iOS et Android.',
  questions: 'Des questions ?',
  privacyLabel: 'Politique de confidentialité',
  supportLabel: 'Assistance',
  disclaimer: 'Cette page décrit les conditions dans lesquelles Document Risk Analyzer est fournie. Elle est fournie par souci de transparence et pour la conformité aux boutiques d’applications, et ne remplace pas un conseil juridique indépendant.',
  toc: {
    'no-legal-advice': 'Pas de conseil juridique',
    'ai-content': 'Contenu généré par IA',
    'no-relationship': 'Pas de relation avocat-client',
    'acceptable-use': 'Usage acceptable',
    warranty: 'Aucune garantie',
    liability: 'Responsabilité',
    changes: 'Modifications',
    contact: 'Contact',
  },
  summaryLabel: 'En bref',
  summary: [
    'Document Risk Analyzer fournit des informations générales et automatisées sur un document : il ne s’agit pas d’un conseil juridique, et son utilisation ne crée pas de relation avocat-client.',
    'Les analyses sont générées par un modèle d’IA et peuvent être incomplètes, périmées ou erronées. Faites toujours vérifier tout point important par un avocat avant de vous y fier.',
    'L’app est fournie « telle quelle », sans garantie, et vous l’utilisez à vos propres risques.',
  ],
  sections: {
    'no-legal-advice': {
      h2: 'Pas de conseil juridique',
      html: `      <p>Document Risk Analyzer est un outil d’information. Il utilise un modèle d’IA pour mettre en évidence des clauses qui méritent un examen plus attentif et pour signaler des protections usuelles qu’un document ne mentionne pas. Il s’agit d’informations générales, et non d’un conseil juridique adapté à votre situation particulière ; elles ne doivent pas remplacer l’avis d’un avocat inscrit au barreau dans votre juridiction.</p>
      <p>Les lois varient selon les lieux et évoluent avec le temps. Seul un avocat qualifié connaissant les détails de votre situation et de votre juridiction peut vous dire comment un document s’applique réellement à vous.</p>`,
    },
    'ai-content': {
      h2: 'Le contenu généré par IA peut être erroné',
      html: `      <p>Les analyses sont produites par un grand modèle de langage, et non par un relecteur humain. Comme tout système d’IA, il peut passer à côté de problèmes bien réels, signaler des points qui n’en sont pas vraiment, ou mal interpréter un texte ambigu. Il ne connaît ni votre situation personnelle, ni les lois de votre région, ni les faits extérieurs au texte que vous lui fournissez.</p>
      <p>Considérez chaque analyse comme un point de départ pour votre propre examen, et non comme une réponse définitive.</p>`,
    },
    'no-relationship': {
      h2: 'Pas de relation avocat-client',
      html: `      <p>L’utilisation de cette app, y compris toute interaction avec son résultat généré par IA, ne crée pas de relation avocat-client entre vous et le développeur de l’app ou toute autre partie. Aucune information que vous fournissez n’est protégée par le secret professionnel de l’avocat.</p>`,
    },
    'acceptable-use': {
      h2: 'Usage acceptable',
      html: `      <p>Vous vous engagez à n’utiliser l’app que pour sa finalité prévue (examiner vos propres documents, ou des documents que vous avez légitimement le droit d’examiner) et à ne pas l’utiliser à des fins illégales. Vous êtes responsable des documents et textes que vous soumettez.</p>`,
    },
    warranty: {
      h2: 'Aucune garantie',
      html: `      <p>L’app est fournie « telle quelle » et « selon disponibilité », sans garantie d’aucune sorte, expresse ou implicite, y compris toute garantie que l’analyse sera exacte, complète ou adaptée à un usage particulier.</p>`,
    },
    liability: {
      h2: 'Limitation de responsabilité',
      html: `      <p>Dans toute la mesure permise par la loi, le développeur de Document Risk Analyzer n’est responsable d’aucune décision prise ni d’aucune action entreprise en se fondant sur le résultat de l’app, ni d’aucune perte ou d’aucun dommage résultant de votre utilisation de l’app.</p>`,
    },
    changes: {
      h2: 'Modifications de ces conditions',
      html: `      <p>Ces conditions peuvent être mises à jour de temps à autre au fil de l’évolution de l’app. La date d’entrée en vigueur en haut de cette page correspond à la version la plus récente.</p>`,
    },
    contact: {
      h2: 'Contact',
      html: `      <p>Les questions sur ces conditions peuvent être envoyées à <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>.</p>`,
    },
  },
};

const support = {
  htmlLang: 'fr',
  title: `${appName} – Assistance`,
  iconAlt: 'Icône de Document Risk Analyzer',
  eyebrow: 'Assistance',
  appName,
  tagline: 'Des réponses aux questions courantes, et comment nous joindre si vous êtes bloqué.',
  translationNote: note,
  contactLabel: 'Nous contacter',
  contactText: 'Signalements de bugs, suggestions de fonctionnalités ou tout ce qui n’est pas couvert ci-dessous : nous lisons chaque e-mail.',
  faqHeading: 'Questions fréquentes',
  privacyLabel: 'Politique de confidentialité',
  termsLabel: 'Conditions d’utilisation',
  credit: 'Idée originale de Chrystal Ding',
  faq: [
    { id: 'account', q: 'Dois-je créer un compte ?', a: 'Non. Il n’y a ni inscription, ni connexion, ni profil : ouvrez l’app et commencez tout de suite à analyser un document.' },
    { id: 'file-types', q: 'Quels types de fichiers sont pris en charge ?', a: 'Les fichiers PDF et DOCX, le texte collé et les pages photographiées avec votre appareil photo.' },
    { id: 'privacy', q: 'Mes informations personnelles sont-elles en sécurité ?', a: 'Les adresses e-mail, numéros de téléphone, numéros de sécurité sociale et identifiants similaires sont automatiquement masqués, ainsi que les noms lorsqu’ils sont détectés, avant que votre document ne soit envoyé à l’analyse par IA. La détection n’est pas parfaite : vous pouvez donc voir un aperçu exact de ce qui sera envoyé et décider de continuer ou non. Consultez la <a href="/privacy?lang=fr">Politique de confidentialité</a> complète pour plus de détails.' },
    { id: 'ads', q: 'Pourquoi vois-je une publicité ?', a: 'L’app est gratuite, financée par une seule publicité discrète affichée pendant la génération de votre rapport. Les publicités ne sont pas personnalisées : elles n’utilisent pas votre activité dans d’autres apps pour vous cibler.' },
    { id: 'history', q: 'Puis-je supprimer l’historique de mes analyses ?', a: 'Oui. Depuis l’onglet Historique, vous pouvez supprimer des entrées une par une ou tout effacer d’un coup, à tout moment.' },
    { id: 'report', q: 'Comment signaler un bug ou demander une fonctionnalité ?', a: 'Écrivez à <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a> ; si possible, indiquez le modèle de votre appareil et votre version d’iOS pour les signalements de bugs.' },
  ],
};

module.exports = { privacy, terms, support };
