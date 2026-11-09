import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Send, CheckCircle2, Copy, Check, RefreshCw, Search,
  Building2, UserCheck, Shield, Layers, Mail, ArrowRight, Sparkles,
  Key, Activity, Terminal, Radio, HelpCircle, FileText, CheckCheck, Globe, Zap
} from 'lucide-react';
import { COMPANIES } from '../constants.ts';
import { CrmContact, EmailCategory, NetworkEmail } from '../types.ts';
import { QuantumLogo } from './QuantumLogo.tsx';
import { CompanyLogo } from './CompanyLogo.tsx';
import {
  MAIL_QI_TAG,
  CRM_API_BASE_URL,
  CRM_API_KEYS,
  CRM_COMPANY_TAGS,
  categorizeMessage,
  forwardInboundEmailToHub,
  lookupCrmContactByEmail,
  syncContactWithCrmos,
  crmosApiCheckHealth,
  crmosApiUpsertContact,
  crmosApiCreateCandidate,
  crmosApiCreateDeal,
  crmosApiSearch,
  crmosApiLookupContact
} from '../services/crmosService.ts';

const ECOSYSTEM_API_KEYS = [
  { company: 'Alle Bedrijven (Master)', key: 'crm_live_master_jamaldrenthe_2026_all_ecosystem', tag: '#all', id: 'quantum_initium', isMaster: true },
  { company: 'VVC Verdienende Vrienden Club', key: 'crm_live_vvc_verdienende_vrienden_club_2026', tag: '#vvc', id: 'vvc' },
  { company: 'Spontiva Recruitment', key: 'crm_live_spontiva_recruitment_2026', tag: '#spontiva', id: 'spontiva' },
  { company: 'Boostplug Energy & IoT', key: 'crm_live_boostplug_energy_iot_2026', tag: '#boostplug', id: 'boostplug' },
  { company: 'Quantum Initium Enterprise', key: 'crm_live_quantum_initium_enterprise_2026', tag: '#quantum-initium', id: 'quantum_initium' },
  { company: 'Immigratiepunt Portal', key: 'crm_live_immigratiepunt_portal_2026', tag: '#immigratiepunt', id: 'immigratiepunt' },
  { company: 'WoningVry Vastgoed', key: 'crm_live_woningvry_realestate_2026', tag: '#woningvry', id: 'woningvry' },
  { company: 'Djobba.works Freelance', key: 'crm_live_djobba_works_freelance_2026', tag: '#djobba-works', id: 'djobba' },
  { company: 'Trusting Work Staffing', key: 'crm_live_trusting_work_staffing_2026', tag: '#trusting-work', id: 'trusting_work' },
  { company: 'Logs.rent Logistics', key: 'crm_live_logs_rent_logistics_2026', tag: '#logs-rent', id: 'logs_rent' },
  { company: 'Zheavenzy Atelier', key: 'crm_live_zheavenzy_atelier_2026', tag: '#zheavenzy', id: 'zheavenzy' },
  { company: 'Xabi World International', key: 'crm_live_xabi_world_international_2026', tag: '#xabi-world', id: 'quantum_initium' },
  { company: 'CRMos Core Platform', key: 'crm_live_crmos_core_platform_2026', tag: '#crmos', id: 'crmos' }
];

export const COPY_PASTE_AGENT_INSTRUCTION = `> **Instructie voor Externe Agent:**  
> Koppel jouw applicatie rechtstreeks met de centrale CRMos Cloud API via \`https://crmos.one/api/v1/*\`.  
> 1. Gebruik bij elk request de header \`X-CRMOS-API-KEY: <JOUW_KEY>\` en \`Content-Type: application/json\`.  
> 2. Test connectiviteit via \`GET https://crmos.one/api/v1/health\`.  
> 3. Stuur leads/aanmeldingen altijd via \`POST https://crmos.one/api/v1/contacts/upsert\` met minimaal \`email\`, \`first_name\`, \`tags\` (inclusief \`#jouwbedrijf\`) en \`notes\`. CRMos dedupliceert automatisch op e-mail en voegt tags en notities samen zonder eerdere data te wissen.  
> 4. Stuur vacature-sollicitaties via \`POST https://crmos.one/api/v1/candidates\` en deals via \`POST https://crmos.one/api/v1/deals\`.  
> 5. CORS en HTTP \`OPTIONS\` preflights worden door CRMos direct met \`204 No Content\` geaccepteerd, dus directe calls vanuit webbrowsers werken zonder proxy.`;

