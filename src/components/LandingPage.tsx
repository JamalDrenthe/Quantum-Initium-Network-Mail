import React, { useState } from 'react';
import {
  Shield, Mail, MessageSquare, ArrowRight, Lock, Building2,
  CheckCircle2, ChevronRight, User, Eye, EyeOff, FileText,
  Briefcase, TrendingUp, Layers, Check, ExternalLink, Globe,
  Cpu, Sparkles, SlidersHorizontal, Menu, X
} from 'lucide-react';
import { Company } from '../types.ts';
import { COMPANIES, SAMPLE_BUSINESS_EMAILS, INITIAL_CHATS_SEED } from '../constants.ts';
import { QuantumLogo } from './QuantumLogo.tsx';
import { CompanyLogo } from './CompanyLogo.tsx';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenCompanyInbox: (companyId: string) => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
  userName?: string;
  showAmounts: boolean;
  onToggleAmounts: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenCompanyInbox,
  onOpenLogin,
  isLoggedIn,
  userName,
  showAmounts,
  onToggleAmounts
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'mail' | 'chat'>('mail');
  const [selectedPreviewCompany, setSelectedPreviewCompany] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white overflow-x-hidden antialiased">
      {/* Apple-style Soft Diffused Ambient Spots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#0071e3]/18 via-[#5e5ce6]/10 to-transparent rounded-full blur-[120px] opacity-75" />
        <div className="absolute top-1/3 -right-60 w-[600px] h-[600px] bg-[#0071e3]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 -left-60 w-[650px] h-[650px] bg-[#5e5ce6]/8 rounded-full blur-[140px]" />
      </div>

      {/* ==================== APPLE VISION PRO GLASS HEADER ==================== */}
      <header className="sticky top-0 z-50 apple-glass px-4 sm:px-6 lg:px-12 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-3 text-left group transition cursor-pointer"
            >
              <QuantumLogo size={32} className="shrink-0 transition-transform group-hover:scale-105" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base sm:text-lg tracking-tight text-white">
                    Quantum Initium
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/[0.08] border border-white/[0.12] text-[#f5f5f7] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                    Network Mail
                  </span>
                </div>
                <p className="text-[11px] text-[#86868b] hidden lg:block tracking-tight">
                  Centrale Directie- & Partnercommunicatie
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Apple-style Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.05] border border-white/[0.1] p-1 rounded-full text-xs font-medium text-[#86868b] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <a
              href="#overzicht"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition"
            >
              Overzicht
            </a>
            <a
              href="#bedrijven"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition"
            >
              12 Holdings
            </a>
            <a
              href="#functies"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition"
            >
              Functionaliteiten
            </a>
            <a
              href="#beveiliging"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition"
            >
              Beveiliging
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Eye Amount Toggle Pill */}
            <button
              onClick={onToggleAmounts}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 ${
                isLoggedIn
                  ? showAmounts
                    ? 'bg-[#30d158]/15 hover:bg-[#30d158]/25 border-[#30d158]/35 text-[#30d158]'
                    : 'bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border-[#2997ff]/35 text-[#2997ff]'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/15 text-[#2997ff]'
              }`}
              title={
                isLoggedIn
                  ? showAmounts
                    ? 'Bedragen zijn zichtbaar (klik om te verbergen)'
                    : 'Bedragen zijn verborgen (klik om te tonen)'
                  : 'Bedragen zijn veilig met 👁️. Klik om in te loggen of registreren.'
              }
            >
              <span className="text-xs">👁️</span>
              <span className="hidden sm:inline font-mono">
                {isLoggedIn
                  ? showAmounts
                    ? 'Bedragen Zichtbaar'
                    : 'Bedragen Verborgen'
                  : 'Bedragen Veilig'}
              </span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline-block text-xs font-medium text-[#86868b]">
                  {userName || 'Ingelogd'}
                </span>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                >
                  <span>Naar Postvak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="apple-btn-secondary px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  Inloggen
                </button>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-primary flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                >
                  <span>Open Postvak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#f5f5f7] hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 pb-2">
            <a
              href="#overzicht"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#f5f5f7] hover:bg-white/[0.08]"
            >
              Overzicht
            </a>
            <a
              href="#bedrijven"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#f5f5f7] hover:bg-white/[0.08]"
            >
              12 Holdings
            </a>
            <a
              href="#functies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#f5f5f7] hover:bg-white/[0.08]"
            >
              Functionaliteiten
            </a>
            <a
              href="#beveiliging"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#f5f5f7] hover:bg-white/[0.08]"
            >
              Beveiliging & Privacy
            </a>
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex-1 apple-btn-secondary py-2 rounded-full text-xs font-medium text-center"
              >
                Inloggen
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterApp();
                }}
                className="flex-1 apple-btn-primary py-2 rounded-full text-xs font-semibold text-center"
              >
                Open Postvak
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* ==================== APPLE HERO SECTION ==================== */}
        <section id="overzicht" className="px-4 sm:px-6 lg:px-12 pt-14 sm:pt-24 pb-16 sm:pb-28 max-w-7xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs font-medium text-[#f5f5f7] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse" />
            <span>Exclusief Communicatienetwerk voor Directie & Partners</span>
          </div>

          {/* Cinematic Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-white leading-[1.08] max-w-5xl mx-auto">
            Twaalf Ondernemingen.{' '}
            <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-[#f5f5f7] to-[#86868b]">
              Eén Uniforme Directiehub.
            </span>
          </h1>

          {/* Refined Subtitle in Apple Secondary Gray */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg lg:text-xl text-[#86868b] font-normal max-w-2xl mx-auto leading-relaxed">
            Stroomlijn alle officiële holdingcorrespondentie, vertrouwelijke syndicaatsallocaties en realtime bestuursbesluiten binnen één beveiligde omgeving.
          </p>

          {/* Apple Action Buttons: White Pill & Translucent Glass */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={onEnterApp}
              className="apple-btn-white w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base shadow-xl"
            >
              <Mail className="w-4 h-4 text-black" />
              <span>Open Directie Postvak</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="apple-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[#f5f5f7] font-medium text-sm sm:text-base"
              >
                <User className="w-4 h-4 text-[#2997ff]" />
                <span>Partner Inloggen</span>
              </button>
            ) : (
              <button
                onClick={onToggleAmounts}
                className="apple-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[#f5f5f7] font-medium text-sm sm:text-base"
              >
                <span className="text-base">👁️</span>
                <span>{showAmounts ? 'Bedragen Verbergen' : 'Bedragen Weergeven'}</span>
              </button>
            )}
          </div>

          {/* ==================== 12 HOLDINGS INTERACTIVE LOGO RIBBON ==================== */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3.5 px-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                <span>Geconsolideerde Holdings &amp; Logo&#39;s</span>
              </span>
              <a
                href="#bedrijven"
                className="text-[11px] text-[#2997ff] hover:underline font-medium flex items-center gap-1 transition"
              >
                <span>Bekijk alle 12 dossiers</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div className="apple-glass rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border border-white/10 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth">
              {COMPANIES.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => onOpenCompanyInbox(comp.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl sm:rounded-2xl hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all duration-200 group shrink-0 text-left active:scale-95"
                  title={`Open direct ${comp.name} postvak`}
                >
                  <CompanyLogo companyId={comp.id} size={38} />
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-semibold text-white group-hover:text-[#2997ff] transition truncate max-w-[120px]">
                      {comp.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#86868b] truncate max-w-[120px]">
                      @{comp.domain}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ==================== APPLE BENTO METRICS BAR ==================== */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto text-left">
            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">12</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#2997ff] mt-1.5">
                Holdingbedrijven
              </p>
              <p className="text-xs text-[#86868b] mt-1 leading-snug">
                Geconsolideerde mail- & chatkanalen
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Realtime</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#30d158] mt-1.5">
                QI Directie Chat
              </p>
              <p className="text-xs text-[#86868b] mt-1 leading-snug">
                Directe lijnen per onderneming
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white flex items-center gap-1.5">
                <span>👁️</span>
                <span className="text-2xl sm:text-3xl">Veilig</span>
              </p>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#2997ff] mt-1.5">
                Financiële Privacy
              </p>
              <p className="text-xs text-[#86868b] mt-1 leading-snug">
                Bedragen uitsluitend na authenticatie
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">300+</p>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-[#bf5af2] mt-1.5">
                Cloudflare PoPs
              </p>
              <p className="text-xs text-[#86868b] mt-1 leading-snug">
                Zero-Trust globale edge distributie
              </p>
            </div>
          </div>
        </section>

        {/* ==================== APPLE HARDWARE DISPLAY FRAME TEASER ==================== */}
        <section className="px-4 sm:px-6 lg:px-12 py-8 sm:py-14 max-w-6xl mx-auto">
          {/* Beveled Studio Frame */}
          <div className="apple-hardware-frame rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-4">
            <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-[#0c0c0e] border border-white/[0.08] overflow-hidden">
              {/* macOS Style Window Bar */}
              <div className="px-4 sm:px-6 py-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff453a]/90 border border-[#ff453a]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#ff9f0a]/90 border border-[#ff9f0a]/40" />
                  <span className="w-3 h-3 rounded-full bg-[#30d158]/90 border border-[#30d158]/40" />
                  <span className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] text-[#f5f5f7] font-mono">
                    <Lock className="w-3 h-3 text-[#30d158]" />
                    <span>mail.quantuminitium.com</span>
                  </span>
                </div>

                {/* Apple Segmented Control for Mail vs Chat */}
                <div className="flex items-center bg-white/[0.06] p-1 rounded-full border border-white/[0.1] text-xs">
                  <button
                    onClick={() => setActivePreviewTab('mail')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                      activePreviewTab === 'mail'
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-[#86868b] hover:text-white'
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>QI Mail</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('chat')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                      activePreviewTab === 'chat'
                        ? 'bg-[#0071e3] text-white font-semibold shadow-sm'
                        : 'text-[#86868b] hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>QI Chat</span>
                  </button>
                </div>

                <button
                  onClick={onEnterApp}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs text-[#f5f5f7] transition"
                >
                  <span>Dashboard Openen</span>
                  <ChevronRight className="w-3 h-3 text-[#2997ff]" />
                </button>
              </div>

              {/* Interactive Company Logo Filter Pillbar */}
              <div className="px-4 sm:px-6 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff]" />
                  <span>Logo Filter:</span>
                </span>
                <button
                  onClick={() => setSelectedPreviewCompany('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                    selectedPreviewCompany === 'all'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-white/[0.05] text-[#86868b] hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  <QuantumLogo size={15} />
                  <span>Alle 12</span>
                </button>
                {COMPANIES.map((comp) => {
                  const isSelected = selectedPreviewCompany === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedPreviewCompany(comp.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition shrink-0 flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-[#0071e3] text-white font-semibold border-[#2997ff]/60 shadow-[0_0_12px_rgba(0,113,227,0.4)]'
                          : 'bg-white/[0.04] border-white/[0.08] text-[#86868b] hover:text-white hover:bg-white/[0.08]'
                      }`}
                      title={comp.name}
                    >
                      <CompanyLogo companyId={comp.id} size={18} showContainer={false} />
                      <span>{comp.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preview Content Body */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-3.5">
                {activePreviewTab === 'mail' ? (
                  <>
                    {(selectedPreviewCompany === 'all'
                      ? [
                          {
                            companyId: 'quantum_initium',
                            category: 'Holding Prioriteit',
                            badgeColor: '#2997ff',
                            subject: 'Strategische Groeiprognose en Kwartaalrapportage Q4',
                            sender: 'Directie Secretariaat',
                            time: 'Zojuist',
                            body: 'Geconsolideerde holdingomzet bedraagt € 14.280.000,- met een gerealiseerde nettomarge van € 2.450.000,- over alle aangesloten dochterondernemingen.'
                          },
                          {
                            companyId: 'woningvry',
                            category: 'Off-Market Dossier',
                            badgeColor: '#30d158',
                            subject: 'Investeringsdossier: Exclusief Beleggingspand Singel Amsterdam',
                            sender: 'Acquisitieteam Vastgoed',
                            time: '12 min geleden',
                            body: 'Monumentaal grachtenpand Singel. Koopsom bedraagt € 1.850.000,- k.k. met een gegarandeerde huuropbrengst van € 133.200,-/jaar.'
                          },
                          {
                            companyId: 'vvc',
                            category: 'Syndicaatsallocatie',
                            badgeColor: '#bf5af2',
                            subject: 'Dividenduitkering en Toelichting Nieuw Scale-Up Syndicaat',
                            sender: 'VVC Bestuursraad',
                            time: '18 min geleden',
                            body: 'Uitgekeerd kwartaaldividend bedraagt € 18.750,00 over een totale tranche van € 450.000,00 voor gekwalificeerde netwerkleden.'
                          }
                        ]
                      : SAMPLE_BUSINESS_EMAILS.filter((e) => e.companyId === selectedPreviewCompany).slice(0, 3)
                    ).map((email, idx) => {
                      const comp = COMPANIES.find((c) => c.id === email.companyId) || COMPANIES[0];
                      const subject = 'subject' in email ? email.subject : '';
                      const sender = 'senderName' in email ? email.senderName : ('sender' in email ? (email as any).sender : comp.name);
                      const time = 'time' in email ? (email as any).time : 'Vandaag';
                      const body = 'body' in email ? email.body : '';

                      // Extract any monetary mentions to safely wrap in masking button
                      const displaySnippet = () => {
                        if (email.companyId === 'quantum_initium') {
                          return (
                            <>
                              Holdingomzet:{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                                title="Klik om afscherming te testen"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 14.280.000,-' : '€ ••••••'}</span>
                              </button>{' '}
                              met nettomarge{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 2.450.000,-' : '€ ••••••'}</span>
                              </button>
                              .
                            </>
                          );
                        }
                        if (email.companyId === 'woningvry') {
                          return (
                            <>
                              Singel Amsterdam. Koopsom:{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 1.850.000,- k.k.' : '€ ••••••'}</span>
                              </button>{' '}
                              (huur{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 133.200,-/jaar' : '€ ••••••'}</span>
                              </button>
                              ).
                            </>
                          );
                        }
                        if (email.companyId === 'vvc') {
                          return (
                            <>
                              Kwartaaldividend:{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 18.750,00' : '€ ••••••'}</span>
                              </button>{' '}
                              over tranche{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleAmounts();
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2997ff]/15 hover:bg-[#2997ff]/25 border border-[#2997ff]/30 text-[#2997ff] font-mono text-[11px] font-semibold transition"
                              >
                                <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 450.000,00' : '€ ••••••'}</span>
                              </button>
                              .
                            </>
                          );
                        }
                        return (
                          <span className="line-clamp-1">
                            {body.slice(0, 140)}...
                          </span>
                        );
                      };

                      return (
                        <div
                          key={idx}
                          onClick={() => onOpenCompanyInbox(email.companyId)}
                          className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/25 cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Bespoke Holding Emblem Logo */}
                            <CompanyLogo companyId={email.companyId} size={44} className="mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                                  style={{
                                    backgroundColor: `${comp.color}20`,
                                    color: comp.color,
                                    borderColor: `${comp.color}40`
                                  }}
                                >
                                  {comp.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-[#f5f5f7] border border-white/15">
                                  {sender}
                                </span>
                                <span className="text-[10px] font-mono text-[#86868b]">
                                  @{comp.domain}
                                </span>
                              </div>
                              <h4 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-[#2997ff] transition">
                                {subject}
                              </h4>
                              <p className="text-xs text-[#86868b] mt-0.5">
                                {displaySnippet()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <span className="text-xs text-[#86868b] font-medium">{time}</span>
                            <span className="p-1.5 rounded-full bg-white/[0.06] text-[#86868b] group-hover:text-[#2997ff] transition">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  /* Chat Tab Preview with Company Logos */
                  <div className="space-y-3">
                    {(selectedPreviewCompany === 'all'
                      ? INITIAL_CHATS_SEED.slice(0, 3)
                      : INITIAL_CHATS_SEED.filter((c) => c.companyId === selectedPreviewCompany)
                    ).map((chat, idx) => {
                      const comp = COMPANIES.find((c) => c.id === chat.companyId) || COMPANIES[0];
                      return (
                        <div
                          key={idx}
                          onClick={() => onOpenCompanyInbox(chat.companyId)}
                          className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] cursor-pointer transition flex items-start gap-3.5 group"
                        >
                          <CompanyLogo companyId={chat.companyId} size={36} className="shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
                                <span>{chat.senderName}</span>
                                <span className="text-[10px] text-[#86868b] font-normal">({comp.name})</span>
                              </span>
                              <span className="text-[#86868b]">14:28</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#f5f5f7] leading-relaxed">
                              {chat.text}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:text-[#2997ff] shrink-0 self-center transition" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== THE 12 ENTERPRISES BENTO SHOWCASE ==================== */}
        <section id="bedrijven" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-28 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] bg-[#0071e3]/10 border border-[#0071e3]/25 px-3.5 py-1.5 rounded-full">
              Holding Architectuur
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mt-4">
              De 12 Gekoppelde Ondernemingen
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#86868b] leading-relaxed">
              Elke onderneming heeft een geïsoleerd postvak, eigen chatkanaal en specifieke syndicaatsallocaties. Klik op een kaart om direct het postvak te betreden.
            </p>
          </div>

          {/* Fully Responsive Bento Grid: 1 col on mobile, 2 on tablet, 3 to 4 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {COMPANIES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onOpenCompanyInbox(comp.id)}
                className="apple-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    {/* Bespoke Company Emblem Logo with Brand Glow */}
                    <div className="relative">
                      <div
                        className="absolute -inset-1.5 rounded-2xl opacity-20 blur-lg group-hover:opacity-60 transition duration-300 pointer-events-none"
                        style={{ backgroundColor: comp.color }}
                      />
                      <CompanyLogo companyId={comp.id} size={52} className="relative z-10 transition-transform group-hover:scale-105" />
                    </div>

                    <span className="text-[10px] font-mono text-[#86868b] px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] truncate max-w-[140px] group-hover:text-white group-hover:border-white/20 transition">
                      @{comp.domain}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#2997ff] transition flex items-center justify-between">
                    <span>{comp.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#86868b] group-hover:text-white">
                      {comp.short}
                    </span>
                  </h3>
                  <p
                    className="text-[11px] font-medium mt-0.5"
                    style={{ color: comp.color }}
                  >
                    {comp.category}
                  </p>
                  <p className="text-xs text-[#86868b] mt-2.5 leading-relaxed line-clamp-2">
                    {comp.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-[#f5f5f7] group-hover:text-[#2997ff] transition">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: comp.color }} />
                    <span>Open Postvak</span>
                  </span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== APPLE BENTO FEATURES GRID ==================== */}
        <section id="functies" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-28 max-w-7xl mx-auto border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2997ff] bg-[#0071e3]/10 border border-[#0071e3]/25 px-3.5 py-1.5 rounded-full">
              Executive Ecosysteem
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mt-4">
              Geavanceerde Beveiliging & Beheer
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#86868b] leading-relaxed">
              Gebouwd voor de hoogste bestuurlijke discretie, snelheid en overzichtelijkheid.
            </p>
          </div>

          {/* Asymmetric Apple Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Spans 2 cols */}
            <div className="md:col-span-2 apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff] mb-5">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Twaalf Bedrijven, Eén Uniform Postvak
                </h3>
                <p className="text-sm text-[#86868b] mt-2.5 max-w-xl leading-relaxed">
                  Geen gefragmenteerde mailboxen of verwarrende aliassen meer. Schakel met één klik tussen het overkoepelende directieoverzicht en elk afzonderlijk holdingbedrijf.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.12] text-[#f5f5f7]">
                  Instant Zoekfilter
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.12] text-[#f5f5f7]">
                  Bijlagenkoppeling naar Chat
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.12] text-[#f5f5f7]">
                  Swipe Actions (Gelezen / Archiveren)
                </span>
              </div>
            </div>

            {/* Bento Card 2: 👁️ Privacy */}
            <div className="apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#30d158]/15 border border-[#30d158]/30 flex items-center justify-center text-[#30d158] mb-5 text-2xl font-bold">
                  👁️
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Financiële Privacy
                </h3>
                <p className="text-sm text-[#86868b] mt-2.5 leading-relaxed">
                  Alle gevoelige bedragen in facturen, contracten en syndicaatsallocaties zijn standaard gemaskeerd achter het 👁️ symbool. Alleen geautoriseerde partners kunnen ze ontgrendelen.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <button
                  onClick={onToggleAmounts}
                  className="apple-btn-secondary w-full py-2.5 rounded-full text-xs font-medium text-[#2997ff] flex items-center justify-center gap-2"
                >
                  <span>👁️</span>
                  <span>{showAmounts && isLoggedIn ? 'Bedragen nu Zichtbaar' : 'Test Bedrag Masking'}</span>
                </button>
              </div>
            </div>

            {/* Bento Card 3: Realtime Chat */}
            <div className="apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#5e5ce6]/15 border border-[#5e5ce6]/30 flex items-center justify-center text-[#bf5af2] mb-5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Realtime Syndicaat Chat
                </h3>
                <p className="text-sm text-[#86868b] mt-2.5 leading-relaxed">
                  Gedetailleerde overlegkanalen voor elk netwerkbedrijf, inclusief gepinde besluiten, interactieve e-mailbijlagen en directie-aankondigingen.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <span className="text-xs font-semibold text-[#30d158] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
                  Live verbonden via Cloudflare Edge
                </span>
              </div>
            </div>

            {/* Bento Card 4: Cloudflare Pages Edge (Spans 2 cols) */}
            <div id="beveiliging" className="md:col-span-2 apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#2997ff] mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Bank-Grade Cloudflare Pages Architectuur
                </h3>
                <p className="text-sm text-[#86868b] mt-2.5 max-w-xl leading-relaxed">
                  Gedistribueerd over meer dan 300 datacenters wereldwijd via Cloudflare Pages. Geen serveronderhoud, automatische DDoS-mitigatie, HTTP/3 ondersteuning en zero attack surface.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
                  <span className="text-xs font-mono text-[#f5f5f7]">
                    mail.quantuminitium.com (SSL A+)
                  </span>
                </div>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-white px-5 py-2 rounded-full text-xs font-semibold text-black flex items-center gap-1.5"
                >
                  <span>Open Postvak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== APPLE MINIMALIST FOOTER ==================== */}
      <footer className="border-t border-white/[0.08] bg-black/80 px-4 sm:px-6 lg:px-12 py-12 text-[#86868b] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <QuantumLogo size={24} />
              <span className="font-semibold text-white tracking-tight text-sm">
                Quantum Initium Network
              </span>
            </div>
            <p className="text-[#86868b] max-w-md text-xs leading-relaxed">
              Exclusief directienetwerk en communicatiesyndicaat voor de 12 aangesloten holdings. Vertrouwelijk en strikt beveiligd.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#86868b]">
            <a href="#overzicht" className="hover:text-white transition">Overzicht</a>
            <a href="#bedrijven" className="hover:text-white transition">12 Holdings</a>
            <a href="#functies" className="hover:text-white transition">Functionaliteiten</a>
            <a href="#beveiliging" className="hover:text-white transition">Beveiliging</a>
            <button onClick={onOpenLogin} className="hover:text-[#2997ff] transition">
              Partner Inloggen
            </button>
          </div>
        </div>

        {/* 12 Holdings Bespoke Logo Showcase in Footer */}
        <div className="max-w-7xl mx-auto my-8 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
              <span>Geaccrediteerde Holding Logo&#39;s</span>
            </span>
            <span className="text-[11px] text-[#86868b] hidden sm:inline">
              12 actieve directiekanalen • Klik om postvak te openen
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 sm:gap-2.5">
            {COMPANIES.map((comp) => (
              <button
                key={comp.id}
                onClick={() => onOpenCompanyInbox(comp.id)}
                className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.05] hover:border-white/20 transition-all duration-200 group text-center cursor-pointer"
                title={`Open direct ${comp.name} postvak`}
              >
                <div className="relative">
                  <div
                    className="absolute -inset-1 rounded-xl opacity-0 blur-md group-hover:opacity-50 transition duration-300 pointer-events-none"
                    style={{ backgroundColor: comp.color }}
                  />
                  <CompanyLogo companyId={comp.id} size={36} className="relative z-10 transition-transform group-hover:scale-110" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-[11px] font-semibold text-white group-hover:text-[#2997ff] transition truncate">
                    {comp.short}
                  </p>
                  <p className="text-[9px] font-mono text-[#86868b] truncate">
                    @{comp.domain.split('.')[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#86868b]">
          <p>© {new Date().getFullYear()} Quantum Initium. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            <span>Cloudflare Pages Global Edge • Alle 12 systemen operationeel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};