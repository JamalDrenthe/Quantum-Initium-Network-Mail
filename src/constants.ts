import { Company, NetworkEmail, NetworkChat, PinnedTopic } from './types.ts';

export const COMPANIES: Company[] = [
  {
    id: 'quantum_initium',
    name: 'Quantum Initium',
    short: 'QI',
    domain: 'quantuminitium.qin',
    color: '#6366f1',
    accentColor: '#4338ca',
    category: 'Holding en Kerntechnologie',
    tagline: 'Centrale holding en technologiebeheer'
  },
  {
    id: 'immigratiepunt',
    name: 'Immigratiepunt',
    short: 'IP',
    domain: 'immigratiepunt.qin',
    color: '#0284c7',
    accentColor: '#0369a1',
    category: 'Juridisch en Relocatie',
    tagline: 'Kennismigranten en juridische begeleiding'
  },
  {
    id: 'vvc',
    name: 'VVC Verdienende Vrienden Club',
    short: 'VVC',
    domain: 'vvcclub.qin',
    color: '#d97706',
    accentColor: '#b45309',
    category: 'Community en Netwerk',
    tagline: 'Exclusieve netwerkkring en syndicaten'
  },
  {
    id: 'investbotiq',
    name: 'Investbotiq',
    short: 'IB',
    domain: 'investbotiq.qin',
    color: '#059669',
    accentColor: '#047857',
    category: 'FinTech en Vermogensbeheer',
    tagline: 'Kwantitatieve handelsstrategieën en vermogensbeheer'
  },
  {
    id: 'spontiva',
    name: 'Spontiva',
    short: 'SP',
    domain: 'spontiva.qin',
    color: '#db2777',
    accentColor: '#be185d',
    category: 'Events en Lifestyle',
    tagline: 'Zakelijke bijeenkomsten en hospitality'
  },
  {
    id: 'boostplug',
    name: 'Boostplug',
    short: 'BP',
    domain: 'boostplug.qin',
    color: '#ea580c',
    accentColor: '#c2410c',
    category: 'Groei en Marketing',
    tagline: 'Leadgeneratie en schaalbare marketing'
  },
  {
    id: 'zheavenzy',
    name: 'Zheavenzy',
    short: 'ZH',
    domain: 'zheavenzy.qin',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    category: 'Commerce en Luxury',
    tagline: 'High end lifestyle en retail platforms'
  },
  {
    id: 'logs_rent',
    name: 'Logs Rent',
    short: 'LR',
    domain: 'logsrent.qin',
    color: '#64748b',
    accentColor: '#475569',
    category: 'Logistiek en Verhuur',
    tagline: 'Fleet management en materieel'
  },
  {
    id: 'crmos',
    name: 'CRMos',
    short: 'CRM',
    domain: 'crmos.qin',
    color: '#0891b2',
    accentColor: '#0e7490',
    category: 'Enterprise Software',
    tagline: 'Centraal CRM en partnerbeheer'
  },
  {
    id: 'djobba',
    name: 'Djobba',
    short: 'DJ',
    domain: 'djobba.qin',
    color: '#eab308',
    accentColor: '#ca8a04',
    category: 'Recruitment en Talent',
    tagline: 'Werving en executive search'
  },
  {
    id: 'trusting_work',
    name: 'Trusting Work',
    short: 'TW',
    domain: 'trustingwork.qin',
    color: '#0d9488',
    accentColor: '#0f766e',
    category: 'HR en Compliance',
    tagline: 'Arbeidscontracten en kwaliteitsborging'
  },
  {
    id: 'woningvry',
    name: 'WoningVry',
    short: 'WV',
    domain: 'woningvry.qin',
    color: '#e11d48',
    accentColor: '#be123c',
    category: 'Vastgoed en Wonen',
    tagline: 'Exclusieve off market vastgoeddossiers'
  }
];

