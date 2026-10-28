const note = 'Traducción de cortesía. Si hay alguna diferencia, prevalece la versión en inglés.';
const appName = 'Document Risk Analyzer';

const privacy = {
  htmlLang: 'es',
  title: `${appName} – Política de privacidad`,
  iconAlt: 'Icono de Document Risk Analyzer',
  eyebrow: 'Política de privacidad',
  appName,
  effective: 'En vigor desde el',
  date: '3 de octubre de 2026',
  translationNote: note,
  appliesTo: 'Se aplica a Document Risk Analyzer en iOS y Android.',
  disclaimer: 'Esta página describe las prácticas reales de datos de Document Risk Analyzer a la fecha indicada arriba. Se ofrece por transparencia y para cumplir con las tiendas de aplicaciones, y no sustituye el asesoramiento jurídico independiente.',
  toc: {
    collect: 'Qué recopilamos',
    redaction: 'Ocultación de datos',
    'ai-sharing': 'Análisis con IA',
    'not-stored': 'Qué no almacenamos',
    'third-party': 'Terceros',
    choices: 'Tus opciones',
    security: 'Seguridad',
    children: 'Menores',
    changes: 'Cambios',
    contact: 'Contacto',
  },
  summaryLabel: 'En resumen',
  summary: [
    'Tu documento se analiza automáticamente en busca de identificadores personales antes de enviar nada para el análisis con IA. Los correos electrónicos, números de teléfono, números de seguridad social y patrones similares se sustituyen, y los nombres también cuando se detectan. La detección no es perfecta, por eso ves una vista previa de exactamente lo que se enviará.',
    'El texto con los datos ocultos se envía a Groq, un servicio de IA de terceros, para redactar tu análisis, y solo después de que toques Permitir en la app. Hemos activado el ajuste de retención cero de datos de Groq, así que Groq no lo almacena.',
    'No almacenamos tus documentos. El texto y las imágenes se procesan en cada solicitud y se descartan en cuanto se devuelve tu informe.',
    'El historial de tus análisis vive solo en tu dispositivo. No lo subimos, no lo sincronizamos y no lo vemos.',
    'Los anuncios, cuando se muestran, no están personalizados: sin seguimiento entre apps y sin necesidad de pedir permiso de seguimiento.',
    'Sin cuenta, sin registro, sin contraseña, nunca.',
  ],
  sections: {
    collect: {
      h2: 'Qué recopilamos',
      html: `      <p>Document Risk Analyzer está diseñada para necesitar la menor cantidad posible de tus datos. Esto es todo lo que pasa por la app:</p>
      <ul>
        <li><strong>El contenido del documento que aportas</strong>: un archivo que subes, un texto que pegas o una página que fotografías. La app lo envía por HTTPS a nuestro servidor, que extrae el texto (con reconocimiento de texto en el caso de las fotos) y localiza los identificadores personales.</li>
        <li><strong>Texto de análisis con los datos ocultos</strong>: tras la ocultación, el resto del texto del documento se envía a Groq, un servicio de IA de terceros, para generar tu informe de riesgos, y solo después de que des tu permiso en la app.</li>
        <li><strong>Historial local</strong>: los análisis anteriores se guardan en el almacenamiento de tu propio dispositivo para que puedas consultarlos de nuevo. Nunca salen de tu teléfono.</li>
        <li><strong>Datos publicitarios</strong>: si se muestra un anuncio mientras se analiza tu documento, Google AdMob puede recopilar datos limitados del dispositivo y de la interacción. Más detalles abajo.</li>
        <li><strong>Registros básicos del servidor</strong>: nuestra infraestructura registra metadatos estándar de las solicitudes (marcas de tiempo, códigos de estado) por motivos de fiabilidad y prevención de abusos. Estos registros no incluyen el contenido de tus documentos.</li>
      </ul>`,
    },
    redaction: {
      h2: 'Cómo funciona la ocultación de datos',
      html: `      <p>Antes de que el texto de un documento llegue a un modelo de IA, nuestro servidor lo analiza en busca de identificadores personales (direcciones de correo electrónico, números de teléfono, números de seguridad social y patrones similares, además de nombres de personas cuando su detección de nombres los reconoce) y los sustituye por marcadores. Esto ocurre automáticamente, en todos los documentos, y no hay ningún ajuste para desactivarlo. La detección de nombres es de mejor esfuerzo y puede pasar por alto nombres, así que considera la ocultación una medida de protección y no una garantía.</p>
      <p class="muted">La pantalla de revisión te muestra exactamente lo que se encontró y se ocultó antes de que decidas continuar, para que veas qué se elimina en lugar de fiarte de nuestra palabra.</p>`,
    },
    'not-stored': {
      h2: 'Qué no almacenamos',
      html: `      <ul>
        <li>No conservamos tus documentos subidos, el texto pegado ni las fotografías una vez generado tu informe.</li>
        <li>Groq no almacena el texto que le enviamos: la retención cero de datos está activada en nuestra cuenta.</li>
        <li>No creamos cuentas de usuario, por lo que no guardamos credenciales de acceso, nombres de usuario ni perfiles permanentes asociados a ti.</li>
        <li>No vendemos tus datos a nadie, por ningún motivo.</li>
      </ul>
      <div class="data-table">
        <div class="col process">
          <div class="col-head">Enviado para el análisis</div>
          <dl>
            <dd>texto del documento con los datos ocultos</dd>
            <dd>categoría de documento seleccionada</dd>
            <dd>índice de sección del documento (solo archivos largos)</dd>
          </dl>
        </div>
        <div class="col never">
          <div class="col-head">Nunca se recopila</div>
          <dl>
            <dd>credenciales de cuenta</dd>
            <dd>información de pago</dd>
            <dd>ubicación precisa</dd>
            <dd>actividad de navegación fuera de la app</dd>
          </dl>
        </div>
      </div>`,
    },
    'ai-sharing': {
      h2: 'Compartir tus datos con un servicio de IA',
      html: `      <p>Para redactar tu análisis de riesgos, la app envía datos a <strong>Groq</strong>, un servicio de IA de terceros. Antes de tu primer análisis, la app te indica qué se envía y a quién, y te pide permiso. Si tocas «No permitir», no se envía nada a Groq y no se realiza ningún análisis.</p>
      <ul>
        <li><strong>Qué se envía:</strong> el texto de tu documento con los datos ocultos, el tipo de documento que seleccionaste (o «auto») y, en los documentos largos que se analizan por secciones, de qué sección se trata.</li>
        <li><strong>Quién lo recibe:</strong> Groq, que ejecuta el modelo de IA que lee el texto y redacta el análisis.</li>
        <li><strong>Para qué:</strong> únicamente para producir el análisis que solicitaste. No usamos estos datos para publicidad, marketing ni elaboración de perfiles, y no los vendemos.</li>
        <li><strong>Qué no se envía:</strong> tu archivo o foto originales, tu nombre o datos de contacto (no recopilamos ninguno), identificadores del dispositivo ni el historial de tus análisis.</li>
      </ul>
      <p>La ocultación es automática y se centra en identificadores habituales como nombres, direcciones de correo electrónico, números de teléfono y números de seguridad social. Puede pasar por alto detalles, por ejemplo formatos poco habituales o referencias en texto libre a una persona o un lugar, por eso la pantalla de revisión muestra una vista previa del texto exacto que se enviará. Por favor, no envíes un documento que no te sientas cómodo enviando.</p>
      <p>Hemos activado el ajuste de retención cero de datos de Groq en nuestra cuenta. Con ello se impide que Groq almacene el texto que enviamos y el análisis que devuelve, de modo que Groq no conserva el texto de tu documento una vez generado el análisis. Por lo demás, el tratamiento de datos por parte de Groq se rige por sus propios términos y su política de privacidad, disponibles en groq.com. Solo le enviamos lo indicado arriba, y solo para generar tu análisis.</p>
      <p class="muted">Puedes desactivar este permiso en cualquier momento con el enlace «Gestionar» de la pantalla de inicio de la app. Se te volverá a preguntar antes de tu próximo análisis.</p>`,
    },
    'third-party': {
      h2: 'Servicios de terceros',
      html: `      <p><strong>Groq (análisis con IA).</strong> Descrito en detalle más arriba. Solo se envía la versión con los datos ocultos del texto de tu documento, nunca el original, y solo con tu permiso.</p>
      <p><strong>Google AdMob (publicidad).</strong> La app puede mostrar un anuncio breve mientras se analiza tu documento, para mantener la app gratuita. Solicitamos únicamente anuncios no personalizados, lo que significa que AdMob no utiliza tu actividad en otras apps para dirigirte publicidad, y no se necesita el permiso de App Tracking Transparency. Google aún puede procesar un identificador del dispositivo y señales aproximadas, no precisas, para mostrar el anuncio, medir su rendimiento y prevenir el fraude, conforme a la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política de privacidad de Google</a>.</p>`,
    },
    choices: {
      h2: 'Tus opciones',
      html: `      <ul>
        <li>Si rechazas el permiso para compartir con la IA, no se envía nada a Groq. También puedes desactivarlo en cualquier momento con «Gestionar» en la pantalla de inicio.</li>
        <li>Borra el historial local de tus análisis cuando quieras desde la propia app.</li>
        <li>Al desinstalar la app se elimina todo el historial y las preferencias almacenados en tu dispositivo.</li>
        <li>El acceso a la cámara y a la fototeca es opcional: si lo rechazas, usa simplemente la subida de archivos o el texto pegado.</li>
      </ul>`,
    },
    security: {
      h2: 'Seguridad de los datos',
      html: `      <p>Todo el tráfico entre la app y nuestros servidores está cifrado en tránsito (HTTPS). La ocultación se realiza antes de que tu texto llegue a un proveedor de IA, lo que limita desde el principio lo que cualquier servicio posterior puede ver.</p>`,
    },
    children: {
      h2: 'Privacidad de los menores',
      html: `      <p>Document Risk Analyzer no está dirigida a menores de 13 años y no recopilamos conscientemente información de menores.</p>`,
    },
    changes: {
      h2: 'Cambios en esta política',
      html: `      <p>Si esta política cambia, actualizaremos la fecha de entrada en vigor que aparece al principio de esta página. Los cambios importantes se reflejarán aquí antes de que entren en vigor.</p>`,
    },
    contact: {
      h2: 'Contacto',
      html: `      <p>Puedes enviar tus preguntas sobre esta política o sobre el tratamiento de tus datos a:</p>
      <p class="contact"><a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a></p>`,
    },
  },
};

