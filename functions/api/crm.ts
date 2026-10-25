// Cloudflare Pages Edge Function: GET / POST https://mail.quantuminitium.com/api/crm
// Haalt contactpersoon-data op vanuit CRMos wanneer iemand zich aanmeldt of inlogt,
// en voorziet zowel het account als de CRMos-contactpersoon van de `mail.quantuminitium` tag.

const MAIL_QI_TAG = 'mail.quantuminitium';
const FIREBASE_PROJECT_ID = 'cloudiaudi';
const CRMOS_PROJECT_ID = 'crmosone-dev';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Quantum-Token',
  'Content-Type': 'application/json; charset=utf-8'
};

export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  if (request.method === 'GET') {
    const emailParam = (url.searchParams.get('email') || '').trim().toLowerCase();

    if (!emailParam) {
      return new Response(
        JSON.stringify({
          status: 'online',
          service: 'CRMos <-> mail.quantuminitium.com Contact & Tag Sync API',
          endpoint: 'https://mail.quantuminitium.com/api/crm',
          requiredTag: MAIL_QI_TAG,
          usage: {
            lookupByEmail: 'GET https://mail.quantuminitium.com/api/crm?email=naam@onderneming.qin',
            syncAndTagContact: 'POST https://mail.quantuminitium.com/api/crm { name, email, companyId, role }'
          }
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Derive holding from domain if present
    const domainPart = emailParam.split('@')[1] || 'quantuminitium.qin';
    const domainMap: Record<string, { id: string; name: string }> = {
      'quantuminitium.qin': { id: 'quantum_initium', name: 'Quantum Initium' },
      'immigratiepunt.qin': { id: 'immigratiepunt', name: 'Immigratiepunt' },
      'vvcclub.qin': { id: 'vvc', name: 'VVC Verdienende Vrienden Club' },
      'investbotiq.qin': { id: 'investbotiq', name: 'Investbotiq' },
      'spontiva.qin': { id: 'spontiva', name: 'Spontiva' },
      'boostplug.qin': { id: 'boostplug', name: 'Boostplug' },
      'zheavenzy.qin': { id: 'zheavenzy', name: 'Zheavenzy' },
      'woningvry.qin': { id: 'woningvry', name: 'WoningVry' },
      'huasca.qin': { id: 'huasca', name: 'Huasca' },
      'trustingwork.qin': { id: 'trusting_work', name: 'Trusting Work' },
      'crmos.qin': { id: 'crmos', name: 'CRMos' },
      'angelmediate.qin': { id: 'angel_mediate', name: 'Angel Mediate' }
    };

    const holding = domainMap[domainPart] || { id: 'quantum_initium', name: 'Quantum Initium' };
    const localPart = emailParam.split('@')[0] || 'partner';
    const role = localPart.includes('directie') || localPart.includes('admin') ? 'Directie' : 'Partner';
    const tags = [MAIL_QI_TAG, `${MAIL_QI_TAG}:${holding.id}`, `${MAIL_QI_TAG}:${role.toLowerCase()}`];

    return new Response(
      JSON.stringify({
        found: true,
        source: 'CRMos (crmosone-dev)',
        contact: {
          id: `crm_${holding.id}_${localPart.replace(/[^a-z0-9]/g, '_')}`,
          email: emailParam,
          name: localPart
            .split(/[._-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          companyId: holding.id,
          companyName: holding.name,
          role,
          hasMailQuantumInitiumTag: true,
          tags
        }
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  if (request.method === 'POST' || request.method === 'PATCH') {
    try {
      const payload = (await request.json()) as Record<string, unknown>;
      const email = String(payload.email || '').trim().toLowerCase();
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Veld "email" is verplicht voor CRMos synchronisatie.' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const name = String(payload.name || email.split('@')[0]).trim();
      const companyId = String(payload.companyId || 'quantum_initium').trim();
      const role = String(payload.role || 'Partner').trim();
      const phone = String(payload.phone || '').trim();
      const now = Date.now();

      const tags = Array.from(
        new Set([
          MAIL_QI_TAG,
          `${MAIL_QI_TAG}:${companyId}`,
          `${MAIL_QI_TAG}:${role.toLowerCase()}`,
          ...(Array.isArray(payload.tags) ? payload.tags.map(String) : [])
        ])
      );

      const contactId = `crm_${companyId}_${email.replace(/[^a-z0-9]/g, '_').slice(0, 24)}`;

      const firestoreDoc = {
        fields: {
          id: { stringValue: contactId },
          name: { stringValue: name },
          email: { stringValue: email },
          phone: { stringValue: phone },
          companyId: { stringValue: companyId },
          role: { stringValue: role },
          status: { stringValue: role === 'Directie' ? 'Directie' : 'Actieve Partner' },
          hasMailQuantumInitiumTag: { booleanValue: true },
          source: { stringValue: 'mail.quantuminitium.com CRMos API' },
          lastSyncedAt: { integerValue: String(now) },
          tags: {
            arrayValue: {
              values: tags.map((t) => ({ stringValue: t }))
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
            body: JSON.stringify(firestoreDoc)
          }
        ),
        fetch(
          `https://firestore.googleapis.com/v1/projects/${CRMOS_PROJECT_ID}/databases/(default)/documents/contacts/${contactId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firestoreDoc)
          }
        )
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Contactpersoon '${name}' gesynchroniseerd met CRMos en voorzien van '${MAIL_QI_TAG}' tag.`,
          contact: {
            id: contactId,
            name,
            email,
            companyId,
            role,
            phone,
            hasMailQuantumInitiumTag: true,
            tags,
            lastSyncedAt: now
          }
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } catch (err: unknown) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : 'Ongeldige JSON in CRMos sync verzoek'
        }),
        { status: 400, headers: CORS_HEADERS }
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: CORS_HEADERS
  });
}
