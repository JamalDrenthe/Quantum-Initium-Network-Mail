import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where
} from 'firebase/firestore';
import { db, crmosDb } from '../firebase.ts';
import { COMPANIES } from '../constants.ts';
import {
  CategorizationResult,
  CrmContact,
  EmailCategory,
  NetworkEmail
} from '../types.ts';

export const MAIL_QI_TAG = 'mail.quantuminitium';

export const INITIAL_CRM_CONTACTS_SEED: CrmContact[] = [
  {
    id: 'crm_qi_01',
    name: 'Jamal Drenthe',
    email: 'directie@quantuminitium.qin',
    phone: '+31 6 82 00 10 01',
    companyId: 'quantum_initium',
    companyName: 'Quantum Initium',
    role: 'Directie',
    status: 'Directie',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:quantum_initium', 'mail.quantuminitium:directie', 'holding-board'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 14.280.000,-',
    notes: 'Oprichter & Centrale Directie Quantum Initium Holding. Volledige rechten over alle 12 entiteiten.',
    source: 'CRMos Core',
    lastSyncedAt: Date.now() - 3600_000
  },
  {
    id: 'crm_vvc_02',
    name: 'Alexander van der Vliet',
    email: 'alexander@vvcclub.qin',
    phone: '+31 6 41 29 88 12',
    companyId: 'vvc',
    companyName: 'VVC Verdienende Vrienden Club',
    role: 'Partner',
    status: 'VIP Lid',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:vvc', 'syndicaat-tranche-a'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 450.000,00',
    notes: 'Senior syndicaatspartner VVC. Actieve deelname in Q4 vastgoed- en groeifondsen.',
    source: 'CRMos Syndicaat',
    lastSyncedAt: Date.now() - 7200_000
  },
  {
    id: 'crm_wv_03',
    name: 'Sophie de Graaf',
    email: 'sophie@woningvry.qin',
    phone: '+31 20 718 44 90',
    companyId: 'woningvry',
    companyName: 'WoningVry',
    role: 'Partner',
    status: 'Actieve Partner',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:woningvry', 'off-market-vastgoed'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 1.850.000,- k.k.',
    notes: 'Verantwoordelijk voor off-market portefeuille Amsterdam & Randstad.',
    source: 'CRMos Vastgoed',
    lastSyncedAt: Date.now() - 10800_000
  },
  {
    id: 'crm_ib_04',
    name: 'Maurits Vermeer',
    email: 'm.vermeer@investbotiq.qin',
    phone: '+31 6 55 81 90 34',
    companyId: 'investbotiq',
    companyName: 'Investbotiq',
    role: 'Partner',
    status: 'Actieve Partner',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:investbotiq', 'quant-trading'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 2.450.000,-',
    notes: 'Lead Quant Strategist & Vermogensbeheer relatie in CRMos.',
    source: 'CRMos FinTech',
    lastSyncedAt: Date.now() - 14400_000
  },
  {
    id: 'crm_ip_05',
    name: 'Mr. Elena Rostova',
    email: 'juridisch@immigratiepunt.qin',
    phone: '+31 70 392 11 08',
    companyId: 'immigratiepunt',
    companyName: 'Immigratiepunt',
    role: 'Partner',
    status: 'Actieve Partner',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:immigratiepunt', 'ind-referent'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 128.500,-',
    notes: 'Hoofd Juridische Zaken & Kennismigranten Dossiers.',
    source: 'CRMos Legal',
    lastSyncedAt: Date.now() - 18000_000
  },
  {
    id: 'crm_bp_06',
    name: 'Daan Hendriks',
    email: 'growth@boostplug.qin',
    phone: '+31 6 19 44 72 01',
    companyId: 'boostplug',
    companyName: 'Boostplug',
    role: 'Partner',
    status: 'Actieve Partner',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:boostplug', 'b2b-leads'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 94.000,-',
    notes: 'Performance Marketing & Leadgeneratie campagnes gekoppeld aan CRMos.',
    source: 'CRMos Marketing',
    lastSyncedAt: Date.now() - 21600_000
  },
  {
    id: 'crm_tw_07',
    name: 'Karim El Amrani',
    email: 'planning@trustingwork.qin',
    phone: '+31 10 800 52 19',
    companyId: 'trusting_work',
    companyName: 'Trusting Work',
    role: 'Partner',
    status: 'Actieve Partner',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:trusting_work', 'detachering-payroll'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 312.000,-',
    notes: 'Operatie & Detachering coördinator binnen CRMos.',
    source: 'CRMos HR',
    lastSyncedAt: Date.now() - 25200_000
  },
  {
    id: 'crm_zh_08',
    name: 'Valerie Krone',
    email: 'fleet@zheavenzy.qin',
    phone: '+31 6 22 91 04 55',
    companyId: 'zheavenzy',
    companyName: 'Zheavenzy',
    role: 'Partner',
    status: 'VIP Lid',
    tags: ['mail.quantuminitium', 'mail.quantuminitium:zheavenzy', 'executive-fleet'],
    hasMailQuantumInitiumTag: true,
    dealValue: '€ 265.000,-',
    notes: 'Wagenpark- en mobiliteitspartner voor directieleden.',
    source: 'CRMos Mobility',
    lastSyncedAt: Date.now() - 28800_000
  }
];