const terms = {
  htmlLang: 'es',
  title: `${appName} – Términos de uso`,
  iconAlt: 'Icono de Document Risk Analyzer',
  eyebrow: 'Términos de uso',
  appName,
  effective: 'En vigor desde el',
  date: '20 de septiembre de 2026',
  translationNote: note,
  appliesTo: 'Se aplica a Document Risk Analyzer en iOS y Android.',
  questions: '¿Tienes preguntas?',
  privacyLabel: 'Política de privacidad',
  supportLabel: 'Soporte',
  disclaimer: 'Esta página describe los términos bajo los cuales se ofrece Document Risk Analyzer. Se ofrece por transparencia y para cumplir con las tiendas de aplicaciones, y no sustituye el asesoramiento jurídico independiente.',
  toc: {
    'no-legal-advice': 'Sin asesoramiento jurídico',
    'ai-content': 'Contenido generado por IA',
    'no-relationship': 'Sin relación abogado-cliente',
    'acceptable-use': 'Uso aceptable',
    warranty: 'Sin garantía',
    liability: 'Responsabilidad',
    changes: 'Cambios',
    contact: 'Contacto',
  },
  summaryLabel: 'En resumen',
  summary: [
    'Document Risk Analyzer ofrece información general y automatizada sobre un documento: no es asesoramiento jurídico, y usarla no crea una relación abogado-cliente.',
    'Los análisis los genera un modelo de IA y pueden ser incompletos, estar desactualizados o ser erróneos. Verifica siempre con un abogado colegiado cualquier cosa importante antes de basarte en ella.',
    'La app se ofrece «tal cual», sin garantía alguna, y su uso corre por tu cuenta y riesgo.',
  ],
  sections: {
    'no-legal-advice': {
      h2: 'No es asesoramiento jurídico',
      html: `      <p>Document Risk Analyzer es una herramienta informativa. Utiliza un modelo de IA para destacar cláusulas que pueden merecer una mirada más atenta y para señalar protecciones habituales que un documento no menciona. Se trata de información general, no de asesoramiento jurídico adaptado a tu situación concreta, y no debe considerarse un sustituto del consejo de un abogado colegiado en tu jurisdicción.</p>
      <p>Las leyes varían según el lugar y cambian con el tiempo. Solo un abogado cualificado que conozca los detalles de tu situación y de tu jurisdicción puede decirte cómo se aplica realmente un documento a tu caso.</p>`,
    },
    'ai-content': {
      h2: 'El contenido generado por IA puede ser incorrecto',
      html: `      <p>Los análisis los produce un modelo de lenguaje de gran tamaño, no una persona. Como cualquier sistema de IA, puede pasar por alto problemas que sí existen, señalar cosas que en realidad no son un problema o interpretar mal un texto ambiguo. No conoce tus circunstancias personales, las leyes de tu localidad ni hechos ajenos al texto que le proporcionas.</p>
      <p>Considera cada análisis como un punto de partida para tu propia revisión, no como una respuesta definitiva.</p>`,
    },
    'no-relationship': {
      h2: 'Sin relación abogado-cliente',
      html: `      <p>Usar esta app, incluida cualquier interacción con su resultado generado por IA, no crea una relación abogado-cliente entre tú y el desarrollador de la app ni ninguna otra parte. Ninguna información que proporciones está protegida por el secreto profesional entre abogado y cliente.</p>`,
    },
    'acceptable-use': {
      h2: 'Uso aceptable',
      html: `      <p>Aceptas usar la app únicamente para su finalidad prevista (revisar tus propios documentos, o documentos que tengas un derecho legítimo a revisar) y no para ningún fin ilícito. Eres responsable de los documentos y textos que envíes.</p>`,
    },
    warranty: {
      h2: 'Sin garantía',
      html: `      <p>La app se ofrece «tal cual» y «según disponibilidad», sin garantías de ningún tipo, ya sean expresas o implícitas, incluida cualquier garantía de que el análisis sea exacto, completo o adecuado para un fin determinado.</p>`,
    },
    liability: {
      h2: 'Limitación de responsabilidad',
      html: `      <p>En la máxima medida permitida por la ley, el desarrollador de Document Risk Analyzer no es responsable de ninguna decisión tomada ni de ninguna acción realizada basándose en el resultado de la app, ni de ninguna pérdida o daño derivados de tu uso de la app.</p>`,
    },
    changes: {
      h2: 'Cambios en estos términos',
      html: `      <p>Estos términos pueden actualizarse de vez en cuando a medida que cambie la app. La fecha de entrada en vigor que aparece al principio de esta página corresponde a la versión más reciente.</p>`,
    },
    contact: {
      h2: 'Contacto',
      html: `      <p>Puedes enviar tus preguntas sobre estos términos a <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>.</p>`,
    },
  },
};

