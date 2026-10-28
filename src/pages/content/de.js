const note = 'Übersetzung zur Orientierung. Bei Abweichungen gilt die englische Fassung.';
const appName = 'Document Risk Analyzer';

const privacy = {
  htmlLang: 'de',
  title: `${appName} – Datenschutzerklärung`,
  iconAlt: 'Symbol von Document Risk Analyzer',
  eyebrow: 'Datenschutzerklärung',
  appName,
  effective: 'Gültig ab',
  date: '3. Oktober 2026',
  translationNote: note,
  appliesTo: 'Gilt für Document Risk Analyzer auf iOS und Android.',
  disclaimer: 'Diese Seite beschreibt die tatsächliche Datenverarbeitung von Document Risk Analyzer zum oben genannten Datum. Sie dient der Transparenz und der Einhaltung der Vorgaben der App-Stores und ersetzt keine unabhängige Rechtsberatung.',
  toc: {
    collect: 'Was wir erfassen',
    redaction: 'Schwärzung',
    'ai-sharing': 'KI-Analyse',
    'not-stored': 'Was wir nicht speichern',
    'third-party': 'Drittanbieter',
    choices: 'Ihre Optionen',
    security: 'Sicherheit',
    children: 'Kinder',
    changes: 'Änderungen',
    contact: 'Kontakt',
  },
  summaryLabel: 'Kurz gesagt',
  summary: [
    'Ihr Dokument wird automatisch auf persönliche Kennungen durchsucht, bevor irgendetwas zur KI-Analyse gesendet wird. E-Mail-Adressen, Telefonnummern, Sozialversicherungsnummern und ähnliche Muster werden ersetzt, ebenso Namen, sofern sie erkannt werden. Die Erkennung ist nicht perfekt, deshalb sehen Sie eine Vorschau dessen, was genau gesendet wird.',
    'Der geschwärzte Text wird an Groq, einen KI-Dienst eines Drittanbieters, gesendet, um Ihre Analyse zu erstellen – und zwar erst, nachdem Sie in der App auf „Erlauben“ getippt haben. Wir haben die Einstellung „Zero Data Retention“ von Groq aktiviert, sodass Groq den Text nicht speichert.',
    'Wir speichern Ihre Dokumente nicht. Texte und Bilder werden pro Anfrage verarbeitet und verworfen, sobald Ihr Bericht zurückgegeben wurde.',
    'Ihr Analyseverlauf bleibt ausschließlich auf Ihrem Gerät. Wir laden ihn nicht hoch, synchronisieren ihn nicht und sehen ihn nicht.',
    'Werbung, sofern angezeigt, ist nicht personalisiert – kein App-übergreifendes Tracking und keine Abfrage der Tracking-Erlaubnis.',
    'Kein Konto, keine Registrierung, kein Passwort – niemals.',
  ],
  sections: {
    collect: {
      h2: 'Was wir erfassen',
      html: `      <p>Document Risk Analyzer ist so gebaut, dass möglichst wenige Ihrer Daten benötigt werden. Das ist alles, was durch die App läuft:</p>
      <ul>
        <li><strong>Dokumentinhalt, den Sie bereitstellen</strong> – eine Datei, die Sie hochladen, ein Text, den Sie einfügen, oder eine Seite, die Sie fotografieren. Die App sendet ihn per HTTPS an unseren Server, der den Text extrahiert (bei Fotos mithilfe von Texterkennung) und persönliche Kennungen ermittelt.</li>
        <li><strong>Geschwärzter Analysetext</strong> – nach der Schwärzung wird der verbleibende Dokumenttext an Groq, einen KI-Dienst eines Drittanbieters, gesendet, um Ihren Risikobericht zu erstellen – erst nachdem Sie in der App Ihre Erlaubnis erteilt haben.</li>
        <li><strong>Lokaler Verlauf</strong> – frühere Analysen werden im Speicher Ihres eigenen Geräts abgelegt, damit Sie sie erneut ansehen können. Dieser Verlauf verlässt Ihr Telefon nie.</li>
        <li><strong>Werbedaten</strong> – wenn während der Analyse Ihres Dokuments eine Anzeige erscheint, kann Google AdMob begrenzte Geräte- und Interaktionsdaten erfassen. Details unten.</li>
        <li><strong>Einfache Serverprotokolle</strong> – unsere Infrastruktur protokolliert übliche Anfragemetadaten (Zeitstempel, Statuscodes) für Zuverlässigkeit und Missbrauchsprävention. Diese Protokolle enthalten nicht den Inhalt Ihrer Dokumente.</li>
      </ul>`,
    },
    redaction: {
      h2: 'So funktioniert die Schwärzung',
      html: `      <p>Bevor Dokumenttext ein KI-Modell erreicht, durchsucht unser Server ihn nach persönlichen Kennungen – E-Mail-Adressen, Telefonnummern, Sozialversicherungsnummern und ähnlichen Mustern sowie Personennamen, soweit die Namenserkennung sie findet – und ersetzt sie durch Platzhalter. Das geschieht automatisch bei jedem Dokument, und es gibt keine Einstellung, um es abzuschalten. Die Namenserkennung arbeitet nach bestem Bemühen und kann Namen übersehen; betrachten Sie die Schwärzung daher als Schutzmaßnahme, nicht als Garantie.</p>
      <p class="muted">Der Prüfbildschirm zeigt Ihnen genau, was gefunden und geschwärzt wurde, bevor Sie fortfahren – so sehen Sie, was entfernt wird, statt uns einfach zu glauben.</p>`,
    },
    'not-stored': {
      h2: 'Was wir nicht speichern',
      html: `      <ul>
        <li>Wir bewahren Ihre hochgeladenen Dokumente, eingefügten Texte oder Fotos nach der Erstellung Ihres Berichts nicht auf.</li>
        <li>Groq speichert den Text, den wir senden, nicht: Zero Data Retention ist für unser Konto aktiviert.</li>
        <li>Wir legen keine Benutzerkonten an und halten daher keine Anmeldedaten, Benutzernamen oder dauerhaften Profile, die Ihnen zugeordnet wären.</li>
        <li>Wir verkaufen Ihre Daten an niemanden, aus keinem Grund.</li>
      </ul>
      <div class="data-table">
        <div class="col process">
          <div class="col-head">Zur Analyse gesendet</div>
          <dl>
            <dd>geschwärzter Dokumenttext</dd>
            <dd>ausgewählte Dokumentkategorie</dd>
            <dd>Abschnittsnummer des Dokuments (nur bei langen Dateien)</dd>
          </dl>
        </div>
        <div class="col never">
          <div class="col-head">Nie erfasst</div>
          <dl>
            <dd>Kontozugangsdaten</dd>
            <dd>Zahlungsinformationen</dd>
            <dd>genauer Standort</dd>
            <dd>Browsing-Aktivität außerhalb der App</dd>
          </dl>
        </div>
      </div>`,
    },
    'ai-sharing': {
      h2: 'Weitergabe Ihrer Daten an einen KI-Dienst',
      html: `      <p>Um Ihre Risikoanalyse zu erstellen, sendet die App Daten an <strong>Groq</strong>, einen KI-Dienst eines Drittanbieters. Vor Ihrer ersten Analyse teilt Ihnen die App mit, was an wen gesendet wird, und bittet um Ihre Erlaubnis. Wenn Sie auf „Nicht erlauben“ tippen, wird nichts an Groq gesendet und es wird keine Analyse durchgeführt.</p>
      <ul>
        <li><strong>Was gesendet wird:</strong> der geschwärzte Text Ihres Dokuments, der von Ihnen gewählte Dokumenttyp (oder „auto“) und – bei langen Dokumenten, die abschnittsweise analysiert werden – um welchen Abschnitt es sich handelt.</li>
        <li><strong>Wer es erhält:</strong> Groq, das das KI-Modell betreibt, welches den Text liest und die Analyse schreibt.</li>
        <li><strong>Warum:</strong> ausschließlich, um die von Ihnen angeforderte Analyse zu erstellen. Wir verwenden diese Daten nicht für Werbung, Marketing oder Profilbildung und verkaufen sie nicht.</li>
        <li><strong>Was nicht gesendet wird:</strong> Ihre Originaldatei oder Ihr Originalfoto, Ihr Name oder Ihre Kontaktdaten (wir erfassen keine), Gerätekennungen oder Ihr Analyseverlauf.</li>
      </ul>
      <p>Die Schwärzung erfolgt automatisch und zielt auf gängige Kennungen wie Namen, E-Mail-Adressen, Telefonnummern und Sozialversicherungsnummern. Sie kann Angaben übersehen, zum Beispiel ungewöhnliche Formate oder Freitext-Verweise auf eine Person oder einen Ort; deshalb zeigt der Prüfbildschirm eine Vorschau des genauen Textes, der gesendet wird. Bitte reichen Sie kein Dokument ein, dessen Versand Ihnen unangenehm ist.</p>
      <p>Wir haben die Einstellung „Zero Data Retention“ von Groq für unser Konto aktiviert. Damit ist ausgeschlossen, dass Groq den von uns gesendeten Text und die zurückgegebene Analyse speichert; Groq behält Ihren Dokumenttext also nicht, nachdem Ihre Analyse erstellt wurde. Im Übrigen unterliegt der Umgang von Groq mit Daten den eigenen Bedingungen und der Datenschutzerklärung von Groq, abrufbar unter groq.com. Wir senden nur das oben Aufgeführte und nur, um Ihre Analyse zu erstellen.</p>
      <p class="muted">Sie können diese Erlaubnis jederzeit über den Link „Verwalten“ auf dem Startbildschirm der App ausschalten. Vor Ihrer nächsten Analyse werden Sie erneut gefragt.</p>`,
    },
    'third-party': {
      h2: 'Dienste von Drittanbietern',
      html: `      <p><strong>Groq (KI-Analyse).</strong> Oben ausführlich beschrieben. Es wird nur die geschwärzte Fassung Ihres Dokumenttextes gesendet, niemals das Original, und nur mit Ihrer Erlaubnis.</p>
      <p><strong>Google AdMob (Werbung).</strong> Die App kann während der Analyse Ihres Dokuments eine kurze Anzeige zeigen, um kostenlos zu bleiben. Wir fordern ausschließlich nicht personalisierte Anzeigen an; AdMob nutzt Ihre Aktivität in anderen Apps also nicht, um Sie anzusprechen, und die Erlaubnis „App Tracking Transparency“ ist nicht erforderlich. Google kann dennoch eine Gerätekennung und grobe, nicht präzise Signale verarbeiten, um die Anzeige auszuliefern, ihre Leistung zu messen und Betrug zu verhindern – gemäß der <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Datenschutzerklärung von Google</a>.</p>`,
    },
    choices: {
      h2: 'Ihre Optionen',
      html: `      <ul>
        <li>Lehnen Sie die Erlaubnis zur KI-Weitergabe ab, wird nichts an Groq gesendet. Sie können sie auch jederzeit über „Verwalten“ auf dem Startbildschirm ausschalten.</li>
        <li>Löschen Sie Ihren lokalen Analyseverlauf jederzeit in der App.</li>
        <li>Wenn Sie die App deinstallieren, werden alle auf Ihrem Gerät gespeicherten Verlaufsdaten und Einstellungen entfernt.</li>
        <li>Der Zugriff auf Kamera und Fotomediathek ist optional – lehnen Sie ihn ab und nutzen Sie stattdessen den Datei-Upload oder eingefügten Text.</li>
      </ul>`,
    },
    security: {
      h2: 'Datensicherheit',
      html: `      <p>Der gesamte Datenverkehr zwischen der App und unseren Servern ist während der Übertragung verschlüsselt (HTTPS). Die Schwärzung erfolgt, bevor Ihr Text einen KI-Anbieter erreicht, wodurch von vornherein begrenzt wird, was nachgelagerten Diensten zugänglich wird.</p>`,
    },
    children: {
      h2: 'Datenschutz für Kinder',
      html: `      <p>Document Risk Analyzer richtet sich nicht an Kinder unter 13 Jahren, und wir erfassen wissentlich keine Informationen von Kindern.</p>`,
    },
    changes: {
      h2: 'Änderungen dieser Erklärung',
      html: `      <p>Wenn sich diese Erklärung ändert, aktualisieren wir das Datum des Inkrafttretens oben auf dieser Seite. Wesentliche Änderungen werden hier abgebildet, bevor sie wirksam werden.</p>`,
    },
    contact: {
      h2: 'Kontakt',
      html: `      <p>Fragen zu dieser Erklärung oder zum Umgang mit Ihren Daten können Sie senden an:</p>
      <p class="contact"><a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a></p>`,
    },
  },
};

