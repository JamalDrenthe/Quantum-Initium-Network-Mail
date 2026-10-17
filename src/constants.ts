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
    tagline: 'Centrale holding en AI infrastructuur'
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
    category: 'FinTech en AI Trading',
    tagline: 'Geautomatiseerd vermogensbeheer en arbitrage'
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
    subject: 'Welkom bij Quantum Initium Holding en Kerntechnologie',
    senderName: 'Quantum Initium Directie',
    senderEmail: 'admin@quantuminitium.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'QIN_Centraal_Protocol_2026.pdf',
    body: `Beste netwerkpartner,

Welkom bij Quantum Initium, het overkoepelende directieorgaan en de technologische kern van ons ecosysteem.

Vanaf heden is jouw zakelijke adres op dit domein geactiveerd. Alle centrale directiemededeelingen, overkoepelende synergieplannen en strategische investeringslijnen ontvang je rechtstreeks in deze centrale inbox.

Jouw voordelen binnen de holding:
1. Centraal Overzicht: Eén uniform dashboard voor alle twaalf netwerkbedrijven
2. Directe Bestuurslijn: Razendsnel schakelen via het centrale QI Chat kanaal
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
    attachment: 'VVC_Synergie_Kader_2026.pdf',
    body: `Beste vriend en netwerklid,

Welkom bij de Verdienende Vrienden Club (VVC). Binnen onze besloten kring delen we deals, syndicate partnerships en gezamenlijke ondernemerskansen.

Wat kun je in dit postvak verwachten?
1. Exclusieve investeringsvoorstellen voordat deze publiek bekend worden
2. Uitnodigingen voor onze besloten kwartaalsessies en diners
3. Geconsolideerde winstdelingen in combinatie met Investbotiq en WoningVry

Laat in de VVC chat gerust weten wie je bent en welke synergie jij zoekt.

Hartelijke groet,
Bestuur Verdienende Vrienden Club`,
    timestamp: Date.now() - 1000 * 60 * 300
  },
  {
    companyId: 'investbotiq',
    subject: 'Welkom bij Investbotiq FinTech en Algoritmische Trading Desk',
    senderName: 'Investbotiq Trading Desk',
    senderEmail: 'admin@investbotiq.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'Investbotiq_Algoritme_Audit.pdf',
    body: `Geachte investeerder en partner,

Welkom bij Investbotiq. Wij beheren geautomatiseerde handelsstrategieën, realtime risicomodellen en liquiditeitsarbitrage voor aangesloten netwerkleden.

Via dit postvak ontvang je periodiek:
• Wekelijkse en maandelijkse rendementsrapportages
• Systeemstatistieken van onze AI trading bots
• Meldingen bij marktopportuniteiten en kapitaalallocatie

De trading desk monitort 24 uur per dag en communiceert realtime via ons Investbotiq kanaal.

