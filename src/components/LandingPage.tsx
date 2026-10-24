import React, { useState } from 'react';
import {
  Shield, Mail, MessageSquare, ArrowRight, Lock, Building2,
  CheckCircle2, ChevronRight, User, Eye, EyeOff, FileText,
  Briefcase, TrendingUp, Layers, Check, ExternalLink, Globe,
  Cpu, Sparkles, SlidersHorizontal, Menu, X
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
  const [activePreviewTab, setActivePreviewTab] = useState<'mail' | 'chat'>('mail');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden antialiased">
      {/* Apple-style Diffused Ambient Backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-indigo-500/12 via-amber-500/8 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/3 -right-64 w-[650px] h-[650px] bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-64 w-[700px] h-[700px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      </div>

      {/* ==================== APPLE FROSTED GLASS HEADER ==================== */}
      <header className="sticky top-0 z-50 apple-glass px-4 sm:px-6 lg:px-12 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2.5 text-left group transition cursor-pointer"
            >
              <QuantumLogo size={32} className="shrink-0 transition-transform group-hover:scale-105" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base sm:text-lg tracking-[-0.02em] text-white">
                    Quantum Initium
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/[0.05] border border-white/10 text-amber-300/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                    Network Mail
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden lg:block tracking-tight">
                  Centrale Directie- & Partnercommunicatie
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Apple-style Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-full text-xs font-medium text-slate-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <a
              href="#overzicht"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition"
            >
              Overzicht
            </a>
            <a
              href="#bedrijven"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition"
            >
              12 Holdings
            </a>
            <a
              href="#functies"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition"
            >
              Functionaliteiten
            </a>
            <a
              href="#beveiliging"
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition"
            >
              Beveiliging
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Eye Amount Toggle Pill */}
            <button
              onClick={onToggleAmounts}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 ${
                isLoggedIn
                  ? showAmounts
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/35 text-amber-300'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-amber-300'
              }`}
              title={
                isLoggedIn
                  ? showAmounts
                    ? 'Bedragen zijn zichtbaar (klik om te verbergen)'
                    : 'Bedragen zijn verborgen (klik om te tonen)'
                  : 'Bedragen zijn afgeschermd met 👁️. Klik om in te loggen of registreren.'
              }
            >
              <span className="text-xs">👁️</span>
              <span className="hidden sm:inline">
                {isLoggedIn
                  ? showAmounts
                    ? 'Bedragen Zichtbaar'
                    : 'Bedragen Verborgen'
                  : 'Bedragen Afgeschermd'}
              </span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline-block text-xs font-medium text-slate-300">
                  {userName || 'Ingelogd'}
                </span>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-gold flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-950"
                >
                  <span>Naar Postvak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="apple-btn-secondary px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-200"
                >
                  Inloggen
                </button>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-gold flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-950"
                >
                  <span>Open Postvak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
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
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              Overzicht
            </a>
            <a
              href="#bedrijven"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              12 Holdings
            </a>
            <a
              href="#functies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              Functionaliteiten
            </a>
            <a
              href="#beveiliging"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/[0.06]"
            >
              Beveiliging & Privacy
            </a>
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex-1 apple-btn-secondary py-2 rounded-xl text-xs font-medium text-center"
              >
                Inloggen
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterApp();
                }}
                className="flex-1 apple-btn-gold py-2 rounded-xl text-xs font-semibold text-slate-950 text-center"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] mb-6 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Exclusief Communicatienetwerk voor Directie & Partners</span>
          </div>

          {/* Cinematic Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-white leading-[1.08] max-w-5xl mx-auto">
            Twaalf Ondernemingen.{' '}
            <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-amber-200/90">
              Eén Uniforme Directiehub.
            </span>
          </h1>

          {/* Refined Subtitle */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg lg:text-xl text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Stroomlijn alle officiële holdingcorrespondentie, syndicaatsallocaties en realtime bestuursbesluiten binnen één beveiligde omgeving.
          </p>

          {/* Apple Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={onEnterApp}
              className="apple-btn-gold w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-slate-950 font-semibold text-sm sm:text-base shadow-xl"
            >
              <Mail className="w-4 h-4" />
              <span>Open Directie Postvak</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="apple-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-slate-200 font-medium text-sm sm:text-base"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Partner Inloggen</span>
              </button>
            ) : (
              <button
                onClick={onToggleAmounts}
                className="apple-btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-slate-200 font-medium text-sm sm:text-base"
              >
                <span className="text-base">👁️</span>
                <span>{showAmounts ? 'Bedragen Verbergen' : 'Bedragen Weergeven'}</span>
              </button>
            )}
          </div>

          {/* ==================== APPLE BENTO METRICS BAR ==================== */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto text-left">
            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">12</p>
              <p className="text-xs font-semibold tracking-wider uppercase text-amber-300 mt-1">
                Holdingbedrijven
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Geconsolideerde mail- & chatkanalen
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Realtime</p>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-400 mt-1">
                QI Directie Chat
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Directe afstemming per onderneming
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white flex items-center gap-1.5">
                <span>👁️</span>
                <span className="text-2xl sm:text-3xl">Afgeschermd</span>
              </p>
              <p className="text-xs font-semibold tracking-wider uppercase text-amber-300 mt-1">
                Financiële Privacy
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Bedragen uitsluitend na authenticatie
              </p>
            </div>

            <div className="apple-glass-card rounded-3xl p-5 sm:p-6">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">300+</p>
              <p className="text-xs font-semibold tracking-wider uppercase text-indigo-400 mt-1">
                Cloudflare PoPs
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Zero-Trust globale edge distributie
              </p>
            </div>
          </div>
        </section>

        {/* ==================== APPLE HARDWARE DISPLAY FRAME TEASER ==================== */}
        <section className="px-4 sm:px-6 lg:px-12 py-8 sm:py-14 max-w-6xl mx-auto">
          {/* Beveled Studio Frame */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] p-2.5 sm:p-4 bg-gradient-to-b from-white/15 via-white/5 to-white/[0.02] border border-white/15 shadow-[0_35px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)]">
            <div className="rounded-[1.6rem] sm:rounded-[2rem] bg-[#070a13] border border-white/5 overflow-hidden">
              {/* macOS Style Window Bar */}
              <div className="px-4 sm:px-6 py-3.5 bg-black/40 border-b border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
                  <span className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-slate-300 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>mail.quantuminitium.com</span>
                  </span>
                </div>

                {/* Apple Segmented Control for Mail vs Chat */}
                <div className="flex items-center bg-white/[0.06] p-1 rounded-full border border-white/10 text-xs">
                  <button
                    onClick={() => setActivePreviewTab('mail')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                      activePreviewTab === 'mail'
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>QI Mail</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('chat')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${
                      activePreviewTab === 'chat'
                        ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>QI Chat</span>
                  </button>
                </div>

                <button
                  onClick={onEnterApp}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-slate-200 transition"
                >
                  <span>Dashboard Openen</span>
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                </button>
              </div>

              {/* Preview Content Body */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-3.5">
                {activePreviewTab === 'mail' ? (
                  <>
                    {/* Item 1 */}
                    <div
                      onClick={onEnterApp}
                      className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-amber-400/30 cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              Quantum Initium Holding
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              Directie Prioriteit
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-amber-300 transition">
                            Strategische Groeiprognose en Kwartaalrapportage Q4
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            Geconsolideerde holdingomzet:{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 14.280.000,-' : '€ ••••••'}</span>
                            </button>{' '}
                            met een gerealiseerde nettomarge van{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 2.450.000,-' : '€ ••••••'}</span>
                            </button>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <span className="text-xs text-slate-500 font-medium">Zojuist</span>
                        <span className="p-1.5 rounded-full bg-white/[0.05] text-slate-400 group-hover:text-amber-300 transition">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div
                      onClick={onEnterApp}
                      className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-amber-400/30 cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              WoningVry Vastgoed
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Off-Market Dossier
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-amber-300 transition">
                            Investeringsdossier: Exclusief Off-Market Beleggingspand Amsterdam
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            Monumentaal pand Singel. Koopsom:{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 1.850.000,- k.k.' : '€ ••••••'}</span>
                            </button>{' '}
                            met een geprojecteerde huuropbrengst van{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 133.200,-/jaar' : '€ ••••••'}</span>
                            </button>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <span className="text-xs text-slate-500 font-medium">12 min geleden</span>
                        <span className="p-1.5 rounded-full bg-white/[0.05] text-slate-400 group-hover:text-amber-300 transition">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div
                      onClick={onEnterApp}
                      className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] hover:border-amber-400/30 cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              VVC Netwerkkring
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Dividendallocatie
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-amber-300 transition">
                            Dividenduitkering en Toelichting Nieuw Investeringssyndicaat
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            Uitgekeerd kwartaaldividend per participatie:{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 18.750,00' : '€ ••••••'}</span>
                            </button>{' '}
                            over een totale tranche van{' '}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleAmounts();
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold transition"
                              title="Klik om afscherming te testen"
                            >
                              <span>👁️</span>{' '}
                              <span>{showAmounts && isLoggedIn ? '€ 450.000,00' : '€ ••••••'}</span>
                            </button>
                            .
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <span className="text-xs text-slate-500 font-medium">18 min geleden</span>
                        <span className="p-1.5 rounded-full bg-white/[0.05] text-slate-400 group-hover:text-amber-300 transition">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Chat Tab Preview */
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Jamal Drenthe (Directie)
                        </span>
                        <span className="text-slate-500">14:28</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200">
                        Het dossier Singel voor WoningVry is zojuist geüpload in het postvak. De koopsom bedraagt{' '}
                        <button
                          onClick={onToggleAmounts}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold"
                        >
                          <span>👁️</span> <span>{showAmounts && isLoggedIn ? '€ 1.850.000,-' : '€ ••••••'}</span>
                        </button>
                        . Gelieve vóór 17:00 te bevestigen.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Partner Raad (VVC)
                        </span>
                        <span className="text-slate-500">14:31</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300">
                        Akkoord vanuit syndicaat VVC. Wij reserveren de eerste participatietranche.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== THE 12 ENTERPRISES BENTO SHOWCASE ==================== */}
        <section id="bedrijven" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-28 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3.5 py-1.5 rounded-full">
              Holding Architectuur
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mt-4">
              De 12 Gekoppelde Ondernemingen
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-slate-400 leading-relaxed">
              Elke onderneming heeft een geïsoleerd postvak, eigen chatkanaal en specifieke syndicaatsallocaties. Klik op een kaart om direct het postvak te betreden.
            </p>
          </div>

          {/* Fully Responsive Bento Grid: 1 col on mobile, 2 on tablet, 3 to 4 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {COMPANIES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onOpenCompanyInbox(comp.id)}
                className="apple-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Squircle Monogram */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg transition-transform group-hover:scale-105 shrink-0"
                      style={{
                        backgroundColor: comp.color,
                        boxShadow: `0 8px 20px -4px ${comp.color}50`
                      }}
                    >
                      {comp.short}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] truncate max-w-[150px]">
                      @{comp.domain}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-amber-300 transition">
                    {comp.name}
                  </h3>
                  <p className="text-[11px] font-medium text-amber-400/90 mt-0.5">
                    {comp.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                    {comp.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                  <span>Open Postvak</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== APPLE BENTO FEATURES GRID ==================== */}
        <section id="functies" className="px-4 sm:px-6 lg:px-12 py-16 sm:py-28 max-w-7xl mx-auto border-t border-white/[0.08]">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3.5 py-1.5 rounded-full">
              Executive Ecosysteem
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mt-4">
              Geavanceerde Beveiliging & Beheer
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-slate-400 leading-relaxed">
              Gebouwd voor de hoogste bestuurlijke discretie, snelheid en overzichtelijkheid.
            </p>
          </div>

          {/* Asymmetric Apple Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Spans 2 cols */}
            <div className="md:col-span-2 apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-5">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Twaalf Bedrijven, Eén Uniform Postvak
                </h3>
                <p className="text-sm text-slate-400 mt-2.5 max-w-xl leading-relaxed">
                  Geen gefragmenteerde mailboxen of verwarrende aliassen meer. Schakel met één klik tussen het overkoepelende directieoverzicht en elk afzonderlijk holdingbedrijf.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 text-slate-300">
                  Instant Zoekfilter
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 text-slate-300">
                  Bijlagenkoppeling naar Chat
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] border border-white/10 text-slate-300">
                  Swipe Actions (Gelezen / Archiveren)
                </span>
              </div>
            </div>

            {/* Bento Card 2: 👁️ Privacy */}
            <div className="apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-5 text-2xl font-bold">
                  👁️
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Financiële Privacy
                </h3>
                <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                  Alle gevoelige bedragen in facturen, contracten en syndicaatsallocaties zijn standaard gemaskeerd achter het 👁️ symbool. Alleen geautoriseerde partners kunnen ze bekijken.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <button
                  onClick={onToggleAmounts}
                  className="apple-btn-secondary w-full py-2.5 rounded-full text-xs font-medium text-amber-300 flex items-center justify-center gap-2"
                >
                  <span>👁️</span>
                  <span>{showAmounts && isLoggedIn ? 'Bedragen nu Zichtbaar' : 'Test Bedrag Masking'}</span>
                </button>
              </div>
            </div>

            {/* Bento Card 3: Realtime Chat */}
            <div className="apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-400/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Realtime Syndicaat Chat
                </h3>
                <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                  Gedetailleerde overlegkanalen voor elk netwerkbedrijf, inclusief gepinde besluiten, interactieve e-mailbijlagen en directie-aankondigingen.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live verbonden via Cloudflare Edge
                </span>
              </div>
            </div>

            {/* Bento Card 4: Cloudflare Pages Edge (Spans 2 cols) */}
            <div id="beveiliging" className="md:col-span-2 apple-glass-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-5">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Bank-Grade Cloudflare Pages Architectuur
                </h3>
                <p className="text-sm text-slate-400 mt-2.5 max-w-xl leading-relaxed">
                  Gedistribueerd over meer dan 300 datacenters wereldwijd via Cloudflare Pages. Geen serveronderhoud, automatische DDoS-mitigatie, HTTP/3 ondersteuning en zero attack surface.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-300">
                    mail.quantuminitium.com (SSL A+)
                  </span>
                </div>
                <button
                  onClick={onEnterApp}
                  className="apple-btn-gold px-5 py-2 rounded-full text-xs font-semibold text-slate-950 flex items-center gap-1.5"
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
      <footer className="border-t border-white/[0.08] bg-black/60 px-4 sm:px-6 lg:px-12 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <QuantumLogo size={24} />
              <span className="font-semibold text-white tracking-tight text-sm">
                Quantum Initium Network
              </span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Exclusief directienetwerk en communicatiesyndicaat voor de 12 aangesloten holdings. Vertrouwelijk en strikt beveiligd.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
            <a href="#overzicht" className="hover:text-white transition">Overzicht</a>
            <a href="#bedrijven" className="hover:text-white transition">12 Holdings</a>
            <a href="#functies" className="hover:text-white transition">Functionaliteiten</a>
            <a href="#beveiliging" className="hover:text-white transition">Beveiliging</a>
            <button onClick={onOpenLogin} className="hover:text-amber-300 transition">
              Partner Inloggen
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Quantum Initium. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cloudflare Pages Global Edge • Alle 12 systemen operationeel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};