const terms = {
  htmlLang: 'de',
  title: `${appName} – Nutzungsbedingungen`,
  iconAlt: 'Symbol von Document Risk Analyzer',
  eyebrow: 'Nutzungsbedingungen',
  appName,
  effective: 'Gültig ab',
  date: '20. September 2026',
  translationNote: note,
  appliesTo: 'Gilt für Document Risk Analyzer auf iOS und Android.',
  questions: 'Fragen?',
  privacyLabel: 'Datenschutzerklärung',
  supportLabel: 'Support',
  disclaimer: 'Diese Seite beschreibt die Bedingungen, unter denen Document Risk Analyzer bereitgestellt wird. Sie dient der Transparenz und der Einhaltung der Vorgaben der App-Stores und ersetzt keine unabhängige Rechtsberatung.',
  toc: {
    'no-legal-advice': 'Keine Rechtsberatung',
    'ai-content': 'KI-generierte Inhalte',
    'no-relationship': 'Kein Mandatsverhältnis',
    'acceptable-use': 'Zulässige Nutzung',
    warranty: 'Keine Gewährleistung',
    liability: 'Haftung',
    changes: 'Änderungen',
    contact: 'Kontakt',
  },
  summaryLabel: 'Kurz gesagt',
  summary: [
    'Document Risk Analyzer liefert allgemeine, automatisierte Informationen zu einem Dokument – es ist keine Rechtsberatung, und seine Nutzung begründet kein Mandatsverhältnis.',
    'Analysen werden von einem KI-Modell erstellt und können unvollständig, veraltet oder falsch sein. Lassen Sie alles Wichtige stets von einer zugelassenen Rechtsanwältin oder einem zugelassenen Rechtsanwalt prüfen, bevor Sie sich darauf verlassen.',
    'Die App wird „wie besehen“ und ohne Gewährleistung bereitgestellt; die Nutzung erfolgt auf eigenes Risiko.',
  ],
  sections: {
    'no-legal-advice': {
      h2: 'Keine Rechtsberatung',
      html: `      <p>Document Risk Analyzer ist ein Informationswerkzeug. Es nutzt ein KI-Modell, um Klauseln hervorzuheben, die einen genaueren Blick lohnen, und um übliche Schutzvorkehrungen zu nennen, die ein Dokument nicht erwähnt. Dies sind allgemeine Informationen, keine auf Ihre konkrete Situation zugeschnittene Rechtsberatung, und sie sind kein Ersatz für den Rat einer in Ihrem Rechtsgebiet zugelassenen Rechtsanwältin oder eines zugelassenen Rechtsanwalts.</p>
      <p>Gesetze unterscheiden sich je nach Ort und ändern sich im Lauf der Zeit. Nur eine qualifizierte Rechtsanwältin oder ein qualifizierter Rechtsanwalt, die bzw. der die Einzelheiten Ihrer Situation und Ihres Rechtsgebiets kennt, kann Ihnen sagen, wie ein Dokument tatsächlich für Sie gilt.</p>`,
    },
    'ai-content': {
      h2: 'KI-generierte Inhalte können falsch sein',
      html: `      <p>Analysen werden von einem großen Sprachmodell erstellt, nicht von einem Menschen. Wie jedes KI-System kann es tatsächlich vorhandene Probleme übersehen, Dinge markieren, die gar kein Problem sind, oder mehrdeutige Formulierungen falsch verstehen. Es kennt weder Ihre persönlichen Umstände noch Ihr örtliches Recht noch Tatsachen außerhalb des von Ihnen übermittelten Textes.</p>
      <p>Betrachten Sie jede Analyse als Ausgangspunkt für Ihre eigene Prüfung – nicht als endgültige Antwort.</p>`,
    },
    'no-relationship': {
      h2: 'Kein Mandatsverhältnis',
      html: `      <p>Die Nutzung dieser App, einschließlich jeder Interaktion mit ihrer KI-generierten Ausgabe, begründet kein Mandatsverhältnis zwischen Ihnen und dem Entwickler der App oder einer anderen Partei. Keine von Ihnen bereitgestellte Information ist durch das Anwaltsgeheimnis geschützt.</p>`,
    },
    'acceptable-use': {
      h2: 'Zulässige Nutzung',
      html: `      <p>Sie verpflichten sich, die App nur zu ihrem vorgesehenen Zweck zu nutzen – zur Prüfung eigener Dokumente oder von Dokumenten, die Sie berechtigterweise prüfen dürfen – und nicht für rechtswidrige Zwecke. Sie sind für die von Ihnen übermittelten Dokumente und Texte verantwortlich.</p>`,
    },
    warranty: {
      h2: 'Keine Gewährleistung',
      html: `      <p>Die App wird „wie besehen“ und „wie verfügbar“ bereitgestellt, ohne Gewährleistungen jeglicher Art, ob ausdrücklich oder stillschweigend, einschließlich einer Gewährleistung, dass die Analyse zutreffend, vollständig oder für einen bestimmten Zweck geeignet ist.</p>`,
    },
    liability: {
      h2: 'Haftungsbeschränkung',
      html: `      <p>Soweit gesetzlich zulässig, haftet der Entwickler von Document Risk Analyzer nicht für Entscheidungen oder Handlungen, die im Vertrauen auf die Ausgabe der App getroffen oder vorgenommen werden, und nicht für Verluste oder Schäden, die sich aus Ihrer Nutzung der App ergeben.</p>`,
    },
    changes: {
      h2: 'Änderungen dieser Bedingungen',
      html: `      <p>Diese Bedingungen können von Zeit zu Zeit aktualisiert werden, wenn sich die App ändert. Das Datum des Inkrafttretens oben auf dieser Seite bezeichnet die jeweils neueste Fassung.</p>`,
    },
    contact: {
      h2: 'Kontakt',
      html: `      <p>Fragen zu diesen Bedingungen können Sie an <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a> senden.</p>`,
    },
  },
};

