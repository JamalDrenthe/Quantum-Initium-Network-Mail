import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mail, MailOpen, MessageSquare, Send, Star, Search, Plus, Check, CheckCheck,
  Shield, User, Building2, Inbox, Paperclip, ArrowLeft,
  Settings, ChevronRight, AlertCircle, Trash2, Lock,
  Copy, CheckCircle2, Layers, FileText, PanelLeftClose,
  PanelLeftOpen, Menu, Sparkles, Filter, RefreshCw, X, LogOut, Reply,
  Pin, PinOff, ExternalLink, Bookmark, SlidersHorizontal, Calendar, Archive
} from 'lucide-react';

import {
  auth,
  db,
  verifyFirestoreConnection,
  handleFirestoreError,
  OperationType
} from './firebase.ts';
import {
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

import { Company, NetworkEmail, NetworkChat, NetworkUser, PinnedTopic } from './types.ts';
import {
  COMPANIES,
  INITIAL_EMAILS_SEED,
  INITIAL_CHATS_SEED,
  SAMPLE_BUSINESS_EMAILS,
  INITIAL_PINNED_TOPICS_SEED
} from './constants.ts';
import { QuantumLogo } from './components/QuantumLogo.tsx';
import { AuthPage } from './components/AuthPage.tsx';

const DRAFT_STORAGE_KEY = 'qin_compose_draft';

interface ComposeDraft {
  composeCompany: string;
  composeRecipient: string;
  composeTargetAll: boolean;
  composeRecipientUser: string;
  composeSubject: string;
  composeBody: string;
  composePriority: 'Normaal' | 'Hoog';
  composeAttachment: string;
  replyingToEmailId?: string | null;
  updatedAt: number;
}

const getCompanyById = (id: string): Company => {
  return COMPANIES.find((c) => c.id === id) || COMPANIES[0];
};

const formatEmailTime = (ts?: number): string => {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('nl', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('nl', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

const formatFullDateTime = (ts?: number): string => {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    return date.toLocaleString('nl', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

const ALL_START_EMAILS: NetworkEmail[] = [
  ...INITIAL_EMAILS_SEED,
  ...SAMPLE_BUSINESS_EMAILS
].map((item, index) => ({
  ...item,
  id: `start_${index}`
}));

const ALL_START_CHATS: NetworkChat[] = INITIAL_CHATS_SEED.map((item, index) => ({
  ...item,
  id: `start_chat_${index}`
}));

interface SwipableEmailCardProps {
  email: NetworkEmail;
  comp: Company;
  read: boolean;
  isPinnedInChat: boolean;
  onOpen: (email: NetworkEmail) => void;
  onToggleRead: (email: NetworkEmail) => void;
  onArchive: (emailId: string) => void;
  onToggleStar: (e: React.MouseEvent, email: NetworkEmail) => void;
}

const SwipableEmailCard: React.FC<SwipableEmailCardProps> = ({
  email,
  comp,
  read,
  isPinnedInChat,
  onOpen,
  onToggleRead,
  onArchive,
  onToggleStar
}) => {
  const [offsetX, setOffsetX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const SWIPE_THRESHOLD = 75;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    const clamped = Math.max(-140, Math.min(140, diff));
    setOffsetX(clamped);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsSwiping(false);

    if (offsetX > SWIPE_THRESHOLD) {
      onToggleRead(email);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onArchive(email.id);
    }

    setOffsetX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    const clamped = Math.max(-140, Math.min(140, diff));
    setOffsetX(clamped);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsSwiping(false);

    const diff = currentXRef.current - startXRef.current;
    if (Math.abs(diff) < 6) {
      onOpen(email);
    } else if (offsetX > SWIPE_THRESHOLD) {
      onToggleRead(email);
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onArchive(email.id);
    }

    setOffsetX(0);
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsSwiping(false);

      if (offsetX > SWIPE_THRESHOLD) {
        onToggleRead(email);
      } else if (offsetX < -SWIPE_THRESHOLD) {
        onArchive(email.id);
      }

      setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden border-b border-slate-800/60 select-none touch-pan-y">
      {/* Background Revealed on Swipe Right: Toggle Read/Unread */}
      <div
        className={`absolute inset-y-0 left-0 flex items-center px-4 font-bold text-xs text-white transition-opacity ${
          offsetX > 15 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${Math.max(0, offsetX)}px`,
          backgroundColor: read ? '#0284c7' : '#059669'
        }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {read ? <Mail className="w-4 h-4 text-white shrink-0" /> : <CheckCheck className="w-4 h-4 text-white shrink-0" />}
          <span>{read ? 'Ongelezen' : 'Gelezen'}</span>
        </div>
      </div>

      {/* Background Revealed on Swipe Left: Archive */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-end px-4 font-bold text-xs text-white transition-opacity ${
          offsetX < -15 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${Math.max(0, -offsetX)}px`,
          backgroundColor: '#e11d48'
        }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Archive className="w-4 h-4 text-white shrink-0" />
          <span>Archiveren</span>
        </div>
      </div>

      {/* Card Content Wrapper */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`group px-3.5 py-3 sm:px-6 sm:py-3.5 cursor-pointer transition-colors ${
          isPinnedInChat ? 'border-l-2 border-l-amber-400' : ''
        } ${
          read
            ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/50'
            : 'bg-slate-900/90 text-slate-100 hover:bg-slate-800/90 shadow-sm'
        }`}
      >
        {/* Mobile View */}
        <div className="flex flex-col gap-1.5 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              {!read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border font-medium truncate"
                style={{
                  backgroundColor: `${comp.color}15`,
                  borderColor: `${comp.color}40`,
                  color: comp.color
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: comp.color }}
                />
                <span className="truncate">{comp.name}</span>
              </span>

              {email.priority === 'Hoog' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                  Urgent
                </span>
              )}

              {isPinnedInChat && (
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0"
                  title="Gepind in QI Chat"
                >
                  <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400/30" />
                  <span>Gepind</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] ${read ? 'text-slate-500' : 'text-amber-300 font-semibold'}`}>
                {formatEmailTime(email.timestamp)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(e, email);
                }}
                className="p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <Star
                  className={`w-4 h-4 ${
                    email.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <h4
              className={`text-sm leading-snug line-clamp-1 ${
                read ? 'font-medium text-slate-300' : 'font-bold text-white'
              }`}
            >
              {email.subject}
            </h4>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <p className="line-clamp-1 text-slate-400 text-[12px] flex-1">
              <span className="text-slate-300 font-medium mr-1.5">{email.senderName}:</span>
              {email.body?.replace(/\n/g, ' ')}
            </p>
            {email.attachment && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 shrink-0">
                <Paperclip className="w-3 h-3 text-slate-500" />
              </span>
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-3.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(e, email);
            }}
            className="p-1 rounded-lg hover:bg-slate-800 shrink-0 transition"
          >
            <Star
              className={`w-4 h-4 ${
                email.starred
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-700 group-hover:text-slate-500'
              }`}
            />
          </button>

          <span
            className={`w-2 h-2 rounded-full shrink-0 transition ${
              read ? 'bg-transparent' : 'bg-amber-400'
            }`}
          />

          <div className="w-44 shrink-0 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border truncate max-w-full font-medium"
              style={{
                backgroundColor: `${comp.color}15`,
                borderColor: `${comp.color}40`,
                color: comp.color
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: comp.color }}
              />
              <span className="truncate">{comp.name}</span>
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            {email.priority === 'Hoog' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                Prioriteit
              </span>
            )}
            {isPinnedInChat && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0 shadow-sm"
                title="Dit e-mail bericht is vastgepind in QI Chat"
              >
                <Pin className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                <span>Gepind in Chat</span>
              </span>
            )}
            <span
              className={`text-sm truncate ${
                read ? 'font-normal text-slate-300' : 'font-bold text-white'
              }`}
            >
              {email.subject}
            </span>
            <span className="hidden md:inline text-xs text-slate-500 truncate">
              • {email.body?.replace(/\n/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {email.attachment && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                <Paperclip className="w-3 h-3 text-slate-500" />
              </span>
            )}

            <span
              className={`text-xs whitespace-nowrap ${
                read ? 'text-slate-500' : 'text-amber-300 font-semibold'
              }`}
            >
              {formatEmailTime(email.timestamp)}
            </span>

            {/* Desktop Hover Quick Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead(email);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                title={read ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
              >
                {read ? <Mail className="w-3.5 h-3.5" /> : <CheckCheck className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(email.id);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                title="Archiveer e-mail"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [userUid, setUserUid] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('qin_user_uid');
      if (stored) return stored;
      const created = `lid.${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('qin_user_uid', created);
      return created;
    } catch {
      return 'lid.p1092';
    }
  });

  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('qin_user_name') || 'Netwerk Partner';
    } catch {
      return 'Netwerk Partner';
    }
  });

  const [userHandle, setUserHandle] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('qin_user_handle');
      if (stored) return stored;
    } catch {}
    return userUid.replace('lid.', 'partner.');
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('qin_user_email') || 'directie@quantuminitium.qin';
    } catch {
      return 'directie@quantuminitium.qin';
    }
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      const role = localStorage.getItem('qin_user_role');
      if (role) return role === 'Directie';
    } catch {}
    return true;
  });

  const [activeTab, setActiveTab] = useState<'mail' | 'chat' | 'split'>('mail');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isMobileChatChannelsOpen, setIsMobileChatChannelsOpen] = useState<boolean>(false);

  const [emails, setEmails] = useState<NetworkEmail[]>(ALL_START_EMAILS);
  const [chats, setChats] = useState<NetworkChat[]>(ALL_START_CHATS);
  const [directoryUsers, setDirectoryUsers] = useState<NetworkUser[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false);

  const [selectedFolder, setSelectedFolder] = useState<'all' | 'starred' | 'unread' | 'archived'>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [multiCompanySelection, setMultiCompanySelection] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);

  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeCompany, setComposeCompany] = useState<string>('quantum_initium');
  const [composeRecipient, setComposeRecipient] = useState<string>('Alle Netwerkpartners');
  const [composeTargetAll, setComposeTargetAll] = useState<boolean>(true);
  const [composeRecipientUser, setComposeRecipientUser] = useState<string>('ALL');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composePriority, setComposePriority] = useState<'Normaal' | 'Hoog'>('Normaal');
  const [composeAttachment, setComposeAttachment] = useState<string>('');
  const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
  const [replyingToEmail, setReplyingToEmail] = useState<NetworkEmail | null>(null);
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<number | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);

  const [activeChatChannel, setActiveChatChannel] = useState<string>('algemeen');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSearch, setChatSearch] = useState<string>('');
  const [linkedEmailForChat, setLinkedEmailForChat] = useState<NetworkEmail | null>(null);
  const [selectedEmailForChatAttachment, setSelectedEmailForChatAttachment] = useState<NetworkEmail | null>(null);
  const [isEmailAttachmentModalOpen, setIsEmailAttachmentModalOpen] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [pinnedTopics, setPinnedTopics] = useState<PinnedTopic[]>(INITIAL_PINNED_TOPICS_SEED);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [selectedEmailForPin, setSelectedEmailForPin] = useState<NetworkEmail | null>(null);
  const [pinSummaryInput, setPinSummaryInput] = useState<string>('');
  const [pinTargetChannel, setPinTargetChannel] = useState<string>('algemeen');

  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterAttachment, setFilterAttachment] = useState<'all' | 'with_attachment' | 'without_attachment'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'normal'>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  const [showAddressesModal, setShowAddressesModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.msg === msg ? null : prev));
    }, 4500);
  };

  const handleSuccessLogin = (userData: {
    uid: string;
    name: string;
    handle: string;
    email: string;
    role: string;
    companyId: string;
  }) => {
    setUserUid(userData.uid);
    setUserName(userData.name);
    setUserHandle(userData.handle);
    setUserEmail(userData.email);
    setIsAdminMode(userData.role === 'Directie');
    if (userData.companyId) {
      setSelectedCompanyFilter(userData.companyId);
    }
    setIsLoggedIn(true);
    try {
      localStorage.setItem('qin_logged_in', 'true');
      localStorage.setItem('qin_user_uid', userData.uid);
      localStorage.setItem('qin_user_name', userData.name);
      localStorage.setItem('qin_user_handle', userData.handle);
      localStorage.setItem('qin_user_email', userData.email);
      localStorage.setItem('qin_user_role', userData.role);
      localStorage.setItem('qin_user_company', userData.companyId || 'quantum_initium');
    } catch {}
    showToast(`Welkom ${userData.name}! Ingelogd als ${userData.role}.`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch {}
    try {
      localStorage.removeItem('qin_logged_in');
    } catch {}
    setIsLoggedIn(false);
    setShowProfileModal(false);
    setIsMobileDrawerOpen(false);
    showToast('Je bent uitgelogd. Welkom terug op de inlogpagina.');
  };

  useEffect(() => {
    let isMounted = true;

    const setupAuth = async () => {
      try {
        const windowCustomToken = (window as unknown as { __initial_auth_token?: string }).__initial_auth_token;
        if (windowCustomToken && !auth.currentUser) {
          await signInWithCustomToken(auth, windowCustomToken);
        }
      } catch {
        // Rustige fallback
      }
    };

    setupAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      if (currentUser) {
        setUserUid(currentUser.uid);
        const short = currentUser.uid.slice(0, 5).toLowerCase();
        setUserHandle(`partner.${short}`);
        setUserName(`QIN Partner ${short.toUpperCase()}`);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userDocRef = doc(db, 'users', userUid);
    setDoc(
      userDocRef,
      {
        uid: userUid,
        name: userName,
        handle: userHandle,
        role: isAdminMode ? 'Directie' : 'Partner',
        lastSeen: Date.now()
      },
      { merge: true }
    ).catch(() => {
      // Optionele registratie
    });

    const emailsColRef = collection(db, 'emails');
    const unsubEmails = onSnapshot(
      emailsColRef,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) as NetworkEmail[];

        fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setEmails(fetched);
        setIsLoadingData(false);
      },
      (err) => {
        console.warn('Firestore emails listener melding:', err);
        setIsLoadingData(false);
      }
    );

    const chatsColRef = collection(db, 'chats');
    const unsubChats = onSnapshot(
      chatsColRef,
      async (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) as NetworkChat[];

        if (fetched.length === 0) {
          try {
            for (const msg of INITIAL_CHATS_SEED) {
              await addDoc(chatsColRef, msg);
            }
          } catch {
            // Houd lokale chatset actief
          }
        } else {
          fetched.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          setChats(fetched);
        }
      },
      (err) => {
        console.warn('Firestore chats listener melding:', err);
      }
    );

    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(
      usersColRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          uid: d.id,
          ...d.data()
        })) as NetworkUser[];
        if (list.length > 0) setDirectoryUsers(list);
      },
      () => {
        // Rustig negeren
      }
    );

    const pinsColRef = collection(db, 'pinned_topics');
    const unsubPins = onSnapshot(
      pinsColRef,
      async (snapshot) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) as PinnedTopic[];

        if (fetched.length === 0) {
          try {
            for (const pin of INITIAL_PINNED_TOPICS_SEED) {
              await addDoc(pinsColRef, pin);
            }
          } catch {
            // Bewaar lokale seeds
          }
        } else {
          fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setPinnedTopics(fetched);
        }
      },
      (err) => {
        console.warn('Firestore pinned topics listener melding:', err);
      }
    );

    return () => {
      unsubEmails();
      unsubChats();
      unsubUsers();
      unsubPins();
    };
  }, [userUid, userName, userHandle, isAdminMode]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatChannel, activeTab]);

  // Auto-save compose draft to localStorage
  useEffect(() => {
    if (!isComposeOpen) return;

    if (composeSubject.trim() || composeBody.trim()) {
      const draft: ComposeDraft = {
        composeCompany,
        composeRecipient,
        composeTargetAll,
        composeRecipientUser,
        composeSubject,
        composeBody,
        composePriority,
        composeAttachment,
        replyingToEmailId: replyingToEmail?.id || null,
        updatedAt: Date.now()
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastDraftSavedAt(draft.updatedAt);
      } catch {
        // LocalStorage melding
      }
    } else {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setLastDraftSavedAt(null);
      } catch {
        // Ignore
      }
    }
  }, [
    isComposeOpen,
    composeCompany,
    composeRecipient,
    composeTargetAll,
    composeRecipientUser,
    composeSubject,
    composeBody,
    composePriority,
    composeAttachment,
    replyingToEmail
  ]);

  const isEmailRead = (email: NetworkEmail) => {
    return Array.isArray(email.readBy) && email.readBy.includes(userUid);
  };

  const visibleEmails = useMemo(() => {
    return emails;
  }, [emails]);

  const unreadCountsByCompany = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    COMPANIES.forEach((c) => {
      counts[c.id] = 0;
    });
    visibleEmails.forEach((e) => {
      if (!e.archived && !isEmailRead(e)) {
        counts.ALL += 1;
        if (counts[e.companyId] !== undefined) {
          counts[e.companyId] += 1;
        }
      }
    });
    return counts;
  }, [visibleEmails, userUid]);

  const hasActiveAdvancedFilters = useMemo(() => {
    return (
      !!filterStartDate ||
      !!filterEndDate ||
      filterAttachment !== 'all' ||
      filterPriority !== 'all'
    );
  }, [filterStartDate, filterEndDate, filterAttachment, filterPriority]);

  const handleResetAdvancedFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterAttachment('all');
    setFilterPriority('all');
    showToast('Geavanceerde filters gereset', 'success');
  };

  const filteredEmails = useMemo(() => {
    return visibleEmails.filter((email) => {
      if (selectedFolder === 'archived') {
        if (!email.archived) return false;
      } else {
        if (email.archived) return false;
      }

      if (selectedFolder === 'starred' && !email.starred) return false;
      if (selectedFolder === 'unread' && isEmailRead(email)) return false;

      if (selectedCompanyFilter !== 'ALL' && email.companyId !== selectedCompanyFilter) {
        return false;
      }

      if (
        multiCompanySelection.length > 0 &&
        !multiCompanySelection.includes(email.companyId)
      ) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const company = getCompanyById(email.companyId);
        const matchSubject = (email.subject || '').toLowerCase().includes(q);
        const matchBody = (email.body || '').toLowerCase().includes(q);
        const matchCompany = company.name.toLowerCase().includes(q);
        const matchSender = (email.senderEmail || '').toLowerCase().includes(q);
        if (!matchSubject && !matchBody && !matchCompany && !matchSender) return false;
      }

      // Advanced filters: Datumbereik
      if (filterStartDate) {
        const startTs = new Date(`${filterStartDate}T00:00:00`).getTime();
        if (email.timestamp < startTs) return false;
      }

      if (filterEndDate) {
        const endTs = new Date(`${filterEndDate}T23:59:59`).getTime();
        if (email.timestamp > endTs) return false;
      }

      // Advanced filters: Bijlage aanwezigheid
      if (filterAttachment === 'with_attachment' && !email.attachment) {
        return false;
      }
      if (filterAttachment === 'without_attachment' && !!email.attachment) {
        return false;
      }

      // Advanced filters: Prioriteit
      if (filterPriority === 'high' && email.priority !== 'Hoog') {
        return false;
      }
      if (filterPriority === 'normal' && email.priority === 'Hoog') {
        return false;
      }

      return true;
    });
  }, [
    visibleEmails,
    selectedFolder,
    selectedCompanyFilter,
    multiCompanySelection,
    searchQuery,
    filterStartDate,
    filterEndDate,
    filterAttachment,
    filterPriority,
    userUid
  ]);

  const activeEmail = useMemo(
    () => visibleEmails.find((e) => e.id === activeEmailId) || null,
    [visibleEmails, activeEmailId]
  );

  const handleOpenEmail = async (email: NetworkEmail) => {
    setActiveEmailId(email.id);
    if (!isEmailRead(email)) {
      const updatedReadBy = Array.isArray(email.readBy)
        ? [...new Set([...email.readBy, userUid])]
        : [userUid];

      setEmails((prev) =>
        prev.map((item) => (item.id === email.id ? { ...item, readBy: updatedReadBy } : item))
      );

      try {
        const emailRef = doc(db, 'emails', email.id);
        await updateDoc(emailRef, { readBy: updatedReadBy });
      } catch {
        // Lokaal reeds bijgewerkt
      }
    }
  };

  const handleToggleStar = async (e: React.MouseEvent, email: NetworkEmail) => {
    e.stopPropagation();
    const newStarred = !email.starred;
    setEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, starred: newStarred } : item))
    );

    try {
      const emailRef = doc(db, 'emails', email.id);
      await updateDoc(emailRef, { starred: newStarred });
    } catch {
      // Lokaal reeds bijgewerkt
    }
  };

  const handleToggleEmailReadStatus = async (email: NetworkEmail) => {
    const isCurrentlyRead = isEmailRead(email);
    const currentReadBy = Array.isArray(email.readBy) ? email.readBy : [];
    const updatedReadBy = isCurrentlyRead
      ? currentReadBy.filter((uid) => uid !== userUid)
      : [...new Set([...currentReadBy, userUid])];

    setEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, readBy: updatedReadBy } : item))
    );

    try {
      const emailRef = doc(db, 'emails', email.id);
      await updateDoc(emailRef, { readBy: updatedReadBy });
    } catch {
      // Lokaal reeds bijgewerkt
    }

    if (isCurrentlyRead) {
      showToast('Bericht gemarkeerd als ongelezen');
    } else {
      showToast('Bericht gemarkeerd als gelezen');
    }
  };

  const handleMarkAllRead = async () => {
    setEmails((prev) =>
      prev.map((item) => ({
        ...item,
        readBy: Array.isArray(item.readBy) ? [...new Set([...item.readBy, userUid])] : [userUid]
      }))
    );

    try {
      const unreadList = filteredEmails.filter((e) => !isEmailRead(e));
      for (const item of unreadList) {
        const emailRef = doc(db, 'emails', item.id);
        const updatedReadBy = Array.isArray(item.readBy)
          ? [...new Set([...item.readBy, userUid])]
          : [userUid];
        await updateDoc(emailRef, { readBy: updatedReadBy });
      }
    } catch {
      // Lokaal reeds aangepast
    }
    showToast('Alle getoonde berichten gemarkeerd als gelezen');
  };

  const handleArchiveEmail = async (emailId: string) => {
    const targetEmail = emails.find((e) => e.id === emailId);
    if (!targetEmail) return;

    const newArchivedStatus = !targetEmail.archived;

    setEmails((prev) =>
      prev.map((item) =>
        item.id === emailId ? { ...item, archived: newArchivedStatus } : item
      )
    );
    if (activeEmailId === emailId) setActiveEmailId(null);

    try {
      const emailRef = doc(db, 'emails', emailId);
      await updateDoc(emailRef, { archived: newArchivedStatus });
    } catch {
      // Lokaal gearchiveerd
    }

    if (newArchivedStatus) {
      showToast(`Bericht "${targetEmail.subject || 'E-mail'}" gearchiveerd!`, 'success');
    } else {
      showToast(`Bericht "${targetEmail.subject || 'E-mail'}" hersteld naar inbox!`, 'success');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!isAdminMode) {
      showToast('Alleen directie kan centrale emails verwijderen', 'error');
      return;
    }

    setEmails((prev) => prev.filter((item) => item.id !== emailId));
    if (activeEmailId === emailId) setActiveEmailId(null);

    try {
      const emailRef = doc(db, 'emails', emailId);
      await deleteDoc(emailRef);
    } catch {
      // Lokaal reeds verwijderd
    }
    showToast('Bericht succesvol verwijderd');
  };

  const handleDeleteAllEmails = async () => {
    setIsDeletingAll(true);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('qin_cleared_inbox');
      }
    } catch {
      // Schoon
    }

    setEmails([]);
    setActiveEmailId(null);

    try {
      const emailsColRef = collection(db, 'emails');
      const snap = await getDocs(emailsColRef);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
    } catch {
      // Afgerond
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllModal(false);
      showToast('Alle berichten succesvol gewist');
    }
  };

  const handleReceiveAllWelcomeEmails = async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('qin_cleared_inbox');
      }
    } catch {
      // Reset instelling
    }

    const now = Date.now();
    const freshWelcomes: NetworkEmail[] = INITIAL_EMAILS_SEED.map((seed, idx) => ({
      ...seed,
      id: `welcome_${now}_${idx}`,
      timestamp: now + idx * 10,
      readBy: [],
      recipientScope: 'ALL'
    }));

    setEmails((prev) => [...freshWelcomes, ...prev]);
    setSelectedCompanyFilter('ALL');
    setMultiCompanySelection([]);
    setSelectedFolder('all');
    setSearchQuery('');
    setActiveEmailId(null);
    setActiveTab('mail');

    try {
      const emailsColRef = collection(db, 'emails');
      await Promise.all(
        INITIAL_EMAILS_SEED.map((seed, idx) =>
          addDoc(emailsColRef, {
            ...seed,
            recipientScope: 'ALL',
            timestamp: now + idx * 10,
            readBy: []
          }).catch(() => {})
        )
      );
    } catch {
      // Lokale toevoeging blijft bewaard
    }
    showToast('Twaalf welkomstmails succesvol ontvangen op alle adressen');
  };

  const handleReceiveAllSampleEmails = async () => {
    setIsGeneratingSamples(true);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('qin_cleared_inbox');
      }
    } catch {
      // Reset instelling
    }
    const now = Date.now();

    const freshSamples: NetworkEmail[] = SAMPLE_BUSINESS_EMAILS.map((sample, idx) => ({
      ...sample,
      id: `sample_${now}_${idx}`,
      timestamp: now + idx * 10,
      readBy: [],
      recipientScope: 'ALL'
    }));

    setEmails((prev) => [...freshSamples, ...prev]);
    setSelectedCompanyFilter('ALL');
    setMultiCompanySelection([]);
    setSelectedFolder('all');
    setSearchQuery('');
    setActiveEmailId(null);
    setActiveTab('mail');

    try {
      const emailsColRef = collection(db, 'emails');
      await Promise.all(
        SAMPLE_BUSINESS_EMAILS.map((sample, idx) =>
          addDoc(emailsColRef, {
            ...sample,
            recipientScope: 'ALL',
            timestamp: now + idx * 10,
            readBy: []
          }).catch(() => {})
        )
      );
    } catch {
      // Lokale toevoeging blijft direct zichtbaar
    } finally {
      setIsGeneratingSamples(false);
      showToast('Twaalf voorbeeldmails succesvol ontvangen op alle adressen');
    }
  };

  const handleSendSingleSampleEmail = async (companyId: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('qin_cleared_inbox');
      }
    } catch {
      // Reset instelling
    }

    const comp = getCompanyById(companyId);
    const sample =
      SAMPLE_BUSINESS_EMAILS.find((s) => s.companyId === companyId) || SAMPLE_BUSINESS_EMAILS[0];
    const now = Date.now();

    const singleEmail: NetworkEmail = {
      ...sample,
      id: `sample_single_${now}`,
      timestamp: now,
      readBy: [],
      recipientScope: 'ALL'
    };

    setEmails((prev) => [singleEmail, ...prev]);
    setSelectedCompanyFilter(companyId);
    setMultiCompanySelection([]);
    setSelectedFolder('all');
    setSearchQuery('');
    setActiveEmailId(singleEmail.id);
    setActiveTab('mail');
    setShowAddressesModal(false);

    try {
      const emailsColRef = collection(db, 'emails');
      await addDoc(emailsColRef, {
        ...sample,
        recipientScope: 'ALL',
        timestamp: now,
        readBy: []
      });
    } catch {
      // Lokaal reeds toegevoegd
    }
    showToast(`Voorbeeldmail voor ${comp.name} ontvangen op ${userHandle}@${comp.domain}`);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Storage clearing
    }
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachment('');
    setComposeRecipient('Alle Netwerkpartners');
    setComposeTargetAll(true);
    setComposeRecipientUser('ALL');
    setReplyingToEmail(null);
    setLastDraftSavedAt(null);
    setIsDraftRestored(false);
    showToast('Concept gewist en velden leeggemaakt', 'success');
  };

  const handleOpenNewCompose = () => {
    let restored = false;
    try {
      const savedStr = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedStr) {
        const parsed: ComposeDraft = JSON.parse(savedStr);
        if (parsed.composeSubject?.trim() || parsed.composeBody?.trim()) {
          setComposeCompany(parsed.composeCompany || 'quantum_initium');
          setComposeRecipient(parsed.composeRecipient || 'Alle Netwerkpartners');
          setComposeTargetAll(parsed.composeTargetAll ?? true);
          setComposeRecipientUser(parsed.composeRecipientUser || 'ALL');
          setComposeSubject(parsed.composeSubject || '');
          setComposeBody(parsed.composeBody || '');
          setComposePriority(parsed.composePriority || 'Normaal');
          setComposeAttachment(parsed.composeAttachment || '');
          setLastDraftSavedAt(parsed.updatedAt || Date.now());
          setIsDraftRestored(true);
          restored = true;
        }
      }
    } catch {
      // Storage parse error
    }

    if (!restored) {
      setReplyingToEmail(null);
      setComposeRecipient('Alle Netwerkpartners');
      setComposeTargetAll(true);
      setComposeRecipientUser('ALL');
      setComposeSubject('');
      setComposeBody('');
      setComposeAttachment('');
      setComposePriority('Normaal');
      setIsDraftRestored(false);
    }

    setIsComposeOpen(true);
    if (restored) {
      showToast('Opgeslagen concept automatisch hersteld uit lokale opslag!', 'success');
    }
  };

  const handleReplyEmail = (email: NetworkEmail) => {
    setReplyingToEmail(email);
    setComposeCompany(email.companyId);
    setComposeRecipient(email.senderEmail || email.senderName);
    setComposeTargetAll(false);
    setComposeRecipientUser(email.senderEmail || 'ALL');
    const cleanSubject = email.subject.replace(/^(re:\s*)+/i, '').trim();
    setComposeSubject(`Re: ${cleanSubject}`);
    setComposePriority(email.priority || 'Normaal');
    setComposeBody('');
    setComposeAttachment('');
    setIsComposeOpen(true);
  };

  const handleSendAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminMode && !replyingToEmail) {
      showToast('Activeer directiemodus om nieuwe emails te publiceren', 'error');
      return;
    }
    if (!composeSubject.trim() || !composeBody.trim()) {
      showToast('Vul onderwerp en berichttekst in', 'error');
      return;
    }

    setIsSendingMail(true);
    const comp = getCompanyById(composeCompany);
    const now = Date.now();

    const recipientVal = composeRecipient.trim() || 'Alle Netwerkpartners';
    const isTargetAll = recipientVal.toLowerCase().includes('alle') || recipientVal === 'ALL';

    const senderDisplayName = isAdminMode ? `${comp.name} Directie` : `${userName} (${comp.name})`;
    const senderEmailAddress = isAdminMode ? `admin@${comp.domain}` : `${userHandle}@${comp.domain}`;

    const createdEmail: NetworkEmail = {
      id: `sent_${now}`,
      companyId: comp.id,
      subject: composeSubject.trim(),
      senderName: senderDisplayName,
      senderEmail: senderEmailAddress,
      recipientScope: isTargetAll ? 'ALL' : recipientVal,
      priority: composePriority,
      starred: composePriority === 'Hoog',
      readBy: [userUid],
      attachment: composeAttachment.trim(),
      body: composeBody.trim(),
      timestamp: now
    };

    setEmails((prev) => [createdEmail, ...prev]);

    try {
      const emailsColRef = collection(db, 'emails');
      await addDoc(emailsColRef, {
        companyId: comp.id,
        subject: composeSubject.trim(),
        senderName: senderDisplayName,
        senderEmail: senderEmailAddress,
        recipientScope: isTargetAll ? 'ALL' : recipientVal,
        priority: composePriority,
        starred: composePriority === 'Hoog',
        readBy: [userUid],
        attachment: composeAttachment.trim(),
        body: composeBody.trim(),
        timestamp: now
      });
    } catch {
      // Lokale toevoeging blijft bewaard
    } finally {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setLastDraftSavedAt(null);
        setIsDraftRestored(false);
      } catch {
        // Clear draft
      }
      const toastFeedback = replyingToEmail
        ? `Reactie succesvol verzonden naar ${recipientVal}`
        : `Email live gezet voor ${comp.name}`;
      setComposeSubject('');
      setComposeBody('');
      setComposeAttachment('');
      setComposeRecipient('Alle Netwerkpartners');
      setComposeTargetAll(true);
      setComposeRecipientUser('ALL');
      setReplyingToEmail(null);
      setIsComposeOpen(false);
      setIsSendingMail(false);
      showToast(toastFeedback);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedEmailForChatAttachment) return;

    const textToSend = chatInput.trim();
    setChatInput('');
    const now = Date.now();

    const companyIdForMsg =
      activeChatChannel === 'algemeen'
        ? linkedEmailForChat?.companyId || selectedEmailForChatAttachment?.companyId || 'quantum_initium'
        : activeChatChannel;

    const createdMsg: NetworkChat = {
      id: `chat_sent_${now}`,
      channelId: activeChatChannel,
      companyId: companyIdForMsg,
      senderId: userUid,
      senderName: isAdminMode ? 'QIN Directie' : userName,
      isAdmin: isAdminMode,
      text: textToSend,
      linkedEmailSubject: linkedEmailForChat ? linkedEmailForChat.subject : null,
      linkedEmailCompany: linkedEmailForChat ? linkedEmailForChat.companyId : null,
      attachedEmailId: selectedEmailForChatAttachment ? selectedEmailForChatAttachment.id : null,
      attachedEmailSubject: selectedEmailForChatAttachment ? selectedEmailForChatAttachment.subject : null,
      attachedAttachmentName: selectedEmailForChatAttachment?.attachment || null,
      timestamp: now,
      status: 'read'
    };

    setChats((prev) => [...prev, createdMsg]);

    try {
      const chatsColRef = collection(db, 'chats');
      await addDoc(chatsColRef, {
        channelId: activeChatChannel,
        companyId: companyIdForMsg,
        senderId: userUid,
        senderName: isAdminMode ? 'QIN Directie' : userName,
        isAdmin: isAdminMode,
        text: textToSend,
        linkedEmailSubject: linkedEmailForChat ? linkedEmailForChat.subject : null,
        linkedEmailCompany: linkedEmailForChat ? linkedEmailForChat.companyId : null,
        attachedEmailId: selectedEmailForChatAttachment ? selectedEmailForChatAttachment.id : null,
        attachedEmailSubject: selectedEmailForChatAttachment ? selectedEmailForChatAttachment.subject : null,
        attachedAttachmentName: selectedEmailForChatAttachment?.attachment || null,
        timestamp: now,
        status: 'read'
      });
    } catch {
      // Lokale toevoeging blijft bewaard
    } finally {
      setLinkedEmailForChat(null);
      setSelectedEmailForChatAttachment(null);
    }
  };

  const handleDiscussEmailInChat = (email: NetworkEmail) => {
    setLinkedEmailForChat(email);
    setActiveChatChannel(email.companyId);
    setActiveTab('chat');
  };

  const handleOpenPinModal = (email?: NetworkEmail) => {
    const targetEmail = email || activeEmail || emails[0];
    if (!targetEmail) {
      showToast('Geen e-mail beschikbaar om te pinnen.', 'error');
      return;
    }
    setSelectedEmailForPin(targetEmail);
    const excerpt = targetEmail.body.slice(0, 140).replace(/\n+/g, ' ').trim() + (targetEmail.body.length > 140 ? '...' : '');
    setPinSummaryInput(excerpt);
    setPinTargetChannel(targetEmail.companyId && targetEmail.companyId !== 'ALL' ? targetEmail.companyId : activeChatChannel);
    setIsPinModalOpen(true);
  };

  const handleSavePinTopic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedEmailForPin) return;

    const summary = pinSummaryInput.trim() || selectedEmailForPin.subject;
    const newPin: Omit<PinnedTopic, 'id'> = {
      channelId: pinTargetChannel,
      emailId: selectedEmailForPin.id,
      emailSubject: selectedEmailForPin.subject,
      companyId: selectedEmailForPin.companyId,
      summary,
      pinnedBy: userName || 'Netwerk Partner',
      timestamp: Date.now()
    };

    try {
      const pinsColRef = collection(db, 'pinned_topics');
      await addDoc(pinsColRef, newPin);
    } catch {
      setPinnedTopics((prev) => [
        { id: `pin-${Date.now()}`, ...newPin },
        ...prev
      ]);
    }

    try {
      const chatsColRef = collection(db, 'chats');
      const chatMsg: Omit<NetworkChat, 'id'> = {
        channelId: pinTargetChannel,
        companyId: selectedEmailForPin.companyId || 'quantum_initium',
        senderId: userUid || 'system',
        senderName: userName || 'QI Partner',
        isAdmin: isAdminMode,
        text: `📌 E-mail onderwerp vastgepind in dit kanaal: "${selectedEmailForPin.subject}"\nSamenvatting: ${summary}`,
        linkedEmailSubject: selectedEmailForPin.subject,
        linkedEmailCompany: selectedEmailForPin.companyId,
        timestamp: Date.now()
      };
      await addDoc(chatsColRef, chatMsg);
    } catch {
      // Chat melding
    }

    setIsPinModalOpen(false);
    setSelectedEmailForPin(null);
    showToast(`E-mail onderwerp "${selectedEmailForPin.subject}" gepind in QI Chat!`, 'success');
  };

  const handleUnpinTopic = async (pinId: string) => {
    try {
      const pinRef = doc(db, 'pinned_topics', pinId);
      await deleteDoc(pinRef);
    } catch {
      setPinnedTopics((prev) => prev.filter((p) => p.id !== pinId));
    }
    showToast('Gepind e-mail onderwerp losgemaakt van chatkanaal.', 'success');
  };

  const handleNavigateToPinnedEmail = (emailId: string, companyId: string, subject?: string) => {
    setSelectedCompanyFilter(companyId || 'ALL');
    let targetEmail = emails.find((e) => e.id === emailId);
    if (!targetEmail && subject) {
      targetEmail = emails.find((e) => e.subject.toLowerCase().trim() === subject.toLowerCase().trim());
    }
    if (targetEmail) {
      setActiveEmailId(targetEmail.id);
    } else {
      setActiveEmailId(null);
    }
    setActiveTab('mail');
    showToast('Gekoppeld e-mail bericht geopend!', 'success');
  };

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedAddress(text);
      showToast(`Adres gekopieerd: ${text}`);
      setTimeout(() => setCopiedAddress(null), 2500);
    } catch {
      // Kopieeractie
    }
    document.body.removeChild(textArea);
  };

  const toggleMultiCompanyChip = (companyId: string) => {
    setSelectedCompanyFilter('ALL');
    setMultiCompanySelection((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    );
  };

  const chatChannels = useMemo(() => {
    const base = [
      {
        id: 'algemeen',
        name: 'QIN Centraal en Directielijn',
        short: 'QIN',
        subtitle: 'Hoofdkanaal overkoepelend voor alle 12 bedrijven',
        color: '#6366f1'
      },
      ...COMPANIES.map((c) => ({
        id: c.id,
        name: c.name,
        short: c.short,
        subtitle: `Zakelijk kanaal op ${c.domain}`,
        color: c.color
      }))
    ];

    if (!chatSearch.trim()) return base;
    const q = chatSearch.toLowerCase();
    return base.filter(
      (ch) => ch.name.toLowerCase().includes(q) || ch.subtitle.toLowerCase().includes(q)
    );
  }, [chatSearch]);

  const activeChannelMessages = useMemo(() => {
    if (activeChatChannel === 'algemeen') {
      return chats;
    }
    return chats.filter(
      (m) => m.channelId === activeChatChannel || m.companyId === activeChatChannel
    );
  }, [chats, activeChatChannel]);

  if (!isLoggedIn) {
    return <AuthPage onSuccessLogin={handleSuccessLogin} />;
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden select-none">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border bg-slate-900/95 backdrop-blur-md text-slate-100 border-amber-500/30 transition-all duration-300">
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium text-slate-200">{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Navigation Bar: Executive Navy & Gold Theme */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsMobileDrawerOpen(true);
              } else {
                if (activeTab === 'chat') {
                  setIsChatSidebarCollapsed((prev) => !prev);
                } else {
                  setIsSidebarCollapsed((prev) => !prev);
                }
              }
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition shrink-0"
            title="Menu openen"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <QuantumLogo size={32} />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-base tracking-tight text-white font-['Plus_Jakarta_Sans'] truncate">
                  Quantum Initium
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Firebase Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Twaalf bedrijven communicatiehub
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('mail')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'mail'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>QI Mail</span>
            {unreadCountsByCompany.ALL > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'mail' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
              }`}>
                {unreadCountsByCompany.ALL}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>QI Chat</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'chat' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {chats.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'split'
                ? 'bg-indigo-500 text-white font-semibold shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Email en chat overzichtelijk naast elkaar"
          >
            <Layers className="w-4 h-4" />
            <span>Split View</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleReceiveAllSampleEmails}
            disabled={isGeneratingSamples}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition active:scale-95 shrink-0"
            title="Ontvang een live voorbeeldmail op alle twaalf zakelijke adressen"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isGeneratingSamples ? 'Bezig...' : 'Voorbeeldmail op Alle 12'}</span>
            <span className="md:hidden">{isGeneratingSamples ? '...' : 'Voorbeeld'}</span>
          </button>

          <button
            onClick={() => setShowAddressesModal(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/70 text-xs font-medium transition"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>12 Adressen</span>
          </button>

          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/60 shrink-0">
            <button
              onClick={() => {
                setIsAdminMode(true);
                showToast('Directiemodus actief: je kunt nieuwe emails verzenden namens alle twaalf bedrijven');
              }}
              className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-lg text-xs font-medium transition-all ${
                isAdminMode
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Directie</span>
            </button>
            <button
              onClick={() => {
                setIsAdminMode(false);
                showToast('Partnermodus actief: je bekijkt de berichten als ontvangende relatie');
              }}
              className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-lg text-xs font-medium transition-all ${
                !isAdminMode
                  ? 'bg-slate-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Partner</span>
            </button>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/70 flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
            title="Profiel en Firebase status"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Slideover Drawer for Postvakken & 12 Bedrijven */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <QuantumLogo size={28} />
                <div>
                  <h3 className="font-bold text-sm text-white">Quantum Initium</h3>
                  <p className="text-[10px] text-amber-300">12 Zakelijke Postvakken</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Actions */}
            <div className="p-3 border-b border-slate-800 space-y-2">
              {isAdminMode ? (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    handleOpenNewCompose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nieuw Bericht</span>
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Ontvangstmodus actief</span>
                </div>
              )}

              <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => {
                    setIsAdminMode(true);
                    showToast('Directiemodus actief');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    isAdminMode ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Directie</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    showToast('Partnermodus actief');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    !isAdminMode ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Partner</span>
                </button>
              </div>
            </div>

            {/* Folders */}
            <div className="p-3 space-y-1 border-b border-slate-800">
              <button
                onClick={() => {
                  setSelectedFolder('all');
                  setSelectedCompanyFilter('ALL');
                  setMultiCompanySelection([]);
                  setActiveEmailId(null);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  selectedFolder === 'all' && selectedCompanyFilter === 'ALL' && multiCompanySelection.length === 0
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-400" />
                  <span>Alle Postvakken</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {unreadCountsByCompany.ALL > 0 ? `${unreadCountsByCompany.ALL} nieuw` : visibleEmails.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedFolder('unread');
                  setActiveEmailId(null);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  selectedFolder === 'unread'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Ongelezen</span>
                </div>
                {unreadCountsByCompany.ALL > 0 && (
                  <span className="text-[11px] font-bold text-amber-400">
                    {unreadCountsByCompany.ALL}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedFolder('starred');
                  setActiveEmailId(null);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  selectedFolder === 'starred'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Gemarkeerd</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {visibleEmails.filter((e) => !e.archived && e.starred).length}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedFolder('archived');
                  setActiveEmailId(null);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  selectedFolder === 'archived'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-slate-400" />
                  <span>Archief</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {visibleEmails.filter((e) => e.archived).length}
                </span>
              </button>
            </div>

            {/* 12 Companies List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Twaalf Bedrijven
                </span>
                {(selectedCompanyFilter !== 'ALL' || multiCompanySelection.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCompanyFilter('ALL');
                      setMultiCompanySelection([]);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    Herstel
                  </button>
                )}
              </div>

              {COMPANIES.map((company) => {
                const isSelected = selectedCompanyFilter === company.id;
                const unread = unreadCountsByCompany[company.id] || 0;
                const total = visibleEmails.filter((e) => e.companyId === company.id).length;

                return (
                  <button
                    key={company.id}
                    onClick={() => {
                      setMultiCompanySelection([]);
                      setSelectedCompanyFilter(company.id);
                      setActiveEmailId(null);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition ${
                      isSelected
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: company.color }}
                      />
                      <span className="truncate">{company.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {unread > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {unread}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">{total || ''}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-900/80">
              <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 pl-1">Rol:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsAdminMode(true);
                      showToast('Directiemodus actief');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      isAdminMode
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Directie</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminMode(false);
                      showToast('Partnermodus actief');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      !isAdminMode
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Partner</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setShowAddressesModal(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>12 Adressen</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setShowDeleteAllModal(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-rose-400"
                  title="Alles wissen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-300 hover:text-rose-300 text-xs font-semibold"
                  title="Uitloggen"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Uitloggen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* ==================== Q MAIL SECTION ==================== */}
        {(activeTab === 'mail' || activeTab === 'split') && (
          <div
            className={`flex-1 flex overflow-hidden bg-slate-900 ${
              activeTab === 'split' ? 'border-r border-slate-800' : ''
            }`}
          >
            {/* Sidebar with Navigation and 12 Companies */}
            <aside
              className={`hidden md:flex ${
                isSidebarCollapsed ? 'w-14 sm:w-16' : 'w-60 sm:w-68'
              } bg-slate-950 border-r border-slate-800/80 flex-col shrink-0 overflow-hidden transition-all duration-300`}
            >
              <div className={`${isSidebarCollapsed ? 'p-2' : 'p-3.5 pb-2'} flex flex-col gap-2`}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Postvakken
                    </span>
                  )}
                  <button
                    onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    title="Menu inklappen"
                  >
                    {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </button>
                </div>

                {isAdminMode ? (
                  <button
                    onClick={handleOpenNewCompose}
                    className={`w-full flex items-center justify-center gap-2 ${
                      isSidebarCollapsed ? 'p-2' : 'py-2 px-3'
                    } rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95`}
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Nieuw Bericht</span>}
                  </button>
                ) : (
                  <div
                    className={`${
                      isSidebarCollapsed ? 'p-2 justify-center' : 'p-2'
                    } rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2`}
                  >
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Ontvangstmodus actief</span>}
                  </div>
                )}
              </div>

              {/* Standard Folders */}
              <div className={`${isSidebarCollapsed ? 'px-1.5' : 'px-3'} space-y-1`}>
                <button
                  onClick={() => {
                    setSelectedFolder('all');
                    setSelectedCompanyFilter('ALL');
                    setMultiCompanySelection([]);
                    setActiveEmailId(null);
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
                  } rounded-xl text-xs sm:text-[13px] transition ${
                    selectedFolder === 'all' && selectedCompanyFilter === 'ALL' && multiCompanySelection.length === 0
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-amber-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Alle Postvakken</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                      {unreadCountsByCompany.ALL > 0 ? `${unreadCountsByCompany.ALL} nieuw` : visibleEmails.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedFolder('unread');
                    setActiveEmailId(null);
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
                  } rounded-xl text-xs sm:text-[13px] transition ${
                    selectedFolder === 'unread'
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Ongelezen</span>}
                  </div>
                  {!isSidebarCollapsed && unreadCountsByCompany.ALL > 0 && (
                    <span className="text-[11px] font-bold text-amber-400">
                      {unreadCountsByCompany.ALL}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedFolder('starred');
                    setActiveEmailId(null);
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
                  } rounded-xl text-xs sm:text-[13px] transition ${
                    selectedFolder === 'starred'
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                  title="Gemarkeerd"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Gemarkeerd</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[11px] text-slate-500">
                      {visibleEmails.filter((e) => !e.archived && e.starred).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedFolder('archived');
                    setActiveEmailId(null);
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-1.5'
                  } rounded-xl text-xs sm:text-[13px] transition ${
                    selectedFolder === 'archived'
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                  title="Archief"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-slate-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Archief</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[11px] text-slate-500">
                      {visibleEmails.filter((e) => e.archived).length}
                    </span>
                  )}
                </button>
              </div>

              <div className="my-2 mx-3 border-t border-slate-800" />

              {/* 12 Companies Filter List */}
              {!isSidebarCollapsed ? (
                <div className="px-4 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Twaalf Bedrijven
                  </span>
                  {(selectedCompanyFilter !== 'ALL' || multiCompanySelection.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedCompanyFilter('ALL');
                        setMultiCompanySelection([]);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300"
                    >
                      Herstel
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-1 text-center">
                  <span className="text-[9px] font-bold text-slate-500">12 HUB</span>
                </div>
              )}

              <div className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'px-1 space-y-1' : 'px-3 space-y-0.5'} pb-4`}>
                {COMPANIES.map((company) => {
                  const isSelected =
                    selectedCompanyFilter === company.id ||
                    multiCompanySelection.includes(company.id);
                  const unread = unreadCountsByCompany[company.id] || 0;
                  const total = visibleEmails.filter((e) => e.companyId === company.id).length;

                  return (
                    <button
                      key={company.id}
                      onClick={() => {
                        setMultiCompanySelection([]);
                        setSelectedCompanyFilter(
                          selectedCompanyFilter === company.id ? 'ALL' : company.id
                        );
                        setActiveEmailId(null);
                      }}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? 'justify-center py-1.5' : 'justify-between px-2.5 py-1.5'
                      } rounded-xl text-left text-xs transition ${
                        isSelected
                          ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                      }`}
                    >
                      {isSidebarCollapsed ? (
                        <div className="relative">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: company.color }}
                          >
                            {company.short}
                          </span>
                          {unread > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950" />
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: company.color }}
                            />
                            <span className="truncate">{company.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {unread > 0 ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {unread}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">{total || ''}</span>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Partner Card & Logout */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 space-y-1.5">
                <button
                  onClick={() => setShowAddressesModal(true)}
                  className={`w-full ${
                    isSidebarCollapsed ? 'p-1.5 justify-center' : 'p-2 justify-between'
                  } rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center text-left`}
                  title="12 gekoppelde adressen"
                >
                  {isSidebarCollapsed ? (
                    <Building2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          12 gekoppelde adressen
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className={`w-full ${
                    isSidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-2 justify-between'
                  } rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-semibold transition flex items-center`}
                  title="Veilig uitloggen"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    {!isSidebarCollapsed && <span>Uitloggen</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] text-slate-500 font-normal">Sessie sluiten</span>
                  )}
                </button>
              </div>
            </aside>

            {/* Email Main Panel */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
              <div className="p-2.5 sm:px-6 sm:py-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Zoek in alle twaalf postvakken..."
                      className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-slate-950 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:border-amber-500 focus:outline-none transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 border ${
                      hasActiveAdvancedFilters
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title="Open geavanceerde e-mail filters (datumbereik, bijlagen)"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Advanced Filter</span>
                    <span className="sm:hidden">Filter</span>
                    {hasActiveAdvancedFilters && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    )}
                  </button>

                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition shrink-0"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Alles Gelezen</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-medium transition shrink-0"
                    title="Verwijder alle berichten uit de postvakken"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Alles Wissen</span>
                    <span className="sm:hidden">Wissen</span>
                  </button>
                </div>

                {hasActiveAdvancedFilters && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                      Actieve Filters:
                    </span>

                    {(filterStartDate || filterEndDate) && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>
                          {filterStartDate ? filterStartDate : 'Begin'} t/m {filterEndDate ? filterEndDate : 'Heden'}
                        </span>
                        <button
                          onClick={() => {
                            setFilterStartDate('');
                            setFilterEndDate('');
                          }}
                          className="hover:text-white ml-0.5"
                          title="Datumfilter wissen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {filterAttachment !== 'all' && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-medium flex items-center gap-1.5">
                        <Paperclip className="w-3 h-3 text-amber-400" />
                        <span>
                          {filterAttachment === 'with_attachment' ? 'Met bijlagen' : 'Zonder bijlagen'}
                        </span>
                        <button
                          onClick={() => setFilterAttachment('all')}
                          className="hover:text-white ml-0.5"
                          title="Bijlagefilter wissen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {filterPriority !== 'all' && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-medium flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>
                          {filterPriority === 'high' ? 'Hoge Prioriteit' : 'Normale Prioriteit'}
                        </span>
                        <button
                          onClick={() => setFilterPriority('all')}
                          className="hover:text-white ml-0.5"
                          title="Prioriteitsfilter wissen"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    <button
                      onClick={handleResetAdvancedFilters}
                      className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition"
                    >
                      Wis Alle Filters
                    </button>
                  </div>
                )}

                {/* Company Filter Badges */}
                <div
                  onWheel={(e) => {
                    if (e.deltaY !== 0) {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }
                  }}
                  className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
                >
                  <button
                    onClick={() => {
                      setSelectedCompanyFilter('ALL');
                      setMultiCompanySelection([]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition ${
                      selectedCompanyFilter === 'ALL' && multiCompanySelection.length === 0
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Alle Twaalf ({visibleEmails.length})
                  </button>
                  {COMPANIES.map((c) => {
                    const active =
                      selectedCompanyFilter === c.id || multiCompanySelection.includes(c.id);
                    const unread = unreadCountsByCompany[c.id] || 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleMultiCompanyChip(c.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition ${
                          active
                            ? 'bg-slate-800 text-white border-amber-400 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="truncate">{c.name}</span>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeEmail ? (
                /* Detail Email Reading View */
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-8 bg-slate-950">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between pb-3 mb-4 sm:mb-6 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveEmailId(null)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm active:scale-95"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Terug naar Postvak</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleStar(e, activeEmail)}
                          className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 transition"
                          title="Gemarkeerd"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              activeEmail.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => handleToggleEmailReadStatus(activeEmail)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 ${
                            isEmailRead(activeEmail)
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                              : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                          }`}
                          title={isEmailRead(activeEmail) ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
                          aria-label={isEmailRead(activeEmail) ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
                        >
                          {isEmailRead(activeEmail) ? (
                            <>
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="hidden sm:inline">Markeer Ongelezen</span>
                            </>
                          ) : (
                            <>
                              <MailOpen className="w-4 h-4 text-amber-400" />
                              <span className="hidden sm:inline">Markeer Gelezen</span>
                            </>
                          )}
                        </button>

                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteEmail(activeEmail.id)}
                            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition"
                            title="Verwijder bericht"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReplyEmail(activeEmail)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-md active:scale-95"
                          title="Beantwoord dit bericht"
                          aria-label="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>

                        <button
                          onClick={() => handleDiscussEmailInChat(activeEmail)}
                          className="flex items-center gap-2 px-3 py-2 sm:px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Bespreek in QI Chat</span>
                          <span className="sm:hidden">Chat</span>
                        </button>

                        <button
                          onClick={() => handleOpenPinModal(activeEmail)}
                          className="flex items-center gap-2 px-3 py-2 sm:px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition shadow-md active:scale-95"
                          title="Pin samenvatting in QI Chat"
                          aria-label="Pin in Chat"
                        >
                          <Pin className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Pin in Chat</span>
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const comp = getCompanyById(activeEmail.companyId);
                      const isWelcome = activeEmail.subject.toLowerCase().includes('welkom');
                      const isSample = activeEmail.subject.toLowerCase().includes('voorbeeld');

                      return (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-8 shadow-xl">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border"
                              style={{
                                backgroundColor: `${comp.color}20`,
                                borderColor: `${comp.color}50`,
                                color: comp.color
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: comp.color }}
                              />
                              {comp.name}
                            </span>

                            {isSample && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Zakelijke Voorbeeldmail</span>
                              </span>
                            )}

                            {isWelcome && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Officieel Welkomstbericht</span>
                              </span>
                            )}

                            {activeEmail.priority === 'Hoog' && (
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Hoge Prioriteit
                              </span>
                            )}

                            <button
                              onClick={() => handleToggleEmailReadStatus(activeEmail)}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 transition active:scale-95 ${
                                isEmailRead(activeEmail)
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                              }`}
                              title={isEmailRead(activeEmail) ? 'Klik om te markeren als ongelezen' : 'Klik om te markeren als gelezen'}
                            >
                              {isEmailRead(activeEmail) ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Gelezen</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                  <span>Ongelezen</span>
                                </>
                              )}
                            </button>
                          </div>

                          <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6 leading-snug">
                            {activeEmail.subject}
                          </h2>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 sm:mb-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md"
                                style={{ backgroundColor: comp.color }}
                              >
                                {comp.short}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-xs sm:text-sm text-slate-200">
                                    {activeEmail.senderName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    &lt;{activeEmail.senderEmail}&gt;
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Ontvanger: <span className="font-mono text-amber-300">{userHandle}@{comp.domain}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 shrink-0">
                              {formatFullDateTime(activeEmail.timestamp)}
                            </div>
                          </div>

                          {activeEmail.attachment && (
                            <div className="mb-4 sm:mb-6 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between max-w-md">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-200 truncate">
                                    {activeEmail.attachment}
                                  </p>
                                  <p className="text-[11px] text-slate-500">Document in archief</p>
                                </div>
                              </div>
                              <button
                                onClick={() => showToast(`Bijlage geopend: ${activeEmail.attachment}`)}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition shrink-0"
                              >
                                Openen
                              </button>
                            </div>
                          )}

                          <div className="text-slate-300 text-xs sm:text-[15px] leading-relaxed whitespace-pre-line">
                            {activeEmail.body}
                          </div>

                          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="text-xs text-slate-400">
                              <p className="font-semibold text-slate-300">
                                Direct reageren op dit dossier van {comp.name}?
                              </p>
                              <p className="text-slate-500 mt-0.5">
                                Beantwoord per email of wissel van gedachten via het interne chatkanaal.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleToggleEmailReadStatus(activeEmail)}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition active:scale-95 ${
                                  isEmailRead(activeEmail)
                                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                    : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                                }`}
                                title={isEmailRead(activeEmail) ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
                                aria-label="Status wisselen"
                              >
                                {isEmailRead(activeEmail) ? (
                                  <>
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Markeer Ongelezen</span>
                                  </>
                                ) : (
                                  <>
                                    <MailOpen className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Markeer Gelezen</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleReplyEmail(activeEmail)}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition shadow-sm active:scale-95"
                                title="Beantwoord dit bericht"
                                aria-label="Reply"
                              >
                                <Reply className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </button>
                              <button
                                onClick={() => handleDiscussEmailInChat(activeEmail)}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                                <span>Reageer in kanaal {comp.short}</span>
                              </button>
                              <button
                                onClick={() => handleOpenPinModal(activeEmail)}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition"
                                title="Pin samenvatting in QI Chat"
                              >
                                <Pin className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pin in Chat</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                /* Inbox Emails List */
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
                  {filteredEmails.length === 0 ? (
                    <div className="p-8 sm:p-14 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-3">
                        <Inbox className="w-5 h-5 text-slate-500" />
                      </div>
                      <p className="text-slate-300 font-bold text-sm sm:text-base">Geen berichten in de postvakken</p>
                      <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto">
                        De inbox is momenteel leeg. Je kunt op elk moment nieuwe welkomstberichten of voorbeeldmails laten bezorgen.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                        <button
                          onClick={handleReceiveAllWelcomeEmails}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Ontvang 12 Welkomstmails</span>
                        </button>
                        <button
                          onClick={handleReceiveAllSampleEmails}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Ontvang 12 Voorbeeldmails</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {filteredEmails.map((email) => {
                        const comp = getCompanyById(email.companyId);
                        const read = isEmailRead(email);
                        const isPinnedInChat = pinnedTopics.some(
                          (p) =>
                            p.emailId === email.id ||
                            p.emailSubject.toLowerCase().trim() === email.subject.toLowerCase().trim()
                        );

                        return (
                          <SwipableEmailCard
                            key={email.id}
                            email={email}
                            comp={comp}
                            read={read}
                            isPinnedInChat={isPinnedInChat}
                            onOpen={handleOpenEmail}
                            onToggleRead={handleToggleEmailReadStatus}
                            onArchive={handleArchiveEmail}
                            onToggleStar={handleToggleStar}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* ==================== Q CHAT SECTION ==================== */}
        {(activeTab === 'chat' || activeTab === 'split') && (
          <div
            className={`${
              activeTab === 'split' ? 'w-[440px] 2xl:w-[500px]' : 'flex-1'
            } flex overflow-hidden bg-slate-950`}
          >
            {/* Chat Channels Sidebar */}
            <aside
              className={`hidden md:flex ${
                isChatSidebarCollapsed ? 'w-14 sm:w-16' : activeTab === 'split' ? 'w-48' : 'w-64 sm:w-72 lg:w-80'
              } bg-slate-950 border-r border-slate-800 flex-col shrink-0 transition-all duration-300`}
            >
              <div
                className={`h-14 ${
                  isChatSidebarCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
                } bg-slate-900 border-b border-slate-800 flex items-center`}
              >
                {!isChatSidebarCollapsed && (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                      QC
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      Kanalen
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsChatSidebarCollapsed((prev) => !prev)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Kanalen inklappen"
                  >
                    {isChatSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isChatSidebarCollapsed && (
                <div className="p-2.5 bg-slate-950 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      placeholder="Zoek kanaal..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                {chatChannels.map((ch) => {
                  const isSelected = activeChatChannel === ch.id;
                  const channelMsgs =
                    ch.id === 'algemeen'
                      ? chats
                      : chats.filter((m) => m.channelId === ch.id || m.companyId === ch.id);
                  const lastMsg = channelMsgs[channelMsgs.length - 1];

                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChatChannel(ch.id)}
                      className={`w-full ${
                        isChatSidebarCollapsed ? 'py-2.5 px-1.5 justify-center' : 'px-3.5 py-3'
                      } flex items-center gap-3 text-left transition ${
                        isSelected ? 'bg-slate-900 border-l-2 border-emerald-400' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                        style={{ backgroundColor: ch.color }}
                      >
                        {ch.short}
                      </div>

                      {!isChatSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs sm:text-[13px] truncate ${
                                isSelected ? 'font-bold text-white' : 'font-medium text-slate-300'
                              }`}
                            >
                              {ch.name}
                            </p>
                            {lastMsg && (
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {formatEmailTime(lastMsg.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : ch.subtitle}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Chat Sidebar Bottom Logout */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800/80">
                <button
                  onClick={handleLogout}
                  className={`w-full ${
                    isChatSidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-2 justify-between'
                  } rounded-xl bg-slate-900/90 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-semibold transition flex items-center`}
                  title="Veilig uitloggen"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    {!isChatSidebarCollapsed && <span>Uitloggen</span>}
                  </div>
                  {!isChatSidebarCollapsed && (
                    <span className="text-[10px] text-slate-500 font-normal">Sessie sluiten</span>
                  )}
                </button>
              </div>
            </aside>

            {/* Conversation Feed */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
              {(() => {
                const currentComp =
                  activeChatChannel === 'algemeen'
                    ? {
                        name: 'QIN Centraal en Directielijn',
                        short: 'QIN',
                        domain: 'quantuminitium.qin',
                        color: '#10b981'
                      }
                    : getCompanyById(activeChatChannel);

                return (
                  <div className="h-14 px-3 sm:px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: currentComp.color }}
                      >
                        {currentComp.short}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                          {currentComp.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          Realtime kanaal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setIsMobileChatChannelsOpen(true)}
                        className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Kanalen</span>
                      </button>

                      {activeChatChannel !== 'algemeen' && (
                        <button
                          onClick={() => {
                            setSelectedCompanyFilter(activeChatChannel);
                            setActiveEmailId(null);
                            if (activeTab === 'chat') setActiveTab('mail');
                          }}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition shrink-0"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Emails</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Pinned Email Topics Banner */}
              {(() => {
                const channelPins = pinnedTopics.filter(
                  (p) => p.channelId === activeChatChannel || (activeChatChannel === 'algemeen' && p.channelId === 'algemeen')
                );

                return (
                  <div className="bg-slate-950/95 border-b border-amber-500/20 px-3 py-2.5 sm:px-5 flex flex-col gap-2 shrink-0 z-10 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
                        <span>Gepinde E-mail Onderwerpen ({channelPins.length})</span>
                      </div>
                      <button
                        onClick={() => handleOpenPinModal()}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1 transition active:scale-95"
                        title="Pin een e-mail samenvatting in dit kanaal"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span>E-mail Pinnen</span>
                      </button>
                    </div>

                    {channelPins.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {channelPins.map((pin) => {
                          const pinComp = getCompanyById(pin.companyId);
                          return (
                            <div
                              key={pin.id}
                              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition flex items-center justify-between gap-3 text-xs shadow-sm"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0"
                                    style={{
                                      backgroundColor: `${pinComp.color}20`,
                                      color: pinComp.color
                                    }}
                                  >
                                    {pinComp.short}
                                  </span>
                                  <p className="font-bold text-slate-100 truncate">
                                    {pin.emailSubject}
                                  </p>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                                  "{pin.summary}"
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() =>
                                    handleNavigateToPinnedEmail(pin.emailId, pin.companyId, pin.emailSubject)
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shadow-sm active:scale-95"
                                  title="Open gekoppelde e-mail"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="hidden sm:inline">Bekijk E-mail</span>
                                  <span className="sm:hidden">Bekijk</span>
                                </button>
                                <button
                                  onClick={() => handleUnpinTopic(pin.id)}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition"
                                  title="Gepind onderwerp losmaken"
                                >
                                  <PinOff className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Er zijn nog geen e-mail onderwerpen vastgepind in dit kanaal. Klik op "E-mail Pinnen" om een korte samenvatting te pinnen.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 bg-gradient-to-b from-slate-950 to-slate-900">
                <div className="max-w-md mx-auto mb-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] text-center shadow-sm">
                  Beveiligde zakelijke communicatie via <strong className="text-amber-300">Quantum Initium Network</strong> en Google Firebase.
                </div>

                {activeChannelMessages.map((msg) => {
                  const isMe = msg.senderId === userUid;
                  const msgComp = getCompanyById(msg.companyId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md border ${
                          isMe
                            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100'
                            : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: msgComp.color }}
                          >
                            {msg.senderName}
                          </span>
                          {msg.isAdmin && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider">
                              Directie
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {msgComp.name}
                          </span>
                        </div>

                        {msg.linkedEmailSubject && (
                          <div className="mb-2 p-2 rounded-lg bg-slate-950/70 border-l-2 border-amber-400 text-xs flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-medium text-amber-400">
                                Betreft email:
                              </p>
                              <p className="font-semibold text-slate-200 truncate">
                                {msg.linkedEmailSubject}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const matched = emails.find((e) => e.subject === msg.linkedEmailSubject);
                                handleOpenPinModal(matched || {
                                  id: `custom-${Date.now()}`,
                                  subject: msg.linkedEmailSubject || 'E-mail onderwerp',
                                  companyId: msg.linkedEmailCompany || activeChatChannel,
                                  body: msg.text,
                                  senderName: msg.senderName,
                                  senderEmail: 'partner@qin',
                                  recipientScope: 'ALL',
                                  priority: 'Normaal',
                                  readBy: [],
                                  timestamp: msg.timestamp
                                });
                              }}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition"
                              title="Pin dit e-mail onderwerp bovenaan in het chatvenster"
                            >
                              <Pin className="w-3 h-3 text-amber-400" />
                              <span>Pin</span>
                            </button>
                          </div>
                        )}

                        {msg.attachedEmailSubject && (
                          <div className="mb-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                                <Paperclip className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-amber-400">
                                  {msg.attachedAttachmentName ? `Bijlage: ${msg.attachedAttachmentName}` : 'Bijgevoegd archiefdocument'}
                                </p>
                                <p className="font-semibold text-slate-200 truncate text-[11px]">
                                  {msg.attachedEmailSubject}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const matched = emails.find((e) => e.id === msg.attachedEmailId || e.subject === msg.attachedEmailSubject);
                                if (matched) {
                                  handleOpenEmail(matched);
                                } else {
                                  showToast('Gekoppeld archiefdocument geopend', 'success');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium shrink-0 transition"
                            >
                              Bekijk
                            </button>
                          </div>
                        )}

                        <p className="text-xs sm:text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-slate-500">
                            {formatEmailTime(msg.timestamp)}
                          </span>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {linkedEmailForChat && (
                <div className="px-3 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 text-amber-300">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Gekoppeld bericht: <strong>{linkedEmailForChat.subject}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setLinkedEmailForChat(null)}
                    className="text-slate-400 hover:text-white ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {selectedEmailForChatAttachment && (
                <div className="px-3 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 text-amber-300">
                    <Paperclip className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Bijgevoegd e-mailbestand: <strong>{selectedEmailForChatAttachment.subject}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEmailForChatAttachment(null)}
                    className="text-slate-400 hover:text-white ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendChatMessage}
                className="p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setIsEmailAttachmentModalOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0 transition"
                  title="Voeg e-mail of document toe vanuit archief"
                  aria-label="Bijvoegen uit archief"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Schrijf in ${
                    activeChatChannel === 'algemeen'
                      ? 'QIN Centraal'
                      : getCompanyById(activeChatChannel).name
                  }...`}
                  className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-slate-900 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg px-2 py-1 flex items-center justify-around shrink-0 z-30">
        <button
          onClick={() => {
            setActiveTab('mail');
            setIsMobileDrawerOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-slate-400 hover:text-white"
        >
          <div className="relative">
            <Inbox className="w-5 h-5 text-amber-400" />
            {unreadCountsByCompany.ALL > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950">
                {unreadCountsByCompany.ALL}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-300">Postvakken</span>
        </button>

        <button
          onClick={() => setShowAddressesModal(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-slate-400 hover:text-white"
        >
          <Building2 className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-medium text-slate-300">12 Adressen</span>
        </button>

        <button
          onClick={() => setActiveTab('mail')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'mail' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px] font-medium">QI Mail</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'chat' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950">
              {chats.length}
            </span>
          </div>
          <span className="text-[10px] font-medium">QI Chat</span>
        </button>

        <button
          onClick={handleReceiveAllSampleEmails}
          disabled={isGeneratingSamples}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-amber-300 active:scale-95"
          title="Ontvang voorbeeldmail"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">Voorbeeld</span>
        </button>
      </nav>

      {/* Mobile Drawer for Chat Channels */}
      {isMobileChatChannelsOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileChatChannelsOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  QC
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">QI Chat Kanalen</h3>
                  <p className="text-[10px] text-emerald-400">Twaalf Bedrijfslijnen</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileChatChannelsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-900 p-2 space-y-1">
              {chatChannels.map((ch) => {
                const isSelected = activeChatChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChatChannel(ch.id);
                      setIsMobileChatChannelsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition ${
                      isSelected ? 'bg-slate-900 border border-emerald-500/40 shadow-sm' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: ch.color }}
                    >
                      {ch.short}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                        {ch.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{ch.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shrink-0">
                  {replyingToEmail ? <Reply className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-white truncate">
                      {replyingToEmail ? 'Beantwoord Email' : 'Nieuwe Zakelijke Email Publiceren'}
                    </h3>
                    {lastDraftSavedAt ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Auto-save: {formatEmailTime(lastDraftSavedAt)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium shrink-0">
                        Auto-save actief
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {replyingToEmail
                      ? `Reactie namens ${getCompanyById(composeCompany).name}`
                      : 'Verzend officieel namens één van de twaalf bedrijven in Firestore'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsComposeOpen(false);
                  setReplyingToEmail(null);
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAdminEmail} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              {(isDraftRestored || lastDraftSavedAt) && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-amber-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {isDraftRestored
                        ? 'Concept automatisch hersteld uit lokale opslag.'
                        : `Concept automatisch opgeslagen om ${formatEmailTime(lastDraftSavedAt || Date.now())}.`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-[11px] transition shrink-0"
                    title="Wis dit opgeslagen concept"
                  >
                    Concept Wissen
                  </button>
                </div>
              )}

              {replyingToEmail && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5 text-amber-400" />
                      In reactie op oorspronkelijk bericht
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">{replyingToEmail.senderEmail}</span>
                  </div>
                  <p className="text-amber-200/90 font-medium truncate">{replyingToEmail.subject}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Afzender Bedrijf
                  </label>
                  <select
                    value={composeCompany}
                    onChange={(e) => setComposeCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 bg-slate-950 focus:outline-none focus:border-amber-400 transition"
                  >
                    {COMPANIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (admin@{c.domain})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Ontvanger
                    </label>
                    {replyingToEmail && (
                      <span className="text-[11px] text-amber-300 font-medium">
                        Vooraf ingevuld
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={composeRecipient}
                    onChange={(e) => setComposeRecipient(e.target.value)}
                    placeholder="Voer emailadres of Alle Netwerkpartners in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 bg-slate-950 focus:outline-none focus:border-amber-400 transition font-mono"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500">Snelle keuze:</span>
                    <button
                      type="button"
                      onClick={() => setComposeRecipient('Alle Netwerkpartners')}
                      className={`px-2 py-0.5 rounded text-[11px] transition ${
                        composeRecipient === 'Alle Netwerkpartners'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Alle Partners
                    </button>
                    {replyingToEmail && (
                      <button
                        type="button"
                        onClick={() => setComposeRecipient(replyingToEmail.senderEmail)}
                        className={`px-2 py-0.5 rounded text-[11px] transition font-mono ${
                          composeRecipient === replyingToEmail.senderEmail
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {replyingToEmail.senderEmail}
                      </button>
                    )}
                    {directoryUsers.slice(0, 2).map((u) => (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => setComposeRecipient(`${u.handle}@${getCompanyById(composeCompany).domain}`)}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Prioriteit
                  </label>
                  <select
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value as 'Normaal' | 'Hoog')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 bg-slate-950 focus:outline-none focus:border-amber-400 transition"
                  >
                    <option value="Normaal">Standaard</option>
                    <option value="Hoog">Hoog met prioriteitsmarkering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Document of Dossiernaam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={composeAttachment}
                    onChange={(e) => setComposeAttachment(e.target.value)}
                    placeholder="Bijvoorbeeld Kwartaalverslag_Q4.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm bg-slate-950 text-slate-200 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Onderwerp
                  </label>
                  {replyingToEmail && (
                    <span className="text-[11px] text-amber-300 font-medium">
                      Onderwerp automatisch overgenomen
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder={`Onderwerp namens ${getCompanyById(composeCompany).name}...`}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 text-xs sm:text-sm font-semibold text-white bg-slate-950 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Berichtinhoud
                </label>
                <textarea
                  rows={5}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder={
                    replyingToEmail
                      ? 'Typ hier uw reactie op het bericht...'
                      : 'Voer de officiële mededeling in...'
                  }
                  className="w-full p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 bg-slate-950 leading-relaxed focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <span className="text-xs text-slate-500">
                  Verzender:{' '}
                  <strong className="text-amber-300 font-mono">
                    {isAdminMode
                      ? `admin@${getCompanyById(composeCompany).domain}`
                      : `${userHandle}@${getCompanyById(composeCompany).domain}`}
                  </strong>
                </span>
                <div className="flex items-center gap-2">
                  {(composeSubject.trim() || composeBody.trim()) && (
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition"
                      title="Wis concept en sluit"
                    >
                      Concept Wis
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposeOpen(false);
                      setReplyingToEmail(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Sluiten
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingMail}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSendingMail
                        ? 'Verzenden...'
                        : replyingToEmail
                        ? 'Verzend Reactie'
                        : 'Plaatsen'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Alle Berichten Verwijderen?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Weet je zeker dat je alle berichten wilt wissen uit de postvakken van de twaalf bedrijven? Deze actie verwijdert alle emails uit het netwerk.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllEmails}
                  disabled={isDeletingAll}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  {isDeletingAll ? 'Wissen...' : 'Ja, Alles Verwijderen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12 Addresses Modal with direct Sample Email buttons */}
      {showAddressesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Jouw Twaalf Zakelijke Emailadressen
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ieder bericht dat naar deze adressen gestuurd wordt arriveert direct in jouw centrale QI Mail inbox.
                </p>
              </div>
              <button
                onClick={() => setShowAddressesModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Persoonlijke emailprefix</p>
                  <p className="text-[11px] text-slate-400">
                    Geldig voor alle twaalf aangesloten bedrijfsdomeinen.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userHandle}
                    onChange={(e) =>
                      setUserHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono font-bold text-amber-300 w-36 sm:w-40 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-mono text-slate-500">@12bedrijven.qin</span>
                </div>
              </div>

              {/* Action Banner to get Sample Emails on all 12 at once */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Ontvang Voorbeeldmails op Alle 12 Adressen</p>
                    <p className="text-[11px] text-slate-400">Laat elk van de twaalf bedrijven direct een actuele zakelijke voorbeeldmail bezorgen in jouw centrale inbox.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleReceiveAllSampleEmails();
                    setShowAddressesModal(false);
                  }}
                  disabled={isGeneratingSamples}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-md transition"
                >
                  Ontvang Voorbeeldmails
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {COMPANIES.map((c) => {
                  const fullEmail = `${userHandle}@${c.domain}`;
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">{fullEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSendSingleSampleEmail(c.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-slate-300 text-[11px] font-medium transition"
                          title="Ontvang voorbeeldmail van dit bedrijf"
                        >
                          Voorbeeld
                        </button>
                        <button
                          onClick={() => copyToClipboard(fullEmail)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition"
                          title="Kopieer adres"
                        >
                          {copiedAddress === fullEmail ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCompanyFilter(c.id);
                            setMultiCompanySelection([]);
                            setActiveEmailId(null);
                            setShowAddressesModal(false);
                            setActiveTab('mail');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold transition"
                        >
                          Filter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Netwerk Profiel en Systeemstatus</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Weergavenaam</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Zakelijk Emailadres</label>
                <input
                  type="text"
                  readOnly
                  value={userEmail}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/70 text-xs font-mono text-slate-300 select-all"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-400">Actieve Rol:</span>
                  <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminMode(true);
                        showToast('Directiemodus actief');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        isAdminMode ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      <span>Directie</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminMode(false);
                        showToast('Partnermodus actief');
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        !isAdminMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>Partner</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="font-medium text-slate-400">Firebase Cloud Firestore:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Actief en Verbonden
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="font-medium text-slate-400">Gebruikers ID:</span>
                  <span className="font-mono text-[10px] text-amber-300 select-all">
                    {userUid}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Uitloggen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    showToast('Profielinstellingen bewaard');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pin Email Summary Modal */}
      {isPinModalOpen && selectedEmailForPin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <Pin className="w-4 h-4 text-amber-400" />
                <h3>E-mail Onderwerp Pinnen in Chat</h3>
              </div>
              <button
                onClick={() => {
                  setIsPinModalOpen(false);
                  setSelectedEmailForPin(null);
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePinTopic} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Geselecteerd E-mail Bericht
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium">
                  <p className="text-amber-300 font-bold text-sm mb-0.5">
                    {selectedEmailForPin.subject}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Van: {selectedEmailForPin.senderName} ({selectedEmailForPin.senderEmail})
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kies QI Chatkanaal
                </label>
                <select
                  value={pinTargetChannel}
                  onChange={(e) => setPinTargetChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="algemeen">QIN Centraal en Directielijn (Algemeen)</option>
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.short})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Korte Samenvatting of Toelichting (Zichtbaar in Chatvenster)
                </label>
                <textarea
                  value={pinSummaryInput}
                  onChange={(e) => setPinSummaryInput(e.target.value)}
                  rows={3}
                  placeholder="Typ een korte samenvatting van dit dossier om vast te pinnen..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Gebruikers kunnen via de gepinde banner direct doorklikken naar deze e-mail.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setSelectedEmailForPin(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pinnen in Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3>Geavanceerde E-mail Filters</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Section 1: Date Range */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Datumbereik (Datum van / t/m)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Van datum:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Tot en met:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-500">Snelkeuze:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      setFilterStartDate(todayStr);
                      setFilterEndDate(todayStr);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    Vandaag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 7);
                      setFilterStartDate(d.toISOString().split('T')[0]);
                      setFilterEndDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    7 dagen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 30);
                      setFilterStartDate(d.toISOString().split('T')[0]);
                      setFilterEndDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                  >
                    30 dagen
                  </button>
                  {(filterStartDate || filterEndDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterStartDate('');
                        setFilterEndDate('');
                      }}
                      className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] transition"
                    >
                      Wis datum
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2: Attachment Presence */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bijlage Aanwezigheid</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterAttachment('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      filterAttachment === 'all'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Alle berichten
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterAttachment('with_attachment')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                      filterAttachment === 'with_attachment'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                    <span>Met Bijlage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterAttachment('without_attachment')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      filterAttachment === 'without_attachment'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Zonder Bijlage
                  </button>
                </div>
              </div>

              {/* Section 3: Priority */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prioriteit Filter</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterPriority('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      filterPriority === 'all'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Alle prioriteiten
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPriority('high')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                      filterPriority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                    <span>Hoge Prioriteit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPriority('normal')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      filterPriority === 'normal'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Normaal
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetAdvancedFilters}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition"
              >
                Filters Wissen
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFilterModalOpen(false);
                  showToast('Geavanceerde e-mail filters toegepast!', 'success');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
              >
                Filters Toepassen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Attachment Selection Modal */}
      {isEmailAttachmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Voeg E-mail of Document toe uit Archief & Inbox
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecteer een e-mailbericht of documentreferentie om als bijlage mee te sturen in het chatkanaal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailAttachmentModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/60">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Geen e-mails beschikbaar in het archief of postvak.
                </div>
              ) : (
                emails.map((mail) => {
                  const comp = getCompanyById(mail.companyId);
                  return (
                    <div
                      key={mail.id}
                      onClick={() => {
                        setSelectedEmailForChatAttachment(mail);
                        setIsEmailAttachmentModalOpen(false);
                        showToast(`E-mail "${mail.subject}" geselecteerd als bijlage`, 'success');
                      }}
                      className="pt-2.5 first:pt-0 p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: comp.color }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                              style={{
                                backgroundColor: `${comp.color}15`,
                                borderColor: `${comp.color}40`,
                                color: comp.color
                              }}
                            >
                              {comp.name}
                            </span>
                            {mail.attachment && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-300">
                                <Paperclip className="w-3 h-3 text-amber-400" />
                                <span>{mail.attachment}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white truncate mt-1">
                            {mail.subject}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {mail.senderName}: {mail.body?.replace(/\n/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition"
                      >
                        Bijvoegen
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Tip: Geselecteerde e-mails worden als interactieve bijlage getoond in de chat.</span>
              <button
                onClick={() => setIsEmailAttachmentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