const COMPANY_ROUTING_RULES: {
  companyId: string;
  domains: string[];
  keywords: string[];
  defaultCategory: EmailCategory;
}[] = [
  {
    companyId: 'immigratiepunt',
    domains: ['immigratiepunt.qin', 'immigratiepunt.nl', 'immigratiepunt.com'],
    keywords: ['immigratie', 'visum', 'ind', 'kennismigrant', 'verblijfsvergunning', 'relocatie', 'expats', 'naturalisatie'],
    defaultCategory: 'Juridisch & Compliance'
  },
  {
    companyId: 'vvc',
    domains: ['vvcclub.qin', 'verdienendevrienden.club', 'vvc.works'],
    keywords: ['vvc', 'verdienende vrienden', 'syndicaat', 'dividend', 'participatie', 'netwerkkring', 'clubavond', 'leden'],
    defaultCategory: 'Financieel & Investeringen'
  },
  {
    companyId: 'investbotiq',
    domains: ['investbotiq.qin', 'investbotiq.com'],
    keywords: ['investbotiq', 'quant', 'algoritme', 'trading', 'portefeuille', 'rendement', 'vermogensbeheer', 'hedge', 'arbitrage'],
    defaultCategory: 'Financieel & Investeringen'
  },
  {
    companyId: 'spontiva',
    domains: ['spontiva.qin', 'spontiva.com'],
    keywords: ['spontiva', 'event', 'gala', 'hospitality', 'catering', 'locatie', 'gastenlijst', 'vip-tafel', 'bijeenkomst'],
    defaultCategory: 'Events & Hospitality'
  },
  {
    companyId: 'boostplug',
    domains: ['boostplug.qin', 'boostplug.one', 'boostplug.com'],
    keywords: ['boostplug', 'marketing', 'leadgeneratie', 'campagne', 'advertentie', 'conversie', 'roas', 'funnel', 'seo'],
    defaultCategory: 'Marketing & Groei'
  },
  {
    companyId: 'zheavenzy',
    domains: ['zheavenzy.qin', 'zheavenzy.one'],
    keywords: ['zheavenzy', 'wagenpark', 'lease', 'mobiliteit', 'chauffeur', 'auto', 'vloot', 'kenteken'],
    defaultCategory: 'Algemeen'
  },
  {
    companyId: 'woningvry',
    domains: ['woningvry.qin', 'woningvry.nl'],
    keywords: ['woningvry', 'vastgoed', 'beleggingspand', 'huur', 'koopsom', 'taxatie', 'kadaster', 'notaris', 'off-market', 'appartement', 'hypotheek'],
    defaultCategory: 'Vastgoed & Dossier'
  },
  {
    companyId: 'huasca',
    domains: ['huasca.qin', 'huasca.one'],
    keywords: ['huasca', 'retraite', 'wellness', 'vitaliteit', 'coaching', 'leiderschap', 'mindfulness', 'programma'],
    defaultCategory: 'Events & Hospitality'
  },
  {
    companyId: 'trusting_work',
    domains: ['trustingwork.qin', 'trustingwork.nl'],
    keywords: ['trusting work', 'detachering', 'uitzend', 'payroll', 'personeel', 'urenstaat', 'cao', 'recruitment', 'kandidaat'],
    defaultCategory: 'HR & Payroll'
  },
  {
    companyId: 'crmos',
    domains: ['crmos.qin', 'crmos.one'],
    keywords: ['crmos', 'crm', 'webhook', 'api', 'synchronisatie', 'database', 'integratie', 'tag', 'pipeline', 'contactpersoon'],
    defaultCategory: 'Technisch & API'
  },
  {
    companyId: 'angel_mediate',
    domains: ['angelmediate.qin', 'angelsmediate.com'],
    keywords: ['angel mediate', 'bemiddeling', 'stichting', 'maatschappelijk', 'zorg', 'ondersteuning', 'charitatief', 'hulpaanvraag'],
    defaultCategory: 'Juridisch & Compliance'
  },
  {
    companyId: 'quantum_initium',
    domains: ['quantuminitium.qin', 'quantuminitium.com', 'mail.quantuminitium.com'],
    keywords: ['quantum initium', 'holding', 'jaarverslag', 'bestuur', 'directie', 'statuten', 'geconsolideerd', 'aandeelhouders'],
    defaultCategory: 'Directie & Bestuur'
  }
];