interface ApiCrmHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  crmContacts: CrmContact[];
  onCrmContactSynced: (contact: CrmContact) => void;
  onInboundEmailCreated: (email: NetworkEmail, contact: CrmContact) => void;
  currentUser: {
    uid: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
    tags: string[];
  };
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ApiCrmHubModal: React.FC<ApiCrmHubModalProps> = ({
  isOpen,
  onClose,
  crmContacts,
  onCrmContactSynced,
  onInboundEmailCreated,
  currentUser,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inbound' | 'crm' | 'rules' | 'docs'>('rules');

  // CRMos Live Health Check State
  const [crmosHealth, setCrmosHealth] = useState<{
    checking: boolean;
    status: 'idle' | 'online' | 'offline';
    version?: string;
    authAs?: string;
    companyScope?: string;
    latency?: number;
  }>({
    checking: false,
    status: 'idle'
  });

  const checkHealth = async () => {
    setCrmosHealth((prev) => ({ ...prev, checking: true }));
    const t0 = performance.now();
    const res = await crmosApiCheckHealth();
    const latency = Math.round(performance.now() - t0);
    if (res.online) {
      setCrmosHealth({
        checking: false,
        status: 'online',
        version: res.version,
        authAs: res.authenticated_as,
        companyScope: res.company_scope,
        latency
      });
      onShowToast(`CRMos API Status: Online (${latency}ms)`);
    } else {
      setCrmosHealth({
        checking: false,
        status: 'offline',
        latency
      });
      onShowToast('CRMos API niet bereikbaar', 'error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  // Inbound API Simulator State
  const [inboundFromName, setInboundFromName] = useState('Alexander van der Berg');
  const [inboundFromEmail, setInboundFromEmail] = useState('a.vanderberg@investbotiq-partner.nl');
  const [inboundToAddress, setInboundToAddress] = useState('info@mail.quantuminitium.com');
  const [inboundSubject, setInboundSubject] = useState(
    'Nieuwe co-investering propositie € 450.000,- voor AI portefeuille'
  );
  const [inboundBody, setInboundBody] = useState(
    'Beste directie,\n\nVanuit CRMos sturen wij dit dossier door voor goedkeuring. Het betreft een kapitaalinjectie van € 450.000,- met verwachte kwartaalrendementen van € 38.500,-. Graag categoriseren onder Investbotiq en contactpersoon koppelen met mail.quantuminitium tag.'
  );
  const [inboundAttachment, setInboundAttachment] = useState('Investbotiq_TermSheet_2026.pdf');
  const [isForwarding, setIsForwarding] = useState(false);

  // CRMos Lookup & Sync State
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [syncEmailInput, setSyncEmailInput] = useState('');
  const [syncNameInput, setSyncNameInput] = useState('');
  const [syncCompanyInput, setSyncCompanyInput] = useState('quantum_initium');
  const [syncRoleInput, setSyncRoleInput] = useState<'Directie' | 'Partner'>('Partner');
  const [syncPhoneInput, setSyncPhoneInput] = useState('');
  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live preview of categorization
  const liveCategorization = useMemo(() => {
    return categorizeMessage({
      to: inboundToAddress,
      from: inboundFromEmail,
      subject: inboundSubject,
      body: inboundBody
    });
  }, [inboundToAddress, inboundFromEmail, inboundSubject, inboundBody]);

  const matchedCompany = useMemo(() => {
    return COMPANIES.find((c) => c.id === liveCategorization.companyId) || COMPANIES[0];
  }, [liveCategorization.companyId]);

  const filteredContacts = useMemo(() => {
    const q = crmSearchQuery.trim().toLowerCase();
    if (!q) return crmContacts;
    return crmContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.companyName || '').toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [crmContacts, crmSearchQuery]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast('Gekopieerd naar klembord');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleForwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundSubject.trim() || !inboundBody.trim()) {
      onShowToast('Vul een onderwerp en berichttekst in om door te sturen.', 'error');
      return;
    }

    setIsForwarding(true);
    try {
      const { email, categorization, crmContact } = await forwardInboundEmailToHub({
        fromEmail: inboundFromEmail.trim() || 'lead@crmos.nl',
        fromName: inboundFromName.trim() || 'CRMos Relatie',
        toEmail: inboundToAddress.trim() || 'info@mail.quantuminitium.com',
        subject: inboundSubject.trim(),
        body: inboundBody.trim(),
        attachment: inboundAttachment.trim()
      });

      onInboundEmailCreated(email, crmContact);
      onShowToast(
        `Doorgestuurd & gecategoriseerd onder ${
          COMPANIES.find((c) => c.id === categorization.companyId)?.name || 'Quantum Initium'
        } (${categorization.category}) met #${MAIL_QI_TAG}`
      );
    } catch {
      onShowToast('Doorsturen voltooid (lokaal gecategoriseerd).');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleLookupFromCrm = async () => {
    const clean = syncEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      onShowToast('Vul een geldig e-mailadres in om op te halen uit CRMos.', 'error');
      return;
    }
    setIsSyncingCrm(true);
    try {
      const found = await lookupCrmContactByEmail(clean);
      if (found) {
        setSyncNameInput(found.name);
        setSyncCompanyInput(found.companyId);
        setSyncRoleInput(found.role === 'Partner' ? 'Partner' : 'Directie');
        setSyncPhoneInput(found.phone || '');
        onCrmContactSynced(found);
        onShowToast(`Contactpersoon ${found.name} opgehaald uit CRMos met #${MAIL_QI_TAG}`);
      } else {
        onShowToast('Nog niet in CRMos gevonden; vul naam in om direct aan te maken en te taggen.');
      }
    } finally {
      setIsSyncingCrm(false);
    }
  };

  const handleSyncContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncEmailInput.trim() || !syncNameInput.trim()) {
      onShowToast('Vul zowel naam als e-mailadres van de contactpersoon in.', 'error');
      return;
    }
    setIsSyncingCrm(true);
    try {
      const synced = await syncContactWithCrmos({
        name: syncNameInput.trim(),
        email: syncEmailInput.trim(),
        companyId: syncCompanyInput,
        role: syncRoleInput,
        phone: syncPhoneInput.trim() || undefined
      });
      onCrmContactSynced(synced);
      onShowToast(
        `Contactpersoon ${synced.name} gesynchroniseerd in CRMos & getagd met #${MAIL_QI_TAG}`
      );
      setSyncNameInput('');
      setSyncEmailInput('');
      setSyncPhoneInput('');
    } finally {
      setIsSyncingCrm(false);
    }
  };

  const applyPresetScenario = (preset: 'invest' | 'vastgoed' | 'crmlead') => {
    if (preset === 'invest') {
      setInboundFromName('Alexander van der Berg');
      setInboundFromEmail('a.vanderberg@investbotiq-partner.nl');
      setInboundToAddress('info@investbotiq.qin');
      setInboundSubject('Goedkeuring Kapitaalinjectie € 450.000,- AI Trading Fonds');
      setInboundBody(
        'Geachte directie,\n\nHierbij het doorgezonden investeringsvoorstel vanuit CRMos ter waarde van € 450.000,- met een verwacht rendement van € 38.500,- per kwartaal. Graag direct toewijzen aan Investbotiq.'
      );
      setInboundAttachment('TermSheet_Investbotiq_Q4.pdf');
    } else if (preset === 'vastgoed') {
      setInboundFromName('Sophie Lindeman');
      setInboundFromEmail('s.lindeman@nextgenhome.qin');
      setInboundToAddress('vastgoed@mail.quantuminitium.com');
      setInboundSubject('Taxatierapport & Bouwdepot € 1.250.000,- NextGen Woonproject');
      setInboundBody(
        'Beste partners,\n\nDoorgestuurd vanuit het vastgoeddossier: de nieuwste bouwcalculatie van € 1.250.000,- k.k. voor de modulaire units van NextGen Home.'
      );
      setInboundAttachment('Bouwdepot_NextGenHome_2026.pdf');
    } else {
      setInboundFromName('Lucas Vermeer (CRMos Aanmelding)');
      setInboundFromEmail('l.vermeer@vermeer-capital.nl');
      setInboundToAddress('crm@mail.quantuminitium.com');
      setInboundSubject('Nieuwe Partner Aanmelding via CRMos • VVC & Quantum Initium');
      setInboundBody(
        'Nieuwe contactpersoon aangemeld in CRMos met startparticipatie € 75.000,-. Account en CRMos contactpersoon zijn voorzien van de verplichte mail.quantuminitium tag.'
      );
      setInboundAttachment('CRMos_Profiel_LVermeer.pdf');
    }
  };

  const categoryColorMap: Record<EmailCategory, string> = {
    'Financieel & Investeringen': '#30d158',
    'CRMos Lead & Aanmelding': '#0071e3',
    'Juridisch & Compliance': '#ff9f0a',
    'Vastgoed & Dossier': '#64d2ff',
    'Directie & Bestuur': '#f5f5f7',
    'HR & Payroll': '#5e5ce6',
    'Marketing & Groei': '#bf5af2',
    'Technisch & API': '#2997ff',
    'Events & Hospitality': '#ff375f',
    'Algemeen': '#86868b'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-4xl rounded-[2rem] apple-glass border border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/15 border border-[#2997ff]/35 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(41,151,255,0.25)]">
              <QuantumLogo size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                  mail.QuantumInitium.com • API & CRMos Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 text-[11px] font-mono font-semibold">
                  #{MAIL_QI_TAG}
                </span>
              </div>
              <p className="text-xs text-[#86868b] truncate">
                Automatische doorstuur-categorisatie & two-way CRMos (`crmosone-dev`) synchronisatie
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#86868b] hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="px-5 sm:px-7 py-3 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.05] border border-white/10 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubTab('rules')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === 'rules'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>4 Spelregels &amp; API Keys</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('inbound')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === 'inbound'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Doorstuur Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('crm')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === 'crm'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>CRMos Contacten ({crmContacts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('docs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeSubTab === 'docs'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Edge Endpoints</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkHealth}
              disabled={crmosHealth.checking}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs flex items-center gap-1.5 transition text-[#86868b] hover:text-white"
              title="Klik om CRMos API Health te controleren"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  crmosHealth.status === 'online'
                    ? 'bg-[#30d158] shadow-[0_0_8px_rgba(48,209,88,0.8)]'
                    : crmosHealth.status === 'offline'
                    ? 'bg-[#ff453a]'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-[11px] text-white">
                {crmosHealth.checking
                  ? 'Pingen...'
                  : crmosHealth.status === 'online'
                  ? `CRMos v${crmosHealth.version || '2.2'} (${crmosHealth.latency}ms)`
                  : 'Ping CRMos'}
              </span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'rules' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0071e3]/20 text-[#2997ff] border border-[#2997ff]/30 text-[10px] font-semibold uppercase tracking-wider">
                      Ecosysteem Standaard
                    </span>
                    <span className="text-xs text-[#86868b] font-mono">
                      https://crmos.one/api/v1/*
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-1.5">
                    4 Universele Spelregels voor Alle Ecosysteem Agents
                  </h3>
                  <p className="text-xs text-[#86868b] mt-1 max-w-2xl leading-relaxed">
                    Spontiva, Boostplug, VVC, Quantum Initium, Woningvry, Djobba en alle andere agents communiceren vlekkeloos en bi-directioneel met CRMos via onderstaand protocol.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(COPY_PASTE_AGENT_INSTRUCTION, 'agent_instruction')}
                  className="apple-btn-primary px-4 py-2.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shrink-0 shadow-lg active:scale-95 transition"
                >
                  {copiedKey === 'agent_instruction' ? (
                    <CheckCheck className="w-4 h-4 text-[#30d158]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>Kopieer Agent Prompt</span>
                </button>
              </div>

              {/* ==================== SPELREGEL 1: AUTHENTICATIE & HEADERS ==================== */}
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      Authenticatie &amp; Headers (Wat elke agent moet meesturen)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#86868b] font-mono">
                    Verplicht bij elk request
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-[#f5f5f7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p><span className="text-[#2997ff]">Content-Type:</span> application/json</p>
                    <p><span className="text-[#30d158]">X-CRMOS-API-KEY:</span> &lt;HUN_EIGEN_API_KEY&gt;</p>
                  </div>
                  <span className="text-[10px] text-[#86868b] sm:text-right">
                    CORS preflight (OPTIONS) wordt direct met 204 beantwoord
                  </span>
                </div>

                {/* API Keys Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider block">
                    Gevalideerde API Keys &amp; Bedrijfstags per Entiteit:
                  </span>
                  <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/[0.06] bg-black/40">
                    {ECOSYSTEM_API_KEYS.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs hover:bg-white/[0.03] transition ${
                          item.isMaster ? 'bg-[#0071e3]/10 border-l-2 border-l-[#2997ff]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-[200px]">
                          <CompanyLogo companyId={item.id} size={24} showContainer={false} />
                          <span className={`font-semibold ${item.isMaster ? 'text-[#2997ff]' : 'text-white'}`}>
                            {item.company}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 font-mono text-[11px] text-[#86868b] truncate">
                          <code>{item.key}</code>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-[#f5f5f7]">
                            {item.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.key, `key_${idx}`)}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#86868b] hover:text-white transition"
                            title="Kopieer API Key"
                          >
                            {copiedKey === `key_${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-[#30d158]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ==================== SPELREGEL 2: DATA STUREN (INBOUND NAAR CRMOS) ==================== */}
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    Data Sturen naar CRMos (Upsert &amp; Funnels)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Card A: Contacts Upsert */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#30d158]/20 text-[#30d158] font-mono text-[10px] font-bold">
                          POST
                        </span>
                        <span className="text-[11px] text-[#86868b]">Matcht op email</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-2 font-mono">
                        /api/v1/contacts/upsert
                      </h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-snug">
                        Dedupliceert op e-mail. Wist nooit oude data, voegt tags samen en plakt de notitie onderaan de historie.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            {
                              first_name: 'Lars',
                              last_name: 'Bakker',
                              email: 'lars.bakker@voorbeeld.nl',
                              phone: '+31612345678',
                              company: 'Spontiva',
                              tags: ['#spontiva', 'B2B Lead', MAIL_QI_TAG],
                              notes: 'Aanvraag via Spontiva portal voor IT-detachering.'
                            },
                            null,
                            2
                          ),
                          'payload_upsert'
                        )
                      }
                      className="w-full py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-medium text-white flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'payload_upsert' ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Kopieer Contact Payload</span>
                    </button>
                  </div>

                  {/* Card B: Candidates Funnel */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#2997ff]/20 text-[#2997ff] font-mono text-[10px] font-bold">
                          POST
                        </span>
                        <span className="text-[11px] text-[#86868b]">Werving Funnel</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-2 font-mono">
                        /api/v1/candidates
                      </h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-snug">
                        Voor Spontiva &amp; Djobba sollicitanten. Registreert sollicitant én koppelt/upsert direct in het centrale CRM.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            {
                              first_name: 'Sanne',
                              last_name: 'de Jong',
                              email: 'sanne.dejong@voorbeeld.nl',
                              phone: '+31687654321',
                              role_applied: '360° Recruiter',
                              deal_model: 'no_cure_no_pay',
                              company: 'Spontiva',
                              tags: ['#spontiva', '#careers', 'Sollicitant'],
                              notes: 'Sollicitatie ontvangen voor 360 Recruiter positie.'
                            },
                            null,
                            2
                          ),
                          'payload_candidate'
                        )
                      }
                      className="w-full py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-medium text-white flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'payload_candidate' ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Kopieer Kandidaat Payload</span>
                    </button>
                  </div>

                  {/* Card C: Deals */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#bf5af2]/20 text-[#bf5af2] font-mono text-[10px] font-bold">
                          POST
                        </span>
                        <span className="text-[11px] text-[#86868b]">Verkooporders</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-2 font-mono">
                        /api/v1/deals
                      </h5>
                      <p className="text-[11px] text-[#86868b] mt-1 leading-snug">
                        Voor Boostplug snelladers, QI Compute licenties, etc. Registreert deals met pipeline stage en contactpersoon.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          JSON.stringify(
                            {
                              name: 'Boostplug Fastcharger Pilot - Jansen Transport',
                              value: 35000,
                              stage: 'qualified',
                              company_name: 'boostplug',
                              contact_email: 'directie@jansentransport.nl',
                              notes: 'Offerteaanvraag ontvangen voor 4x DC Snelladers.'
                            },
                            null,
                            2
                          ),
                          'payload_deal'
                        )
                      }
                      className="w-full py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-medium text-white flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedKey === 'payload_deal' ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Kopieer Deal Payload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SPELREGEL 3: DATA OPVRAGEN (READ & ZOEKEN) ==================== */}
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    Data Opvragen (Read &amp; Realtime Zoeken)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158] font-mono text-[9px] font-bold">
                          GET
                        </span>
                        <code className="text-xs text-white font-mono truncate">/api/v1/health</code>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">Health check voor agent statusbot</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('https://crmos.one/api/v1/health', 'get_health')}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#86868b] hover:text-white"
                      title="Kopieer URL"
                    >
                      {copiedKey === 'get_health' ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158] font-mono text-[9px] font-bold">
                          GET
                        </span>
                        <code className="text-xs text-white font-mono truncate">/api/v1/search?q=Lars</code>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">Realtime fulltext search over alle collecties</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('https://crmos.one/api/v1/search?q=', 'get_search')}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#86868b] hover:text-white"
                      title="Kopieer URL"
                    >
                      {copiedKey === 'get_search' ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158] font-mono text-[9px] font-bold">
                          GET
                        </span>
                        <code className="text-xs text-white font-mono truncate">/api/v1/contacts?email=...</code>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">Controleer of contactpersoon bestaat</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('https://crmos.one/api/v1/contacts?email=', 'get_contact')}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#86868b] hover:text-white"
                      title="Kopieer URL"
                    >
                      {copiedKey === 'get_contact' ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#30d158]/20 text-[#30d158] font-mono text-[9px] font-bold">
                          GET
                        </span>
                        <code className="text-xs text-white font-mono truncate">/api/v1/vvc/lookup?tag=...</code>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">VVC-code of membertag verifiëren</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('https://crmos.one/api/v1/vvc/lookup?tag=', 'get_vvc')}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#86868b] hover:text-white"
                      title="Kopieer URL"
                    >
                      {copiedKey === 'get_vvc' ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================== SPELREGEL 4: WEBHOOKS ==================== */}
              <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      Live Updates Terugkrijgen (Webhooks: CRMos ➔ Externe Agent)
                    </h4>
                  </div>
                  <span className="text-xs text-[#30d158] font-semibold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Realtime Event Push</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <p className="font-semibold text-white">1. Endpoint Leveren</p>
                    <p className="text-[#86868b] text-[11px]">
                      De agent levert bijv. <code>https://spontiva.nl/api/webhooks/crmos</code>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <p className="font-semibold text-white">2. Eenmalig Registreren</p>
                    <p className="text-[#86868b] text-[11px]">
                      Via <code>POST https://crmos.one/api/v1/webhooks</code> met hun API key
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <p className="font-semibold text-white">3. Push Events Ontvangen</p>
                    <p className="text-[#86868b] text-[11px]">
                      CRMos schiet direct data bij <code>deal.won</code>, <code>candidate.placed</code>, <code>contact.upserted</code>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black border border-white/10">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-xs">
                    <span className="text-[#86868b] font-mono">cURL Webhook Registratie Voorbeeld:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `curl -X POST "https://crmos.one/api/v1/webhooks" \\\n  -H "Content-Type: application/json" \\\n  -H "X-CRMOS-API-KEY: crm_live_spontiva_recruitment_2026" \\\n  -d '{\n    "company": "Spontiva",\n    "url": "https://spontiva.nl/api/webhooks/crmos",\n    "events": ["candidate.placed", "deal.won", "contact.upserted"],\n    "secret": "whsec_spontiva_crmos_2026"\n  }'`,
                          'curl_webhook'
                        )
                      }
                      className="text-xs text-[#2997ff] hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'curl_webhook' ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Kopieer cURL</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-[#f5f5f7] overflow-x-auto leading-relaxed">
{`curl -X POST "https://crmos.one/api/v1/webhooks" \\
  -H "Content-Type: application/json" \\
  -H "X-CRMOS-API-KEY: crm_live_spontiva_recruitment_2026" \\
  -d '{
    "company": "Spontiva",
    "url": "https://spontiva.nl/api/webhooks/crmos",
    "events": ["candidate.placed", "deal.won", "contact.upserted"],
    "secret": "whsec_spontiva_crmos_2026"
  }'`}
                  </pre>
                </div>
              </div>

              {/* ==================== KOPPELEBARE INSTRUCTIE PROMPT VOOR EXTERNE AGENTS ==================== */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#0071e3]/10 to-transparent border border-[#0071e3]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#2997ff]" />
                    <h4 className="text-sm font-semibold text-white">
                      Kant-en-klare Instructie voor Externe Agent Developer / Prompt
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COPY_PASTE_AGENT_INSTRUCTION, 'copy_prompt')}
                    className="apple-btn-secondary px-3 py-1.5 rounded-full text-xs font-semibold text-[#2997ff] flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'copy_prompt' ? (
                      <Check className="w-3.5 h-3.5 text-[#30d158]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Kopieer Tekst</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-[#f5f5f7] leading-relaxed whitespace-pre-wrap">
                  {COPY_PASTE_AGENT_INSTRUCTION}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'inbound' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form */}
              <form onSubmit={handleForwardSubmit} className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2997ff]" />
                    <span>Bericht Doorsturen naar mail.QuantumInitium.com</span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPresetScenario('invest')}
                      className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-[#f5f5f7] border border-white/10 transition"
                    >
                      Scenario: Investering
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetScenario('vastgoed')}
                      className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-[#f5f5f7] border border-white/10 transition"
                    >
                      Vastgoed
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetScenario('crmlead')}
                      className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-[#f5f5f7] border border-white/10 transition"
                    >
                      CRMos Lead
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                      Afzender Naam (Contactpersoon)
                    </label>
                    <input
                      type="text"
                      value={inboundFromName}
                      onChange={(e) => setInboundFromName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                      Afzender E-mail (CRMos Match)
                    </label>
                    <input
                      type="email"
                      value={inboundFromEmail}
                      onChange={(e) => setInboundFromEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                      Doorgestuurd Naar Adres
                    </label>
                    <input
                      type="text"
                      value={inboundToAddress}
                      onChange={(e) => setInboundToAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                      Bijlage / Dossier (Optioneel)
                    </label>
                    <input
                      type="text"
                      value={inboundAttachment}
                      onChange={(e) => setInboundAttachment(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                    Onderwerp
                  </label>
                  <input
                    type="text"
                    value={inboundSubject}
                    onChange={(e) => setInboundSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">
                    Inhoud (Bedragen worden automatisch beveiligd met 👁️)
                  </label>
                  <textarea
                    rows={4}
                    value={inboundBody}
                    onChange={(e) => setInboundBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isForwarding}
                  className="w-full py-3 rounded-full apple-btn-primary text-white font-semibold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isForwarding
                      ? 'Doorsturen & Categoriseren...'
                      : 'Nu Doorsturen naar mail.QuantumInitium.com & CRMos Taggen'}
                  </span>
                </button>
              </form>

              {/* Right Column: Live Categorization Engine Output */}
              <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff]">
                      Live AI & Regel-Categorisatie
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 text-[10px] font-semibold">
                      Realtime Preview
                    </span>
                  </div>

                  {/* Assigned Holding */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
                    <span className="text-[11px] text-[#86868b] block mb-1">
                      Toegewezen Onderneming (Postvak)
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <CompanyLogo companyId={matchedCompany.id} size={30} className="shrink-0" />
                        <span className="text-sm font-semibold text-white">
                          {matchedCompany.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#86868b]">
                        info@{matchedCompany.domain}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Category & Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
                      <span className="text-[11px] text-[#86868b] block mb-1">
                        Categorie
                      </span>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{
                          color: categoryColorMap[liveCategorization.category],
                          borderColor: `${categoryColorMap[liveCategorization.category]}40`,
                          backgroundColor: `${categoryColorMap[liveCategorization.category]}15`
                        }}
                      >
                        {liveCategorization.category}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
                      <span className="text-[11px] text-[#86868b] block mb-1">
                        Prioriteit & Reden
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            liveCategorization.priority === 'Hoog'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-white/10 text-[#f5f5f7] border border-white/15'
                          }`}
                        >
                          {liveCategorization.priority}
                        </span>
                        <span className="text-[11px] text-[#86868b] truncate">
                          ({Math.round(liveCategorization.confidence * 100)}% match)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Tags */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
                    <span className="text-[11px] text-[#86868b] block mb-2">
                      Automatische Account & CRMos Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {liveCategorization.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${
                            tag === MAIL_QI_TAG
                              ? 'bg-[#0071e3]/25 text-[#2997ff] border-[#2997ff]/40'
                              : 'bg-white/[0.05] text-[#f5f5f7] border-white/10'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0071e3]/10 border border-[#2997ff]/25 text-xs text-[#f5f5f7] leading-relaxed">
                  Zodra dit bericht binnenkomt op <strong>mail.QuantumInitium.com</strong> wordt het
                  geplaatst bij <strong>{matchedCompany.name}</strong> en krijgt de afzender in{' '}
                  <strong>CRMos</strong> automatisch de tag <code>{MAIL_QI_TAG}</code>.
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'crm' && (
            <div className="space-y-6">
              {/* Top Form: Add / Lookup CRMos Contact */}
              <form
                onSubmit={handleSyncContactSubmit}
                className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Contactpersoon Ophalen of Taggen in CRMos (`crmosone-dev`)
                    </h4>
                    <p className="text-xs text-[#86868b]">
                      Elke aangemelde persoon krijgt de speciale <code>{MAIL_QI_TAG}</code> tag in zijn account én als contactpersoon in CRMos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLookupFromCrm}
                    disabled={isSyncingCrm}
                    className="px-3.5 py-1.5 rounded-full bg-[#0071e3]/20 hover:bg-[#0071e3]/30 text-[#2997ff] border border-[#2997ff]/30 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCrm ? 'animate-spin' : ''}`} />
                    <span>Data Ophalen uit CRMos</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#86868b] font-semibold mb-1">
                      Zakelijk E-mailadres
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="naam@bedrijf.nl"
                      value={syncEmailInput}
                      onChange={(e) => setSyncEmailInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] font-semibold mb-1">
                      Naam Contactpersoon
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Volledige naam"
                      value={syncNameInput}
                      onChange={(e) => setSyncNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] font-semibold mb-1">
                      Holding / Onderneming
                    </label>
                    <select
                      value={syncCompanyInput}
                      onChange={(e) => setSyncCompanyInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                    >
                      {COMPANIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSyncingCrm}
                      className="w-full py-2 px-4 rounded-xl apple-btn-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Synchroniseer + Tag `{MAIL_QI_TAG}`</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Search & Contact List */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                      placeholder="Zoek contactpersoon op naam, e-mail, holding of mail.quantuminitium tag..."
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-[#86868b] focus:outline-none focus:border-[#0071e3]"
                    />
                  </div>
                  <span className="text-xs text-[#86868b]">
                    {filteredContacts.length} CRMos contactpersonen met <code>#{MAIL_QI_TAG}</code>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredContacts.map((contact) => {
                    const comp = COMPANIES.find((c) => c.id === contact.companyId) || COMPANIES[0];
                    return (
                      <div
                        key={contact.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white truncate">
                                {contact.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-[#f5f5f7] border border-white/10">
                                {contact.role}
                              </span>
                            </div>
                            <p className="text-xs text-[#86868b] truncate mt-0.5">{contact.email}</p>
                          </div>

                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shrink-0"
                            style={{
                              backgroundColor: `${comp.color}15`,
                              borderColor: `${comp.color}40`,
                              color: comp.color
                            }}
                          >
                            <CompanyLogo companyId={comp.id} size={16} showContainer={false} />
                            <span>{comp.name}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((t) => (
                              <span
                                key={t}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                  t === MAIL_QI_TAG
                                    ? 'bg-[#0071e3]/20 text-[#2997ff] border border-[#2997ff]/35 font-semibold'
                                    : 'bg-white/[0.05] text-[#86868b] border border-white/10'
                                }`}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              const updated = await syncContactWithCrmos({
                                name: contact.name,
                                email: contact.email,
                                companyId: contact.companyId,
                                role: contact.role,
                                phone: contact.phone
                              });
                              onCrmContactSynced(updated);
                              onShowToast(
                                `CRMos tag #${MAIL_QI_TAG} geverifieerd voor ${contact.name}`
                              );
                            }}
                            className="text-[11px] text-[#2997ff] hover:underline font-medium shrink-0"
                          >
                            Sync Tag
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'docs' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2997ff] uppercase tracking-wider">
                      Endpoint 1 • Inbound Mail & Categorisatie
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('https://mail.quantuminitium.com/api/inbound', 'ep_inbound')
                      }
                      className="text-xs text-[#f5f5f7] hover:text-[#2997ff] flex items-center gap-1"
                    >
                      {copiedKey === 'ep_inbound' ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Kopieer URL</span>
                    </button>
                  </div>
                  <code className="block p-2.5 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#30d158] break-all">
                    POST https://mail.quantuminitium.com/api/inbound
                  </code>
                  <p className="text-xs text-[#86868b]">
                    Ontvangt doorgestuurde e-mails, webhooks en CRMos notificaties. Categoriseert automatisch naar de juiste holding + categorie en voorziet het contact in CRMos van de <code>{MAIL_QI_TAG}</code> tag.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2997ff] uppercase tracking-wider">
                      Endpoint 2 • CRMos Contact Sync & Tagging
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('https://mail.quantuminitium.com/api/crm', 'ep_crm')
                      }
                      className="text-xs text-[#f5f5f7] hover:text-[#2997ff] flex items-center gap-1"
                    >
                      {copiedKey === 'ep_crm' ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Kopieer URL</span>
                    </button>
                  </div>
                  <code className="block p-2.5 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#30d158] break-all">
                    GET / POST https://mail.quantuminitium.com/api/crm?email=...
                  </code>
                  <p className="text-xs text-[#86868b]">
                    Haalt contactpersoon-data op uit CRMos (`crmosone-dev`) bij aanmelding en garandeert dat zowel het mail-account als het CRMos contact de tag <code>{MAIL_QI_TAG}</code> bezitten.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Voorbeeld Webhook / cURL Request voor Doorsturen & Categoriseren
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X POST https://mail.quantuminitium.com/api/inbound \\\n  -H "Content-Type: application/json" \\\n  -d '{"fromEmail":"partner@investbotiq.nl","fromName":"Alexander de Vries","to":"info@mail.quantuminitium.com","subject":"Investering € 250.000,- AI Fonds","body":"Graag verwerken in Investbotiq en taggen in CRMos."}'`,
                        'curl_inbound'
                      )
                    }
                    className="text-xs text-[#2997ff] hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'curl_inbound' ? (
                      <Check className="w-3.5 h-3.5 text-[#30d158]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Kopieer cURL</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black border border-white/10 text-[11px] font-mono text-[#f5f5f7] overflow-x-auto leading-relaxed">
{`curl -X POST https://mail.quantuminitium.com/api/inbound \\
  -H "Content-Type: application/json" \\
  -d '{
    "fromEmail": "partner@investbotiq.nl",
    "fromName": "Alexander de Vries",
    "to": "info@mail.quantuminitium.com",
    "subject": "Investering € 250.000,- AI Fonds",
    "body": "Graag verwerken in Investbotiq en taggen in CRMos."
  }'`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