Met vriendelijke groet,
Investbotiq Algoritmisch Beheer`,
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
• Synergie mogelijkheden voor financiering in samenwerking met VVC

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
    text: 'Welkom in QI Chat. Dit is de beveiligde communicatielijn voor alle twaalf bedrijven binnen het netwerk.',
    timestamp: Date.now() - 1000 * 60 * 350,
    status: 'read'
  },
  {
    channelId: 'immigratiepunt',
    companyId: 'immigratiepunt',
    senderId: 'system_admin',
    senderName: 'Immigratiepunt Relocatieteam',
    isAdmin: true,
    text: 'Welkom in het Immigratiepunt kanaal. Stel hier al je vragen over kennismigranten en verblijfsaanvragen.',
    timestamp: Date.now() - 1000 * 60 * 320,
    status: 'read'
  },
  {
    channelId: 'vvc',
    companyId: 'vvc',
    senderId: 'system_admin',
    senderName: 'VVC Bestuur',
    isAdmin: true,
    text: 'Welkom bij VVC. Hier delen we syndicate updates en bespreken we nieuwe investeringskansen.',
    timestamp: Date.now() - 1000 * 60 * 290,
    status: 'read'
  },
  {
    channelId: 'investbotiq',
    companyId: 'investbotiq',
    senderId: 'system_admin',
    senderName: 'Investbotiq Trading Desk',
    isAdmin: true,
    text: 'Welkom bij Investbotiq. De geautomatiseerde arbitrage modules zijn 24 uur per dag actief.',
    timestamp: Date.now() - 1000 * 60 * 260,
    status: 'read'
  },
  {
    channelId: 'spontiva',
    companyId: 'spontiva',
    senderId: 'system_admin',
    senderName: 'Spontiva Hospitality',
    isAdmin: true,
    text: 'Welkom in het Spontiva kanaal. VIP reserveringen en eventvragen kunnen hier worden geplaatst.',
    timestamp: Date.now() - 1000 * 60 * 230,
    status: 'read'
  },
  {
    channelId: 'boostplug',
    companyId: 'boostplug',
    senderId: 'system_admin',
    senderName: 'Boostplug Performance Team',
    isAdmin: true,
    text: 'Welkom bij Boostplug. We staan klaar om jouw leadcampagnes naar het volgende niveau te tillen.',
    timestamp: Date.now() - 1000 * 60 * 200,
    status: 'read'
  },
  {
    channelId: 'zheavenzy',
    companyId: 'zheavenzy',
    senderId: 'system_admin',
    senderName: 'Zheavenzy Brand Management',
    isAdmin: true,
    text: 'Welkom bij Zheavenzy. Vragen over de luxury collectie en wholesale kun je direct hier stellen.',
    timestamp: Date.now() - 1000 * 60 * 170,
    status: 'read'
  },
  {
    channelId: 'logs_rent',
    companyId: 'logs_rent',
    senderId: 'system_admin',
    senderName: 'Logs Rent Planning',
    isAdmin: true,
    text: 'Welkom bij Logs Rent. Voertuigreserveringen en vlootplanning coördineren we via dit kanaal.',
    timestamp: Date.now() - 1000 * 60 * 140,
    status: 'read'
  },
  {
    channelId: 'crmos',
    companyId: 'crmos',
    senderId: 'system_admin',
    senderName: 'CRMos Systeembeheer',
    isAdmin: true,
    text: 'Welkom bij CRMos. Technische integratieverzoeken en databasevragen kun je hier melden.',
    timestamp: Date.now() - 1000 * 60 * 110,
    status: 'read'
  },
  {
    channelId: 'djobba',
    companyId: 'djobba',
    senderId: 'system_admin',
    senderName: 'Djobba Talent Desk',
    isAdmin: true,
    text: 'Welkom bij Djobba. Zoek je nieuw talent voor jouw organisatie? Deel hier je wensen.',
    timestamp: Date.now() - 1000 * 60 * 80,
    status: 'read'
  },
  {
    channelId: 'trusting_work',
    companyId: 'trusting_work',
    senderId: 'system_admin',
    senderName: 'Trusting Work Kwaliteitsbeheer',
    isAdmin: true,
    text: 'Welkom bij Trusting Work. Contractcontroles en HR compliance vraagstukken worden hier opgepakt.',
    timestamp: Date.now() - 1000 * 60 * 50,
    status: 'read'
  },
  {
    channelId: 'woningvry',
    companyId: 'woningvry',
    senderId: 'system_admin',
    senderName: 'WoningVry Acquisitieteam',
    isAdmin: true,
    text: 'Welkom bij WoningVry. Vragen over onze off market dossiers beantwoorden we graag direct in dit kanaal.',
    timestamp: Date.now() - 1000 * 60 * 20,
    status: 'read'
  }
];

export const SAMPLE_BUSINESS_EMAILS: Omit<NetworkEmail, 'id'>[] = [
  {
    companyId: 'quantum_initium',
    subject: 'Voorbeeldmail: Strategische Groeiprognose en Synergie Rapportage',
    senderName: 'Quantum Initium Raad van Bestuur',
    senderEmail: 'admin@quantuminitium.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'QIN_Strategische_Prognose_2026.pdf',
    body: `Geachte netwerkpartner,

