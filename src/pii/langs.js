// Language packs for Spanish, French, German and Portuguese. English lives in
// stoplist.js; everything here is merged into the same sets, so a document is
// handled correctly without first having to guess its language (contracts are
// often bilingual anyway).

const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const words = s => s.split(/\s+/).filter(Boolean);
const foldedSet = s => new Set(words(s).map(fold));

const PACKS = {
  es: {
    roleCues: [
      'arrendador', 'arrendadora', 'arrendatario', 'arrendataria', 'inquilino', 'inquilina', 'propietario',
      'propietaria', 'casero', 'casera', 'locador', 'locadora', 'locatario', 'locataria', 'empleado', 'empleada',
      'trabajador', 'trabajadora', 'empleador', 'empleadora', 'prestatario', 'prestataria', 'prestamista',
      'comprador', 'compradora', 'vendedor', 'vendedora', 'cliente', 'contratista', 'consultor', 'consultora',
      'licenciante', 'licenciatario', 'fiador', 'fiadora', 'avalista', 'deudor', 'deudora', 'acreedor',
      'acreedora', 'solicitante', 'paciente', 'asegurado', 'asegurada', 'tomador', 'tomadora', 'beneficiario',
      'beneficiaria', 'testigo', 'firmante', 'cónyuge', 'socio', 'socia', 'representante', 'apoderado',
      'apoderada', 'albacea', 'fideicomisario', 'cedente', 'cesionario', 'cesionaria', 'contacto',
      'de una parte', 'de otra parte', 'de otra', 'el abajo firmante', 'la abajo firmante',
    ],
    labelCues: [
      'nombre', 'nombre completo', 'nombre y apellidos', 'apellidos', 'firmado', 'firmado por', 'firma',
      'firmante', 'atn', 'atención', 'a la atención de', 'para', 'testigo', 'notario', 'arrendador',
      'arrendatario', 'inquilino', 'propietario', 'empleado', 'empleador', 'prestatario', 'prestamista',
      'comprador', 'vendedor', 'titular', 'representante',
    ],
    honorifics: ['señor', 'señora', 'señorita', 'doña', 'dña', 'dra', 'profa'],
    strictHonorifics: ['D.', 'Dña.', 'Dª', 'Dª.', 'Don', 'Doña', 'Sr.', 'Sra.', 'Srta.', 'Sr', 'Sra', 'Srta'],
    salutations: ['Estimado', 'Estimada', 'Estimados', 'Querido', 'Querida', 'Apreciado', 'Apreciada'],
    between: ['entre'],
    and: ['y', 'e'],
    legalStop: `
      el la los las un una unos unas de del al y e o u ni que en con por para sin sobre entre hasta desde segun
      este esta estos estas ese esa dicho dicha presente contrato contratos arrendamiento alquiler clausula
      clausulas articulo articulos anexo anexos apartado capitulo titulo parte partes arrendador arrendadora
      arrendatario arrendataria inquilino inquilina propietario propietaria empleado empleada empleador
      empleadora trabajador trabajadora prestatario prestamista comprador vendedor cliente contratista
      consultor fiador avalista deudor acreedor solicitante paciente asegurado beneficiario testigo firmante
      sociedad empresa fecha efecto vigencia duracion plazo renta fianza deposito pago pagos precio importe
      servicio servicios propiedad inmueble vivienda local garantia responsabilidad obligaciones derechos
      resolucion rescision terminacion jurisdiccion tribunal tribunales ley leyes legislacion confidencialidad
      informacion confidencial datos personales proteccion intereses mora penalizacion indemnizacion danos
      perjuicios notificacion notificaciones firma firmas testigos domicilio direccion
      lunes martes miercoles jueves viernes sabado domingo
      enero febrero marzo abril mayo junio julio agosto septiembre setiembre octubre noviembre diciembre
      senor senora senorita don dona dna sr sra srta estimado estimada atentamente saludos
      firmado firma nombre apellidos titular cargo
      espana mexico argentina colombia chile peru union europea
    `,
    orgWords: `
      sociedad limitada anonima sl sa slu srl cia compania empresa banco caja fundacion asociacion cooperativa
      universidad ayuntamiento gobierno ministerio hospital clinica seguros inmobiliaria constructora
      consultoria servicios soluciones sistemas tecnologias grupo holding inversiones financiera
      administracion agencia instituto comunidad
    `,
    particles: 'los las',
    firstNames: `
      juan jose jesus carlos luis miguel antonio manuel francisco pedro javier jorge alberto fernando ricardo
      roberto pablo sergio daniel alejandro david diego andres rafael angel enrique ramon eduardo gonzalo
      ignacio ivan marcos mario oscar raul rodrigo santiago victor hector alvaro adrian ruben guillermo
      salvador felipe gabriel emilio tomas martin nicolas julio cesar maria carmen ana laura isabel marta
      lucia sofia paula elena sara patricia rosa teresa pilar dolores cristina beatriz raquel silvia monica
      andrea angela claudia gloria irene julia lorena natalia nuria olga rocio susana veronica alicia amparo
      concepcion mercedes ines inmaculada esther eva blanca carolina diana valeria camila fernanda guadalupe
      josefa josefina manuela dolores montserrat aurora agustin alfonso benito bernardo cristian dario
      efrain emiliano esteban fabian federico gerardo gustavo hugo humberto jaime joaquin leonardo lorenzo
      mauricio maximiliano nestor orlando patricio ramiro reyes samuel sebastian tadeo valentin vicente
      yolanda
    `,
    lastNames: `
      garcia rodriguez gonzalez fernandez lopez martinez sanchez perez gomez martin jimenez ruiz hernandez
      diaz moreno alvarez munoz romero alonso gutierrez navarro torres dominguez vazquez ramos gil ramirez
      serrano blanco molina morales suarez ortega delgado castro ortiz rubio marin sanz nunez iglesias medina
      garrido cortes castillo santos lozano guerrero cano prieto mendez cruz calvo gallego vidal leon herrera
      pena flores cabrera campos vega fuentes carrasco diez reyes caballero nieto aguilar pascual santana
      herrero lorenzo montero hidalgo gimenez ibanez ferrer duran santiago benitez mora vicente vargas arias
      carmona crespo roman pastor soto saez velasco moya soler parra esteban bravo gallardo rojas
    `,
    signature: 'firma|firmado|firmante|testigo|notario|fecha|nombre|cargo',
    emailLocals: 'contacto administracion ventas soporte atencion facturacion rrhh comercial',
  },

  fr: {
    roleCues: [
      'bailleur', 'bailleresse', 'locataire', 'sous-locataire', 'propriétaire', 'employé', 'employée', 'salarié',
      'salariée', 'employeur', 'emprunteur', 'emprunteuse', 'prêteur', 'prêteuse', 'acheteur', 'acheteuse',
      'vendeur', 'vendeuse', 'client', 'cliente', 'prestataire', 'consultant', 'consultante', 'concédant',
      'licencié', 'garant', 'caution', 'débiteur', 'débitrice', 'créancier', 'créancière', 'demandeur',
      'demanderesse', 'patient', 'patiente', 'assuré', 'assurée', 'souscripteur', 'bénéficiaire', 'témoin',
      'signataire', 'conjoint', 'conjointe', 'associé', 'associée', 'mandataire', 'représentant',
      'exécuteur', 'fiduciaire', 'cédant', 'cessionnaire', 'contact', 'soussigné', 'soussignée',
      "d'une part", "d'autre part",
    ],
    labelCues: [
      'nom', 'nom complet', 'nom et prénom', 'prénom', 'noms et prénoms', 'signé', 'signé par', 'signature',
      "à l'attention de", 'à l’attention de', 'p.a.', 'par', 'témoin', 'notaire', 'bailleur', 'locataire',
      'propriétaire', 'employé', 'salarié', 'employeur', 'emprunteur', 'prêteur', 'acheteur', 'vendeur',
      'titulaire', 'représentant',
    ],
    honorifics: ['monsieur', 'madame', 'mademoiselle', 'maître', 'maitre', 'mme', 'mlle'],
    strictHonorifics: ['M.', 'MM.', 'Mme', 'Mlle', 'Monsieur', 'Madame', 'Mademoiselle', 'Maître'],
    salutations: ['Cher', 'Chère', 'Chere', 'Chers', 'Chères'],
    between: ['entre'],
    and: ['et'],
    legalStop: `
      le la les un une des du de au aux et ou ni que qui en dans avec par pour sans sur sous entre jusqu depuis
      selon ce cette ces ledit ladite lesdits present presente contrat contrats bail baux location clause
      clauses article articles annexe annexes alinea chapitre titre partie parties bailleur bailleresse
      locataire proprietaire employe employee salarie salariee employeur emprunteur preteur acheteur vendeur
      client prestataire consultant garant caution debiteur creancier demandeur patient assure beneficiaire
      temoin signataire societe entreprise date effet duree delai loyer depot garantie paiement paiements prix
      montant service services bien immeuble logement local responsabilite obligations droits resiliation
      rupture juridiction tribunal tribunaux loi lois legislation confidentialite information informations
      confidentielle donnees personnelles protection interets retard penalite indemnite dommages preavis
      notification notifications signature signatures domicile adresse
      lundi mardi mercredi jeudi vendredi samedi dimanche
      janvier fevrier mars avril mai juin juillet aout septembre octobre novembre decembre
      monsieur madame mademoiselle mme mlle maitre cher chere cordialement salutations
      signe signature nom prenom titulaire fonction
      france republique francaise union europeenne
    `,
    orgWords: `
      societe anonyme sarl sas sasu sci eurl banque caisse fondation association universite mairie
      gouvernement ministere hopital clinique assurances assurance immobilier immobiliere constructions
      conseil services solutions systemes technologies groupe holding investissements financiere
      administration agence institut communaute mutuelle
    `,
    particles: 'du des le la les',
    firstNames: `
      jean pierre michel philippe alain patrick nicolas christophe daniel laurent francois eric stephane
      olivier thierry julien david frederic pascal sebastien vincent guillaume antoine alexandre maxime thomas
      paul louis henri jacques bernard marcel andre rene claude gerard didier bruno yves gilles serge lucas
      hugo nathan mathieu romain marie nathalie isabelle sylvie catherine francoise monique christine sophie
      anne nicole valerie sandrine veronique martine brigitte stephanie celine julie camille aurelie emilie
      laure virginie caroline florence helene jeanne charlotte lucie manon chloe lea emma ines sarah margaux
      claire odile genevieve amelie antoinette arnaud benoit cedric damien denis dominique fabrice gael
      guy herve jerome joel karine mathilde noemie rachel remi sabrina simone solange yvette yannick
    `,
    lastNames: `
      martin bernard dubois thomas robert richard petit durand leroy moreau simon laurent lefebvre michel
      garcia david bertrand roux vincent fournier morel girard andre lefevre mercier dupont lambert bonnet
      francois martinez legrand garnier faure rousseau blanc guerin muller henry roussel nicolas perrin morin
      mathieu clement gauthier dumont lopez fontaine chevalier robin masson sanchez gerard nguyen boyer denis
      lemaire duval joly gautier roger roche roy noel meyer lucas meunier jean perez marchand dufour
      blanchard marie barbier brun dumas brunet schmitt leroux colin fernandez pierre renard arnaud rolland
      caron aubert giraud leclerc vidal bourgeois renaud lemoine picard gaillard philippe leclercq lacroix
      fabre dupuis olivier rodriguez hubert louis charles guillot riviere guillaume adam rey moulin gonzalez
      berger lecomte menard fleury deschamps carpentier julien benoit paris maillard marchal aubry vasseur
      renault jacquet collet prevost poirier charpentier royer huet baron dupuy pons paul laine carre breton
      remy schneider perrot guyot barre marty cousin
    `,
    signature: 'signature|signé|témoin|temoin|notaire|date|nom|fonction',
    emailLocals: 'contrat vente comptabilite service client',
  },

  de: {
    roleCues: [
      'Vermieter', 'Vermieterin', 'Mieter', 'Mieterin', 'Untermieter', 'Untermieterin', 'Eigentümer',
      'Eigentümerin', 'Arbeitnehmer', 'Arbeitnehmerin', 'Arbeitgeber', 'Arbeitgeberin', 'Darlehensnehmer',
      'Darlehensnehmerin', 'Darlehensgeber', 'Darlehensgeberin', 'Kreditnehmer', 'Kreditnehmerin',
      'Kreditgeber', 'Kreditgeberin', 'Käufer', 'Käuferin', 'Verkäufer', 'Verkäuferin', 'Kunde', 'Kundin',
      'Auftraggeber', 'Auftraggeberin', 'Auftragnehmer', 'Auftragnehmerin', 'Berater', 'Beraterin',
      'Lizenzgeber', 'Lizenznehmer', 'Bürge', 'Bürgin', 'Schuldner', 'Schuldnerin', 'Gläubiger', 'Gläubigerin',
      'Antragsteller', 'Antragstellerin', 'Patient', 'Patientin', 'Versicherungsnehmer',
      'Versicherungsnehmerin', 'Versicherter', 'Versicherte', 'Begünstigter', 'Begünstigte', 'Zeuge', 'Zeugin',
      'Unterzeichner', 'Unterzeichnerin', 'Ehepartner', 'Ehepartnerin', 'Gesellschafter', 'Gesellschafterin',
      'Bevollmächtigter', 'Bevollmächtigte', 'Vertreter', 'Vertreterin', 'Ansprechpartner',
      'Ansprechpartnerin', 'Beauftragter', 'Beauftragte', 'Mitarbeiter', 'Mitarbeiterin', 'Erbe', 'Erbin',
    ],
    labelCues: [
      'Name', 'Vorname', 'Nachname', 'Familienname', 'vollständiger Name', 'Unterschrift', 'unterschrieben',
      'unterschrieben von', 'z. Hd.', 'zu Händen', 'Zeuge', 'Notar', 'Von', 'Vermieter', 'Mieter',
      'Arbeitnehmer', 'Arbeitgeber', 'Darlehensnehmer', 'Käufer', 'Verkäufer', 'Inhaber', 'Vertreter',
    ],
    honorifics: ['herr', 'frau', 'fräulein'],
    strictHonorifics: ['Herr', 'Herrn', 'Frau', 'Fräulein', 'Hr.', 'Fr.'],
    salutations: ['Lieber', 'Liebe', 'Sehr geehrter', 'Sehr geehrte', 'Sehr geehrtes'],
    between: ['zwischen'],
    and: ['und'],
    legalStop: `
      der die das den dem des ein eine einen einem einer eines und oder aber dass nicht mit von zu zur zum bei
      nach aus auf für fur über uber unter durch ohne gegen bis seit gemäß gemass laut sowie dieser diese
      dieses diesem diesen vertrag vertrages verträge vertrage mietvertrag arbeitsvertrag kaufvertrag
      darlehensvertrag dienstvertrag werkvertrag miete pacht klausel klauseln artikel absatz abs ziffer
      anlage anlagen anhang kapitel titel partei parteien vermieter vermieterin mieter mieterin eigentümer
      eigentumer arbeitnehmer arbeitgeber darlehensnehmer darlehensgeber kreditnehmer kreditgeber käufer
      kaufer verkäufer verkaufer kunde auftraggeber auftragnehmer berater bürge burge schuldner gläubiger
      glaubiger antragsteller patient versicherungsnehmer begünstigter beguenstigter zeuge unterzeichner
      gesellschaft unternehmen firma datum wirksamkeit laufzeit frist kündigung kundigung kaution
      zahlung zahlungen preis betrag leistung leistungen eigentum immobilie wohnung gebäude gebaude haftung
      pflichten rechte rücktritt rucktritt beendigung gerichtsstand gericht gerichte gesetz gesetze recht
      vertraulichkeit informationen vertraulich daten personenbezogene datenschutz zinsen verzug vertragsstrafe
      schadensersatz schaden mitteilung mitteilungen unterschrift unterschriften wohnsitz anschrift adresse
      montag dienstag mittwoch donnerstag freitag samstag sonntag
      januar februar marz maerz april mai juni juli august september oktober november dezember
      herr herrn frau fräulein fraulein sehr geehrter geehrte lieber liebe mit freundlichen grüßen grussen
      unterschrift unterschrieben name vorname nachname inhaber funktion
      deutschland österreich osterreich schweiz bundesrepublik europäische europaische union
    `,
    orgWords: `
      gmbh ag kg ohg ug gbr eg ev verein stiftung bank sparkasse genossenschaft universität universitat
      hochschule stadt gemeinde regierung ministerium krankenhaus klinik versicherung versicherungen
      immobilien hausverwaltung bau beratung dienstleistungen lösungen losungen systeme technologien
      gruppe holding beteiligungen finanz verwaltung behörde behorde institut gemeinschaft
    `,
    particles: 'von vom zu zum zur ten ter',
    firstNames: `
      hans peter klaus wolfgang jurgen werner thomas michael andreas stefan markus christian frank uwe
      dieter horst heinz gunter manfred helmut karl josef walter bernd rainer jens jorg matthias sven
      tobias florian lukas jan felix max paul leon finn niklas oliver martin dirk ralf holger lars kai
      maria ursula monika petra sabine renate karin brigitte birgit susanne andrea claudia gabriele heike
      angelika anja sandra nicole stefanie katrin julia lena anna laura lisa sarah hannah emma mia sophie
      johanna elke ingrid helga gisela christa ute silke jurgen gerhard rolf rudolf siegfried dietmar
      eckhard eberhard bernhard burkhard detlef ernst fritz georg gottfried gunther harald henning hermann
      joachim konrad kurt lothar norbert reinhard theo ulrich volker wilhelm willi anke barbara bettina
      christine doris erika eva gudrun hannelore irmgard jutta katharina kerstin margarete marion martina
      sigrid sybille tanja ulrike vera waltraud
    `,
    lastNames: `
      muller schmidt schneider fischer weber meyer wagner becker schulz hoffmann schafer koch bauer richter
      klein wolf schroder neumann schwarz zimmermann braun kruger hofmann hartmann lange schmitt werner
      schmitz krause meier lehmann schmid schulze maier kohler herrmann konig walter mayer huber kaiser fuchs
      peters lang scholz moller weiss jung hahn schubert vogel friedrich keller gunther frank berger winkler
      roth beck lorenz baumann franke albrecht schuster simon ludwig bohm winter kraus martin schumacher
      kramer vogt stein jager otto sommer gross seidel heinrich brandt haas schreiber graf schulte dietrich
      ziegler kuhn kuhne engel pohl horn busch bergmann thomas voigt sauer arnold wolff pfeiffer
    `,
    signature: 'unterschrift|unterschrieben|zeuge|notar|datum|name|funktion',
    emailLocals: 'kontakt verwaltung vertrieb buchhaltung kundenservice',
  },

  pt: {
    roleCues: [
      'locador', 'locadora', 'locatário', 'locatária', 'inquilino', 'inquilina', 'senhorio', 'senhoria',
      'proprietário', 'proprietária', 'arrendatário', 'arrendatária', 'arrendador', 'arrendadora', 'empregado',
      'empregada', 'trabalhador', 'trabalhadora', 'empregador', 'empregadora', 'mutuário', 'mutuária',
      'mutuante', 'devedor', 'devedora', 'credor', 'credora', 'comprador', 'compradora', 'vendedor',
      'vendedora', 'cliente', 'contratante', 'contratado', 'contratada', 'consultor', 'consultora',
      'licenciante', 'licenciado', 'fiador', 'fiadora', 'avalista', 'requerente', 'paciente', 'segurado',
      'segurada', 'tomador', 'tomadora', 'beneficiário', 'beneficiária', 'testemunha', 'signatário',
      'signatária', 'cônjuge', 'sócio', 'sócia', 'procurador', 'procuradora', 'representante', 'contacto',
      'contato', 'outorgante', 'outorgado', 'outorgada', 'cedente', 'cessionário', 'cessionária',
      'de um lado', 'de outro lado',
    ],
    labelCues: [
      'nome', 'nome completo', 'nome e apelido', 'apelido', 'sobrenome', 'assinado', 'assinado por',
      'assinatura', 'a/c', 'à atenção de', 'atenção', 'por', 'testemunha', 'notário', 'notario', 'locador',
      'locatário', 'inquilino', 'proprietário', 'empregado', 'empregador', 'comprador', 'vendedor',
      'titular', 'representante',
    ],
    honorifics: ['senhor', 'senhora', 'dona', 'dom', 'exmo', 'exma', 'ilmo', 'ilma', 'dra', 'profa'],
    strictHonorifics: ['Sr.', 'Sra.', 'Srta.', 'Sr', 'Sra', 'Srta', 'Senhor', 'Senhora', 'Dona', 'Dom', 'Exmo.', 'Exma.', 'Ilmo.', 'Ilma.'],
    salutations: ['Caro', 'Cara', 'Prezado', 'Prezada', 'Prezados', 'Estimado', 'Estimada', 'Querido', 'Querida'],
    between: ['entre'],
    and: ['e'],
    legalStop: `
      o a os as um uma uns umas de do da dos das no na nos nas ao aos e ou nem que em com por para sem sobre
      entre ate desde segundo este esta estes estas esse essa dito dita presente contrato contratos
      arrendamento aluguel aluguer clausula clausulas artigo artigos anexo anexos alinea capitulo titulo
      parte partes locador locadora locatario locataria inquilino inquilina senhorio proprietario
      proprietaria arrendatario empregado empregada empregador trabalhador mutuario mutuante devedor credor
      comprador vendedor cliente contratante contratado consultor fiador avalista requerente paciente
      segurado beneficiario testemunha signatario sociedade empresa data efeito vigencia duracao prazo renda
      caucao deposito pagamento pagamentos preco valor montante servico servicos propriedade imovel
      habitacao fracao garantia responsabilidade obrigacoes direitos rescisao denuncia foro tribunal
      tribunais lei leis legislacao confidencialidade informacao informacoes confidencial dados pessoais
      protecao juros mora multa penalidade indenizacao danos prejuizos notificacao notificacoes assinatura
      assinaturas testemunhas domicilio endereco morada
      segunda terca quarta quinta sexta sabado domingo
      janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro
      senhor senhora dona dom exmo exma ilmo sr sra srta caro cara prezado prezada atenciosamente cumprimentos
      assinado assinatura nome apelido sobrenome titular cargo
      portugal brasil uniao europeia republica federativa
    `,
    orgWords: `
      sociedade anonima sa lda ltda eireli sas banco caixa fundacao associacao cooperativa universidade
      camara municipal governo ministerio hospital clinica seguros imobiliaria construtora consultoria
      servicos solucoes sistemas tecnologias grupo holding investimentos financeira administracao agencia
      instituto comunidade
    `,
    particles: 'do da dos das',
    firstNames: `
      joao jose antonio manuel francisco carlos paulo pedro luis miguel jorge fernando rui nuno tiago diogo
      andre ricardo bruno rafael goncalo filipe marco sergio vitor helder artur fabio gustavo lucas mateus
      gabriel eduardo marcelo rodrigo thiago leonardo felipe maria ana isabel catarina sofia margarida teresa
      helena fernanda patricia sandra paula cristina susana sara rita ines marta carla joana beatriz luisa
      claudia monica vanessa tania sonia silvia raquel diana mariana leonor luciana juliana camila aline
      larissa amanda bruna alexandre alberto armando augusto baltazar cesar daniel david duarte emanuel
      fabiano henrique hugo igor jaime julio lazaro leandro leopoldo mauricio nelson orlando renato roberto
      samuel simao valter vasco adriana alice amelia angela carolina celeste denise elisa fatima gabriela
      graca irene lara lidia lurdes natalia olivia paloma rosa vera
    `,
    lastNames: `
      silva santos ferreira pereira oliveira costa rodrigues martins jesus sousa fernandes goncalves gomes
      lopes marques alves almeida ribeiro pinto carvalho teixeira moreira correia mendes nunes soares vieira
      monteiro cardoso rocha raposo neves coelho cruz cunha pires ramos reis simoes antunes matos fonseca
      machado araujo barbosa tavares lourenco castro figueiredo azevedo cavalcanti barros moura freitas melo
      campos nascimento albuquerque lima
    `,
    signature: 'assinatura|assinado|testemunha|notário|notario|data|nome|cargo',
    emailLocals: 'contacto contato comercial financeiro geral suporte',
  },
};

