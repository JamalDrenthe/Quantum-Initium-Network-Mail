export interface Company {
  id: string;
  name: string;
  short: string;
  domain: string;
  color: string;
  accentColor: string;
  category: string;
  tagline: string;
}

export type EmailCategory =
  | 'Financieel & Investeringen'
  | 'CRMos Lead & Aanmelding'
  | 'Juridisch & Compliance'
  | 'Vastgoed & Dossier'
  | 'Directie & Bestuur'
  | 'HR & Payroll'
  | 'Marketing & Groei'
  | 'Technisch & API'
  | 'Events & Hospitality'
  | 'Algemeen';

export interface NetworkEmail {
  id: string;
  companyId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipientScope: string;
  priority: 'Normaal' | 'Hoog';
  category?: EmailCategory;
  tags?: string[];
  crmContactId?: string;
  forwardedViaApi?: boolean;
  starred?: boolean;
  archived?: boolean;
  readBy: string[];
  attachment?: string;
  body: string;
  timestamp: number;
}

export interface NetworkChat {
  id: string;
  channelId: string;
  companyId: string;
  senderId: string;
  senderName: string;
  isAdmin?: boolean;
  text: string;
  linkedEmailSubject?: string | null;
  linkedEmailCompany?: string | null;
  attachedEmailId?: string | null;
  attachedEmailSubject?: string | null;
  attachedAttachmentName?: string | null;
  timestamp: number;
  status?: string;
}

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId: string;
  companyName?: string;
  role: string;
  status: 'Lead' | 'Actieve Partner' | 'Directie' | 'Klant' | 'VIP Lid';
  tags: string[];
  hasMailQuantumInitiumTag: boolean;
  dealValue?: string;
  notes?: string;
  source?: string;
  lastSyncedAt: number;
}

export interface NetworkUser {
  uid: string;
  name: string;
  handle: string;
  role: string;
  lastSeen: number;
  email?: string;
  companyId?: string;
  tags?: string[];
  crmContactId?: string;
  crmSynced?: boolean;
  phone?: string;
  crmStatus?: string;
}

export interface PinnedTopic {
  id: string;
  channelId: string;
  emailId: string;
  emailSubject: string;
  companyId: string;
  summary: string;
  pinnedBy: string;
  timestamp: number;
}

export interface CategorizationResult {
  companyId: string;
  companyName: string;
  category: EmailCategory;
  priority: 'Normaal' | 'Hoog';
  tags: string[];
  matchedKeywords: string[];
  confidence: number;
}