Dit is een voorbeeld van een officiële directiemededeling van Quantum Initium.

Onderwerp van deze rapportage:
• Geconsolideerde omzet en synergievoordelen over alle twaalf aangesloten bedrijven
• Uitrol van het geautomatiseerde Firebase datamodel voor realtime synchronisatie
• Planning van de eerstvolgende fysieke aandeelhoudersbijeenkomst

In de bijlage vind je de volledige financiële toelichting. Vragen kunnen direct gesteld worden in het centrale directiekanaal van QI Chat.

Hoogachtend,
Raad van Bestuur Quantum Initium`,
    timestamp: Date.now() - 1000 * 60 * 5
  },
  {
    companyId: 'immigratiepunt',
    subject: 'Voorbeeldmail: Goedkeuring Kennismigrantendossier en Visumbesluit',
    senderName: 'Immigratiepunt Relocatieteam',
    senderEmail: 'admin@immigratiepunt.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'IND_Besluit_Kennismigrant_Dossier.pdf',
    body: `Beste collega,

Hierbij ontvang je een voorbeeldupdate inzake een lopend kennismigrantendossier.

De Immigratie en Naturalisatiedienst heeft het dossier van de senior software engineer positief beoordeeld. Het tewerkstellingsvisum is met succes toegekend.

Vervolgstappen:
1. Afspraak inplannen voor biometrische registratie en ophalen verblijfspas
2. Huisvestingsafstemming starten met WoningVry
3. Aanmelden in CRMos voor payrollkoppeling via Trusting Work

Met vriendelijke groet,
Team Immigratiepunt`,
    timestamp: Date.now() - 1000 * 60 * 12
  },
  {
    companyId: 'vvc',
    subject: 'Voorbeeldmail: Dividenduitkering en Nieuw Investeringssyndicaat',
    senderName: 'VVC Bestuur',
    senderEmail: 'admin@vvcclub.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'VVC_Dividend_Specificatie_Q4.xlsx',
    body: `Beste VVC netwerklid,

Hierbij ontvang je een voorbeeldbericht van jouw persoonlijke kwartaaluitkering vanuit de Verdienende Vrienden Club.

Overzicht:
• Uitgekeerd dividend over lopende syndicate projecten
• Toelichting op de samenwerking met Investbotiq arbitrage en WoningVry vastgoed
• Voorinschrijving geopend voor het nieuwe scaleup fonds

Je kunt jouw deelname bevestigen via de VVC chatroom.

Hartelijke groet,
Bestuur VVC`,
    timestamp: Date.now() - 1000 * 60 * 18
  },
  {
    companyId: 'investbotiq',
    subject: 'Voorbeeldmail: Arbitrage Rendement en Systeemnotificatie Desk',
    senderName: 'Investbotiq Trading Desk',
    senderEmail: 'admin@investbotiq.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'Investbotiq_Trade_Logboek.pdf',
    body: `Geachte relatie,

Dit is een voorbeeld van een realtime handelsmelding van de Investbotiq desk.

Systeemprestaties afgelopen 24 uur:
• Aantal uitgevoerde arbitrage transacties: 342
• Gemiddelde spreadsnelheid: 14 milliseconden
• Gerealiseerd netto rendement op allocatie: plus 1.84 procent

Alle transacties zijn cryptografisch vastgelegd in CRMos. De risicomodellen opereren binnen de veilige marges.

Met vriendelijke groet,
Investbotiq Trading Desk`,
    timestamp: Date.now() - 1000 * 60 * 25
  },
  {
    companyId: 'spontiva',
    subject: 'Voorbeeldmail: VIP Uitnodiging Exclusieve Directielunch Spontiva',
    senderName: 'Spontiva Hospitality',
    senderEmail: 'admin@spontiva.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'VIP_Toegangsbewijs_Directielunch.pdf',
    body: `Beste relatie,

Hierbij ontvang je een voorbeeld van een exclusieve Spontiva VIP uitnodiging.