export const INITIAL_EMAILS_SEED: Omit<NetworkEmail, 'id'>[] = [
  {
    companyId: 'quantum_initium',
    subject: 'Welkom bij Quantum Initium Holding',
    senderName: 'Quantum Initium Directie',
    senderEmail: 'admin@quantuminitium.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'QIN_Centraal_Protocol_2026.pdf',
    body: `Beste netwerkpartner,

Welkom bij Quantum Initium, de centrale directie- en technologieholding van onze aangesloten ondernemingen.

Vanaf heden is jouw zakelijke adres op dit domein geactiveerd. Alle officiële directiemededelingen, kwartaalrapportages en strategische investeringslijnen ontvang je rechtstreeks in deze centrale inbox.

Jouw voordelen binnen de holding:
1. Centraal Overzicht: Eén uniform dashboard voor alle twaalf netwerkbedrijven
2. Directe Bestuurslijn: Snel schakelen via het centrale QI Chat kanaal
3. Gekoppelde Identiteit: Eén persoonlijke gebruikersnaam actief over alle twaalf domeinen

Voor dringende zaken kun je direct reageren via de chatfunctie hiernaast.

Met vriendelijke groet,
Raad van Bestuur Quantum Initium`,
    timestamp: Date.now() - 1000 * 60 * 360
  },
  {
    companyId: 'immigratiepunt',
    subject: 'Welkom bij Immigratiepunt Juridische Begeleiding en Relocatie',
    senderName: 'Immigratiepunt Relocatieteam',
    senderEmail: 'admin@immigratiepunt.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: true,
    readBy: [],
    attachment: 'Immigratiepunt_Kennismigrant_Gids.pdf',
    body: `Geachte relatie,

Hartelijk welkom bij Immigratiepunt, jouw juridische partner voor internationale kenniswerkers, visumaanvragen en zakelijke relocatietrajecten binnen de Europese Unie.

Vanaf nu ontvang je op dit adres alle updates betreffende:
• Status van kennismigranten dossiers
• Wijzigingen in de nationale en Europese wetgeving
• Versnelde IND procedures in samenwerking met Djobba en Trusting Work

Ons juridische team staat voor je klaar via het interne Immigratiepunt chatkanaal.

Met collegiale groet,
Directie Immigratiepunt`,
    timestamp: Date.now() - 1000 * 60 * 330
  },
  {
    companyId: 'vvc',
    subject: 'Welkom bij de Verdienende Vrienden Club (VVC Netwerkkring)',
    senderName: 'VVC Bestuur',
    senderEmail: 'admin@vvcclub.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'VVC_Investeringskader_2026.pdf',
    body: `Beste partner en netwerklid,

Welkom bij de Verdienende Vrienden Club (VVC). Binnen onze besloten kring delen we deals, syndicate partnerships en gezamenlijke investeringskansen.

Wat kun je in dit postvak verwachten?
1. Exclusieve investeringsvoorstellen voordat deze publiek bekend worden
2. Uitnodigingen voor onze besloten kwartaalsessies en directielunches
3. Geconsolideerde winstdelingen in combinatie met Investbotiq en WoningVry

Laat in de VVC chat gerust weten wie je bent en welke samenwerkingen je zoekt.

Hartelijke groet,
Bestuur Verdienende Vrienden Club`,
    timestamp: Date.now() - 1000 * 60 * 300
  },
  {
    companyId: 'investbotiq',
    subject: 'Welkom bij Investbotiq FinTech en Trading Desk',
    senderName: 'Investbotiq Trading Desk',
    senderEmail: 'admin@investbotiq.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'Investbotiq_Auditrapport_2026.pdf',
    body: `Geachte investeerder en partner,

Welkom bij Investbotiq. Wij beheren kwantitatieve handelsstrategieën, realtime risicomodellen en liquiditeitsarbitrage voor aangesloten netwerkleden.

Via dit postvak ontvang je periodiek:
• Wekelijkse en maandelijkse rendementsrapportages
• Kwantitatieve marktanalyses en prestatiestatistieken
• Meldingen bij marktopportuniteiten en kapitaalallocatie

De trading desk monitort de markten continu en communiceert realtime via ons Investbotiq kanaal.

Met vriendelijke groet,
Investbotiq Vermogensbeheer`,
    timestamp: Date.now() - 1000 * 60 * 270
  },
  {
    companyId: 'spontiva',
    subject: 'Welkom bij Spontiva Exclusieve Events en Zakelijke Hospitality',
    senderName: 'Spontiva Hospitality',
    senderEmail: 'admin@spontiva.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Spontiva_Evenementen_Kalender.pdf',
    body: `Beste netwerkpartner,

Welkom bij Spontiva, de hospitality en eventtak van ons netwerk. Wij verzorgen besloten bijeenkomsten, directielunches en exclusieve netwerkbelevingen.

In deze inbox ontvang je:
• Toegangskaarten en VIP registraties voor aankomende sessies
• Locatiereserveringen en besloten dinerarrangementen
• Mogelijkheden voor het hosten van eigen bedrijfsevenementen

Heb je specifieke dieet of reiswensen voor een komend event? Reageer eenvoudig via ons QI Chat kanaal.

Met gastvrije groet,
Team Spontiva`,
    timestamp: Date.now() - 1000 * 60 * 240
  },
  {
    companyId: 'boostplug',
    subject: 'Welkom bij Boostplug Groeiversnelling en Schaalbare Marketing',
    senderName: 'Boostplug Marketing Desk',
    senderEmail: 'admin@boostplug.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Boostplug_Groeiplan_Template.pdf',
    body: `Beste ondernemer,

Welkom bij Boostplug. Wij verzorgen geautomatiseerde leadgeneratie, advertentiecampagnes en conversie optimalisatie voor alle ondernemingen in ons netwerk.

Wat levert Boostplug jou op?
1. Voorspelbare instroom van hoogwaardige zakelijke leads
2. Directe integratie van formulieren en advertenties in CRMos
3. Continue monitoring van acquisitiekosten en ROI

Vragen over jouw groeicampagne? Open het Boostplug kanaal in QI Chat.

Met ondernemende groet,
Boostplug Performance Team`,
    timestamp: Date.now() - 1000 * 60 * 210
  },
  {
    companyId: 'zheavenzy',
    subject: 'Welkom bij Zheavenzy High End Lifestyle en Luxury Commerce',
    senderName: 'Zheavenzy Directie',
    senderEmail: 'admin@zheavenzy.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Zheavenzy_Collectie_Overzicht.pdf',
    body: `Geachte relatie,

Welkom bij Zheavenzy, ons platform gewijd aan verfijnde lifestyle producten, luxury retail en exclusieve merkartikelen.

In dit postvak informeren we je over:
• Nieuwe selecties binnen onze besloten catalogus
• Partnercondities voor retaildistributie
• Exclusieve pre orders en gelimiteerde releases

Voor zakelijke inkoop en samenwerkingen kun je direct chatten met onze accountmanager via QI Chat.

Met stijlvolle groet,
Zheavenzy Brand Management`,
    timestamp: Date.now() - 1000 * 60 * 180
  },
  {
    companyId: 'logs_rent',
    subject: 'Welkom bij Logs Rent Logistiek en Fleet Verhuuroplossingen',
    senderName: 'Logs Rent Vlootbeheer',
    senderEmail: 'admin@logsrent.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'LogsRent_Vloot_Tarieven.pdf',
    body: `Goedendag,

Welkom bij Logs Rent, de materieel en wagenparkbeheerder van het netwerk. Wij zorgen voor betrouwbaar vervoer, tijdelijke bedrijfswagens en flexibele logistieke oplossingen.

Wat mag je van Logs Rent verwachten?
1. Direct inzetbare voertuigen met scherpe netwerktarieven
2. Geautomatiseerd kilometer en onderhoudsbeheer via CRMos
3. 24 uurs pechhulp en vervangend vervoer binnen heel Nederland

Vlootreserveringen kunnen direct worden doorgegeven in ons chatkanaal.

Met vriendelijke groet,
Logs Rent Planning`,
    timestamp: Date.now() - 1000 * 60 * 150
  },
  {
    companyId: 'crmos',
    subject: 'Welkom bij CRMos Enterprise Software en Partnerbeheer',
    senderName: 'CRMos Cloud Engineering',
    senderEmail: 'admin@crmos.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'CRMos_Handleiding_Systeemkoppeling.pdf',
    body: `Beste netwerkgebruiker,

Welkom bij CRMos, de centrale softwaremotor die alle twaalf netwerkbedrijven data technisch met elkaar verbindt.

Jouw account is nu geregistreerd op het platform. Hierdoor geniet je van:
• Centrale lead en klantopvolging tussen alle zusterbedrijven
• Automatische rapportages en contractstatussen
• Veilige dataopslag powered by Google Firebase Firestore

Technische ondersteuning en koppelingsverzoeken worden behandeld in het CRMos QI Chat kanaal.

Met vriendelijke groet,
CRMos Systeembeheer`,
    timestamp: Date.now() - 1000 * 60 * 120
  },
  {
    companyId: 'djobba',
    subject: 'Welkom bij Djobba Recruitment en Executive Talent Matching',
    senderName: 'Djobba Talent Desk',
    senderEmail: 'admin@djobba.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Djobba_Werving_Profielen.pdf',
    body: `Beste partner,

Welkom bij Djobba, ons gespecialiseerde wervingsbureau voor technische specialisten, commerciële toppers en directiefuncties.

In dit postvak ontvang je:
• Kandidaatdossiers die exact aansluiten op jouw personeelsbehoefte
• Updates over actuele vacaturecampagnes
• Afstemming met Immigratiepunt voor buitenlandse kennismigranten

Heb je per direct versterking nodig? Stuur direct een bericht in de Djobba chatlijn.

Hartelijke groet,
Team Djobba`,
    timestamp: Date.now() - 1000 * 60 * 90
  },
  {
    companyId: 'trusting_work',
    subject: 'Welkom bij Trusting Work HR Kwaliteitsborging en Compliance',
    senderName: 'Trusting Work Compliance',
    senderEmail: 'admin@trustingwork.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'TrustingWork_Compliance_Richtlijn.pdf',
    body: `Geachte relatie,

Welkom bij Trusting Work. Wij borgen de juridische en administratieve kwaliteit van alle arbeidsrelaties, verloningen en arbo richtlijnen binnen het netwerk.

Wat regelt Trusting Work voor jou?
1. Sluitende arbeidsovereenkomsten en geheimhoudingsverklaringen
2. Periodieke compliance checks conform actuele wetgeving
3. Harmonisatie van personeelsvoorwaarden binnen alle netwerkpartners

Voor contractcontroles kun je dossiers direct delen via de chat.

Met vriendelijke groet,
Trusting Work Kwaliteitsbeheer`,
    timestamp: Date.now() - 1000 * 60 * 60
  },
  {
    companyId: 'woningvry',
    subject: 'Welkom bij WoningVry Exclusieve Off Market Vastgoedportefeuille',
    senderName: 'WoningVry Acquisitie',
    senderEmail: 'admin@woningvry.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'WoningVry_Vastgoed_Introductie.pdf',
    body: `Beste investeerder en partner,

Welkom bij WoningVry, de vastgoedpoot van het Quantum Initium Network. Wij verwerven en beheren residentiële en commerciële vastgoedobjecten die niet op de openbare markt verschijnen.

Via dit adres krijg je exclusieve toegang tot:
• Voorinschrijvingen op verhuurde beleggingspanden met direct rendement
• Herontwikkelingsprojecten in de Randstad en groeiregio's
• Financieringsmogelijkheden en syndicaatspartnerships in samenwerking met VVC

Bezichtigingsafspraken en rendementsberekeningen vraag je direct aan in het WoningVry QI Chat kanaal.

Met hartelijke groet,
WoningVry Acquisitieteam`,
    timestamp: Date.now() - 1000 * 60 * 30
  }
];

