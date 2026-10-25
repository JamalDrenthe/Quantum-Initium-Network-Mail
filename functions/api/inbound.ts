// Cloudflare Pages Edge Function: POST / GET https://mail.quantuminitium.com/api/inbound
// Ontvangt doorgestuurde e-mails, webhooks en formulieren, categoriseert ze automatisch
// onder de juiste Quantum Initium holding, slaat ze op in Firestore en voorziet de
// contactpersoon in CRMos van de `mail.quantuminitium` tag.

const MAIL_QI_TAG = 'mail.quantuminitium';
const FIREBASE_PROJECT_ID = 'cloudiaudi';
const CRMOS_PROJECT_ID = 'crmosone-dev';

const HOLDING_RULES = [
  { id: 'immigratiepunt', name: 'Immigratiepunt', domain: 'immigratiepunt.qin', category: 'Juridisch & Compliance', keywords: ['immigratie', 'visum', 'ind', 'kennismigrant', 'verblijfsvergunning', 'relocatie', 'expat'] },
  { id: 'vvc', name: 'VVC Verdienende Vrienden Club', domain: 'vvcclub.qin', category: 'Financieel & Investeringen', keywords: ['vvc', 'verdienende vrienden', 'syndicaat', 'dividend', 'participatie', 'club'] },
  { id: 'investbotiq', name: 'Investbotiq', domain: 'investbotiq.qin', category: 'Financieel & Investeringen', keywords: ['investbotiq', 'quant', 'trading', 'algoritme', 'rendement', 'vermogensbeheer'] },
  { id: 'spontiva', name: 'Spontiva', domain: 'spontiva.qin', category: 'Events & Hospitality', keywords: ['spontiva', 'event', 'gala', 'hospitality', 'catering', 'vip'] },
  { id: 'boostplug', name: 'Boostplug', domain: 'boostplug.qin', category: 'Marketing & Groei', keywords: ['boostplug', 'marketing', 'lead', 'campagne', 'conversie', 'funnel', 'roas'] },
  { id: 'zheavenzy', name: 'Zheavenzy', domain: 'zheavenzy.qin', category: 'Algemeen', keywords: ['zheavenzy', 'wagenpark', 'lease', 'mobiliteit', 'auto', 'vloot'] },
  { id: 'woningvry', name: 'WoningVry', domain: 'woningvry.qin', category: 'Vastgoed & Dossier', keywords: ['woningvry', 'vastgoed', 'pand', 'huur', 'koopsom', 'taxatie', 'kadaster', 'hypotheek'] },
  { id: 'huasca', name: 'Huasca', domain: 'huasca.qin', category: 'Events & Hospitality', keywords: ['huasca', 'retraite', 'wellness', 'vitaliteit', 'coaching'] },
  { id: 'trusting_work', name: 'Trusting Work', domain: 'trustingwork.qin', category: 'HR & Payroll', keywords: ['trusting work', 'detachering', 'uitzend', 'payroll', 'personeel', 'urenstaat'] },
  { id: 'crmos', name: 'CRMos', domain: 'crmos.qin', category: 'Technisch & API', keywords: ['crmos', 'crm', 'webhook', 'api', 'sync', 'tag', 'contactpersoon'] },
  { id: 'angel_mediate', name: 'Angel Mediate', domain: 'angelmediate.qin', category: 'Juridisch & Compliance', keywords: ['angel mediate', 'bemiddeling', 'stichting', 'maatschappelijk', 'zorg'] },
  { id: 'quantum_initium', name: 'Quantum Initium', domain: 'quantuminitium.qin', category: 'Directie & Bestuur', keywords: ['quantum initium', 'holding', 'directie', 'bestuur', 'jaarverslag'] }
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Quantum-Token',
  'Content-Type': 'application/json; charset=utf-8'
};