const support = {
  htmlLang: 'es',
  title: `${appName} – Soporte`,
  iconAlt: 'Icono de Document Risk Analyzer',
  eyebrow: 'Soporte',
  appName,
  tagline: 'Respuestas a las preguntas más habituales y cómo contactarnos si te quedas atascado.',
  translationNote: note,
  contactLabel: 'Contáctanos',
  contactText: 'Informes de errores, sugerencias de funciones o cualquier cosa que no se cubra más abajo: leemos todos los correos.',
  faqHeading: 'Preguntas frecuentes',
  privacyLabel: 'Política de privacidad',
  termsLabel: 'Términos de uso',
  credit: 'Idea de la app: Chrystal Ding',
  faq: [
    { id: 'account', q: '¿Tengo que crear una cuenta?', a: 'No. No hay registro, inicio de sesión ni perfil: abre la app y empieza a analizar un documento de inmediato.' },
    { id: 'file-types', q: '¿Qué tipos de archivo se admiten?', a: 'Archivos PDF y DOCX, texto pegado y páginas fotografiadas con la cámara.' },
    { id: 'privacy', q: '¿Está segura mi información personal?', a: 'Los correos electrónicos, números de teléfono, números de seguridad social e identificadores similares se ocultan automáticamente, y los nombres cuando se detectan, antes de que tu documento se envíe para el análisis con IA. La detección no es perfecta, por eso puedes ver una vista previa de exactamente lo que se enviará y decidir si continúas. Consulta la <a href="/privacy?lang=es">Política de privacidad</a> completa para más detalles.' },
    { id: 'ads', q: '¿Por qué veo un anuncio?', a: 'La app es gratuita y se financia con un único anuncio discreto que se muestra mientras se genera tu informe. Los anuncios no están personalizados: no usan tu actividad en otras apps para dirigirse a ti.' },
    { id: 'history', q: '¿Puedo borrar el historial de mis análisis?', a: 'Sí. Desde la pestaña Historial puedes borrar entradas individuales o vaciarlo todo de una vez, cuando quieras.' },
    { id: 'report', q: '¿Cómo informo de un error o sugiero una función?', a: 'Escribe a <a href="mailto:contractanalyzer@icloud.com">contractanalyzer@icloud.com</a>; si puedes, incluye el modelo de tu dispositivo y la versión de iOS en los informes de errores.' },
  ],
};

module.exports = { privacy, terms, support };