export const INITIAL_CHATS_SEED: Omit<NetworkChat, 'id'>[] = [
  {
    channelId: 'algemeen',
    companyId: 'quantum_initium',
    senderId: 'system_admin',
    senderName: 'Quantum Initium Directie',
    isAdmin: true,
    text: 'Goedemorgen directie en partners. De geconsolideerde holdingomzet van € 14.280.000,- is definitief vastgesteld in het directiedossier.',
    timestamp: Date.now() - 1000 * 60 * 350,
    status: 'read'
  },
  {
    channelId: 'immigratiepunt',
    companyId: 'immigratiepunt',
    senderId: 'system_admin',
    senderName: 'Immigratiepunt Relocatieteam',
    isAdmin: true,
    text: 'Update IND-portaal: De nieuwe kennismigrantencriteria voor 2026 zijn van kracht. Minimum bruto maandsalaris bedraagt € 5.670,-.',
    timestamp: Date.now() - 1000 * 60 * 320,
    status: 'read'
  },
  {
    channelId: 'vvc',
    companyId: 'vvc',
    senderId: 'system_admin',
    senderName: 'VVC Bestuur',
    isAdmin: true,
    text: 'De voorinschrijving voor het nieuwe scale-up investeringssyndicaat met een tranche van € 250.000,- is geopend en sluit vrijdag om 17:00 uur.',
    timestamp: Date.now() - 1000 * 60 * 290,
    status: 'read'
  },
  {
    channelId: 'investbotiq',
    companyId: 'investbotiq',
    senderId: 'system_admin',
    senderName: 'Investbotiq Trading Desk',
    isAdmin: true,
    text: 'Kwantitatieve desk rapportage: Dagwinst van € 4.320,00 gerealiseerd op de liquiditeitsdesk. Rendement: +0.42%.',
    timestamp: Date.now() - 1000 * 60 * 260,
    status: 'read'
  },
  {
    channelId: 'spontiva',
    companyId: 'spontiva',
    senderId: 'system_admin',
    senderName: 'Spontiva Hospitality',
    isAdmin: true,
    text: 'De tafelschikking voor de directielunch op Duin & Kruidberg is bevestigd. Arrangementprijs is vastgesteld op € 495,- p.p.',
    timestamp: Date.now() - 1000 * 60 * 230,
    status: 'read'
  },
  {
    channelId: 'boostplug',
    companyId: 'boostplug',
    senderId: 'system_admin',
    senderName: 'Boostplug Performance Team',
    isAdmin: true,
    text: 'Resultaat wekelijkse leadcampagne: 34 nieuwe gekwalificeerde B2B-leads ingeladen met een geschatte orderwaarde van € 34.200,-.',
    timestamp: Date.now() - 1000 * 60 * 200,
    status: 'read'
  },
  {
    channelId: 'zheavenzy',
    companyId: 'zheavenzy',
    senderId: 'system_admin',
    senderName: 'Zheavenzy Brand Management',
    isAdmin: true,
    text: 'Nieuwe luxe order #ZH-88921 ter waarde van € 12.850,00 is goedgekeurd voor verzekerde distributie via Logs Rent.',
    timestamp: Date.now() - 1000 * 60 * 170,
    status: 'read'
  },
  {
    channelId: 'logs_rent',
    companyId: 'logs_rent',
    senderId: 'system_admin',
    senderName: 'Logs Rent Planning',
    isAdmin: true,
    text: 'Vlootupdate: Twee extra representatieve directievoertuigen zijn gereedgemaakt en direct reserveerbaar via de portal.',
    timestamp: Date.now() - 1000 * 60 * 140,
    status: 'read'
  },
  {
    channelId: 'crmos',
    companyId: 'crmos',
    senderId: 'system_admin',
    senderName: 'CRMos Systeembeheer',
    isAdmin: true,
    text: 'Systeemonderhoud succesvol afgerond. Alle API-webhooks en partnerkoppelingen functioneren op 100% capaciteit.',
    timestamp: Date.now() - 1000 * 60 * 110,
    status: 'read'
  },
  {
    channelId: 'djobba',
    companyId: 'djobba',
    senderId: 'system_admin',
    senderName: 'Djobba Talent Desk',
    isAdmin: true,
    text: 'Shortlist voor de vacature Head of Operations is samengesteld; de eerste gespreksrondes zijn ingepland.',
    timestamp: Date.now() - 1000 * 60 * 80,
    status: 'read'
  },
  {
    channelId: 'trusting_work',
    companyId: 'trusting_work',
    senderId: 'system_admin',
    senderName: 'Trusting Work Kwaliteitsbeheer',
    isAdmin: true,
    text: 'De periodieke compliance-controle op alle arbeidscontracten is afgerond zonder afwijkingen. Certificaat is gedeponeerd.',
    timestamp: Date.now() - 1000 * 60 * 50,
    status: 'read'
  },
  {
    channelId: 'woningvry',
    companyId: 'woningvry',
    senderId: 'system_admin',
    senderName: 'WoningVry Acquisitieteam',
    isAdmin: true,
    text: 'Nieuw off-market herenhuis Singel opgenomen in portfolio. Vraagprijs: € 1.850.000,- k.k. met 7.2% aanvangsrendement.',
    timestamp: Date.now() - 1000 * 60 * 20,
    status: 'read'
  }
];

