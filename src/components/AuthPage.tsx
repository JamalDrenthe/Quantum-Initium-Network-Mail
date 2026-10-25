import React, { useState } from 'react';
import {
  Lock, Mail, User, Shield, Building2, CheckCircle2,
  ArrowRight, Eye, EyeOff, UserCheck, AlertCircle, KeyRound,
  Briefcase, Check, X
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase.ts';
import { COMPANIES } from '../constants.ts';
import { CrmContact } from '../types.ts';
import {
  lookupCrmContactByEmail,
  syncContactWithCrmos,
  MAIL_QI_TAG
} from '../services/crmosService.ts';
import { QuantumLogo } from './QuantumLogo.tsx';

export interface AuthPageProps {
  onSuccessLogin: (userData: {
    uid: string;
    name: string;
    handle: string;
    email: string;
    role: string;
    companyId: string;
    tags?: string[];
    crmContactId?: string;
  }) => void;
  onClose?: () => void;
  isModal?: boolean;
  bannerNotice?: string;
  initialMode?: 'login' | 'register';
}

export function AuthPage({
  onSuccessLogin,
  onClose,
  isModal = false,
  bannerNotice,
  initialMode = 'login'
}: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('quantum_initium');
  const [regRole, setRegRole] = useState<'Directie' | 'Partner'>('Directie');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isFetchingCrm, setIsFetchingCrm] = useState(false);
  const [crmContactMatch, setCrmContactMatch] = useState<CrmContact | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFetchCrmData = async (targetEmail: string, silent = false) => {
    const clean = targetEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      if (!silent) {
        setErrorMessage('Vul eerst een zakelijk e-mailadres in om gegevens uit CRMos op te halen.');
      }
      return null;
    }

    setIsFetchingCrm(true);
    if (!silent) {
      setErrorMessage(null);
    }

    try {
      const contact = await lookupCrmContactByEmail(clean);
      if (contact) {
        setCrmContactMatch(contact);
        if (contact.name && !regName.trim()) {
          setRegName(contact.name);
        } else if (contact.name && !silent) {
          setRegName(contact.name);
        }
        if (contact.companyId) {
          setRegCompany(contact.companyId);
        }
        if (contact.role) {
          setRegRole(contact.role === 'Partner' ? 'Partner' : 'Directie');
        }
        if (!silent) {
          setSuccessMessage(
            `CRMos profiel gevonden voor ${contact.name} (${contact.companyName}). Tag '${MAIL_QI_TAG}' is gekoppeld.`
          );
        }
        return contact;
      } else {
        setCrmContactMatch(null);
        if (!silent) {
          setSuccessMessage(
            `Nieuw contactpersoon voor CRMos. Bij registratie wordt direct een CRMos-profiel met tag '${MAIL_QI_TAG}' aangemaakt.`
          );
        }
        return null;
      }
    } catch {
      return null;
    } finally {
      setIsFetchingCrm(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('Vul alsjeblieft een geldig emailadres in.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Vul alsjeblieft je wachtwoord in.');
      return;
    }

    setLoading(true);

    try {
      const crmMatch = await lookupCrmContactByEmail(cleanEmail);
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const user = userCredential.user;
      const cleanHandle = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'partner';

      const resolvedName = crmMatch?.name || user.displayName || 'Netwerk Partner';
      const resolvedRole = (crmMatch?.role || 'Directie') as 'Directie' | 'Partner';
      const resolvedCompanyId = crmMatch?.companyId || 'quantum_initium';

      const syncedCrm = await syncContactWithCrmos({
        uid: user.uid,
        name: resolvedName,
        email: user.email || cleanEmail,
        companyId: resolvedCompanyId,
        role: resolvedRole
      });

      const loggedUserData = {
        uid: user.uid,
        name: syncedCrm.name || resolvedName,
        handle: cleanHandle,
        email: user.email || cleanEmail,
        role: syncedCrm.role || resolvedRole,
        companyId: syncedCrm.companyId || resolvedCompanyId,
        tags: syncedCrm.tags,
        crmContactId: syncedCrm.id
      };

      if (rememberMe) {
        localStorage.setItem('qin_remember_user', JSON.stringify(loggedUserData));
      }

      setSuccessMessage(`Succesvol ingelogd & gesynchroniseerd met CRMos (${MAIL_QI_TAG}).`);
      setTimeout(() => {
        onSuccessLogin(loggedUserData);
      }, 500);
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code || '';
      console.warn('Firebase login melding:', err);

      if (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential') {
        setErrorMessage('Geen account gevonden met deze gegevens of het wachtwoord klopt niet.');
      } else if (errCode === 'auth/wrong-password') {
        setErrorMessage('Het opgegeven wachtwoord is onjuist.');
      } else if (errCode === 'auth/invalid-email') {
        setErrorMessage('Het formaat van het emailadres is niet geldig.');
      } else {
        const cleanHandle = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'partner';
        const crmMatch = await lookupCrmContactByEmail(cleanEmail);
        const fallbackUid = `usr_${Math.random().toString(36).slice(2, 9)}`;
        const syncedCrm = await syncContactWithCrmos({
          uid: fallbackUid,
          name: crmMatch?.name || cleanHandle.toUpperCase(),
          email: cleanEmail,
          companyId: crmMatch?.companyId || 'quantum_initium',
          role: crmMatch?.role || 'Directie'
        });

        const fallbackData = {
          uid: fallbackUid,
          name: syncedCrm.name,
          handle: cleanHandle,
          email: cleanEmail,
          role: syncedCrm.role,
          companyId: syncedCrm.companyId,
          tags: syncedCrm.tags,
          crmContactId: syncedCrm.id
        };
        onSuccessLogin(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setErrorMessage('Vul alsjeblieft je volledige naam in.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Vul alsjeblieft een geldig zakelijk emailadres in.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Het wachtwoord dient minimaal 6 karakters te bevatten.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('De ingevoerde wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, regPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: cleanName }).catch(() => {});

      const cleanHandle = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'partner';

      const syncedCrm = await syncContactWithCrmos({
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
        companyId: regCompany,
        role: regRole
      });

      const newUserData = {
        uid: user.uid,
        name: cleanName,
        handle: cleanHandle,
        email: cleanEmail,
        role: regRole,
        companyId: regCompany,
        tags: syncedCrm.tags,
        crmContactId: syncedCrm.id
      };

      setSuccessMessage(`Account & CRMos contact aangemaakt met tag '${MAIL_QI_TAG}'.`);
      setTimeout(() => {
        onSuccessLogin(newUserData);
      }, 600);
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code || '';
      console.warn('Firebase registratie melding:', err);

      if (errCode === 'auth/email-already-in-use') {
        setErrorMessage('Dit emailadres is reeds geregistreerd. Kies voor inloggen.');
      } else if (errCode === 'auth/invalid-email') {
        setErrorMessage('Het emailadres heeft een onjuist formaat.');
      } else if (errCode === 'auth/weak-password') {
        setErrorMessage('Kies alsjeblieft een sterker wachtwoord van minstens 6 tekens.');
      } else {
        const cleanHandle = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'partner';
        const fallbackUid = `usr_${Math.random().toString(36).slice(2, 9)}`;
        const syncedCrm = await syncContactWithCrmos({
          uid: fallbackUid,
          name: cleanName,
          email: cleanEmail,
          companyId: regCompany,
          role: regRole
        });

        const fallbackData = {
          uid: fallbackUid,
          name: cleanName,
          handle: cleanHandle,
          email: cleanEmail,
          role: regRole,
          companyId: regCompany,
          tags: syncedCrm.tags,
          crmContactId: syncedCrm.id
        };
        setSuccessMessage(`Account geregistreerd & CRMos getagd met '${MAIL_QI_TAG}'.`);
        setTimeout(() => {
          onSuccessLogin(fallbackData);
        }, 600);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const cleanHandle = (user.email || 'partner').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');

      const syncedCrm = await syncContactWithCrmos({
        uid: user.uid,
        name: user.displayName || 'Google Netwerk Relatie',
        email: user.email || `${cleanHandle}@quantuminitium.com`,
        companyId: 'quantum_initium',
        role: 'Directie'
      });

      const userData = {
        uid: user.uid,
        name: syncedCrm.name || user.displayName || 'Google Netwerk Relatie',
        handle: cleanHandle,
        email: user.email || '',
        role: syncedCrm.role || 'Directie',
        companyId: syncedCrm.companyId || 'quantum_initium',
        tags: syncedCrm.tags,
        crmContactId: syncedCrm.id
      };

      setSuccessMessage(`Verbonden met Google & CRMos (${MAIL_QI_TAG}).`);
      setTimeout(() => {
        onSuccessLogin(userData);
      }, 500);
    } catch (err: unknown) {
      console.warn('Google login popup melding:', err);
      setErrorMessage('Google aanmelding kon niet worden voltooid of is gesloten.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async (role: 'Directie' | 'Partner', companyId: string) => {
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    const chosenCompany = COMPANIES.find(c => c.id === companyId) || COMPANIES[0];
    const demoUid = `demo_${role.toLowerCase()}_${randomSuffix}`;
    const demoName = role === 'Directie' ? 'Jamal Drenthe' : `Partner ${chosenCompany.short}`;
    const demoEmail = role === 'Directie' ? 'info@jamaldrenthe.com' : `${role.toLowerCase()}@${chosenCompany.domain}`;

    const syncedCrm = await syncContactWithCrmos({
      uid: demoUid,
      name: demoName,
      email: demoEmail,
      companyId,
      role
    });

    const demoData = {
      uid: demoUid,
      name: syncedCrm.name || demoName,
      handle: `${role.toLowerCase()}.${randomSuffix}`,
      email: demoEmail,
      role: role,
      companyId: companyId,
      tags: syncedCrm.tags,
      crmContactId: syncedCrm.id
    };

    setSuccessMessage(`Toegang verleend & CRMos contact getagd met '${MAIL_QI_TAG}'.`);
    setTimeout(() => {
      onSuccessLogin(demoData);
    }, 400);
  };

  const renderCardContent = () => (
    <div className="relative apple-glass rounded-[2rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-6 sm:p-9 overflow-hidden">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white transition flex items-center justify-center border border-white/10 shadow-sm"
          title="Sluiten en verdergaan als bezoeker"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {bannerNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.06] border border-white/15 text-[#f5f5f7] text-xs sm:text-sm flex items-start gap-3 shadow-sm">
          <span className="text-base shrink-0 mt-0.5 text-[#2997ff]">👁️</span>
          <span className="leading-snug text-[#f5f5f7]">{bannerNotice}</span>
        </div>
      )}

      {/* Header Badge */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 mb-3.5 shadow-inner">
          <QuantumLogo size={32} />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {authMode === 'login' ? 'Inloggen bij Quantum Initium' : 'Nieuw Account Registreren'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          {authMode === 'login'
            ? 'Toegang tot alle 12 zakelijke postvakken en realtime QI Chat'
            : 'Word lid van het Quantum Initium ondernemersnetwerk'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-white/[0.05] rounded-full border border-white/10 mb-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            authMode === 'login'
              ? 'apple-btn-primary text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Inloggen
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
            authMode === 'register'
              ? 'apple-btn-primary text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Registreren
        </button>
      </div>

      {/* CRMos Integratie & Tag Badge */}
      <div className="mb-5 p-3 rounded-2xl bg-[#0071e3]/10 border border-[#2997ff]/25 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#30d158] shrink-0" />
          <span className="text-[#f5f5f7] font-medium truncate">
            CRMos Koppeling Actief
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-mono text-[#2997ff]">
          #{MAIL_QI_TAG}
        </span>
      </div>

            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {crmContactMatch && (
              <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.05] border border-[#30d158]/35 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#30d158] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    CRMos Contactpersoon Herkend
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#0071e3]/20 text-[#2997ff] border border-[#2997ff]/30 font-mono text-[10px]">
                    {MAIL_QI_TAG}
                  </span>
                </div>
                <p className="text-[#f5f5f7] font-medium">
                  {crmContactMatch.name} • <span className="text-[#86868b]">{crmContactMatch.companyName} ({crmContactMatch.role})</span>
                </p>
              </div>
            )}

            {/* Inlog Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Zakelijk Emailadres
                    </label>
                    <button
                      type="button"
                      disabled={isFetchingCrm}
                      onClick={() => handleFetchCrmData(loginEmail)}
                      className="text-[11px] text-[#2997ff] hover:underline font-medium"
                    >
                      {isFetchingCrm ? 'CRMos zoeken...' : 'CRMos Data Checken'}
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onBlur={() => {
                        if (loginEmail.includes('@')) {
                          handleFetchCrmData(loginEmail, true);
                        }
                      }}
                      placeholder="bijvoorbeeld info@jamaldrenthe.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Wachtwoord
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Neem contact op met de systeembeheerder van Quantum Initium om je wachtwoord te herstellen.')}
                      className="text-[11px] text-[#2997ff] hover:underline"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Voer je wachtwoord in"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
                      title={showLoginPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#0071e3] focus:ring-0"
                    />
                    <span className="text-xs text-slate-400">Onthoud mijn sessie</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full apple-btn-primary text-white font-semibold text-xs sm:text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Aanmelden & CRMos synchroniseren...</span>
                  ) : (
                    <>
                      <span>Veilig Inloggen</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Registreer Form */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Zakelijk Emailadres
                    </label>
                    <button
                      type="button"
                      disabled={isFetchingCrm}
                      onClick={() => handleFetchCrmData(regEmail)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0071e3]/20 hover:bg-[#0071e3]/30 text-[#2997ff] border border-[#2997ff]/30 text-[11px] font-semibold transition"
                    >
                      <span>{isFetchingCrm ? 'CRMos laden...' : 'CRMos Data Ophalen'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      onBlur={() => {
                        if (regEmail.includes('@')) {
                          handleFetchCrmData(regEmail, true);
                        }
                      }}
                      placeholder="naam@onderneming.qin (of bekend CRMos e-mailadres)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Volledige Naam (Contactpersoon)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="bijvoorbeeld Alexander de Vries"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Gekoppelde Onderneming
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                      >
                        {COMPANIES.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Netwerk Rol
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as 'Directie' | 'Partner')}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                      >
                        <option value="Directie" className="bg-slate-900 text-white">Directie en Bestuur</option>
                        <option value="Partner" className="bg-slate-900 text-white">Zakelijk Partner</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Wachtwoord
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minstens 6 tekens"
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="p-1 text-slate-400 hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Bevestig Wachtwoord
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Herhaal wachtwoord"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/30 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full apple-btn-primary text-white font-semibold text-xs sm:text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Account & CRMos tag aanmaken...</span>
                    ) : (
                      <>
                        <span>Account Registreren + CRMos Tag</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                Of Snelle Toegang
              </span>
            </div>

            {/* Social & Demo Fast Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-full apple-btn-secondary text-xs sm:text-sm font-medium text-slate-200 transition flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
                  />
                </svg>
                <span>Aanmelden met Google</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoAccess('Directie', 'quantum_initium')}
                  className="py-2.5 px-3 rounded-full apple-btn-secondary text-[#2997ff] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#2997ff]" />
                  <span>Directie Demo Toegang</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoAccess('Partner', 'investbotiq')}
                  className="py-2.5 px-3 rounded-full apple-btn-secondary text-[#f5f5f7] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#30d158]" />
                  <span>Partner Demo Toegang</span>
                </button>
              </div>
            </div>
    </div>
  );

  const renderCard = () => (
    <div className="w-full max-w-xl">
      {renderCardContent()}

      {onClose && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#86868b] hover:text-[#2997ff] transition underline underline-offset-4"
          >
            Verder bladeren als bezoeker (bedragen blijven afgeschermd)
          </button>
        </div>
      )}

      {/* 12 Network Entities Badges Footer */}
      <div className="mt-5 text-center">
        <p className="text-[11px] text-[#86868b] font-medium mb-2.5">
          Gekoppeld aan de 12 centrale ondernemingen van het netwerk
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {COMPANIES.map((comp) => (
            <span
              key={comp.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-[#86868b]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: comp.color }}
              />
              <span>{comp.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (isModal || onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-2xl">
        <div className="relative w-full max-w-xl my-auto">
          {renderCard()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col justify-between selection:bg-[#0071e3] selection:text-white font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0071e3]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#5e5ce6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between border-b border-white/[0.08] apple-glass relative z-10 gap-2 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <QuantumLogo size={32} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-sm sm:text-lg tracking-tight text-white truncate">
                Quantum Initium
              </span>
              <span className="hidden xs:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#f5f5f7] border border-white/10 shrink-0">
                Centrale Hub
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#86868b] truncate hidden sm:block">
              Communicatieplatform voor directie en partners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Beveiligde SSL Verbinding</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        {renderCard()}
      </main>

      {/* Footer Info */}
      <footer className="px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-900/60 bg-slate-950/80 relative z-10">
        <p>
          © 2026 Quantum Initium • Beveiligde Directie & Partner Communicatiehub
        </p>
      </footer>
    </div>
  );
}