const support = {
  htmlLang: 'de',
  title: `${appName} – Support`,
  iconAlt: 'Symbol von Document Risk Analyzer',
  eyebrow: 'Support',
  appName,
  tagline: 'Antworten auf häufige Fragen – und wie Sie uns erreichen, wenn Sie nicht weiterkommen.',
  translationNote: note,
  contactLabel: 'Kontakt',
  contactText: 'Fehlermeldungen, Funktionswünsche oder alles, was unten nicht behandelt wird – wir lesen jede E-Mail.',
  faqHeading: 'Häufig gestellte Fragen',
  privacyLabel: 'Datenschutzerklärung',
  termsLabel: 'Nutzungsbedingungen',
  credit: 'Idee für die App: Chrystal Ding',
  faq: [
    { id: 'account', q: 'Muss ich ein Konto erstellen?', a: 'Nein. Es gibt keine Registrierung, keine Anmeldung und kein Profil – öffnen Sie die App und analysieren Sie sofort ein Dokument.' },
    { id: 'file-types', q: 'Welche Dateitypen werden unterstützt?', a: 'PDF- und DOCX-Uploads, eingefügter Text und mit der Kamera fotografierte Seiten.' },
    { id: 'privacy', q: 'Sind meine persönlichen Daten sicher?', a: 'E-Mail-Adressen, Telefonnummern, Sozialversicherungsnummern und ähnliche Kennungen werden automatisch geschwärzt, Namen ebenfalls, sofern sie erkannt werden – bevor Ihr Dokument zur KI-Analyse gesendet wird. Die Erkennung ist nicht perfekt, deshalb können Sie genau prüfen, was gesendet wird, und entscheiden, ob Sie fortfahren. Details finden Sie in der vollständigen <a href="/privacy?lang=de">Datenschutzerklärung</a>.' },
    { id: 'ads', q: 'Warum sehe ich eine Anzeige?', a: 'Die App ist kostenlos und wird durch eine einzelne, unaufdringliche Anzeige finanziert, die während der Erstellung Ihres Berichts erscheint. Die Anzeigen sind nicht personalisiert – sie nutzen Ihre Aktivität in anderen Apps nicht, um Sie anzusprechen.' },
    { id: 'history', q: 'Kann ich meinen Analyseverlauf löschen?', a: 'Ja. Im Tab „Verlauf“ können Sie einzelne Einträge löschen oder jederzeit alles auf einmal entfernen.' },
    { id: 'report', q: 'Wie melde ich einen Fehler oder wünsche eine Funktion?', a: 'Schreiben Sie an <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a> – geben Sie bei Fehlermeldungen nach Möglichkeit Ihr Gerätemodell und Ihre iOS-Version an.' },
  ],
};

module.exports = { privacy, terms, support };