Programma:
• Ontvangst met champagne en netwerkreceptie
• Viergangen walking dinner verzorgd door sterrenchefs
• Keynote presentatie over de toekomst van het Quantum Initium Network

Bevestig je komst via het bijgevoegde VIP toegangsbewijs of meld het in de Spontiva QI Chat.

Met gastvrije groet,
Spontiva Events Team`,
    timestamp: Date.now() - 1000 * 60 * 32
  },
  {
    companyId: 'boostplug',
    subject: 'Voorbeeldmail: Maandrapportage 148 Gekwalificeerde Zakelijke Leads',
    senderName: 'Boostplug Performance Team',
    senderEmail: 'admin@boostplug.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Boostplug_Lead_Acquisitie_Rapport.pdf',
    body: `Beste partner,

Dit is een voorbeeld van een Boostplug marketing eindrapportage.

Resultaten van de afgelopen campagne:
• 148 geverifieerde zakelijke leads direct doorgeschoten naar CRMos
• Kosten per gekwalificeerde aanvraag gedaald met 22 procent
• Conversieratio op de landingspagina gestegen naar 6.4 procent

Wil je de advertentiebudgetten opschalen voor de komende periode? Neem contact op via ons kanaal.

Met vriendelijke groet,
Boostplug Growth Desk`,
    timestamp: Date.now() - 1000 * 60 * 40
  },
  {
    companyId: 'zheavenzy',
    subject: 'Voorbeeldmail: Bestelbevestiging en Leveringsschema Luxury Collectie',
    senderName: 'Zheavenzy Directie',
    senderEmail: 'admin@zheavenzy.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Zheavenzy_Factuur_en_Pakbon.pdf',
    body: `Geachte klant,

Dit is een voorbeeld van een orderbevestiging uit het Zheavenzy luxury ecommerce segment.

Jouw bestelling is met zorg samengesteld in ons beveiligde distributiecentrum. De artikelen worden discreet en verzekerd verzonden met Logs Rent transport.

Details:
• Ordernummer: ZH 88921
• Verwachte bezorging: Binnen 24 uur op het gewenste directieadres
• Certificaat van echtheid bijgevoegd

Met stijlvolle groet,
Zheavenzy Luxury Concierge`,
    timestamp: Date.now() - 1000 * 60 * 48
  },
  {
    companyId: 'logs_rent',
    subject: 'Voorbeeldmail: Bevestiging Reservering Bedrijfswagen en Huurovereenkomst',
    senderName: 'Logs Rent Planning',
    senderEmail: 'admin@logsrent.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'LogsRent_Huurovereenkomst_Vloot.pdf',
    body: `Beste partner,

Hierbij ontvang je een voorbeeld van een Logs Rent wagenparkreservering.

Gereserveerd voertuig:
• Model: Mercedes Benz Sprinter Executive Black Edition
• Inzetperiode: Komende maandag tot en met vrijdag
• Inclusief all risk verzekering en onbeperkte kilometers binnen de Benelux

De digitale sleutel is geactiveerd in de vlootapp. Vragen kunnen worden gesteld via de Logs Rent chat.

Met vriendelijke groet,
Logs Rent Planning`,
    timestamp: Date.now() - 1000 * 60 * 55
  },
  {
    companyId: 'crmos',
    subject: 'Voorbeeldmail: API Sleutel en Cloud Database Koppelingsbevestiging',
    senderName: 'CRMos Cloud Engineering',
    senderEmail: 'admin@crmos.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: false,
    readBy: [],
    attachment: 'CRMos_API_Configuratie.json',
    body: `Goedendag,

Dit is een voorbeeld van een technisch systeembericht van CRMos.

Jouw API koppeling met Google Firebase Firestore is succesvol geverifieerd. Gegevens tussen leadformulieren, offertes en facturatie synchroniseren nu automatisch.

Systeeminformatie:
• Status: 100 procent uptime
• Beveiliging: End to end encryptie actief
• Verwerkte API calls vandaag: 4.812

Ondersteuning nodig bij verdere webhooks? Ons engineering team zit klaar in QI Chat.

