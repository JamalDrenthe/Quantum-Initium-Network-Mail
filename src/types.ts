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

export interface NetworkEmail {
  id: string;
  companyId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  recipientScope: string;
  priority: 'Normaal' | 'Hoog';
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

export interface NetworkUser {
  uid: string;
  name: string;
  handle: string;
  role: string;
  lastSeen: number;
  email?: string;
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