export const SAMPLE_BUSINESS_EMAILS: Omit<NetworkEmail, 'id'>[] = [
  {
    companyId: 'quantum_initium',
    subject: 'Strategische Groeiprognose en Kwartaalrapportage Q4',
    senderName: 'Quantum Initium Raad van Bestuur',
    senderEmail: 'admin@quantuminitium.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'QIN_Strategische_Prognose_2026.pdf',
    body: `Geachte netwerkpartner,

Hierbij ontvangt u de formele kwartaalrapportage van Quantum Initium Holding.

Belangrijkste financiële kerncijfers:
• Geconsolideerde omzet holding: € 14.280.000,- over het afgelopen boekjaar
• Gerealiseerde nettomarge: € 2.450.000,-
• Beschikbare liquiditeitsreserve voor syndicaatspartnerships: € 5.800.000,-
• Planning van de eerstvolgende fysieke aandeelhoudersbijeenkomst

In de bijlage treft u de volledige financiële toelichting aan. Vragen kunnen direct worden gericht aan het directieteam via het centrale kanaal.

Hoogachtend,
Raad van Bestuur Quantum Initium`,
    timestamp: Date.now() - 1000 * 60 * 5
  },
  {
    companyId: 'immigratiepunt',
    subject: 'Goedkeuring Kennismigrantendossier en Toewijzing Tewerkstellingsvisum',
    senderName: 'Immigratiepunt Relocatieteam',
    senderEmail: 'admin@immigratiepunt.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'IND_Besluit_Kennismigrant_Dossier.pdf',
    body: `Beste collega,

Hierbij informeren wij u over de afronding van het recente kennismigrantendossier.

De Immigratie- en Naturalisatiedienst (IND) heeft het dossier van de software specialist positief beoordeeld. Het tewerkstellingsvisum is officieel toegekend.

Financiële en operationele specificaties:
• Vastgesteld minimaal bruto maandsalaris kennismigrant: € 5.670,- per maand
• Voldane IND behandelleges en garantstellingsdepot: € 3.850,-
• Aanvullende relocatievergoeding en expathuisvesting via WoningVry

Vervolgstappen:
1. Afspraak inplannen voor biometrische registratie en uitreiking van de verblijfspas
2. Huisvestingsbegeleiding opstarten via WoningVry
3. Registratie in CRMos voor payrollverwerking via Trusting Work

Met vriendelijke groet,
Team Immigratiepunt`,
    timestamp: Date.now() - 1000 * 60 * 12
  },
  {
    companyId: 'vvc',
    subject: 'Dividenduitkering en Toelichting Nieuw Investeringssyndicaat',
    senderName: 'VVC Bestuur',
    senderEmail: 'admin@vvcclub.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'VVC_Dividend_Specificatie_Q4.xlsx',
    body: `Beste VVC-lid,

Hierbij ontvangt u de specificatie van uw persoonlijke kwartaaluitkering vanuit de Verdienende Vrienden Club.

Overzicht financiële allocaties:
• Uitgekeerd dividend over lopende syndicaatsprojecten: € 18.750,00 per participatie
• Totale syndicaatuitkering Q4 over de aangesloten kring: € 450.000,00
• Minimale instap voor het nieuwe scale-up fonds: € 25.000,00
• Toelichting op de gezamenlijke allocaties met Investbotiq en WoningVry

U kunt uw allocatie bevestigen via de VVC-chatroom.

Hartelijke groet,
Bestuur Verdienende Vrienden Club`,
    timestamp: Date.now() - 1000 * 60 * 18
  },
  {
    companyId: 'investbotiq',
    subject: 'Handelsupdate: Kwartaalrendement en Arbitragestatistieken Desk',
    senderName: 'Investbotiq Trading Desk',
    senderEmail: 'admin@investbotiq.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'Investbotiq_Trade_Logboek.pdf',
    body: `Geachte relatie,

Hierbij ontvangt u het overzicht van de kwantitatieve handelsdesk van Investbotiq.

Systeemprestaties afgelopen periode:
• Totale beheerde allocatie: € 4.500.000,00
• Aantal uitgevoerde geautomatiseerde transacties: 342
• Gemiddelde executiesnelheid: 14 milliseconden
• Gerealiseerd netto rendement op allocatie: +1.84% (totale nettowinst: € 82.800,00)
• Gemiddelde dagwinst per geautomatiseerde cyclus: € 1.340,00

Alle transacties zijn geverifieerd en vastgelegd conform het auditprotocol. De risicomodellen opereren binnen de gestelde bandbreedtes.

Met vriendelijke groet,
Investbotiq Trading Desk`,
    timestamp: Date.now() - 1000 * 60 * 25
  },
  {
    companyId: 'spontiva',
    subject: 'VIP Uitnodiging: Besloten Directielunch en Netwerkontvangst',
    senderName: 'Spontiva Hospitality',
    senderEmail: 'admin@spontiva.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'VIP_Toegangsbewijs_Directielunch.pdf',
    body: `Beste relatie,

Namens Spontiva nodigen wij u van harte uit voor de exclusieve najaarsdirectielunch.

Programma en condities:
• Ontvangst met aperitief en informele netwerkreceptie
• Viergangen walking dinner verzorgd door gerenommeerde chefs
• Arrangementprijs inclusief champagnereceptie en privé chef: € 495,- p.p.
• Exclusieve directietafel voor netwerkpartners (8 personen): € 3.960,- excl. btw
• Strategische toelichting op de koers van het ondernemersnetwerk

U kunt uw aanwezigheid bevestigen via het bijgevoegde VIP-toegangsbewijs of via het Spontiva chatkanaal.

Met gastvrije groet,
Spontiva Events Team`,
    timestamp: Date.now() - 1000 * 60 * 32
  },
  {
    companyId: 'boostplug',
    subject: 'Maandrapportage: 148 Gekwalificeerde Zakelijke Aanvragen',
    senderName: 'Boostplug Performance Team',
    senderEmail: 'admin@boostplug.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Boostplug_Lead_Acquisitie_Rapport.pdf',
    body: `Beste partner,

Hierbij ontvangt u de marketing-eindrapportage van de afgelopen campagneperiode.

Resultaten en conversie:
• 148 geverifieerde zakelijke leads direct doorgestuurd naar CRMos
• Gerealiseerde orderwaarde via gegenereerde leads: € 94.600,-
• Totale mediabudgetten afgelopen maand: € 8.200,-
• Netto acquisitiekosten per gekwalificeerde lead: € 55,40
• Conversieratio op de landingspagina gestegen naar 6.4%

Wenst u de mediabudgetten op te schalen voor de komende kwartaalcampagne? Neem gerust contact op via ons kanaal.

Met vriendelijke groet,
Boostplug Growth Desk`,
    timestamp: Date.now() - 1000 * 60 * 40
  },
  {
    companyId: 'zheavenzy',
    subject: 'Orderbevestiging en Leveringsschema Luxury Collectie',
    senderName: 'Zheavenzy Directie',
    senderEmail: 'admin@zheavenzy.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Zheavenzy_Factuur_en_Pakbon.pdf',
    body: `Geachte relatie,

Uw bestelling uit het Zheavenzy luxury segment is succesvol verwerkt en gereedgemaakt voor verzending.

Factuur- en leveringsdetails:
• Ordernummer: ZH-88921
• Totaalbedrag factuur: € 12.850,00 (voldaan via zakelijke overschrijving)
• Verzekerde verzendwaarde via Logs Rent transport: € 15.000,00
• Verwachte bezorging: Binnen 24 uur op het gewenste directieadres
• Certificaat van echtheid bijgevoegd in de zending

Met stijlvolle groet,
Zheavenzy Luxury Concierge`,
    timestamp: Date.now() - 1000 * 60 * 48
  },
  {
    companyId: 'logs_rent',
    subject: 'Bevestiging Wagenparkreservering en Huurovereenkomst',
    senderName: 'Logs Rent Planning',
    senderEmail: 'admin@logsrent.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'LogsRent_Huurovereenkomst_Vloot.pdf',
    body: `Beste partner,

Hierbij ontvangt u de bevestiging van uw zakelijke wagenparkreservering via Logs Rent.

Gereserveerd voertuig en tarieven:
• Model: Mercedes-Benz Sprinter Executive Black Edition
• Inzetperiode: Maandag t/m vrijdag
• Maandelijks leasetarief: € 1.350,- excl. btw
• Borgstelling via bedrijfsgarantie: € 2.500,-
• Inclusief all-risk dekking en onbeperkte kilometers binnen de Benelux

De digitale sleutel is geactiveerd in uw vlootaccount. Voor vragen kunt u terecht in het Logs Rent kanaal.

Met vriendelijke groet,
Logs Rent Planning`,
    timestamp: Date.now() - 1000 * 60 * 55
  },
  {
    companyId: 'crmos',
    subject: 'Systeemmelding: API Koppeling en Data Integratie Bevestigd',
    senderName: 'CRMos Cloud Engineering',
    senderEmail: 'admin@crmos.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'CRMos_API_Configuratie.json',
    body: `Geachte beheerder,

Hierbij ontvangt u de bevestiging van de technische integratie via CRMos.

Uw API-koppeling met het centrale gegevensplatform is succesvol geconfigureerd. Gegevens tussen leadformulieren, offertes en facturatie synchroniseren conform het schema.

Systeeminformatie en verwerking:
• Beschikbaarheid: 99.98% uptime afgelopen 30 dagen
• Totale transactiewaarde verwerkt via CRMos gateways: € 1.840.000,-
• Gemiddelde transactieomvang: € 382,50
• Beveiliging: End-to-end encryptie actief
• Verwerkte API transacties vandaag: 4.812

Voor ondersteuning bij geavanceerde webhooks staat ons engineering team klaar via QI Chat.

Met vriendelijke groet,
CRMos Systeembeheer`,
    timestamp: Date.now() - 1000 * 60 * 62
  },
  {
    companyId: 'djobba',
    subject: 'Kandidatenselectie: Drie Executives Beschikbaar voor Sollicitatie',
    senderName: 'Djobba Talent Desk',
    senderEmail: 'admin@djobba.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Kandidaat_Dossiers_Overzicht.pdf',
    body: `Beste directie,

Djobba heeft een gerichte selectie afgerond voor de openstaande directieposities.

Drie gekwalificeerde profielen zijn beschikbaar voor een kennismaking:
1. Senior Commercieel Directeur (salarisindicatie: € 145.000,- per jaar)
2. Lead Cloud Architect (salarisindicatie: € 120.000,- per jaar)
3. Interim Financial Controller (uurtarief: € 135,- per uur)

Vaste bemiddelingsfee executive placement: € 15.000,- per succesvolle plaatsing.

In de bijlage treft u de geanonimiseerde profielen en assessments aan. Gesprekken kunnen direct worden gecoördineerd via onze chat.

Hartelijke groet,
Djobba Executive Search`,
    timestamp: Date.now() - 1000 * 60 * 70
  },
  {
    companyId: 'trusting_work',
    subject: 'Auditresultaten: Periodieke HR Audit en Compliance Certificaat',
    senderName: 'Trusting Work Compliance',
    senderEmail: 'admin@trustingwork.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Compliance_Certificaat_2026.pdf',
    body: `Geachte directie,

Hierbij ontvangt u de resultaten van de periodieke compliance-audit van Trusting Work.

Auditresultaten en loonstatistieken:
• Alle 84 arbeidsovereenkomsten binnen het netwerk voldoen aan de actuele wetgeving
• Gecontroleerde geconsolideerde loonsom: € 3.420.000,-
• Gemiddeld jaarsalaris binnen het netwerk: € 68.500,-
• Verloningsprocessen en premieafdrachten zijn gecontroleerd en sluitend bevonden
• Het officiële Compliance Certificaat 2026 is toegekend

Het volledige auditrapport en het certificaat zijn bijgevoegd.

Met vriendelijke groet,
Trusting Work Compliance`,
    timestamp: Date.now() - 1000 * 60 * 78
  },
  {
    companyId: 'woningvry',
    subject: 'Investeringsdossier: Exclusief Off-Market Beleggingspand Amsterdam',
    senderName: 'WoningVry Acquisitie',
    senderEmail: 'admin@woningvry.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'WoningVry_Exclusief_Pand_Overzicht.pdf',
    body: `Beste belegger,

Hierbij ontvangt u een exclusief off-market vastgoeddossier van WoningVry.

Objectomschrijving en financiële details:
• Type: Monumentaal pand opgesplitst in 4 hoogwaardig verhuurde appartementen
• Locatie: Amsterdam Centrum (Singel)
• Koopsom: € 1.850.000,- k.k.
• Huidige jaarlijkse huuropbrengst: € 133.200,- (netto aanvangsrendement 7.2%)
• Verwachte meerwaarde na splitsingsvergunning: € 320.000,-
• Status: Volledig gerenoveerd en langdurig verhuurd aan expats

Aangesloten netwerkpartners hebben 72 uur het eerste recht van koop. Bezichtigingen kunnen worden aangevraagd via ons chatkanaal.

Met vriendelijke groet,
WoningVry Acquisitieteam`,
    timestamp: Date.now() - 1000 * 60 * 85
  }
];

export const INITIAL_PINNED_TOPICS_SEED: PinnedTopic[] = [
  {
    id: 'pin-1',
    channelId: 'algemeen',
    emailId: 'mail-seed-1',
    emailSubject: 'Officiele uitnodiging: Quantum Initium Network Partner Strategiedag 2026',
    companyId: 'quantum_initium',
    summary: 'Jaarlijkse strategiedag: Geconsolideerde omzet € 14.280.000,- en investeringskader Duin & Kruidberg.',
    pinnedBy: 'Directie Quantum Initium',
    timestamp: Date.now() - 1000 * 60 * 120
  },
  {
    id: 'pin-2',
    channelId: 'immigratiepunt',
    emailId: 'mail-seed-2',
    emailSubject: 'Kwartaalupdate Kennismigranten en IND Wetgeving Q4',
    companyId: 'immigratiepunt',
    summary: 'Kennismigranten en IND: Salariscriterium vastgesteld op € 5.670,- per maand conform richtlijn 2026.',
    pinnedBy: 'Immigratiepunt Relocatie',
    timestamp: Date.now() - 1000 * 60 * 60
  }
];