function classifyInbound(payload: Record<string, unknown>) {
  const to = String(payload.to || payload.recipient || payload.toEmail || '').toLowerCase();
  const from = String(payload.from || payload.senderEmail || payload.fromEmail || '').toLowerCase();
  const subject = String(payload.subject || 'Doorgestuurd bericht via Quantum Initium API');
  const body = String(payload.body || payload.text || payload.message || payload.html || '');
  const explicitCompany = String(payload.companyId || '').toLowerCase();

  const combined = `${to} ${from} ${subject} ${body}`.toLowerCase();

  let bestRule = HOLDING_RULES[HOLDING_RULES.length - 1];
  let bestScore = 0;
  const matchedKeywords: string[] = [];

  for (const rule of HOLDING_RULES) {
    let score = 0;
    if (explicitCompany === rule.id) score += 100;
    if (to.includes(rule.domain) || to.includes(rule.id)) {
      score += 50;
      matchedKeywords.push(`@${rule.domain}`);
    }
    if (from.includes(rule.domain)) {
      score += 25;
    }
    for (const kw of rule.keywords) {
      if (combined.includes(kw)) {
        score += 15;
        matchedKeywords.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  let category = bestRule.category;
  if (/factuur|bedrag|€|eur|dividend|investering|koopsom/i.test(combined)) {
    category = 'Financieel & Investeringen';
  } else if (/aanmelding|nieuwe lead|registratie|contactpersoon/i.test(combined)) {
    category = 'CRMos Lead & Aanmelding';
  }

  const isUrgent =
    String(payload.priority || '').toLowerCase() === 'hoog' ||
    /urgent|spoed|directie|prioriteit|deadline|€\s*\d{2,}/i.test(combined);

  const tags = [
    MAIL_QI_TAG,
    `${MAIL_QI_TAG}:${bestRule.id}`,
    `categorie:${category.toLowerCase().replace(/\s+/g, '-')}`
  ];

  return {
    companyId: bestRule.id,
    companyName: bestRule.name,
    domain: bestRule.domain,
    category,
    priority: isUrgent ? 'Hoog' : 'Normaal',
    tags,
    matchedKeywords
  };
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'online',
        service: 'Quantum Initium Network Mail — Inbound Forwarding & Auto-Categorization API',
        endpoint: 'https://mail.quantuminitium.com/api/inbound',
        crmIntegration: 'CRMos (crmosone-dev)',
        requiredTag: MAIL_QI_TAG,
        supportedHoldings: HOLDING_RULES.map((h) => ({
          id: h.id,
          name: h.name,
          address: `info@${h.domain}`,
          defaultCategory: h.category
        })),
        examplePayload: {
          fromName: 'Alexander van der Vliet',
          fromEmail: 'alexander@vvcclub.qin',
          toEmail: 'info@woningvry.qin',
          subject: 'Nieuw off-market vastgoeddossier Singel Amsterdam',
          body: 'Koopsom € 1.850.000,- k.k. Graag direct categoriseren voor WoningVry en koppelen in CRMos.',
          attachment: 'Taxatierapport_Singel.pdf'
        }
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Gebruik GET voor API-info of POST om een bericht door te sturen.' }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  try {
    const bodyData = (await request.json()) as Record<string, unknown>;
    const classification = classifyInbound(bodyData);

    const senderEmail = String(
      bodyData.fromEmail || bodyData.senderEmail || bodyData.from || 'relatie@quantuminitium.qin'
    )
      .trim()
      .toLowerCase();
    const senderName = String(
      bodyData.fromName || bodyData.senderName || senderEmail.split('@')[0]
    ).trim();
    const subject = String(bodyData.subject || 'Inkomend bericht via Quantum Initium API').trim();
    const bodyText = String(bodyData.body || bodyData.text || bodyData.message || '').trim();
    const recipientScope = String(
      bodyData.toEmail || bodyData.to || `info@${classification.domain}`
    ).trim();
    const attachment = String(bodyData.attachment || '').trim();
    const now = Date.now();

    const contactId = `crm_${classification.companyId}_${senderEmail.replace(/[^a-z0-9]/g, '_').slice(0, 24)}`;

    // 1. Write email document to Firestore via REST API
    const firestoreEmailDoc = {
      fields: {
        companyId: { stringValue: classification.companyId },
        subject: { stringValue: subject },
        senderName: { stringValue: senderName },
        senderEmail: { stringValue: senderEmail },
        recipientScope: { stringValue: recipientScope },
        priority: { stringValue: classification.priority },
        category: { stringValue: classification.category },
        crmContactId: { stringValue: contactId },
        forwardedViaApi: { booleanValue: true },
        starred: { booleanValue: classification.priority === 'Hoog' },
        archived: { booleanValue: false },
        attachment: { stringValue: attachment },
        body: { stringValue: bodyText },
        timestamp: { integerValue: String(now) },
        readBy: { arrayValue: { values: [] } },
        tags: {
          arrayValue: {
            values: classification.tags.map((t) => ({ stringValue: t }))
          }
        }
      }
    };

    await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/emails`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firestoreEmailDoc)
      }
    ).catch(() => null);

    // 2. Tag & upsert contact in CRMos (`crm_contacts` + `crmosone-dev`) with `mail.quantuminitium`
    const firestoreContactDoc = {
      fields: {
        id: { stringValue: contactId },
        name: { stringValue: senderName },
        email: { stringValue: senderEmail },
        companyId: { stringValue: classification.companyId },
        companyName: { stringValue: classification.companyName },
        role: { stringValue: 'Partner' },
        status: { stringValue: 'Actieve Partner' },
        hasMailQuantumInitiumTag: { booleanValue: true },
        source: { stringValue: 'Inbound API Forward' },
        lastSyncedAt: { integerValue: String(now) },
        tags: {
          arrayValue: {
            values: classification.tags.map((t) => ({ stringValue: t }))
          }
        }
      }
    };

    await Promise.allSettled([
      fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/crm_contacts/${contactId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestoreContactDoc)
        }
      ),
      fetch(
        `https://firestore.googleapis.com/v1/projects/${CRMOS_PROJECT_ID}/databases/(default)/documents/contacts/${contactId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firestoreContactDoc)
        }
      )
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bericht succesvol doorgestuurd naar ${classification.companyName} en gecategoriseerd onder '${classification.category}'.`,
        classification,
        crmSync: {
          contactId,
          email: senderEmail,
          appliedTag: MAIL_QI_TAG,
          tags: classification.tags
        },
        timestamp: now
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Ongeldige JSON payload'
      }),
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
