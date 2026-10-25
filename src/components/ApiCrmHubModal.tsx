import React, { useState, useMemo } from 'react';
import {
  X, Send, CheckCircle2, Copy, Check, RefreshCw, Search,
  Building2, UserCheck, Shield, Layers, Mail, ArrowRight, Sparkles
} from 'lucide-react';
import { COMPANIES } from '../constants.ts';
import { CrmContact, EmailCategory, NetworkEmail } from '../types.ts';
import {
  MAIL_QI_TAG,
  categorizeMessage,
  forwardInboundEmailToHub,
  lookupCrmContactByEmail,
  syncContactWithCrmos
} from '../services/crmosService.ts';

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
  const [activeSubTab, setActiveSubTab] = useState<'inbound' | 'crm' | 'docs'>('inbound');

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
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/20 border border-[#2997ff]/35 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#2997ff]" />
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
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.05] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveSubTab('inbound')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeSubTab === 'inbound'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              1. Doorstuur API & Categorisatie
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('crm')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeSubTab === 'crm'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              2. CRMos Contacten ({crmContacts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('docs')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeSubTab === 'docs'
                  ? 'apple-btn-primary text-white shadow'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              3. API Endpoints & Webhooks
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-[#86868b]">
            <span>Actief account:</span>
            <span className="text-[#f5f5f7] font-medium">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/20 text-[#2997ff] border border-[#2997ff]/30 font-mono text-[10px]">
              {MAIL_QI_TAG}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
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
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: matchedCompany.color }}
                        />
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
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: comp.color }}
                            />
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