const LANG_NAMES = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };

const all = pick => Object.values(PACKS).flatMap(pick);
const union = pick => new Set(all(p => words(pick(p))).map(fold));

module.exports = {
  LANG_NAMES,
  SUPPORTED_LANGS: Object.keys(LANG_NAMES),
  fold,
  foldedSet,
  ROLE_CUES: [...new Set(all(p => p.roleCues))],
  LABEL_CUES: [...new Set(all(p => p.labelCues))],
  HONORIFICS: [...new Set(all(p => p.honorifics))],
  STRICT_HONORIFICS: [...new Set(all(p => p.strictHonorifics))],
  SALUTATIONS: [...new Set(all(p => p.salutations))],
  BETWEEN_WORDS: [...new Set(all(p => p.between))],
  AND_WORDS: [...new Set(all(p => p.and))],
  // one-letter words ("a", "e", "o") would also swallow real initials like "A. Smith"
  LEGAL_STOP: new Set([...union(p => p.legalStop)].filter(w => w.length > 1)),
  ORG_WORDS: union(p => p.orgWords),
  PARTICLES: union(p => p.particles),
  FIRST_NAMES: union(p => p.firstNames),
  LAST_NAMES: union(p => p.lastNames),
  GENERIC_EMAIL_LOCALS: union(p => p.emailLocals),
  SIGNATURE_CONTEXT_SOURCE: all(p => [p.signature]).join('|'),
};