Met vriendelijke groet,
CRMos Cloud Team`,
    timestamp: Date.now() - 1000 * 60 * 62
  },
  {
    companyId: 'djobba',
    subject: 'Voorbeeldmail: Drie Topkandidaten Beschikbaar voor Sollicitatie',
    senderName: 'Djobba Talent Desk',
    senderEmail: 'admin@djobba.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Kandidaat_Dossiers_Overzicht.pdf',
    body: `Beste hiring manager,

Hierbij ontvang je een voorbeelduitnodiging voor kandidaatgesprekken vanuit Djobba.

We hebben drie uitstekende profielen geselecteerd voor de openstaande directiefuncties:
1. Senior Commercieel Directeur met 12 jaar ervaring in B2B tech
2. Lead Software Architect gespecialiseerd in gedistribueerde cloudsystemen
3. Interim Financial Controller met ervaring in holdingstructuren

In de bijlage vind je de geanonimiseerde CV's en assessments. Gesprekken kunnen direct worden gepland via onze chat.

Hartelijke groet,
Djobba Executive Search`,
    timestamp: Date.now() - 1000 * 60 * 70
  },
  {
    companyId: 'trusting_work',
    subject: 'Voorbeeldmail: Periodieke HR Audit en Compliance Goedkeuringscertificaat',
    senderName: 'Trusting Work Compliance',
    senderEmail: 'admin@trustingwork.qin',
    recipientScope: 'ALL',
    priority: 'Normaal',
    starred: false,
    readBy: [],
    attachment: 'Compliance_Certificaat_2026.pdf',
    body: `Geachte directie,

Dit is een voorbeeld van een periodieke compliance auditrapportage van Trusting Work.

Auditresultaten:
• Alle 84 arbeidsovereenkomsten binnen het netwerk voldoen aan de nieuwste wetgeving
• Verloningsprocessen en premieafdrachten zijn gecontroleerd en sluitend bevonden
• Het officiële Compliance Goedkeuringscertificaat 2026 is toegekend

Je kunt het certificaat downloaden via de bijlage.

Met vriendelijke groet,
Trusting Work Kwaliteitsbeheer`,
    timestamp: Date.now() - 1000 * 60 * 78
  },
  {
    companyId: 'woningvry',
    subject: 'Voorbeeldmail: Nieuw Vastgoedbeleggingsdossier Amsterdam en Utrecht',
    senderName: 'WoningVry Acquisitie',
    senderEmail: 'admin@woningvry.qin',
    recipientScope: 'ALL',
    priority: 'Hoog',
    starred: true,
    readBy: [],
    attachment: 'WoningVry_Exclusief_Pand_Overzicht.pdf',
    body: `Beste belegger,

Hierbij ontvang je een voorbeeld van een exclusief off market vastgoeddossier van WoningVry.

Objectomschrijving:
• Type: Monumentaal herenhuis opgesplitst in 4 verhuurde luxe appartementen
• Locatie: Centrum Amsterdam nabij de grachtengordel
• Huidig netto huurrendement: 7.2 procent per jaar
• Status: Volledig gerenoveerd en langdurig verhuurd aan expats

Leden van het Quantum Initium Network hebben 72 uur het eerste recht van koop. Bezichtigingen kunnen worden aangevraagd in ons chatkanaal.

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
    summary: 'Jaarlijkse strategiedag op landgoed Duin & Kruidberg op 18 november 2026.',
    pinnedBy: 'Directie Quantum Initium',
    timestamp: Date.now() - 1000 * 60 * 120
  },
  {
    id: 'pin-2',
    channelId: 'immigratiepunt',
    emailId: 'mail-seed-2',
    emailSubject: 'Kwartaalupdate Kennismigranten en IND Wetgeving Q4',
    companyId: 'immigratiepunt',
    summary: 'Versnelde procedure voor erkend referentschap en verhoogde salariscriteria per 2026.',
    pinnedBy: 'Immigratiepunt Relocatie',
    timestamp: Date.now() - 1000 * 60 * 60
  }
];