/**
 * Categorizes any inbound/forwarded email or webhook payload into the exact holding company,
 * category, priority, and attaches the required `mail.quantuminitium` tags.
 */
export function categorizeMessage(input: {
  to?: string;
  from?: string;
  subject?: string;
  body?: string;
  companyId?: string;
  priority?: 'Normaal' | 'Hoog';
  tags?: string[];
}): CategorizationResult {
  const combinedText = `${input.to || ''} ${input.from || ''} ${input.subject || ''} ${input.body || ''}`.toLowerCase();
  const toLower = (input.to || '').toLowerCase();
  const fromLower = (input.from || '').toLowerCase();

  let matchedCompanyId = input.companyId || '';
  const matchedKeywords: string[] = [];
  let bestScore = 0;
  let detectedCategory: EmailCategory = 'Algemeen';

  // 1. Check explicit companyId if valid
  const explicitCompany = COMPANIES.find((c) => c.id === matchedCompanyId);
  if (explicitCompany) {
    bestScore = 100;
    const rule = COMPANY_ROUTING_RULES.find((r) => r.companyId === explicitCompany.id);
    if (rule) detectedCategory = rule.defaultCategory;
  }

  // 2. Check recipient/sender domain & keyword scoring across all 12 holdings
  for (const rule of COMPANY_ROUTING_RULES) {
    let score = 0;
    for (const dom of rule.domains) {
      if (toLower.includes(dom)) {
        score += 50;
        matchedKeywords.push(`@${dom}`);
      } else if (fromLower.includes(dom)) {
        score += 30;
        matchedKeywords.push(`afzender:${dom}`);
      }
    }
    for (const kw of rule.keywords) {
      if (combinedText.includes(kw)) {
        score += 15;
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      matchedCompanyId = rule.companyId;
      detectedCategory = rule.defaultCategory;
    }
  }

  if (!matchedCompanyId || !COMPANIES.some((c) => c.id === matchedCompanyId)) {
    matchedCompanyId = 'quantum_initium';
    detectedCategory = 'Directie & Bestuur';
  }

  // 3. Refine category based on content signals
  if (/factuur|bedrag|€|eur|dividend|investering|koopsom|rendement|tranche|betaling/i.test(combinedText)) {
    detectedCategory = 'Financieel & Investeringen';
  } else if (/aanmelding|nieuwe lead|registratie|formulier|contactpersoon|kennismaking/i.test(combinedText)) {
    detectedCategory = 'CRMos Lead & Aanmelding';
  } else if (/contract|notaris|juridisch|ind|vergunning|compliance|nda|overeenkomst/i.test(combinedText)) {
    detectedCategory = 'Juridisch & Compliance';
  } else if (/pand|vastgoed|huur|taxatie|kadaster|singel|woning/i.test(combinedText)) {
    detectedCategory = 'Vastgoed & Dossier';
  } else if (/api|webhook|crmos|sync|token|endpoint/i.test(combinedText)) {
    detectedCategory = 'Technisch & API';
  }

  // 4. Determine priority
  const isHighPriority =
    input.priority === 'Hoog' ||
    /urgent|spoed|directie|prioriteit|belangrijk|deadline|vertrouwelijk|€\s*\d{2,}/i.test(combinedText);

  const comp = COMPANIES.find((c) => c.id === matchedCompanyId) || COMPANIES[0];

  // 5. Build canonical tags including `mail.quantuminitium`
  const tagSet = new Set<string>([
    MAIL_QI_TAG,
    `${MAIL_QI_TAG}:${comp.id}`,
    `categorie:${detectedCategory.toLowerCase().replace(/\s+/g, '-')}`,
    ...(input.tags || [])
  ]);

  const confidence = Math.min(99, Math.max(72, 70 + matchedKeywords.length * 7));

  return {
    companyId: comp.id,
    companyName: comp.name,
    category: detectedCategory,
    priority: isHighPriority ? 'Hoog' : 'Normaal',
    tags: Array.from(tagSet),
    matchedKeywords: matchedKeywords.slice(0, 6),
    confidence
  };
}

/**
 * Ensures a tags array always contains `mail.quantuminitium` and holding-specific tags.
 */
export function ensureQuantumMailTags(
  existingTags: string[] = [],
  companyId?: string,
  role?: string
): string[] {
  const set = new Set<string>(existingTags.filter(Boolean));
  set.add(MAIL_QI_TAG);
  if (companyId) {
    set.add(`${MAIL_QI_TAG}:${companyId}`);
  }
  if (role) {
    set.add(`${MAIL_QI_TAG}:${role.toLowerCase()}`);
  }
  return Array.from(set);
}

/**
 * Looks up a contact in CRMos (checking `crmosDb` collections, primary `db`, and seed contacts) by email.
 */
export async function lookupCrmContactByEmail(email: string): Promise<CrmContact | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  // 1. Try CRMos secondary Firestore instance (`crmosone-dev`)
  const crmCollections = ['contacts', 'crm_contacts', 'leads', 'users'];
  for (const colName of crmCollections) {
    try {
      const q = query(collection(crmosDb, colName), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        const raw = d.data();
        const companyId = raw.companyId || raw.company || 'quantum_initium';
        const comp = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
        const tags = ensureQuantumMailTags(
          Array.isArray(raw.tags) ? raw.tags : [],
          comp.id,
          raw.role
        );
        return {
          id: d.id,
          name: raw.name || raw.fullName || raw.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          phone: raw.phone || raw.phoneNumber || '',
          companyId: comp.id,
          companyName: comp.name,
          role: raw.role || 'Partner',
          status: raw.status || 'Actieve Partner',
          tags,
          hasMailQuantumInitiumTag: true,
          dealValue: raw.dealValue || raw.value || '',
          notes: raw.notes || raw.description || 'Opgehaald uit CRMos database',
          source: `CRMos (${colName})`,
          lastSyncedAt: Date.now()
        };
      }
    } catch {
      // Continue to next collection or fallback
    }
  }

  // 2. Try primary Firestore `crm_contacts`
  try {
    const q = query(collection(db, 'crm_contacts'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      const raw = d.data();
      const comp = COMPANIES.find((c) => c.id === raw.companyId) || COMPANIES[0];
      const tags = ensureQuantumMailTags(Array.isArray(raw.tags) ? raw.tags : [], comp.id, raw.role);
      return {
        id: d.id,
        name: raw.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: raw.phone || '',
        companyId: comp.id,
        companyName: comp.name,
        role: raw.role || 'Partner',
        status: raw.status || 'Actieve Partner',
        tags,
        hasMailQuantumInitiumTag: true,
        dealValue: raw.dealValue || '',
        notes: raw.notes || '',
        source: raw.source || 'CRMos Sync',
        lastSyncedAt: raw.lastSyncedAt || Date.now()
      };
    }
  } catch {
    // Fallback to seed
  }

  // 3. Check seed contacts or match by domain
  const seeded = INITIAL_CRM_CONTACTS_SEED.find(
    (c) => c.email.toLowerCase() === cleanEmail
  );
  if (seeded) {
    return {
      ...seeded,
      tags: ensureQuantumMailTags(seeded.tags, seeded.companyId, seeded.role),
      hasMailQuantumInitiumTag: true,
      lastSyncedAt: Date.now()
    };
  }

  // 4. If email domain matches one of our 12 holdings, synthesize a pre-categorized CRMos profile
  const domainPart = cleanEmail.split('@')[1] || '';
  const matchedHolding = COMPANIES.find((c) => c.domain.toLowerCase() === domainPart);
  if (matchedHolding) {
    const localPart = cleanEmail.split('@')[0];
    const formattedName = localPart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const role = localPart.includes('directie') || localPart.includes('admin') ? 'Directie' : 'Partner';
    return {
      id: `crm_${matchedHolding.id}_${localPart.replace(/[^a-z0-9]/g, '')}`,
      name: formattedName,
      email: cleanEmail,
      companyId: matchedHolding.id,
      companyName: matchedHolding.name,
      role,
      status: role === 'Directie' ? 'Directie' : 'Actieve Partner',
      tags: ensureQuantumMailTags([], matchedHolding.id, role),
      hasMailQuantumInitiumTag: true,
      notes: `Automatisch herkend via holdingdomein @${matchedHolding.domain} in CRMos.`,
      source: 'CRMos Auto-Domain',
      lastSyncedAt: Date.now()
    };
  }

  return null;
}

/**
 * Syncs a user/contact with CRMos on registration or login.
 * Ensures both the user's account in Quantum Initium Mail AND the contact record in CRMos
 * carry the `mail.quantuminitium` tag.
 */
export async function syncContactWithCrmos(contactInput: {
  uid?: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
  phone?: string;
  dealValue?: string;
  notes?: string;
  extraTags?: string[];
}): Promise<CrmContact> {
  const cleanEmail = contactInput.email.trim().toLowerCase();
  const existing = await lookupCrmContactByEmail(cleanEmail);

  const companyId = contactInput.companyId || existing?.companyId || 'quantum_initium';
  const comp = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
  const role = contactInput.role || existing?.role || 'Partner';

  const mergedTags = ensureQuantumMailTags(
    [...(existing?.tags || []), ...(contactInput.extraTags || [])],
    comp.id,
    role
  );

  const contactId =
    existing?.id ||
    `crm_${comp.id}_${cleanEmail.replace(/[^a-z0-9]/g, '_').slice(0, 24)}`;

  const syncedContact: CrmContact = {
    id: contactId,
    name: contactInput.name || existing?.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: contactInput.phone || existing?.phone || '+31 6 00 00 00 00',
    companyId: comp.id,
    companyName: comp.name,
    role,
    status: role === 'Directie' ? 'Directie' : existing?.status || 'Actieve Partner',
    tags: mergedTags,
    hasMailQuantumInitiumTag: true,
    dealValue: contactInput.dealValue || existing?.dealValue || '',
    notes:
      contactInput.notes ||
      existing?.notes ||
      `Gekoppeld met mail.quantuminitium.com (${comp.name}) en voorzien van ${MAIL_QI_TAG} tag.`,
    source: existing?.source || 'mail.quantuminitium.com',
    lastSyncedAt: Date.now()
  };

  // 1. Write to primary Firestore `crm_contacts`
  try {
    await setDoc(doc(db, 'crm_contacts', contactId), syncedContact, { merge: true });
  } catch {
    // Ignore offline error
  }

  // 2. Write to CRMos (`crmosone-dev`) Firestore `contacts` collection with `mail.quantuminitium` tag
  try {
    await setDoc(
      doc(crmosDb, 'contacts', contactId),
      {
        ...syncedContact,
        mailQuantumInitiumEnabled: true,
        mailQuantumInitiumTag: MAIL_QI_TAG,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch {
    // Ignore if cross-project rules restrict direct write
  }

  // 3. Also update user account document if uid is provided
  if (contactInput.uid) {
    try {
      await setDoc(
        doc(db, 'users', contactInput.uid),
        {
          uid: contactInput.uid,
          name: syncedContact.name,
          email: syncedContact.email,
          role: syncedContact.role,
          companyId: syncedContact.companyId,
          tags: mergedTags,
          crmContactId: contactId,
          crmSynced: true,
          lastSeen: Date.now()
        },
        { merge: true }
      );
    } catch {
      // Ignore offline error
    }
  }

  return syncedContact;
}

/**
 * Forwards an external/API message into `mail.quantuminitium.com`, automatically categorizes it
 * into the right holding inbox, and tags the sender in CRMos with `mail.quantuminitium`.
 */
export async function forwardInboundEmailToHub(payload: {
  fromName: string;
  fromEmail: string;
  toEmail?: string;
  subject: string;
  body: string;
  companyId?: string;
  priority?: 'Normaal' | 'Hoog';
  attachment?: string;
  tags?: string[];
}): Promise<{
  email: NetworkEmail;
  categorization: CategorizationResult;
  crmContact: CrmContact;
}> {
  const categorization = categorizeMessage({
    to: payload.toEmail,
    from: payload.fromEmail,
    subject: payload.subject,
    body: payload.body,
    companyId: payload.companyId,
    priority: payload.priority,
    tags: payload.tags
  });

  // Ensure sender is synced & tagged in CRMos with `mail.quantuminitium`
  const crmContact = await syncContactWithCrmos({
    name: payload.fromName || payload.fromEmail.split('@')[0],
    email: payload.fromEmail,
    companyId: categorization.companyId,
    role: 'Partner',
    extraTags: categorization.tags
  });

  const newEmailData: Omit<NetworkEmail, 'id'> = {
    companyId: categorization.companyId,
    subject: payload.subject.trim(),
    senderName: payload.fromName.trim() || crmContact.name,
    senderEmail: payload.fromEmail.trim().toLowerCase(),
    recipientScope: payload.toEmail || `info@${COMPANIES.find((c) => c.id === categorization.companyId)?.domain || 'quantuminitium.qin'}`,
    priority: categorization.priority,
    category: categorization.category,
    tags: categorization.tags,
    crmContactId: crmContact.id,
    forwardedViaApi: true,
    starred: categorization.priority === 'Hoog',
    archived: false,
    readBy: [],
    attachment: payload.attachment || '',
    body: payload.body.trim(),
    timestamp: Date.now()
  };

  let createdId = `api_${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, 'emails'), newEmailData);
    createdId = docRef.id;
  } catch {
    // Fallback local ID
  }

  return {
    email: {
      ...newEmailData,
      id: createdId
    },
    categorization,
    crmContact
  };
}
