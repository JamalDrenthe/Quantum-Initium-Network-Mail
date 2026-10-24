import React from 'react';
import {
  Shield, Mail, MessageSquare, ArrowRight, Lock, Building2,
  CheckCircle2, ChevronRight, User, Eye, EyeOff, FileText,
  Briefcase, TrendingUp, Layers, Check, ExternalLink
} from 'lucide-react';
import { Company } from '../types.ts';
import { COMPANIES } from '../constants.ts';
import { QuantumLogo } from './QuantumLogo.tsx';

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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Decorative Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-slate-800/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Top Executive Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QuantumLogo size={32} className="shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Quantum Initium
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Network Mail
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Centrale Directie- & Partnercommunicatiehub
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#overzicht" className="hover:text-amber-300 transition">Overzicht</a>
          <a href="#bedrijven" className="hover:text-amber-300 transition">12 Ondernemingen</a>
          <a href="#functies" className="hover:text-amber-300 transition">Functionaliteiten</a>
          <a href="#beveiliging" className="hover:text-amber-300 transition">Beveiliging & Financiën</a>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Eye amount toggle pill */}
          <button
            onClick={onToggleAmounts}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isLoggedIn
                ? showAmounts
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-300'
            }`}
            title={isLoggedIn ? (showAmounts ? 'Klik om bedragen te verbergen' : 'Klik om bedragen te tonen') : 'Inloggen of registreren om bedragen te bekijken'}
          >
            <span className="text-sm">👁️</span>
            <span className="hidden md:inline">
              {isLoggedIn ? (showAmounts ? 'Bedragen Zichtbaar' : 'Bedragen Verborgen') : 'Bedragen Afgeschermd'}
            </span>
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-medium text-slate-300">
                {userName || 'Ingelogd'}
              </span>
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <span>Naar Postvak & Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-semibold transition"
              >
                Inloggen
              </button>
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <span>Open Postvak</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* ==================== HERO SECTION ==================== */}
        <section id="overzicht" className="px-4 sm:px-6 lg:px-12 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-7xl mx-auto text-center">
          {/* Executive Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Exclusief Communicatieplatform voor Directie & Partners</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
            Twaalf Ondernemingen. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Eén Uniforme Directiehub.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stroomlijn alle officiële correspondentie, vertrouwelijke syndicaatsallocaties en realtime bestuursbesluiten tussen alle holdings binnen Quantum Initium.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Open Directie Postvak</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm sm:text-base transition active:scale-95"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Partner Inloggen</span>
              </button>
            ) : (
              <button
                onClick={onToggleAmounts}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm sm:text-base transition active:scale-95"
              >
                <span className="text-base">👁️</span>
                <span>{showAmounts ? 'Bedragen Verbergen' : 'Bedragen Weergeven'}</span>
              </button>
            )}
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">12</p>
              <p className="text-xs font-semibold text-amber-300 mt-0.5">Holdingbedrijven</p>
              <p className="text-[11px] text-slate-400 mt-1">Onderling verbonden mailkanalen</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Realtime</p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">QI Directie Chat</p>
              <p className="text-[11px] text-slate-400 mt-1">Directe lijnen per onderneming</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-1.5">
                <span>👁️</span>
                <span>Afgeschermd</span>
              </p>
              <p className="text-xs font-semibold text-amber-300 mt-0.5">Financiële Privacy</p>
              <p className="text-[11px] text-slate-400 mt-1">Cijfers uitsluitend na authenticatie</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.98%</p>
              <p className="text-xs font-semibold text-indigo-400 mt-0.5">Cloudflare Edge</p>
              <p className="text-[11px] text-slate-400 mt-1">Hoge beschikbaarheid & beveiliging</p>
            </div>
          </div>
        </section>

        {/* ==================== INTERACTIVE PREVIEW TEASER ==================== */}
        <section className="px-4 sm:px-6 lg:px-12 py-10 max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-5 sm:p-8 relative overflow-hidden">
            {/* Top Bar of Preview */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Voorbeeld: Directiecommunicatie & Afgeschermde Data
                  </h3>
                  <p className="text-xs text-slate-400">
                    Klik op de postvakken of het oog-icoon om de interactieve beveiliging te testen.
                  </p>
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                <span>Volledig Dashboard Openen</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Mock Item Showcase */}
            <div className="mt-5 space-y-3">
              {/* Email Sample 1: Quantum Initium */}
              <div
                onClick={onEnterApp}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Quantum Initium Holding
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Prioriteit
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-amber-300 transition">
                      Strategische Groeiprognose en Kwartaalrapportage Q4
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      Geconsolideerde holdingomzet:{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 14.280.000,-' : '€ ••••••'}</span>
                      </span>{' '}
                      over afgelopen boekjaar met een nettomarge van{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 2.450.000,-' : '€ ••••••'}</span>
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs text-slate-500">Zojuist</span>
                  <span className="p-1 rounded-lg bg-slate-900 text-slate-400 group-hover:text-amber-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Email Sample 2: WoningVry */}
              <div
                onClick={onEnterApp}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        WoningVry Vastgoed
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Off-Market Dossier
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-amber-300 transition">
                      Investeringsdossier: Exclusief Off-Market Beleggingspand Amsterdam
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      Monumentaal pand Singel. Koopsom:{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 1.850.000,- k.k.' : '€ ••••••'}</span>
                      </span>{' '}
                      met een jaarlijkse huuropbrengst van{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 133.200,-' : '€ ••••••'}</span>
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs text-slate-500">12 min geleden</span>
                  <span className="p-1 rounded-lg bg-slate-900 text-slate-400 group-hover:text-amber-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Email Sample 3: VVC Verdienende Vrienden Club */}
              <div
                onClick={onEnterApp}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 cursor-pointer transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        VVC Netwerkkring
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Dividenduitkering
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-amber-300 transition">
                      Dividenduitkering en Toelichting Nieuw Investeringssyndicaat
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      Uitgekeerd kwartaaldividend per participatie:{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 18.750,00' : '€ ••••••'}</span>
                      </span>{' '}
                      over een totale syndicaatstranche van{' '}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
                        <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 450.000,00' : '€ ••••••'}</span>
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs text-slate-500">18 min geleden</span>
                  <span className="p-1 rounded-lg bg-slate-900 text-slate-400 group-hover:text-amber-300">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== THE 12 ENTERPRISES SECTION ==================== */}
        <section id="bedrijven" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Holding Structuur
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 font-['Plus_Jakarta_Sans']">
              De 12 Gekoppelde Ondernemingen
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Ieder bedrijf beschikt over een eigen zakelijk postvak, beveiligd realtime chatkanaal en specifieke documentenarchivering. Klik op een onderneming om direct naar het bijbehorende postvak te navigeren.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {COMPANIES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onOpenCompanyInbox(comp.id)}
                className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-md shrink-0"
                      style={{ backgroundColor: comp.color }}
                    >
                      {comp.short}
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 truncate">
                      @{comp.domain}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                    {comp.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-amber-400/90 mt-0.5">
                    {comp.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {comp.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                  <span>Open Postvak & Chat</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== CORE PLATFORM FEATURES ==================== */}
        <section id="functies" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Executive Functionaliteiten
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 font-['Plus_Jakarta_Sans']">
              Ontworpen voor Zakelijke Efficiëntie
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Geen versnipperde e-mailthreads meer. Alle communicatielijnen zijn georganiseerd volgens de bestuursstructuur van de holding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">12 Gekoppelde Postvakken</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Schakel moeiteloos tussen overkoepelende directieberichten en specifieke bedrijfspostvakken zonder steeds opnieuw in te loggen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-4">
                <span className="text-2xl font-bold">👁️</span>
              </div>
              <h3 className="text-base font-bold text-white">Afgeschermde Cijfers</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Bedragen in e-mails en chats zijn standaard afgeschermd achter het 👁️ teken. Alleen geautoriseerde partners kunnen deze met één klik ontgrendelen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Realtime QI Chat</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Koppel e-mails direct aan chatkanalen, pin agendapunten vast en overleg met directieleden zonder e-mailvertraging.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Documenten & Dossiers</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Direct inzicht in IND-kennismigrantenaanvragen, syndicaatcontracten, huurvlootovereenkomsten en HR-compliance certificaten.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== SECURITY & ACCESS SECTION ==================== */}
        <section id="beveiliging" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-20 max-w-6xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Beveiliging & Cloudflare Edge</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Beveiligde Directielijn & Toegangscontrole
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Het platform maakt gebruik van geavanceerde rolgebaseerde beveiliging (Directie vs. Partner), end-to-end SSL-encryptie en afgeschermde financiële metadata. Geen data wordt publiek gedeeld zonder geverifieerde sessie.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Strikte rollenscheiding</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Financiële bedrag-maskering (👁️)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cloudflare Pages Global CDN</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Direct naar Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isLoggedIn && (
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition text-center"
                >
                  Partner Inloggen
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Executive Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 text-xs px-4 sm:px-6 lg:px-12 py-8 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <QuantumLogo size={24} />
            <span className="font-bold text-white text-sm">Quantum Initium</span>
            <span className="text-slate-600">•</span>
            <span>Centrale Holding & Technologiebeheer</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button onClick={onEnterApp} className="hover:text-amber-300 transition">
              Webmail & Chat
            </button>
            <button onClick={onOpenLogin} className="hover:text-amber-300 transition">
              Inloggen
            </button>
            <button onClick={onToggleAmounts} className="hover:text-amber-300 transition flex items-center gap-1">
              <span>👁️</span>
              <span>Bedragen</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 Quantum Initium • Besloten Directie Communicatieplatform
          </p>
        </div>
      </footer>
    </div>
  );
};
