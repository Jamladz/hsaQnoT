import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Users, User, Trophy, Play, Loader2, Share2, Copy, CheckCircle2, ArrowDownToLine, ArrowUpFromLine, Globe, Volume2, VolumeX, CheckSquare, Tv, Bell, Star, Crown, Search, RefreshCw, ShieldCheck, Sparkles, Flame, Activity, Trash2, Edit3 } from 'lucide-react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { cn, triggerHaptic } from './lib/utils';
import { playSound, toggleMute, getIsMuted } from './lib/sounds';
import { translations, Language } from './lib/i18n';
import confetti from 'canvas-confetti';

// Create a custom confetti instance without workers to avoid OffscreenCanvas/getBoundingClientRect errors
const myConfetti = confetti.create(undefined, { useWorker: false, resize: true });
import WebApp from '@twa-dev/sdk';

// --- Generated High-Fidelity Visual Assets ---
const BULL_MASCOT_IMG = '/src/assets/images/bull_cyber_mascot_1793921339487.jpg';
const BEAR_MASCOT_IMG = '/src/assets/images/bear_cyber_mascot_1793921341555.jpg';
const PEPE_PRIZE_IMG = '/src/assets/images/prize_plush_pepe_1793921342657.jpg';
const GIFT_PRIZE_IMG = '/src/assets/images/prize_mystery_ton_box_1793921343824.jpg';

// --- Icons ---
export const TonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={cn("shrink-0", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#0098EA"/>
    <path d="M6.50195 7.33398H17.498C18.4847 7.33398 19.0647 8.42398 18.5113 9.24398L12.9446 17.4973C12.4846 18.1773 11.5113 18.1773 11.0513 17.4973L5.48462 9.24398C4.93129 8.42398 5.51795 7.33398 6.50195 7.33398ZM12 15.6673L16.248 9.33398H7.75195L12 15.6673Z" fill="white"/>
  </svg>
);

// --- Mock Data & Constants ---
const ADJECTIVES = ['crypto', 'ton', 'whale', 'ninja', 'diamond', 'moon', 'bull', 'bear', 'smart', 'rich', 'pro', 'master', 'lord', 'king', 'boss', 'alpha', 'mega', 'super', 'cyber', 'web3', 'defi', 'nft', 'meta', 'block', 'chain', 'node', 'miner', 'trader', 'hodler', 'degen', 'ape', 'punk', 'doge', 'pepe', 'shib', 'chad', 'sigma', 'based'];
const NOUNS = ['hunter', 'killer', 'rider', 'watcher', 'investor', 'money', 'guru', 'club', 'legend', 'god', 'hero', 'champion', 'fan', 'kid', 'boy', 'girl', 'man', 'dude', 'bro', 'guy', 'pal', 'buddy', 'friend', 'partner', 'ally', 'mate', 'team', 'squad', 'crew', 'gang', 'mob', 'clan', 'tribe', 'horde', 'swarm', 'pack'];
const RUSSIAN_NAMES = ['Ivan', 'Alexey', 'Dmitry', 'Sergey', 'Mikhail', 'Andrei', 'Egor', 'Nikita', 'Vladimir', 'Sasha', 'Misha', 'Dasha', 'Anya', 'Katya', 'Olya', 'Igor', 'Pavel', 'Roman', 'Viktor', 'Artem', 'Denis', 'Ilya', 'Maksim', 'Oleg', 'Ruslan', 'Timur', 'Vadim', 'Yuri', 'Anton', 'Boris', 'Gleb', 'Lev', 'Mark', 'Petr', 'Slava', 'Stanislav', 'Taras', 'Vitaly', 'Vlad', 'Yaroslav'];
const ARABIC_NAMES = ['Ahmed', 'Ali', 'Omar', 'Khaled', 'Hassan', 'Youssef', 'Tariq', 'Mahmoud', 'Ibrahim', 'Ziad', 'Karim', 'Nabil', 'Sami', 'Rami', 'Amir', 'Layla', 'Fatima', 'Yasmin', 'Mohammed', 'Mustafa', 'Hussein', 'Abbas', 'Adel', 'Ayman', 'Bassel', 'Fadi', 'Faris', 'Ghassan', 'Hadi', 'Hatem', 'Hesham', 'Imad', 'Issam', 'Jalal', 'Jamal', 'Kamal', 'Majed', 'Marwan', 'Mounir', 'Nader', 'Nasser', 'Nizar', 'Osama', 'Qasim', 'Raed', 'Saeed', 'Saleh', 'Salem', 'Samir', 'Tamer', 'Wael', 'Walid', 'Yasser'];

const generateBot = () => {
  const rand = Math.random();
  let name = '';
  const num = Math.floor(Math.random() * 90000) + 10000; // 5 digit number for absolute uniqueness
  
  if (rand < 0.33) {
    // Crypto style
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    name = `@${adj}_${noun}${num}`;
  } else if (rand < 0.66) {
    // Russian style
    const rName = RUSSIAN_NAMES[Math.floor(Math.random() * RUSSIAN_NAMES.length)];
    name = `@${rName.toLowerCase()}${num}`;
  } else {
    // Arabic style
    const aName = ARABIC_NAMES[Math.floor(Math.random() * ARABIC_NAMES.length)];
    name = `@${aName.toLowerCase()}${num}`;
  }
  
  return {
    name,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  };
};

const GAME_DURATION = 15; // seconds for playing
const WAITING_DURATION = 20; // seconds for waiting
const HOUSE_EDGE = 0.03; // 3%
const REFERRAL_BONUS = 0.10; // 10%
const MIN_BUY_IN = 0.1;
const ADMIN_USERNAME = '@sekanedr_is';

// --- Types ---
type Participant = {
  id: string;
  name: string;
  color: string;
  amount: number;
  isBot: boolean;
  percentage?: number;
};

type GameState = 'waiting' | 'playing' | 'finished';
type Tab = 'game' | 'referrals' | 'profile' | 'tasks' | 'admin';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLangPrompt, setShowLangPrompt] = useState(false);
  const [showDailyRefPrompt, setShowDailyRefPrompt] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showReferralWelcome, setShowReferralWelcome] = useState(false);
  const [showEarnPopup, setShowEarnPopup] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [activeGame, setActiveGame] = useState<'game1' | 'game2'>('game2');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const walletConnected = !!wallet;
  const [balance, setBalance] = useState(() => parseFloat(localStorage.getItem('tq_real_balance_v2') || '0')); // Strictly real balance, resets old mock data
  
  // Global Deposit State
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1);
  const [isDepositing, setIsDepositing] = useState(false);
  const [showWelcomeDeposit, setShowWelcomeDeposit] = useState(false);
  const [showUpdateInfo, setShowUpdateInfo] = useState(false);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(() => !localStorage.getItem('tq_update_seen_v3'));
  const [topUpToast, setTopUpToast] = useState<{ visible: boolean; neededAmount: number }>({ visible: false, neededAmount: 1 });
  const topUpToastTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevWalletConnected = useRef(false);

  const triggerTopUpToast = useCallback((neededAmount: number) => {
    playSound('click');
    triggerHaptic('medium');
    if (topUpToastTimeout.current) {
      clearTimeout(topUpToastTimeout.current);
    }
    setTopUpToast({ visible: true, neededAmount: Math.max(0.1, Number(neededAmount.toFixed(1))) });
    topUpToastTimeout.current = setTimeout(() => {
      setTopUpToast((prev) => ({ ...prev, visible: false }));
    }, 4200);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('tq_real_balance_v2', balance.toString());
  }, [balance]);

  useEffect(() => {
    if (walletConnected && !prevWalletConnected.current && balance === 0) {
      setShowWelcomeDeposit(true);
    }
    prevWalletConnected.current = walletConnected;
  }, [walletConnected, balance]);

  const handleDeposit = async () => {
    if (depositAmount < 1) {
      alert(t('minDeposit1'));
      return;
    }
    playSound('click');
    setIsDepositing(true);
    
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: "UQDkJ-PPmaN7x4aqTEUlG3gqVoPI19-YHPYhuZLC0EDQgkWm",
            amount: (depositAmount * 1000000000).toString(), // nanoTON
          }
        ]
      };
      
      await tonConnectUI.sendTransaction(transaction);
      
      // If transaction succeeds
      setBalance(prev => prev + depositAmount);
      setShowDeposit(false);
      playSound('win');
      alert(`${t('depositSuccess')} ${depositAmount} TON!`);
    } catch (e: any) {
      console.error(e);
      // Ignore user rejection errors to prevent generic txFailed alert
      if (e?.message?.includes('User rejects') || e?.name?.includes('UserRejectsError') || e?.toString()?.includes('User rejects')) {
        console.log('User cancelled transaction');
      } else {
        alert(t('txFailed'));
      }
    } finally {
      setIsDepositing(false);
    }
  };

  const [username, setUsername] = useState(() => {
    if (WebApp.initDataUnsafe?.user?.username) {
      return '@' + WebApp.initDataUnsafe.user.username;
    } else if (WebApp.initDataUnsafe?.user?.first_name) {
      return '@' + WebApp.initDataUnsafe.user.first_name.replace(/\s+/g, '');
    }
    return '@TelegramUser';
  });
  const isAdmin = username === ADMIN_USERNAME;
  const [photoUrl, setPhotoUrl] = useState(() => WebApp.initDataUnsafe?.user?.photo_url || '');
  const [lang, setLang] = useState<Language>('en');
  const [muted, setMuted] = useState(getIsMuted());
  const [liveUsers, setLiveUsers] = useState(2453);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand(); // Expands to maximum height
    
    // Attempt official full-screen mode (Bot API 7.0+)
    try {
      if ((WebApp as any).requestFullscreen) {
        (WebApp as any).requestFullscreen();
      }
      if ((WebApp as any).disableVerticalSwipes) {
        (WebApp as any).disableVerticalSwipes();
      }
    } catch (e) {
      console.warn("Fullscreen/Swipe methods not supported", e);
    }

    try {
      WebApp.setHeaderColor('#0B0F19');
      WebApp.setBackgroundColor('#0B0F19');
    } catch (e) {}
    
    // Check for referral start_param from Telegram WebApp or URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const startParam =
      WebApp.initDataUnsafe?.start_param ||
      urlParams.get('startapp') ||
      urlParams.get('tgWebAppStartParam') ||
      urlParams.get('ref') ||
      urlParams.get('invite');

    if (startParam && !localStorage.getItem('tonqash_referrer')) {
      localStorage.setItem('tonqash_referrer', startParam.trim());
    }

    // Generate or load User ID (prefer real Telegram ID when inside Telegram)
    const tgUser = WebApp.initDataUnsafe?.user;
    let uid = tgUser?.id ? String(tgUser.id) : localStorage.getItem('tonqash_uid');
    if (!uid) {
      uid = 'tg_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('tonqash_uid', uid);
    } else {
      localStorage.setItem('tonqash_uid', uid);
    }
    setUserId(uid);

    // Sync real Telegram user with persistent backend database
    const syncUserWithDatabase = async (isInitialSession = false) => {
      try {
        const storedGames = parseInt(localStorage.getItem('tq_user_games_played') || '0') + parseInt(localStorage.getItem('game2_games_played') || '0');
        const storedWins = parseInt(localStorage.getItem('tq_user_wins') || '0');
        const storedWagered = parseFloat(localStorage.getItem('tq_user_total_wagered') || '0');
        const currentBal = parseFloat(localStorage.getItem('tq_real_balance_v2') || '0');

        const res = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: uid,
            telegramId: tgUser?.id || null,
            username: tgUser?.username ? `@${tgUser.username}` : username,
            firstName: tgUser?.first_name || username.replace(/^@/, ''),
            lastName: tgUser?.last_name || '',
            photoUrl: tgUser?.photo_url || '',
            languageCode: tgUser?.language_code || localStorage.getItem('tonqash_lang') || 'en',
            isPremium: Boolean((tgUser as any)?.is_premium),
            balance: currentBal,
            gamesPlayed: storedGames,
            wins: storedWins,
            totalWagered: storedWagered,
            referredBy: localStorage.getItem('tonqash_referrer') || null,
            walletAddress: wallet?.account?.address || null,
            platform: (WebApp as any).platform || 'Telegram Mini App',
            isInitialSession,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            if (typeof data.user.referralsCount === 'number') {
              localStorage.setItem('portals_total_referrals', String(data.user.referralsCount));
            }
            if (typeof data.user.referralEarnings === 'number') {
              localStorage.setItem('portals_earned_ton', String(data.user.referralEarnings));
            }
            if (typeof data.referralBonusGranted === 'number' && data.referralBonusGranted > 0) {
              setBalance(data.user.balance);
              playSound('win');
            } else if (typeof data.user.balance === 'number' && Math.abs(data.user.balance - currentBal) > 0.001 && !isInitialSession) {
              setBalance(data.user.balance);
            }
          }
        }
      } catch (err) {
        // Silent fallback if offline
      }
    };

    syncUserWithDatabase(true);

    // Live Users Simulation
    const interval = setInterval(() => {
      setLiveUsers(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        let next = prev + change;
        if (next < 2400) next = 2400 + Math.floor(Math.random() * 20);
        if (next > 2600) next = 2600 - Math.floor(Math.random() * 20);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync balance and wallet updates to backend DB
  useEffect(() => {
    if (!userId) return;
    const tgUser = WebApp.initDataUnsafe?.user;
    const storedGames = parseInt(localStorage.getItem('tq_user_games_played') || '0') + parseInt(localStorage.getItem('game2_games_played') || '0');
    const storedWins = parseInt(localStorage.getItem('tq_user_wins') || '0');
    const storedWagered = parseFloat(localStorage.getItem('tq_user_total_wagered') || '0');

    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        telegramId: tgUser?.id || null,
        username,
        firstName: tgUser?.first_name || username.replace(/^@/, ''),
        lastName: tgUser?.last_name || '',
        photoUrl,
        languageCode: lang,
        balance,
        gamesPlayed: storedGames,
        wins: storedWins,
        totalWagered: storedWagered,
        walletAddress: wallet?.account?.address || null,
        isInitialSession: false,
      }),
    }).catch(() => {});
  }, [balance, walletConnected, lang, userId]);

  useEffect(() => {
    // Fast, smooth entry
    const loadTimer = setTimeout(() => {
      setIsLoading(false);

      const savedLang = localStorage.getItem('tonqash_lang');
      if (savedLang) {
        setLang(savedLang as Language);
      }
    }, 650);
    return () => clearTimeout(loadTimer);
  }, []);

  const handleToggleMute = () => {
    setMuted(toggleMute());
  };

  const t = (key: keyof typeof translations['en']) => translations[lang][key];

  const handleLangSelect = (selectedLang: Language) => {
    playSound('click');
    setLang(selectedLang);
    localStorage.setItem('tonqash_lang', selectedLang);
    setShowLangPrompt(false);
  };

  const cycleLanguage = () => {
    const order: Language[] = ['en', 'ar', 'ru'];
    const next = order[(order.indexOf(lang) + 1) % order.length];
    handleLangSelect(next);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[100dvh] w-full max-w-md md:max-w-2xl mx-auto bg-[#090C12] text-white items-center justify-center relative overflow-hidden px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0098EA] flex items-center justify-center shadow-[0_8px_30px_rgba(0,152,234,0.35)]">
            <TonIcon className="w-10 h-10" />
          </div>
          <h1 className="mt-4 font-display font-bold text-2xl tracking-tight text-white">TonQash</h1>
          <div className="w-32 h-1 bg-white/10 rounded-full mt-5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-[#0098EA]"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-[100dvh] w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-[#090C12] text-white overflow-hidden relative md:border-x md:border-white/[0.06] select-none",
        lang === 'ar' ? "rtl" : "ltr"
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sleek Floating Insufficient-Balance Top-Up Toast Notification */}
      <AnimatePresence>
        {topUpToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed top-16 left-3.5 right-3.5 max-w-md mx-auto z-50 pointer-events-none"
          >
            <div className="pointer-events-auto bg-[#131C31]/95 backdrop-blur-2xl border border-[#0098EA]/40 rounded-2xl p-3 shadow-[0_14px_34px_rgba(0,0,0,0.65),0_0_24px_rgba(0,152,234,0.22)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#0098EA]/15 border border-[#0098EA]/35 flex items-center justify-center shrink-0">
                  <TonIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-display font-bold text-white truncate">
                    {lang === 'ar'
                      ? 'رصيدك غير كافٍ لدخول الجولة'
                      : lang === 'ru'
                      ? 'Недостаточно TON для игры'
                      : 'Insufficient Balance to Play'}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    {lang === 'ar'
                      ? `اشحن حسابك الآن بـ TON وابدأ اللعب فوراً`
                      : lang === 'ru'
                      ? `Пополните баланс TON, чтобы вступить в раунд`
                      : `Top up your TON balance to join this round`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  setTopUpToast((prev) => ({ ...prev, visible: false }));
                  setDepositAmount(Math.max(1, Math.ceil(topUpToast.neededAmount)));
                  if (walletConnected) {
                    setShowDeposit(true);
                  } else {
                    tonConnectUI.openModal();
                  }
                }}
                className="bg-[#0098EA] hover:bg-[#0088D1] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_4px_14px_rgba(0,152,234,0.35)] active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <ArrowDownToLine size={14} />
                <span>{lang === 'ar' ? 'شحن الآن' : lang === 'ru' ? 'Пополнить' : 'Top Up'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist Single-Row Top Bar */}
      <header className="shrink-0 px-4 h-14 bg-[#090C12]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between gap-3 z-30">
        {/* Brand & Live Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0098EA] flex items-center justify-center shrink-0">
            <TonIcon className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="font-display font-bold text-base tracking-tight text-white truncate">{t('appName')}</h1>
            <span className="text-[11px] font-mono-num text-slate-400 hidden xs:inline">
              {liveUsers.toLocaleString()} online
            </span>
          </div>
        </div>

        {/* Clean Action Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('light');
              setShowUpdateInfo(true);
              setHasUnreadUpdates(false);
              localStorage.setItem('tq_update_seen_v3', 'true');
            }}
            aria-label="Updates"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell size={16} />
            {hasUnreadUpdates && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#0098EA] rounded-full" />
            )}
          </button>

          <button
            onClick={handleToggleMute}
            aria-label="Toggle Audio"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={cycleLanguage}
            className="h-9 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-bold uppercase text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <Globe size={13} className="text-slate-400" />
            <span>{lang}</span>
          </button>

          <button 
            onClick={() => { 
              playSound('click'); 
              if (walletConnected) {
                tonConnectUI.disconnect();
              } else {
                tonConnectUI.openModal();
              }
            }}
            className={cn(
              "h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all luxury-button whitespace-nowrap",
              walletConnected 
                ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10" 
                : "bg-[#0098EA] hover:bg-[#0088D1] text-white"
            )}
          >
            <Wallet size={14} className="shrink-0" />
            {walletConnected || balance > 0 ? (
              <span className="flex items-center gap-1 font-mono-num font-bold">
                {balance.toFixed(2)} <TonIcon className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span>{t('connect')}</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative touch-pan-y">
        <div className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 pb-24 overscroll-contain custom-scrollbar", activeTab === 'game' ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
          {/* Minimalist Segmented Arena Switcher */}
          <div className="sticky top-0 z-30 bg-[#090C12]/90 backdrop-blur-xl px-4 pt-3 pb-2">
            <div className="grid grid-cols-2 gap-1 bg-[#111622] p-1 rounded-xl border border-white/[0.06]">
              <button 
                onClick={() => { playSound('click'); setActiveGame('game2'); }}
                className={cn(
                  "py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                  activeGame === 'game2'
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span>Bears vs Bulls</span>
              </button>
              <button 
                onClick={() => { playSound('click'); setActiveGame('game1'); }}
                className={cn(
                  "py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                  activeGame === 'game1'
                    ? "bg-white/[0.1] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <span>Jackpot Wheel</span>
              </button>
            </div>
          </div>
          {activeGame === 'game1' ? (
            <GameTab walletConnected={walletConnected} balance={balance} setBalance={setBalance} username={username} t={t} onInsufficientBalance={triggerTopUpToast} />
          ) : (
            <Game2Tab walletConnected={walletConnected} balance={balance} setBalance={setBalance} username={username} t={t} onInsufficientBalance={triggerTopUpToast} />
          )}
        </div>
        <div className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 pb-24 overscroll-contain custom-scrollbar", activeTab === 'tasks' ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
          <TasksTab t={t} balance={balance} setBalance={setBalance} userId={userId} />
        </div>
        <div className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 pb-24 overscroll-contain custom-scrollbar", activeTab === 'referrals' ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
          <ReferralsTab t={t} userId={userId} balance={balance} setBalance={setBalance} lang={lang} />
        </div>
        <div className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 pb-28 overscroll-contain custom-scrollbar", activeTab === 'profile' ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
          <ProfileTab
            username={username}
            photoUrl={photoUrl}
            userId={userId}
            balance={balance}
            setBalance={setBalance}
            walletConnected={walletConnected}
            walletAddress={wallet?.account?.address || null}
            onConnectWallet={() => tonConnectUI.openModal()}
            onDisconnectWallet={() => tonConnectUI.disconnect()}
            onNavigateTab={(tab) => setActiveTab(tab)}
            lang={lang}
            t={t}
            onDepositClick={() => setShowDeposit(true)}
          />
        </div>
        {isAdmin && (
          <div className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-200 pb-24 overscroll-contain custom-scrollbar", activeTab === 'admin' ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0")}>
            <AdminTab t={t} balance={balance} setBalance={setBalance} currentUserId={userId} />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation: Rounded-Edge Capsule Frame + Standalone Profile Icon on Same Row */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] z-30 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Rounded-Edges Capsule Frame for Main Navigation Buttons */}
          <div className="flex-1 flex items-center justify-around bg-[#111622]/95 backdrop-blur-2xl border border-white/[0.1] rounded-full p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
            <NavButton icon={<Trophy />} label={t('game')} active={activeTab === 'game'} onClick={() => { playSound('click'); triggerHaptic('light'); setActiveTab('game'); }} />
            <NavButton icon={<CheckSquare />} label={t('tasks')} active={activeTab === 'tasks'} onClick={() => { playSound('click'); triggerHaptic('light'); setActiveTab('tasks'); }} />
            <NavButton icon={<Users />} label={t('referrals')} active={activeTab === 'referrals'} onClick={() => { playSound('click'); triggerHaptic('light'); setActiveTab('referrals'); }} />
            {isAdmin && (
              <NavButton icon={<ShieldCheck />} label="Admin" active={activeTab === 'admin'} onClick={() => { playSound('click'); triggerHaptic('light'); setActiveTab('admin'); }} />
            )}
          </div>

          {/* Standalone Circular Profile Icon Button on the Same Row */}
          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('light');
              setActiveTab('profile');
            }}
            aria-label={t('profile')}
            title={t('profile')}
            className={cn(
              "w-[54px] h-[54px] shrink-0 rounded-full flex items-center justify-center backdrop-blur-2xl border transition-all duration-200 shadow-[0_12px_32px_rgba(0,0,0,0.65)] active:scale-95",
              activeTab === 'profile'
                ? "bg-[#0098EA] text-white border-[#38BDF8]/50 shadow-[0_4px_20px_rgba(0,152,234,0.45)]"
                : "bg-[#111622]/95 text-slate-300 hover:text-white border-white/[0.1] hover:border-white/20"
            )}
          >
            <User size={22} className={cn("transition-transform duration-200", activeTab === 'profile' && "scale-110")} />
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {showUpdateInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              className="bg-[#111622] border border-white/10 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-4 max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0098EA]/15 border border-[#0098EA]/30 rounded-xl flex items-center justify-center shrink-0">
                  <Bell className="text-[#0098EA]" size={18} />
                </div>
                <h3 className="text-lg font-display font-bold text-white">{t('updateInfoTitle')}</h3>
              </div>
              
              <div className="flex flex-col gap-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06]">
                  <p>{t('updateMsg1')}</p>
                </div>
                <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06]">
                  <p>{t('updateMsg2')}</p>
                </div>
                <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06]">
                  <p>{t('updateMsg3')}</p>
                </div>
              </div>

              <button 
                onClick={() => { playSound('click'); setShowUpdateInfo(false); }} 
                className="bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold text-sm py-3 rounded-xl luxury-button mt-1"
              >
                {t('closeBtn')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showWelcomeDeposit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500/30 to-transparent" />
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/50 border-4 border-black/20 cartoon-border z-10">
                <Wallet size={48} className="text-white drop-shadow-md" />
              </div>
              <h3 className="text-3xl font-bold text-stroke text-white z-10">{t('welcomeDepositTitle')}</h3>
              <p className="text-[var(--color-tg-muted)] font-bold text-sm z-10">{t('welcomeDepositDesc')}</p>
              
              <div className="flex flex-col gap-2 mt-4 z-10">
                <button 
                  onClick={() => {
                    playSound('click');
                    setShowWelcomeDeposit(false);
                    setShowDeposit(true);
                  }} 
                  className="bg-gradient-to-b from-green-400 to-green-600 text-white font-bold py-4 rounded-xl cartoon-button text-stroke text-lg transition-colors"
                >
                  {t('depositNow')}
                </button>
                <button 
                  onClick={() => { playSound('click'); setShowWelcomeDeposit(false); }} 
                  className="bg-black/30 hover:bg-white/10 text-[var(--color-tg-muted)] font-bold py-3 rounded-xl cartoon-border transition-colors"
                >
                  {t('maybeLater')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeposit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4"
            >
              <h3 className="text-2xl font-bold text-stroke text-center">{t('depositTon')}</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-[var(--color-tg-muted)] text-xs font-bold uppercase">{t('amountMin1')}</label>
                <input 
                  type="number" 
                  min="1" 
                  value={depositAmount} 
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="bg-black/30 p-3 rounded-xl text-white font-bold text-xl outline-none cartoon-border text-center"
                />
              </div>

              <button 
                onClick={handleDeposit}
                disabled={isDepositing || depositAmount < 1}
                className="bg-gradient-to-b from-[var(--color-game-primary)] to-[var(--color-game-secondary)] text-white font-bold py-3 rounded-xl cartoon-button text-stroke mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDepositing ? <><Loader2 className="animate-spin" size={18} /> {t('confirming')}</> : t('depositViaWallet')}
              </button>
              
              <button 
                onClick={() => { playSound('click'); setShowDeposit(false); }}
                disabled={isDepositing}
                className="text-[var(--color-tg-muted)] font-bold py-2 hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showLangPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center"
            >
              <Globe size={48} className="mx-auto text-[var(--color-game-accent)] drop-shadow-md" />
              <h3 className="text-3xl font-bold text-stroke text-white">{t('selectLanguage')}</h3>
              
              <div className="flex flex-col gap-2 mt-2">
                <button onClick={() => handleLangSelect('en')} className="bg-black/30 hover:bg-white/10 text-white font-bold py-3 rounded-xl cartoon-border transition-colors">English</button>
                <button onClick={() => handleLangSelect('ru')} className="bg-black/30 hover:bg-white/10 text-white font-bold py-3 rounded-xl cartoon-border transition-colors">Русский</button>
                <button onClick={() => handleLangSelect('ar')} className="bg-black/30 hover:bg-white/10 text-white font-bold py-3 rounded-xl cartoon-border transition-colors">العربية</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEarnPopup && !showLangPrompt && !showDailyRefPrompt && !showDailyBonus && !showReferralWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/30 to-transparent" />
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50 border-4 border-black/20 cartoon-border z-10 animate-bounce-slow">
                <Trophy size={48} className="text-white drop-shadow-md" />
              </div>
              <h3 className="text-3xl font-bold text-stroke text-white z-10">{t('earnPopupTitle')}</h3>
              <p className="text-[var(--color-tg-muted)] font-bold text-sm z-10">{t('earnPopupDesc')}</p>
              
              <div className="flex flex-col gap-2 mt-4 z-10">
                <button 
                  onClick={() => {
                    playSound('click');
                    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                    }
                    setShowEarnPopup(false);
                    setActiveTab('tasks');
                  }} 
                  className="bg-gradient-to-b from-indigo-400 to-indigo-600 text-white font-bold py-4 rounded-xl cartoon-button text-stroke text-lg transition-colors"
                >
                  {t('goToTasks')}
                </button>
                <button 
                  onClick={() => { playSound('click'); setShowEarnPopup(false); }} 
                  className="bg-black/30 hover:bg-white/10 text-[var(--color-tg-muted)] font-bold py-3 rounded-xl cartoon-border transition-colors"
                >
                  {t('maybeLater')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDailyRefPrompt && !showLangPrompt && !showEarnPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-blue-500/50 border-4 border-black/20 cartoon-border">
                <Users size={40} className="text-white drop-shadow-md" />
              </div>
              <h3 className="text-3xl font-bold text-stroke text-white">{t('dailyRefTitle')}</h3>
              <p className="text-[var(--color-tg-muted)] font-bold text-sm">{t('dailyRefDesc')}</p>
              
              <button 
                onClick={() => { playSound('click'); setShowDailyRefPrompt(false); setActiveTab('referrals'); }}
                className="bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl cartoon-button text-stroke mt-2"
              >
                {t('shareNow')}
              </button>
              <button 
                onClick={() => { playSound('click'); setShowDailyRefPrompt(false); }}
                className="text-[var(--color-tg-muted)] font-bold py-2 hover:text-white transition-colors"
              >
                {t('maybeLater')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showDailyBonus && !showLangPrompt && !showDailyRefPrompt && !showReferralWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center"
            >
              <div className="text-6xl drop-shadow-lg animate-bounce">🎁</div>
              <h3 className="text-3xl font-bold text-stroke text-[var(--color-game-secondary)]">{t('dailyBonusTitle')}</h3>
              <p className="text-white font-bold text-lg">{t('dailyBonusDesc')}</p>
              <p className="text-4xl font-bold text-yellow-400 text-stroke flex items-center justify-center gap-2">+50 XP</p>
              
              <button 
                onClick={() => { 
                  playSound('win'); 
                  const currentXp = parseInt(localStorage.getItem('tq_user_xp') || '0');
                  localStorage.setItem('tq_user_xp', (currentXp + 50).toString());
                  setShowDailyBonus(false); 
                  myConfetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
                }}
                className="bg-gradient-to-b from-[var(--color-game-primary)] to-[var(--color-game-secondary)] text-white font-bold py-3 rounded-xl cartoon-button text-stroke mt-2"
              >
                {t('claimBonus')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showReferralWelcome && !showLangPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-game-card)] p-6 rounded-3xl cartoon-border w-full max-w-sm flex flex-col gap-4 text-center"
            >
              <div className="text-6xl drop-shadow-lg animate-bounce">🤝</div>
              <h3 className="text-3xl font-bold text-stroke text-[var(--color-game-accent)]">Welcome!</h3>
              <p className="text-white font-bold text-lg">You were invited by a friend!</p>
              <p className="text-[var(--color-tg-muted)] text-sm">Here is a welcome bonus to get you started.</p>
              <p className="text-4xl font-bold text-yellow-400 text-stroke">+100 XP</p>
              
              <button 
                onClick={() => { 
                  playSound('win'); 
                  const currentXp = parseInt(localStorage.getItem('tq_user_xp') || '0');
                  localStorage.setItem('tq_user_xp', (currentXp + 100).toString());
                  setShowReferralWelcome(false); 
                  myConfetti({ particleCount: 80, spread: 80, origin: { y: 0.8 } });
                }}
                className="bg-gradient-to-b from-[var(--color-game-primary)] to-[var(--color-game-secondary)] text-white font-bold py-3 rounded-xl cartoon-button text-stroke mt-2"
              >
                {t('claimBonus')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Components ---

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-[42px] px-2 rounded-full transition-all duration-200 relative active:scale-95",
        active
          ? "bg-[#0098EA] text-white shadow-[0_4px_14px_rgba(0,152,234,0.4)]"
          : "text-slate-400 hover:text-slate-200"
      )}
    >
      <div className="transition-transform duration-200">
        {React.cloneElement(icon as React.ReactElement, { size: 17 })}
      </div>
      <span className={cn("text-[10px] font-semibold tracking-tight leading-none mt-0.5 whitespace-nowrap", active ? "text-white font-bold" : "text-slate-400")}>{label}</span>
    </button>
  );
}

const Game2Tab: React.FC<{ walletConnected: boolean, balance: number, setBalance: React.Dispatch<React.SetStateAction<number>>, username: string, t: any, onInsufficientBalance: (needed: number) => void }> = ({ walletConnected, balance, setBalance, username, t, onInsufficientBalance }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [timeLeft, setTimeLeft] = useState(15);
  const [redPool, setRedPool] = useState<Participant[]>([]);
  const [greenPool, setGreenPool] = useState<Participant[]>([]);
  const [userBet, setUserBet] = useState<{ color: 'red' | 'green', amount: number } | null>(null);
  const [winner, setWinner] = useState<'red' | 'green' | null>(null);
  const [betInput, setBetInput] = useState<string>(() => localStorage.getItem('game2_bet_amount') || '1');
  const buyAmount = Math.max(0.1, parseFloat(betInput) || 0.1);
  const [history, setHistory] = useState<('red' | 'green')[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('game2_history') || '[]');
    } catch {
      return [];
    }
  });
  
  const redTotal = redPool.reduce((s, p) => s + p.amount, 0) + (userBet?.color === 'red' ? userBet.amount : 0);
  const greenTotal = greenPool.reduce((s, p) => s + p.amount, 0) + (userBet?.color === 'green' ? userBet.amount : 0);
  const totalPool = redTotal + greenTotal;

  const redPercentage = totalPool === 0 ? 50 : (redTotal / totalPool) * 100;
  const greenPercentage = totalPool === 0 ? 50 : (greenTotal / totalPool) * 100;

  // Bot generation
  useEffect(() => {
    if (gameState !== 'waiting') return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const scheduleBot = () => {
      if (!isMounted || gameState !== 'waiting') return;
      
      // Extremely fast bot joining to reach 30-50 bots per color (60-100 total) in 15 seconds
      const nextCheck = 100 + Math.random() * 150;
      
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        
        // Add 1 to 3 bots per tick
        const botsToAdd = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < botsToAdd; i++) {
          const randomBot = generateBot();
          
          // Realistic distribution: mostly small, some medium, few large
          const rand = Math.random();
          let amount = 0;
          if (rand < 0.7) amount = Number((Math.random() * 0.9 + 0.1).toFixed(1)); // 0.1 - 1.0
          else if (rand < 0.95) amount = Number((Math.random() * 1.5 + 1.0).toFixed(1)); // 1.0 - 2.5
          else amount = Number((Math.random() * 1.5 + 2.5).toFixed(1)); // 2.5 - 4.0
          
          const color = Math.random() > 0.5 ? 'red' : 'green';
          
          if (color === 'red') {
            setRedPool(prev => [{ id: Math.random().toString(), name: randomBot.name, color: '#ef4444', amount, isBot: true }, ...prev]);
          } else {
            setGreenPool(prev => [{ id: Math.random().toString(), name: randomBot.name, color: '#22c55e', amount, isBot: true }, ...prev]);
          }
        }
        scheduleBot();
      }, nextCheck);
    };

    scheduleBot();
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, [gameState, timeLeft]);

  // Timer
  useEffect(() => {
    if (gameState !== 'waiting') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 0) {
          if (prev <= 4) playSound('tick');
          return prev - 1;
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'waiting') {
      startGame();
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    let finalRedPool = [...redPool];
    let finalGreenPool = [...greenPool];
    let finalRedTotal = redTotal;
    let finalGreenTotal = greenTotal;

    let targetWinner: 'red' | 'green';

    const userGamesPlayed = parseInt(localStorage.getItem('game2_games_played') || '0');
    const currentNetProfit = parseFloat(localStorage.getItem('game2_net_profit') || '0');

    if (userBet) {
      if (userGamesPlayed < 4) {
        targetWinner = userBet.color;
        
        let losingTotal = targetWinner === 'red' ? finalGreenTotal : finalRedTotal;
        let winningTotal = targetWinner === 'red' ? finalRedTotal : finalGreenTotal;
        
        if (winningTotal <= losingTotal) {
            const diff = losingTotal - winningTotal;
            const amountToAdd = diff + Math.random() * 2 + 0.1;
            winningTotal += amountToAdd;
            
            const bot = generateBot();
            if (targetWinner === 'red') {
                finalRedPool.unshift({ id: Math.random().toString(), name: bot.name, color: '#ef4444', amount: Number(amountToAdd.toFixed(1)), isBot: true });
                finalRedTotal += amountToAdd;
            } else {
                finalGreenPool.unshift({ id: Math.random().toString(), name: bot.name, color: '#22c55e', amount: Number(amountToAdd.toFixed(1)), isBot: true });
                finalGreenTotal += amountToAdd;
            }
        }
        
        const profit = losingTotal * (userBet.amount / winningTotal);
        if (currentNetProfit + profit > 9) {
            targetWinner = userBet.color === 'red' ? 'green' : 'red';
        }
      } else {
        targetWinner = userBet.color === 'red' ? 'green' : 'red';
      }
    } else {
      targetWinner = finalRedTotal >= finalGreenTotal ? 'red' : 'green';
    }

    if (targetWinner === 'red' && finalRedTotal <= finalGreenTotal) {
      const diff = finalGreenTotal - finalRedTotal;
      const amountToAdd = diff + Math.random() * 2 + 0.1;
      const bot = generateBot();
      finalRedPool.unshift({ id: Math.random().toString(), name: bot.name, color: '#ef4444', amount: Number(amountToAdd.toFixed(1)), isBot: true });
      finalRedTotal += amountToAdd;
    } else if (targetWinner === 'green' && finalGreenTotal <= finalRedTotal) {
      const diff = finalRedTotal - finalGreenTotal;
      const amountToAdd = diff + Math.random() * 2 + 0.1;
      const bot = generateBot();
      finalGreenPool.unshift({ id: Math.random().toString(), name: bot.name, color: '#22c55e', amount: Number(amountToAdd.toFixed(1)), isBot: true });
      finalGreenTotal += amountToAdd;
    }

    setRedPool(finalRedPool);
    setGreenPool(finalGreenPool);
    setWinner(targetWinner);
    setGameState('playing');
    playSound('start');

    setTimeout(() => {
      endGame(targetWinner, finalRedTotal, finalGreenTotal);
    }, 3000);
  };

  const endGame = (winningColor: 'red' | 'green', finalRedTotal: number, finalGreenTotal: number) => {
    playSound('win');
    setGameState('finished');
    
    setHistory(prev => {
      const newHistory = [...prev, winningColor].slice(-10); // Keep last 10 rounds
      localStorage.setItem('game2_history', JSON.stringify(newHistory));
      return newHistory;
    });

    if (userBet) {
      const userGamesPlayed = parseInt(localStorage.getItem('game2_games_played') || '0');
      localStorage.setItem('game2_games_played', (userGamesPlayed + 1).toString());
      
      let currentNetProfit = parseFloat(localStorage.getItem('game2_net_profit') || '0');
      
      if (userBet.color === winningColor) {
        const winningTotal = winningColor === 'red' ? finalRedTotal : finalGreenTotal;
        const losingTotal = winningColor === 'red' ? finalGreenTotal : finalRedTotal;
        const profit = losingTotal * (userBet.amount / winningTotal);
        
        currentNetProfit += profit;
        setBalance(prev => prev + userBet.amount + profit);
        
        myConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        currentNetProfit -= userBet.amount;
      }
      localStorage.setItem('game2_net_profit', currentNetProfit.toString());
    } else {
      myConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setTimeout(() => {
      setGameState('waiting');
      setTimeLeft(15);
      setRedPool([]);
      setGreenPool([]);
      setUserBet(null);
      setWinner(null);
    }, 4000);
  };

  const handleBet = (color: 'red' | 'green', amount: number) => {
    if (gameState !== 'waiting') return;
    if (balance < amount) {
      onInsufficientBalance(amount);
      return;
    }

    playSound('click');
    triggerHaptic('medium');
    setBalance(prev => prev - amount);
    setUserBet({ color, amount });
  };

  return (
    <div className="p-3.5 sm:p-5 flex flex-col gap-3.5 min-h-full w-full">
      {/* Arena Header & Recent History */}
      <div className="flex justify-between items-center glass-card rounded-2xl p-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-extrabold text-white tracking-tight leading-none">Bears vs Bulls</h2>
            <span className="text-[11px] text-slate-400 font-medium">· 2x Pool Arena</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Last Rounds:</span>
            {history.length === 0 ? (
              <span className="text-[10px] text-slate-500 font-medium">Waiting for round 1</span>
            ) : (
              history.map((color, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0 transition-transform", 
                    color === 'red' ? "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
                    i === history.length - 1 ? "ring-2 ring-white/70 scale-125" : "opacity-75"
                  )} 
                />
              ))
            )}
          </div>
        </div>
        <div className="bg-[#0B0F19]/90 border border-white/10 rounded-xl px-3.5 py-2 flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">Round Timer</span>
          <span className={cn("text-xl font-mono-num font-extrabold leading-none", timeLeft <= 3 ? "text-rose-400 animate-pulse" : "text-white")}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* High-Craft Split Battle Arena */}
      <div className="w-full h-44 sm:h-52 rounded-3xl overflow-hidden flex relative shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-white/15 bg-[#0B0F19]">
        {/* Bears (Crimson Side) */}
        <div 
          className="h-full bg-gradient-to-br from-rose-950 via-rose-800 to-rose-600 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden"
          style={{ width: `${redPercentage}%` }}
        >
          <img 
            src={BEAR_MASCOT_IMG} 
            alt="Bear Clan" 
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-rose-950/30 to-transparent pointer-events-none" />
          {redPercentage > 14 && (
            <motion.div 
              key={Math.round(redPercentage)}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="z-10 flex flex-col items-center text-center px-2"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-rose-400/50 shadow-lg mb-1 bg-rose-950">
                <img src={BEAR_MASCOT_IMG} alt="Bear" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-mono-num font-extrabold text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                {redPercentage.toFixed(0)}%
              </span>
              <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Bears</span>
            </motion.div>
          )}
        </div>

        {/* Bulls (Emerald Side) */}
        <div 
          className="h-full bg-gradient-to-bl from-emerald-950 via-emerald-800 to-emerald-600 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden border-l border-white/20"
          style={{ width: `${greenPercentage}%` }}
        >
          <img 
            src={BULL_MASCOT_IMG} 
            alt="Bull Clan" 
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-emerald-950/30 to-transparent pointer-events-none" />
          {greenPercentage > 14 && (
            <motion.div 
              key={Math.round(greenPercentage)}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="z-10 flex flex-col items-center text-center px-2"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-emerald-400/50 shadow-lg mb-1 bg-emerald-950">
                <img src={BULL_MASCOT_IMG} alt="Bull" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-mono-num font-extrabold text-2xl sm:text-3xl tracking-tight drop-shadow-md">
                {greenPercentage.toFixed(0)}%
              </span>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Bulls</span>
            </motion.div>
          )}
        </div>
        
        {/* Center Total Pool & VS Anchor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none">
          <div className="bg-[#0B0F19]/95 text-white text-xs font-mono-num font-bold px-3 py-1 rounded-full mb-1.5 border border-white/15 shadow-xl flex items-center gap-1.5">
            <span>Pool:</span>
            <span className="text-sky-400 font-extrabold">{totalPool.toFixed(1)}</span>
            <TonIcon className="w-3.5 h-3.5" />
          </div>
          <div className="w-11 h-11 bg-[#0F1523] rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-2xl rotate-45">
            <span className="-rotate-45 text-white font-display font-black text-xs tracking-wider">VS</span>
          </div>
        </div>

        {/* Winner Overlay */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-30 bg-black/75 backdrop-blur-md"
            >
              <div className={cn(
                "px-7 py-5 rounded-3xl border shadow-2xl text-center",
                winner === 'red' ? "bg-rose-950/90 border-rose-500/50" : "bg-emerald-950/90 border-emerald-500/50"
              )}>
                <h3 className={cn("text-2xl sm:text-3xl font-display font-extrabold mb-1", winner === 'red' ? "text-rose-400" : "text-emerald-400")}>
                  {winner === 'red' ? 'BEARS TRIUMPH!' : 'BULLS TRIUMPH!'}
                </h3>
                {userBet && userBet.color === winner && (
                  <p className="text-white font-bold text-base">Victory! Payout credited to balance</p>
                )}
                {userBet && userBet.color !== winner && (
                  <p className="text-slate-300 font-medium text-sm">Round ended · Next round starting</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting Console */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-300">Wager Amount (TON)</span>
          <div className="flex items-center gap-2 bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-white/10 focus-within:border-[#0098EA] transition-colors">
            <input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={betInput} 
              onChange={(e) => {
                setBetInput(e.target.value);
                localStorage.setItem('game2_bet_amount', e.target.value);
              }}
              className="bg-transparent text-white font-mono-num font-bold text-right w-20 outline-none text-base"
              placeholder="0.1"
            />
            <TonIcon className="w-4 h-4" />
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[0.1, 1, 5, 10, 25].map(amt => (
            <button
              key={amt}
              onClick={() => {
                playSound('click');
                setBetInput(amt.toString());
                localStorage.setItem('game2_bet_amount', amt.toString());
              }}
              className={cn(
                "py-2 rounded-xl font-mono-num font-bold text-xs transition-all border",
                parseFloat(betInput) === amt
                  ? "bg-[#0098EA] text-white border-sky-400 shadow-sm"
                  : "bg-white/[0.04] text-slate-300 border-white/[0.06] hover:bg-white/[0.08]"
              )}
            >
              {amt} TON
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => handleBet('red', buyAmount)} 
              disabled={gameState !== 'waiting' || userBet !== null}
              className="w-full py-3 px-3 bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 disabled:opacity-45 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-lg shadow-rose-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 border border-rose-400/30"
            >
              <img src={BEAR_MASCOT_IMG} alt="Bear" referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg object-cover border border-white/20" />
              <span className="text-sm font-display font-bold">Join Bears</span>
            </button>
            <div className="text-center text-xs font-mono-num font-semibold text-rose-400 flex items-center justify-center gap-1">
              <span>{redTotal.toFixed(1)}</span> <TonIcon className="w-3 h-3" />
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{redPool.length + (userBet?.color === 'red' ? 1 : 0)} players</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => handleBet('green', buyAmount)} 
              disabled={gameState !== 'waiting' || userBet !== null}
              className="w-full py-3 px-3 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 disabled:opacity-45 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 border border-emerald-400/30"
            >
              <img src={BULL_MASCOT_IMG} alt="Bull" referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg object-cover border border-white/20" />
              <span className="text-sm font-display font-bold">Join Bulls</span>
            </button>
            <div className="text-center text-xs font-mono-num font-semibold text-emerald-400 flex items-center justify-center gap-1">
              <span>{greenTotal.toFixed(1)}</span> <TonIcon className="w-3 h-3" />
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{greenPool.length + (userBet?.color === 'green' ? 1 : 0)} players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Faction Rosters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-3 border-rose-500/20 flex flex-col h-56">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/[0.07]">
            <h4 className="text-rose-400 font-display font-bold text-xs flex items-center gap-1.5 truncate">
              <img src={BEAR_MASCOT_IMG} alt="Bear" referrerPolicy="no-referrer" className="w-4 h-4 rounded object-cover shrink-0" />
              <span>Bears Roster</span>
            </h4>
            <span className="text-[11px] font-mono-num font-semibold text-slate-400">{redPool.length + (userBet?.color === 'red' ? 1 : 0)}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {userBet?.color === 'red' && (
              <div className="flex justify-between items-center p-2 bg-rose-500/20 rounded-xl mb-1.5 border border-rose-500/40">
                <span className="font-bold text-xs text-white truncate">{username}</span>
                <span className="font-mono-num font-bold text-xs text-rose-300 flex items-center gap-1">{userBet.amount} <TonIcon className="w-3 h-3" /></span>
              </div>
            )}
            <AnimatePresence initial={false}>
              {redPool.slice(0, 25).map(p => (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center py-1.5 px-1 border-b border-white/[0.04] last:border-0"
                >
                  <span className="font-medium text-xs text-slate-300 truncate pr-2">{p.name}</span>
                  <span className="font-mono-num font-semibold text-xs text-rose-400 whitespace-nowrap flex items-center gap-1">{p.amount} <TonIcon className="w-3 h-3" /></span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 border-emerald-500/20 flex flex-col h-56">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/[0.07]">
            <h4 className="text-emerald-400 font-display font-bold text-xs flex items-center gap-1.5 truncate">
              <img src={BULL_MASCOT_IMG} alt="Bull" referrerPolicy="no-referrer" className="w-4 h-4 rounded object-cover shrink-0" />
              <span>Bulls Roster</span>
            </h4>
            <span className="text-[11px] font-mono-num font-semibold text-slate-400">{greenPool.length + (userBet?.color === 'green' ? 1 : 0)}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {userBet?.color === 'green' && (
              <div className="flex justify-between items-center p-2 bg-emerald-500/20 rounded-xl mb-1.5 border border-emerald-500/40">
                <span className="font-bold text-xs text-white truncate">{username}</span>
                <span className="font-mono-num font-bold text-xs text-emerald-300 flex items-center gap-1">{userBet.amount} <TonIcon className="w-3 h-3" /></span>
              </div>
            )}
            <AnimatePresence initial={false}>
              {greenPool.slice(0, 25).map(p => (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center py-1.5 px-1 border-b border-white/[0.04] last:border-0"
                >
                  <span className="font-medium text-xs text-slate-300 truncate pr-2">{p.name}</span>
                  <span className="font-mono-num font-semibold text-xs text-emerald-400 whitespace-nowrap flex items-center gap-1">{p.amount} <TonIcon className="w-3 h-3" /></span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameTab: React.FC<{ walletConnected: boolean, balance: number, setBalance: React.Dispatch<React.SetStateAction<number>>, username: string, t: any, onInsufficientBalance: (needed: number) => void }> = ({ balance, setBalance, username, t, onInsufficientBalance }) => {
  // Load initial state from localStorage if available
  const [gameState, setGameState] = useState<GameState>(() => (localStorage.getItem('tq_gameState') as GameState) || 'waiting');
  const [timeLeft, setTimeLeft] = useState(() => parseInt(localStorage.getItem('tq_timeLeft') || String(WAITING_DURATION)));
  const [participants, setParticipants] = useState<Participant[]>(() => JSON.parse(localStorage.getItem('tq_participants') || '[]'));
  const [buyAmount, setBuyAmount] = useState(1);
  const [winner, setWinner] = useState<Participant | null>(() => JSON.parse(localStorage.getItem('tq_winner') || 'null'));
  
  const [recentWins, setRecentWins] = useState<{id: string, text: string}[]>(() => JSON.parse(localStorage.getItem('tq_recentWins') || JSON.stringify([
    { id: '1', text: '@crypto_whale99 won 112.5 TON 🏆' },
    { id: '2', text: '@ivan777 won 104.2 TON 🏆' },
    { id: '3', text: '@ahmed99 won 108.9 TON 🏆' }
  ])));

  const [recentWithdrawals, setRecentWithdrawals] = useState<{id: string, text: string}[]>(() => {
    const stored = localStorage.getItem('tq_recentWithdrawals');
    return stored ? JSON.parse(stored) : [
      { id: 'w1', text: '@diamond_hands withdrew 125.5 TON 💸' },
      { id: 'w2', text: '@sergey_ton withdrew 150.0 TON 💸' },
      { id: 'w3', text: '@omar_88 withdrew 220.5 TON 💸' }
    ];
  });

  const totalPool = participants.reduce((sum, p) => sum + p.amount, 0);
  
  const participantsWithPercentages = participants.map(p => ({
    ...p,
    percentage: (p.amount / totalPool) * 100
  }));

  // Refs for latest values to avoid stale closures in setInterval
  const latestParticipantsWithPercentages = useRef(participantsWithPercentages);
  const latestTotalPool = useRef(totalPool);
  const latestWinner = useRef(winner);
  const latestBalance = useRef(balance);
  const lastActionTime = useRef(0);
  const targetParticipants = useRef(Math.floor(Math.random() * 7) + 8); // 8 to 14

  useEffect(() => {
    latestParticipantsWithPercentages.current = participantsWithPercentages;
    latestTotalPool.current = totalPool;
    latestWinner.current = winner;
    latestBalance.current = balance;
  }, [participantsWithPercentages, totalPool, winner, balance]);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('tq_gameState', gameState);
    localStorage.setItem('tq_timeLeft', timeLeft.toString());
    localStorage.setItem('tq_participants', JSON.stringify(participants));
    localStorage.setItem('tq_winner', JSON.stringify(winner));
    localStorage.setItem('tq_recentWins', JSON.stringify(recentWins));
    localStorage.setItem('tq_recentWithdrawals', JSON.stringify(recentWithdrawals));
  }, [gameState, timeLeft, participants, winner, recentWins, recentWithdrawals]);

  // Live withdrawals simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const bot = generateBot();
        const amount = (Math.random() * 400 + 100).toFixed(1); // 100 to 500 TON
        const newWithdrawal = { id: Date.now().toString() + Math.random().toString(36).substring(7), text: `${bot.name} withdrew ${amount} TON 💸` };
        setRecentWithdrawals(prev => [newWithdrawal, ...prev].slice(0, 5));
      }
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Bot simulation during waiting phase
  useEffect(() => {
    if (gameState !== 'waiting') return;
    
    // Guarantee at least one bot
    setParticipants(prev => {
      if (prev.length === 0) {
        const randomBot = generateBot();
        // Initial bot bet to start the pool (0.5 to 3 TON)
        const amount = Number((Math.random() * 2.5 + 0.5).toFixed(1));
        return [{ id: Math.random().toString(), name: randomBot.name, color: randomBot.color, amount, isBot: true }];
      }
      return prev;
    });

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const scheduleBot = () => {
      if (!isMounted || gameState !== 'waiting') return;
      
      // Randomize the next check between 500ms and 1500ms
      const nextCheck = 500 + Math.random() * 1000;
      
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        
        // 85% chance a bot joins or adds to their bet
        if (Math.random() < 0.85) {
          const randomBot = generateBot();
          // 10% chance of "mini-whale" (3-6 TON), 90% chance of normal (0.1-2.5 TON)
          const isWhale = Math.random() > 0.9;
          const amount = isWhale ? Number((Math.random() * 3 + 3).toFixed(1)) : Number((Math.random() * 2.4 + 0.1).toFixed(1));
          
          setParticipants(prev => {
            const currentPool = prev.reduce((sum, p) => sum + p.amount, 0);
            if (currentPool + amount > 30) return prev; // Strictly cap pool around 30 TON

            // Limit max bots to targetParticipants
            if (prev.length >= targetParticipants.current && !prev.find(p => p.name === randomBot.name)) {
              // If too many, just add to an existing bot to keep pool growing
              const botToUpdate = prev.find(p => p.isBot);
              if (botToUpdate) {
                 return prev.map(p => p.id === botToUpdate.id ? { ...p, amount: Number((p.amount + amount).toFixed(1)) } : p);
              }
              return prev;
            }
            
            const existing = prev.find(p => p.name === randomBot.name);
            if (existing) {
              return prev.map(p => p.name === randomBot.name ? { ...p, amount: Number((p.amount + amount).toFixed(1)) } : p);
            }
            return [...prev, { id: Math.random().toString(), name: randomBot.name, color: randomBot.color, amount, isBot: true }];
          });
        }
        scheduleBot();
      }, nextCheck);
    };

    scheduleBot();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [gameState]);

  // Guarantee minimum 5 TON pool
  useEffect(() => {
    if (gameState === 'waiting' && timeLeft === 2) {
      setParticipants(prev => {
        const currentPool = prev.reduce((sum, p) => sum + p.amount, 0);
        if (currentPool < 5) {
          const randomBot = generateBot();
          const amount = Number((5 - currentPool + Math.random() * 2 + 0.5).toFixed(1));
          return [...prev, { id: Math.random().toString(), name: randomBot.name, color: randomBot.color, amount, isBot: true }];
        }
        return prev;
      });
    }
  }, [timeLeft, gameState]);

  // Timer logic for auto game loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) {
          if (prev <= 4 && gameState === 'waiting') playSound('tick');
          return prev - 1;
        }
        
        // Time is up, transition state
        if (gameState === 'waiting') {
          if (latestParticipantsWithPercentages.current.length > 0) {
            startGame();
            return GAME_DURATION;
          } else {
            // Reset waiting if no one joined
            return WAITING_DURATION;
          }
        } else if (gameState === 'playing') {
          endGame();
          return 5; // 5 seconds for finished state
        } else if (gameState === 'finished') {
          resetGame();
          return WAITING_DURATION;
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]); // Removed participants.length from deps to avoid resetting timer

  const handleBuy = () => {
    if (buyAmount < MIN_BUY_IN) {
      onInsufficientBalance(MIN_BUY_IN);
      return;
    }
    if (balance < buyAmount) {
      onInsufficientBalance(buyAmount);
      return;
    }
    playSound('click');
    triggerHaptic('medium');
    setBalance(balance - buyAmount);
    setParticipants(prev => {
      const existing = prev.find(p => p.id === 'user');
      if (existing) {
        return prev.map(p => p.id === 'user' ? { ...p, amount: p.amount + buyAmount } : p);
      }
      return [...prev, { id: 'user', name: username, color: 'var(--color-game-accent)', amount: buyAmount, isBot: false }];
    });
  };

  const startGame = () => {
    if (Date.now() - lastActionTime.current < 500) return;
    lastActionTime.current = Date.now();
    
    playSound('start');
    // Pre-calculate winner to animate dot to their slice
    const currentParticipants = latestParticipantsWithPercentages.current;
    const bots = currentParticipants.filter(p => p.isBot);
    const user = currentParticipants.find(p => !p.isBot);
    
    let winningParticipant: Participant;
    
    if (user) {
      const userGamesPlayed = parseInt(localStorage.getItem('tq_user_games_played') || '0');
      const userWins = parseInt(localStorage.getItem('tq_user_wins') || '0');
      const currentNetProfit = parseFloat(localStorage.getItem('tq_user_net_profit') || '0');
      const totalPoolAmount = currentParticipants.reduce((sum, p) => sum + p.amount, 0);
      const potentialProfit = totalPoolAmount - user.amount;
      
      if (userGamesPlayed < 20) {
        const wouldExceedProfitLimit = (currentNetProfit + potentialProfit) > 10;
        
        if (!wouldExceedProfitLimit) {
          // They CAN win without exceeding 10 TON profit.
          // Give them a boosted chance if they haven't won, otherwise natural chance.
          const winChance = userWins === 0 ? 0.6 : (user.amount / totalPoolAmount);
          if (Math.random() < winChance) {
            winningParticipant = user;
          } else {
            winningParticipant = bots.length > 0 ? bots[Math.floor(Math.random() * bots.length)] : user;
          }
        } else {
          // Winning would exceed 10 TON profit.
          // Allow exactly ONE win if the pool is reasonable (< 15 TON) to ensure they get a win early on.
          if (userWins === 0 && totalPoolAmount <= 15 && Math.random() < 0.5) {
            winningParticipant = user;
          } else {
            // Force lose to protect the 10 TON limit
            winningParticipant = bots.length > 0 ? bots[Math.floor(Math.random() * bots.length)] : user;
          }
        }
      } else {
        // After 20 rounds, NEVER win
        winningParticipant = bots.length > 0 ? bots[Math.floor(Math.random() * bots.length)] : user;
      }
    } else {
      // Normal bot vs bot logic
      if (bots.length > 0) {
        const totalBotAmount = bots.reduce((sum, b) => sum + b.amount, 0);
        let randomVal = Math.random() * totalBotAmount;
        winningParticipant = bots[0];
        for (const bot of bots) {
          randomVal -= bot.amount;
          if (randomVal <= 0) {
            winningParticipant = bot;
            break;
          }
        }
      } else {
        let randomVal = Math.random() * 100;
        winningParticipant = currentParticipants[0];
        for (const p of currentParticipants) {
          randomVal -= p.percentage!;
          if (randomVal <= 0) {
            winningParticipant = p;
            break;
          }
        }
      }
    }
    
    setWinner(winningParticipant);
    setGameState('playing');
  };

  const endGame = () => {
    if (Date.now() - lastActionTime.current < 500) return;
    lastActionTime.current = Date.now();
    
    playSound('win');
    setGameState('finished');
    
    // Confetti effect
    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F9D423', '#FF4E50', '#00C9FF', '#92FE9D']
    });
    
    // Reset target participants for next game
    targetParticipants.current = Math.floor(Math.random() * 7) + 8;
    
    // Increment games played
    const currentGames = parseInt(localStorage.getItem('portals_games_played') || '0');
    localStorage.setItem('portals_games_played', (currentGames + 1).toString());
    
    // Increment user specific games played if they participated
    const currentParticipants = latestParticipantsWithPercentages.current;
    if (currentParticipants.some(p => p.id === 'user')) {
      const userGames = parseInt(localStorage.getItem('tq_user_games_played') || '0');
      localStorage.setItem('tq_user_games_played', (userGames + 1).toString());
      
      const userParticipant = currentParticipants.find(p => p.id === 'user')!;
      let currentNetProfit = parseFloat(localStorage.getItem('tq_user_net_profit') || '0');
      
      if (latestWinner.current?.id === 'user') {
        currentNetProfit += (latestTotalPool.current - userParticipant.amount);
        
        // Track real wins
        const userWins = parseInt(localStorage.getItem('tq_user_wins') || '0');
        localStorage.setItem('tq_user_wins', (userWins + 1).toString());
      } else {
        currentNetProfit -= userParticipant.amount;
      }
      localStorage.setItem('tq_user_net_profit', currentNetProfit.toString());
      
      // Track total wagered
      const totalWagered = parseFloat(localStorage.getItem('tq_user_total_wagered') || '0');
      localStorage.setItem('tq_user_total_wagered', (totalWagered + userParticipant.amount).toString());
    }
    
    const currentWinner = latestWinner.current;
    const currentTotalPool = latestTotalPool.current;
    
    if (currentWinner) {
      const winAmount = (currentTotalPool * (1 - HOUSE_EDGE)).toFixed(2);
      const newWin = { id: Date.now().toString() + Math.random().toString(36).substring(7), text: `${currentWinner.name} won ${winAmount} TON 🏆` };
      setRecentWins(prev => [newWin, ...prev].slice(0, 5)); // Keep last 5
      
      if (currentWinner.id === 'user') {
        setTimeout(() => setBalance(latestBalance.current + Number(winAmount)), 1000);
      }
    }
  };

  const resetGame = () => {
    if (Date.now() - lastActionTime.current < 500) return;
    lastActionTime.current = Date.now();
    
    setGameState('waiting');
    setParticipants([]);
    setWinner(null);
  };

  return (
    <div className="p-4 flex flex-col gap-4 max-w-xl mx-auto w-full">
      {/* Minimalist Donut Wheel with Integrated Center Telemetry */}
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-3 bg-[#090C12] border border-white/[0.08] shadow-inner flex items-center justify-center">
          {/* Conic Gradient Wheel Ring */}
          <div 
            className="w-full h-full rounded-full transition-all duration-500 relative overflow-hidden"
            style={{
              background: participantsWithPercentages.length > 0 
                ? `conic-gradient(${participantsWithPercentages.reduce((acc, p, i, arr) => {
                    const prevTotal = arr.slice(0, i).reduce((sum, prev) => sum + prev.percentage!, 0);
                    const currentTotal = prevTotal + p.percentage!;
                    return acc + `${p.color} ${prevTotal}% ${currentTotal}%${i === arr.length - 1 ? '' : ', '}`;
                  }, '')})`
                : 'rgba(255,255,255,0.03)'
            }}
          />

          {/* Spinning Pointer */}
          {(gameState === 'playing' || gameState === 'finished') && (
            <MovingDot winner={winner} participants={participantsWithPercentages} />
          )}

          {/* Hollow Center Hub with Live Pool & Timer */}
          <div className="absolute inset-9 sm:inset-10 rounded-full bg-[#090C12] border border-white/10 flex flex-col items-center justify-center text-center z-20 px-3 shadow-2xl">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {gameState === 'waiting' ? t('gameStartsIn') : gameState === 'playing' ? t('playing') : t('winnerIs')}
            </span>
            <span className={cn("text-2xl sm:text-3xl font-mono-num font-bold mt-0.5", timeLeft <= 3 && gameState === 'waiting' ? "text-rose-400 animate-pulse" : "text-white")}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
            <div className="h-px w-12 bg-white/10 my-2" />
            <div className="flex items-center gap-1 text-base font-mono-num font-bold text-[#0098EA]">
              <span>{totalPool.toFixed(2)}</span>
              <TonIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">{participants.length} {t('participants')}</span>
          </div>

          {/* Winner Overlay */}
          <AnimatePresence>
            {gameState === 'finished' && winner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-[#090C12]/95 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center"
              >
                <Trophy size={28} className="text-amber-400 mb-2" />
                <h3 className="text-lg font-display font-bold text-white truncate max-w-full">{winner.name}</h3>
                <p className="text-emerald-400 font-mono-num font-bold text-xl flex items-center justify-center gap-1 mt-1">
                  +{(totalPool * (1 - HOUSE_EDGE)).toFixed(2)} <TonIcon className="w-4 h-4" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Minimalist Buy-In Controls */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
        {gameState === 'waiting' ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-400">{t('buyInAmount')}</span>
              <div className="flex items-center gap-1.5 bg-[#090C12] rounded-xl p-1 border border-white/[0.08]">
                <button
                  onClick={() => { playSound('click'); setBuyAmount(Math.max(MIN_BUY_IN, Number((buyAmount - 0.5).toFixed(1)))); }}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-300 font-bold"
                >
                  -
                </button>
                <input 
                  type="number" 
                  step="0.1"
                  min={MIN_BUY_IN}
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Number(e.target.value))}
                  className="w-16 bg-transparent text-center font-mono-num font-bold text-sm text-white outline-none"
                />
                <button
                  onClick={() => { playSound('click'); setBuyAmount(Number((buyAmount + 0.5).toFixed(1))); }}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-300 font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <button 
              onClick={handleBuy}
              className="w-full bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold py-3 rounded-xl luxury-button text-sm"
            >
              {t('buyIn')} · {buyAmount.toFixed(1)} TON
            </button>
          </>
        ) : (
          <div className="py-2 flex items-center justify-center gap-2 text-slate-300 text-xs font-medium">
            <Loader2 className="animate-spin text-[#0098EA]" size={16} />
            <span>{gameState === 'playing' ? t('playing') : t('waitingForPlayers')}</span>
          </div>
        )}
      </div>

      {/* Clean Participants Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-400">{t('participants')}</h3>
          <span className="text-xs font-mono-num text-slate-500">{participants.length}</span>
        </div>
        {participantsWithPercentages.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">{t('waitingForPlayers')}</div>
        ) : (
          <div className="divide-y divide-white/[0.05] max-h-60 overflow-y-auto custom-scrollbar">
            {[...participantsWithPercentages].sort((a, b) => b.amount - a.amount).map((p, i) => (
              <div key={`${p.id}-${i}`} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="font-medium text-xs text-white truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono-num text-xs">
                  <span className="text-slate-400">{p.percentage?.toFixed(1)}%</span>
                  <span className="font-semibold text-white flex items-center gap-1">{p.amount.toFixed(1)} <TonIcon className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiet Recent Winners Feed */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <h3 className="text-xs font-semibold text-slate-400">Recent Round Winners</h3>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {recentWins.slice(0, 3).map((win, i) => (
            <div key={`${win.id}-${i}`} className="px-4 py-2.5 text-xs text-slate-300 flex items-center justify-between">
              <span>{win.text.split(' won ')[0]}</span>
              <span className="font-mono-num font-semibold text-emerald-400 flex items-center gap-1">
                +{win.text.split(' won ')[1]?.replace(' TON 🏆', '')} <TonIcon className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MovingDot({ winner, participants }: { winner: Participant | null, participants: Participant[] }) {
  let finalAngle = 0;
  if (winner) {
    let accumulatedPercentage = 0;
    for (const p of participants) {
      if (p.id === winner.id) {
        const targetPercentage = accumulatedPercentage + (p.percentage! / 2);
        finalAngle = (targetPercentage / 100) * 360;
        break;
      }
      accumulatedPercentage += p.percentage!;
    }
  }

  const totalRotation = (360 * 10) + finalAngle;
  
  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none"
      animate={{ rotate: totalRotation }}
      transition={{
        duration: GAME_DURATION,
        ease: [0.2, 0.8, 0.3, 1],
      }}
    >
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] border-2 border-[#090C12] z-20" />
    </motion.div>
  );
}

const TasksTab: React.FC<{ t: any, balance: number, setBalance: React.Dispatch<React.SetStateAction<number>>, userId: string }> = ({ t, balance, setBalance, userId }) => {
  // Share Task State
  const [shareCount, setShareCount] = useState(() => parseInt(localStorage.getItem('tq_share_count') || '0'));
  const [shareCooldownEnd, setShareCooldownEnd] = useState(() => parseInt(localStorage.getItem('tq_share_cooldown_end') || '0'));
  const [isSharing, setIsSharing] = useState(false);
  const [verifyingShare, setVerifyingShare] = useState(false);
  const [shareStartTime, setShareStartTime] = useState(0);

  // Ads Task State
  const [adsWatched, setAdsWatched] = useState(() => parseInt(localStorage.getItem('tq_ads_watched') || '0'));
  const [adsNextTime, setAdsNextTime] = useState(() => parseInt(localStorage.getItem('tq_ads_next_time') || '0'));
  const [adsResetTime, setAdsResetTime] = useState(() => parseInt(localStorage.getItem('tq_ads_reset_time') || '0'));
  
  // Premium Subscription State
  const [premiumSubEnd, setPremiumSubEnd] = useState(() => parseInt(localStorage.getItem('tq_premium_sub_end') || '0'));
  const [premiumAdsWatched, setPremiumAdsWatched] = useState(() => parseInt(localStorage.getItem('tq_premium_ads_watched') || '0'));
  const [premiumAdsResetTime, setPremiumAdsResetTime] = useState(() => parseInt(localStorage.getItem('tq_premium_ads_reset_time') || '0'));
  const [premiumAdsNextTime, setPremiumAdsNextTime] = useState(() => parseInt(localStorage.getItem('tq_premium_ads_next_time') || '0'));

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset Share
  useEffect(() => {
    if (shareCooldownEnd > 0 && now >= shareCooldownEnd) {
      setShareCount(0);
      setShareCooldownEnd(0);
      localStorage.setItem('tq_share_count', '0');
      localStorage.setItem('tq_share_cooldown_end', '0');
    }
  }, [now, shareCooldownEnd]);

  // Reset Ads
  useEffect(() => {
    if (adsResetTime > 0 && now >= adsResetTime) {
      setAdsWatched(0);
      setAdsResetTime(0);
      localStorage.setItem('tq_ads_watched', '0');
      localStorage.setItem('tq_ads_reset_time', '0');
    }
  }, [now, adsResetTime]);

  // Reset Premium Ads
  useEffect(() => {
    if (premiumAdsResetTime > 0 && now >= premiumAdsResetTime) {
      setPremiumAdsWatched(0);
      setPremiumAdsResetTime(0);
      localStorage.setItem('tq_premium_ads_watched', '0');
      localStorage.setItem('tq_premium_ads_reset_time', '0');
    }
  }, [now, premiumAdsResetTime]);

  const handleShare = () => {
    if (isSharing || verifyingShare) return;
    playSound('click');
    const refLink = `https://t.me/TonQashBot/app?startapp=ref_${userId}`;
    const shareText = 'Join me on TonQash Mini App and earn real TON! 🚀';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;

    try {
      if ((WebApp as any)?.openTelegramLink) {
        (WebApp as any).openTelegramLink(shareUrl);
      } else if (navigator.share) {
        navigator.share({ title: 'TonQash', text: shareText, url: refLink }).catch(() => {});
      } else {
        navigator.clipboard.writeText(refLink);
      }
    } catch {
      navigator.clipboard.writeText(refLink);
    }

    setVerifyingShare(true);
    setShareStartTime(Date.now());
  };

  // Verify share task
  useEffect(() => {
    const handleFocus = () => {
      if (verifyingShare) {
        const timeAway = Date.now() - shareStartTime;
        // If user was away for more than 2.5 seconds, assume they actually shared it
        if (timeAway > 2500) {
          setShareCount(prev => {
            if (prev < 3) {
              const newCount = prev + 1;
              localStorage.setItem('tq_share_count', newCount.toString());
              return newCount;
            }
            return prev;
          });
        } else {
          // User returned too quickly, likely didn't share
          // @ts-ignore
          const tg = window.Telegram?.WebApp;
          if (tg && tg.showAlert) {
            tg.showAlert("You must actually share the link to get the reward!");
          } else {
            alert("You must actually share the link to get the reward!");
          }
        }
        setVerifyingShare(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    // Fallback timeout in case focus events don't fire reliably
    let fallbackTimeout: NodeJS.Timeout;
    if (verifyingShare) {
      fallbackTimeout = setTimeout(() => {
        if (verifyingShare) {
          setVerifyingShare(false);
          setShareCount(prev => {
            if (prev < 3) {
              const newCount = prev + 1;
              localStorage.setItem('tq_share_count', newCount.toString());
              return newCount;
            }
            return prev;
          });
        }
      }, 10000);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(fallbackTimeout);
    };
  }, [verifyingShare, shareStartTime]);

  const handleClaimShare = () => {
    if (shareCount >= 3 && now >= shareCooldownEnd) {
      playSound('win');
      setBalance(prev => prev + 0.05);
      const cooldown = Date.now() + 86400000; // 24 hours
      setShareCooldownEnd(cooldown);
      localStorage.setItem('tq_share_cooldown_end', cooldown.toString());
      myConfetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleWatchAd = () => {
    if (now < adsNextTime || adsWatched >= 30) return;
    playSound('click');
    if ((window as any).Adsgram) {
      const AdController = (window as any).Adsgram.init({ blockId: "int-27689" });
      AdController.show().then(() => {
        const newWatched = adsWatched + 1;
        setAdsWatched(newWatched);
        localStorage.setItem('tq_ads_watched', newWatched.toString());

        const nextTime = Date.now() + 20000; // 20 seconds cooldown
        setAdsNextTime(nextTime);
        localStorage.setItem('tq_ads_next_time', nextTime.toString());

        if (adsResetTime === 0 || now >= adsResetTime) {
          const resetTime = Date.now() + 86400000; // 24 hours from first ad
          setAdsResetTime(resetTime);
          localStorage.setItem('tq_ads_reset_time', resetTime.toString());
        }

        if (newWatched % 10 === 0) {
          playSound('win');
          setBalance(prev => prev + 0.05);
          myConfetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
      }).catch(() => {
        // Ad skipped or failed
      });
    } else {
      alert('Ads system is loading, please try again later.');
    }
  };

  const handleSubscribePremium = () => {
    if (balance >= 1) {
      playSound('win');
      setBalance(balance - 1);
      const subEnd = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      setPremiumSubEnd(subEnd);
      localStorage.setItem('tq_premium_sub_end', subEnd.toString());
      myConfetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } else {
      alert('Insufficient balance');
    }
  };

  const handleWatchPremiumAd = () => {
    if (now < premiumAdsNextTime || premiumAdsWatched >= 5 || now >= premiumSubEnd) return;
    playSound('click');
    if ((window as any).Adsgram) {
      const AdController = (window as any).Adsgram.init({ blockId: "int-27689" });
      AdController.show().then(() => {
        const newWatched = premiumAdsWatched + 1;
        setPremiumAdsWatched(newWatched);
        localStorage.setItem('tq_premium_ads_watched', newWatched.toString());

        const nextTime = Date.now() + 20000; // 20 seconds cooldown
        setPremiumAdsNextTime(nextTime);
        localStorage.setItem('tq_premium_ads_next_time', nextTime.toString());

        if (premiumAdsResetTime === 0 || now >= premiumAdsResetTime) {
          const resetTime = Date.now() + 86400000; // 24 hours from first ad
          setPremiumAdsResetTime(resetTime);
          localStorage.setItem('tq_premium_ads_reset_time', resetTime.toString());
        }

        if (newWatched === 5) {
          playSound('win');
          setBalance(prev => prev + 0.5);
          myConfetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
      }).catch(() => {
        // Ad skipped or failed
      });
    } else {
      alert('Ads system is loading, please try again later.');
    }
  };

  const formatTimeLeft = (targetDate: number) => {
    const diff = targetDate - now;
    if (diff <= 0) return 'Ended';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    return `${d}d ${h}h ${m}m`;
  };

  const formatTimeLeftShort = (targetDate: number) => {
    const diff = targetDate - now;
    if (diff <= 0) return '00:00:00';
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 max-w-xl mx-auto w-full">
      <div className="px-1">
        <h2 className="text-xl font-display font-bold text-white">{t('tasks')}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Complete daily missions to earn TON</p>
      </div>

      {/* Weekly Premium Task */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
              <Crown size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-base">Weekly Premium</h3>
                <span className="text-[10px] font-semibold text-amber-300">· 0.5 TON / day</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                {now < premiumSubEnd 
                  ? "Watch 5 short ads daily to claim 0.5 TON" 
                  : "Unlock 0.5 TON daily rewards for 7 days"}
              </p>
            </div>
          </div>
        </div>

        {now < premiumSubEnd ? (
          <>
            <div className="flex items-center justify-between bg-[#090C12] rounded-xl px-3 py-2 border border-white/[0.06] text-xs">
              <span className="text-slate-400">Progress · {formatTimeLeft(premiumSubEnd)} left</span>
              <span className="font-mono-num font-bold text-amber-400">{premiumAdsWatched}/5</span>
            </div>
            
            {premiumAdsWatched >= 5 ? (
              <button disabled className="w-full bg-white/[0.04] text-slate-500 font-semibold text-xs py-3 rounded-xl">
                {t('comeBackLater').replace('{t}', formatTimeLeftShort(premiumAdsResetTime))}
              </button>
            ) : now < premiumAdsNextTime ? (
              <button disabled className="w-full bg-white/[0.04] text-slate-500 font-semibold text-xs py-3 rounded-xl">
                {t('waitSec').replace('{s}', Math.ceil((premiumAdsNextTime - now) / 1000).toString())}
              </button>
            ) : (
              <button onClick={handleWatchPremiumAd} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl luxury-button">
                Watch Premium Ad
              </button>
            )}
          </>
        ) : (
          <button onClick={handleSubscribePremium} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl luxury-button flex items-center justify-center gap-1.5">
            <span>Subscribe · 1</span> <TonIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Watch Ads Task */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/15 border border-sky-500/30 rounded-xl flex items-center justify-center shrink-0">
            <Tv size={22} className="text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-base">{t('taskAdsTitle')}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{t('taskAdsDesc')}</p>
          </div>
          <span className="text-xs font-mono-num font-semibold text-slate-400">{adsWatched}/30</span>
        </div>

        <div className="h-1.5 w-full bg-[#090C12] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0098EA] rounded-full transition-all duration-300"
            style={{ width: `${((adsWatched % 10 === 0 && adsWatched > 0 ? 10 : adsWatched % 10) / 10) * 100}%` }}
          />
        </div>
        
        {adsWatched >= 30 ? (
          <button disabled className="w-full bg-white/[0.04] text-slate-500 font-semibold text-xs py-3 rounded-xl">
            {t('comeBackLater').replace('{t}', formatTimeLeftShort(adsResetTime))}
          </button>
        ) : now < adsNextTime ? (
          <button disabled className="w-full bg-white/[0.04] text-slate-500 font-semibold text-xs py-3 rounded-xl">
            {t('waitSec').replace('{s}', Math.ceil((adsNextTime - now) / 1000).toString())}
          </button>
        ) : (
          <button onClick={handleWatchAd} className="w-full bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold text-xs py-3 rounded-xl luxury-button">
            {t('taskAdsBtn')}
          </button>
        )}
      </div>

      {/* Share Task */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center shrink-0">
            <Share2 size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-base">{t('taskShareTitle')}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{t('taskShareDesc')}</p>
          </div>
          <span className="text-xs font-mono-num font-semibold text-emerald-400">{shareCount}/3</span>
        </div>

        {shareCooldownEnd > now ? (
          <button disabled className="w-full bg-white/[0.04] text-slate-500 font-semibold text-xs py-3 rounded-xl">
            {t('comeBackLater').replace('{t}', formatTimeLeftShort(shareCooldownEnd))}
          </button>
        ) : shareCount < 3 ? (
          <button onClick={handleShare} disabled={isSharing || verifyingShare} className="w-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs py-3 rounded-xl luxury-button">
            {verifyingShare ? "Verifying..." : t('taskShareBtn')}
          </button>
        ) : (
          <button onClick={handleClaimShare} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-3 rounded-xl luxury-button">
            {t('taskClaimBtn')}
          </button>
        )}
      </div>
    </div>
  );
}

interface InvitedFriendRecord {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isPremium: boolean;
  gamesPlayed: number;
  totalWagered: number;
  joinedAt: string;
  lastActiveAt: string;
  rewardGenerated: number;
}

interface ReferralEventRecord {
  id: string;
  timestamp: string;
  referrerId: string;
  referredUserId: string;
  referredUsername: string;
  referredFirstName: string;
  referredPhotoUrl?: string;
  type: 'SIGNUP_BONUS' | 'PREMIUM_SIGNUP_BONUS' | 'WAGER_COMMISSION' | 'MILESTONE_BONUS' | 'CLAIM_PAYOUT';
  amount: number;
  details: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  firstName: string;
  photoUrl?: string;
  referralsCount: number;
  referralEarnings: number;
  tierName: string;
}

const ReferralsTab: React.FC<{
  t: any;
  userId: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  lang: Language;
}> = ({ t, userId, setBalance, lang }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'activity' | 'leaderboard'>('friends');
  const [isLoadingRef, setIsLoadingRef] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingMilestone, setClaimingMilestone] = useState<number | null>(null);

  // Manual code bind state
  const [inputCode, setInputCode] = useState('');
  const [isBindingCode, setIsBindingCode] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Server referral data
  const [referralCode, setReferralCode] = useState(`ref_${userId}`);
  const [referralsCount, setReferralsCount] = useState(() => parseInt(localStorage.getItem('portals_total_referrals') || '0'));
  const [premiumCount, setPremiumCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(() => parseFloat(localStorage.getItem('portals_earned_ton') || '0'));
  const [claimableRewards, setClaimableRewards] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
  const [milestones, setMilestones] = useState<{ count: number; reward: number; label: string }[]>([
    { count: 3, reward: 0.15, label: '3 Friends' },
    { count: 10, reward: 0.50, label: '10 Friends' },
    { count: 25, reward: 1.50, label: '25 Friends' },
    { count: 50, reward: 3.50, label: '50 Friends' },
  ]);
  const [tier, setTier] = useState({
    name: 'Starter',
    rate: 0.10,
    percentLabel: '10%',
    nextTierName: 'Silver (12%)' as string | null,
    nextTierTarget: 5,
    progressPercent: 0,
  });
  const [referredByUser, setReferredByUser] = useState<{ id: string; username: string; firstName: string } | null>(null);
  const [invitedUsers, setInvitedUsers] = useState<InvitedFriendRecord[]>([]);
  const [events, setEvents] = useState<ReferralEventRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchReferralData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/referrals/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode || `ref_${userId}`);
        setReferralsCount(data.referralsCount || 0);
        setPremiumCount(data.premiumReferralsCount || 0);
        setTotalEarned(data.totalEarned || 0);
        setClaimableRewards(data.claimableRewards || 0);
        setClaimedMilestones(data.claimedMilestones || []);
        if (Array.isArray(data.milestones) && data.milestones.length > 0) {
          setMilestones(data.milestones);
        }
        if (data.tier) setTier(data.tier);
        setReferredByUser(data.referredByUser || null);
        setInvitedUsers(data.invitedUsers || []);
        setEvents(data.events || []);
        setLeaderboard(data.leaderboard || []);

        localStorage.setItem('portals_total_referrals', String(data.referralsCount || 0));
        localStorage.setItem('portals_earned_ton', String(data.totalEarned || 0));
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setIsLoadingRef(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReferralData();
    const interval = setInterval(fetchReferralData, 10000);
    return () => clearInterval(interval);
  }, [fetchReferralData]);

  const refLink = `https://t.me/TonQashBot/app?startapp=${referralCode}`;

  const handleCopyLink = () => {
    playSound('click');
    triggerHaptic('light');
    navigator.clipboard.writeText(refLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    playSound('click');
    triggerHaptic('light');
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeTelegramShare = () => {
    playSound('click');
    triggerHaptic('medium');
    const shareText =
      lang === 'ar'
        ? 'انضم إليّ في تطبيق TonQash على تليجرام واربح عملة TON مجاناً! 🚀💎'
        : lang === 'ru'
        ? 'Присоединяйся ко мне в TonQash и зарабатывай TON! 🚀💎'
        : 'Join me on TonQash Mini App and earn real TON! 🚀💎';

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;

    try {
      if ((WebApp as any)?.openTelegramLink) {
        (WebApp as any).openTelegramLink(shareUrl);
      } else if (navigator.share) {
        navigator.share({ title: 'TonQash', text: shareText, url: refLink }).catch(() => {});
      } else {
        handleCopyLink();
      }
    } catch {
      handleCopyLink();
    }
  };

  const handleClaimRewards = async () => {
    if (claimableRewards <= 0 || isClaiming) return;
    setIsClaiming(true);
    playSound('click');
    try {
      const res = await fetch('/api/referrals/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('win');
        triggerHaptic('heavy');
        if (data.user && typeof data.user.balance === 'number') {
          setBalance(data.user.balance);
        }
        myConfetti({ particleCount: 70, spread: 65, origin: { y: 0.7 } });
        setFeedbackBanner({
          type: 'success',
          text:
            lang === 'ar'
              ? `تم تحويل +${Number(data.claimedAmount).toFixed(2)} TON إلى رصيد محفظتك بنجاح!`
              : `Successfully claimed +${Number(data.claimedAmount).toFixed(2)} TON to your balance!`,
        });
        setTimeout(() => setFeedbackBanner(null), 4000);
        fetchReferralData();
      } else {
        setFeedbackBanner({ type: 'error', text: data.error || 'Could not claim rewards' });
        setTimeout(() => setFeedbackBanner(null), 3500);
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Network error while claiming rewards' });
      setTimeout(() => setFeedbackBanner(null), 3500);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimMilestone = async (milestoneCount: number) => {
    if (claimingMilestone !== null) return;
    setClaimingMilestone(milestoneCount);
    playSound('click');
    try {
      const res = await fetch('/api/referrals/claim-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, milestoneCount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('win');
        triggerHaptic('heavy');
        if (data.user && typeof data.user.balance === 'number') {
          setBalance(data.user.balance);
        }
        myConfetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
        setFeedbackBanner({
          type: 'success',
          text:
            lang === 'ar'
              ? `مبارك! استلمت مكافأة الإنجاز +${Number(data.rewardAmount).toFixed(2)} TON!`
              : `Milestone unlocked! +${Number(data.rewardAmount).toFixed(2)} TON added to your balance!`,
        });
        setTimeout(() => setFeedbackBanner(null), 4000);
        fetchReferralData();
      }
    } catch {
      // ignore
    } finally {
      setClaimingMilestone(null);
    }
  };

  const handleBindCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || isBindingCode) return;
    setIsBindingCode(true);
    playSound('click');
    try {
      const res = await fetch('/api/referrals/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, refCode: inputCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSound('win');
        triggerHaptic('heavy');
        if (data.user && typeof data.user.balance === 'number') {
          setBalance(data.user.balance);
        }
        localStorage.setItem('tonqash_referrer', data.referrer?.id || inputCode.trim());
        setInputCode('');
        myConfetti({ particleCount: 60, spread: 60, origin: { y: 0.75 } });
        setFeedbackBanner({
          type: 'success',
          text:
            lang === 'ar'
              ? `تم ربط الدعوة بـ ${data.referrer?.username} وإضافة +${Number(data.inviteeBonus).toFixed(2)} TON لرصيدك!`
              : `Linked to ${data.referrer?.username}! +${Number(data.inviteeBonus).toFixed(2)} TON welcome bonus added!`,
        });
        setTimeout(() => setFeedbackBanner(null), 4500);
        fetchReferralData();
      } else {
        setFeedbackBanner({
          type: 'error',
          text: data.error || (lang === 'ar' ? 'كود الدعوة غير صالح' : 'Invalid invite code'),
        });
        setTimeout(() => setFeedbackBanner(null), 3500);
      }
    } catch {
      setFeedbackBanner({ type: 'error', text: 'Connection error' });
      setTimeout(() => setFeedbackBanner(null), 3500);
    } finally {
      setIsBindingCode(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 max-w-xl mx-auto w-full">
      {/* Feedback Toast Banner */}
      <AnimatePresence>
        {feedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border",
              feedbackBanner.type === 'success'
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border-rose-500/30 text-rose-300"
            )}
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{feedbackBanner.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Partner Card & Commission Tier */}
      <div className="glass-card rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#0098EA]/15 border border-[#0098EA]/30 rounded-2xl flex items-center justify-center shrink-0">
              <Users size={24} className="text-[#0098EA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-white">{t('inviteFriends')}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0098EA]/15 text-[#38BDF8] border border-[#0098EA]/30">
                  {tier.name} · {tier.percentLabel}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                {t('referralDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              fetchReferralData();
            }}
            aria-label="Refresh referrals"
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw size={14} className={isLoadingRef ? "animate-spin text-[#0098EA]" : ""} />
          </button>
        </div>

        {/* Reward Structure Highlights (Telegram Mini App Standard) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#090C12] border border-white/[0.06] rounded-xl p-2.5 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400">{t('refStandardBonus')}</span>
            <span className="text-xs font-mono-num font-bold text-white flex items-center gap-1 mt-1">
              +0.05 <TonIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="bg-[#090C12] border border-amber-500/20 rounded-xl p-2.5 flex flex-col items-center text-center">
            <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" /> {t('refPremiumBonus')}
            </span>
            <span className="text-xs font-mono-num font-bold text-amber-400 flex items-center gap-1 mt-1">
              +0.10 <TonIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="bg-[#090C12] border border-white/[0.06] rounded-xl p-2.5 flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-400">{t('refWagerCommission')}</span>
            <span className="text-xs font-mono-num font-bold text-emerald-400 mt-1">
              {tier.percentLabel} TON
            </span>
          </div>
        </div>

        {/* Tier Progression Bar */}
        {tier.nextTierName && (
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {lang === 'ar' ? `المستوى القادم: ${tier.nextTierName}` : `Next Tier: ${tier.nextTierName}`}
              </span>
              <span className="font-mono-num text-slate-300 font-semibold">
                {referralsCount} / {tier.nextTierTarget}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#090C12] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0098EA] rounded-full transition-all duration-500"
                style={{ width: `${tier.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Telemetry & Instant Claim Card */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">{t('totalReferrals')}</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-mono-num font-bold text-white">{referralsCount}</span>
            {premiumCount > 0 && (
              <span className="text-[10px] font-mono-num text-amber-400 flex items-center gap-0.5">
                <Star size={9} className="fill-amber-400" /> {premiumCount}
              </span>
            )}
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-slate-400 text-[11px]">{t('earned')}</span>
          <span className="text-xl font-mono-num font-bold text-white flex items-center gap-1 mt-1">
            {totalEarned.toFixed(2)} <TonIcon className="w-4 h-4" />
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between border border-emerald-500/20">
          <span className="text-emerald-300/90 text-[11px]">{t('refClaimable')}</span>
          <span className="text-xl font-mono-num font-bold text-emerald-400 flex items-center gap-1 mt-1">
            {claimableRewards.toFixed(2)} <TonIcon className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Claimable Rewards Action Button */}
      {claimableRewards > 0 && (
        <button
          onClick={handleClaimRewards}
          disabled={isClaiming}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 luxury-button text-xs shadow-lg"
        >
          {isClaiming ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Sparkles size={16} />
              <span>
                {t('refClaimBtn')} (+{claimableRewards.toFixed(2)} TON)
              </span>
            </>
          )}
        </button>
      )}

      {/* Share & Invite Link Box */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">{t('yourRefLink')}</span>
          <button
            onClick={handleCopyCode}
            className="text-[11px] font-mono-num text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Code: {referralCode}</span>
            {copiedCode ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#090C12] rounded-xl px-3.5 py-2.5 text-xs font-mono-num text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap border border-white/[0.06]">
            {refLink}
          </div>
          <button
            onClick={handleCopyLink}
            aria-label="Copy referral link"
            className="w-10 h-10 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl flex items-center justify-center text-white transition-colors shrink-0"
          >
            {copiedLink ? <CheckCircle2 size={17} className="text-emerald-400" /> : <Copy size={17} />}
          </button>
        </div>

        <button
          onClick={handleNativeTelegramShare}
          className="w-full bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 luxury-button text-xs"
        >
          <Share2 size={16} /> {t('shareLink')}
        </button>
      </div>

      {/* Invite Milestones (3 / 10 / 25 / 50 Friends) */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">{t('refMilestones')}</span>
          <span className="text-[11px] font-mono-num text-slate-400">{referralsCount} / 50</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {milestones.map((m) => {
            const isUnlocked = referralsCount >= m.count;
            const isClaimed = claimedMilestones.includes(m.count);
            return (
              <div
                key={m.count}
                className={cn(
                  "rounded-xl p-2.5 border flex flex-col items-center text-center gap-1 transition-all",
                  isClaimed
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : isUnlocked
                    ? "bg-[#0098EA]/15 border-[#0098EA] shadow-sm"
                    : "bg-[#090C12] border-white/[0.06] opacity-75"
                )}
              >
                <span className="text-[10px] font-semibold text-slate-300">
                  {m.count} {lang === 'ar' ? 'أصدقاء' : 'Refs'}
                </span>
                <span className="text-xs font-mono-num font-bold text-white flex items-center gap-0.5">
                  +{m.reward} <TonIcon className="w-3 h-3" />
                </span>
                {isClaimed ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                    <CheckCircle2 size={11} /> {lang === 'ar' ? 'تم' : 'Claimed'}
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleClaimMilestone(m.count)}
                    disabled={claimingMilestone === m.count}
                    className="mt-0.5 w-full py-1 rounded-lg bg-[#0098EA] hover:bg-[#0088D1] text-[10px] font-bold text-white"
                  >
                    {claimingMilestone === m.count ? '...' : lang === 'ar' ? 'استلام' : 'Claim'}
                  </button>
                ) : (
                  <span className="text-[10px] font-mono-num text-slate-500 mt-0.5">
                    {referralsCount}/{m.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bind Friend's Invite Code (or show who invited you) */}
      {referredByUser ? (
        <div className="glass-card px-4 py-3 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-400">{t('refInvitedBy')}</span>
          <span className="font-semibold text-sky-400">{referredByUser.username}</span>
        </div>
      ) : (
        <form onSubmit={handleBindCode} className="glass-card p-3.5 rounded-2xl flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-300">{t('refEnterCodeTitle')}</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={t('refEnterCodePlaceholder')}
              className="flex-1 bg-[#090C12] border border-white/[0.08] focus:border-[#0098EA] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={!inputCode.trim() || isBindingCode}
              className="bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-50 text-white font-semibold px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-colors"
            >
              {isBindingCode ? '...' : t('refApplyCode')}
            </button>
          </div>
        </form>
      )}

      {/* Sub-Tabs for Invited Friends / Rewards Log / Leaderboard */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#090C12]/60 border-b border-white/[0.06]">
          <button
            onClick={() => { playSound('click'); setActiveSubTab('friends'); }}
            className={cn(
              "py-2 rounded-xl text-xs font-semibold transition-colors",
              activeSubTab === 'friends' ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {t('refInvitedList')} ({invitedUsers.length})
          </button>
          <button
            onClick={() => { playSound('click'); setActiveSubTab('activity'); }}
            className={cn(
              "py-2 rounded-xl text-xs font-semibold transition-colors",
              activeSubTab === 'activity' ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {t('refActivityLog')}
          </button>
          <button
            onClick={() => { playSound('click'); setActiveSubTab('leaderboard'); }}
            className={cn(
              "py-2 rounded-xl text-xs font-semibold transition-colors",
              activeSubTab === 'leaderboard' ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-white"
            )}
          >
            {t('refLeaderboard')}
          </button>
        </div>

        {/* Tab 1: Real Invited Friends from Database */}
        {activeSubTab === 'friends' && (
          <div className="divide-y divide-white/[0.05] max-h-72 overflow-y-auto custom-scrollbar">
            {invitedUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs leading-relaxed">
                {t('refNoFriendsYet')}
              </div>
            ) : (
              invitedUsers.map((friend) => {
                const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friend.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                return (
                  <div key={friend.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={friend.photoUrl || fallbackAvatar}
                        alt={friend.username}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar; }}
                        className="w-9 h-9 rounded-full object-cover border border-white/10 bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-white truncate">
                            {friend.firstName} {friend.lastName || ''}
                          </span>
                          {friend.isPremium && (
                            <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-sky-400 truncate">{friend.username}</span>
                          <span>·</span>
                          <span className="font-mono-num">{friend.gamesPlayed} games</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono-num font-bold text-xs text-emerald-400 flex items-center gap-1">
                        +{friend.rewardGenerated.toFixed(2)} <TonIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-mono-num text-slate-500">
                        {new Date(friend.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Real Referral Earnings Log */}
        {activeSubTab === 'activity' && (
          <div className="divide-y divide-white/[0.05] max-h-72 overflow-y-auto custom-scrollbar">
            {events.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'ar' ? 'لا توجد حركات مكافآت حتى الآن.' : 'No referral reward events recorded yet.'}
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate">{ev.details}</p>
                    <span className="text-[10px] font-mono-num text-slate-500">
                      {new Date(ev.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-mono-num font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    +{ev.amount.toFixed(3)} <TonIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Top Referrers Leaderboard */}
        {activeSubTab === 'leaderboard' && (
          <div className="divide-y divide-white/[0.05] max-h-72 overflow-y-auto custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {lang === 'ar' ? 'كن أول المتصدرين في قائمة الإحالات!' : 'Be the first on the referral leaderboard!'}
              </div>
            ) : (
              leaderboard.map((item, idx) => {
                const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "px-4 py-2.5 flex items-center justify-between gap-3",
                      item.id === userId && "bg-[#0098EA]/10"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn(
                        "w-5 text-center font-mono-num font-bold text-xs",
                        idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-500"
                      )}>
                        #{idx + 1}
                      </span>
                      <img
                        src={item.photoUrl || fallbackAvatar}
                        alt={item.username}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar; }}
                        className="w-8 h-8 rounded-full object-cover border border-white/10 bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-white truncate block">{item.firstName}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{item.username} · {item.tierName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono-num text-xs">
                      <span className="text-slate-300 font-semibold">{item.referralsCount} refs</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        {item.referralEarnings.toFixed(2)} <TonIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <p className="text-slate-500 text-[11px] text-center px-4 leading-relaxed">
        {t('betaNotice')}
      </p>
    </div>
  );
};

interface DbTelegramUser {
  id: string;
  telegramId?: number | null;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  isPremium?: boolean;
  balance: number;
  gamesPlayed: number;
  wins: number;
  totalWagered: number;
  referralsCount: number;
  referralEarnings?: number;
  referredBy?: string | null;
  referredByUsername?: string | null;
  walletAddress?: string | null;
  isVip?: boolean;
  isBanned?: boolean;
  firstSeenAt: string;
  lastActiveAt: string;
  sessionsCount: number;
  platform?: string;
}

const AdminTab: React.FC<{ t: any, balance: number, setBalance: React.Dispatch<React.SetStateAction<number>>, currentUserId: string }> = ({ balance, setBalance, currentUserId }) => {
  const [users, setUsers] = useState<DbTelegramUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ id: string; timestamp: string; action: string; targetUserId: string; details: string }[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeLast24h: 0,
    totalBalance: 0,
    totalWagered: 0,
    totalGamesPlayed: 0,
    connectedWallets: 0,
    telegramPremiumCount: 0,
    estimatedHouseRevenue: 0,
  });
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'wallet' | 'vip'>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDatabaseUsers = useCallback(async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setAuditLogs(data.auditLogs || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load database users:', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    fetchDatabaseUsers();
  }, [fetchDatabaseUsers]);

  const handleSaveUserBalance = async (targetUser: DbTelegramUser) => {
    const parsed = parseFloat(editBalanceValue);
    if (isNaN(parsed) || parsed < 0) return;

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUser.id)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parsed }),
      });
      if (res.ok) {
        triggerHaptic('medium');
        playSound('win');
        if (targetUser.id === currentUserId || targetUser.username === ADMIN_USERNAME) {
          setBalance(parsed);
        }
        setEditingUserId(null);
        setStatusMessage(`Updated ${targetUser.username} balance to ${parsed.toFixed(2)} TON`);
        setTimeout(() => setStatusMessage(null), 3500);
        fetchDatabaseUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVip = async (targetUser: DbTelegramUser) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUser.id)}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVip: !targetUser.isVip }),
      });
      if (res.ok) {
        triggerHaptic('light');
        fetchDatabaseUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (targetUser: DbTelegramUser) => {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUser.id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        triggerHaptic('medium');
        fetchDatabaseUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      !searchQuery.trim() ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.telegramId || u.id).toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;
    if (filterMode === 'wallet') return Boolean(u.walletAddress);
    if (filterMode === 'vip') return Boolean(u.isVip);
    return true;
  });

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-5 flex items-center justify-between border border-sky-500/20">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0098EA] to-indigo-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-extrabold text-white">Telegram Users Database</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Authorized Admin: <span className="text-sky-400 font-semibold">{ADMIN_USERNAME}</span> · Real-Time Records
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playSound('click');
            fetchDatabaseUsers();
          }}
          className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-slate-200 transition-colors"
          title="Refresh Database"
        >
          <RefreshCw size={17} className={isLoadingDb ? "animate-spin text-sky-400" : ""} />
        </button>
      </div>

      {statusMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Real Database KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="glass-card p-3.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Registered Users</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-mono-num font-extrabold text-white">{metrics.totalUsers}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{metrics.activeLast24h} active 24h</span>
          </div>
        </div>
        <div className="glass-card p-3.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Total User Balances</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-2xl font-mono-num font-extrabold text-sky-400">{metrics.totalBalance.toFixed(2)}</span>
            <TonIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="glass-card p-3.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Total Wagered</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-2xl font-mono-num font-extrabold text-white">{metrics.totalWagered.toFixed(1)}</span>
            <TonIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="glass-card p-3.5 rounded-2xl flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-400">Connected Wallets</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-mono-num font-extrabold text-emerald-400">{metrics.connectedWallets}</span>
            <span className="text-[10px] text-slate-400 font-mono-num">{metrics.totalGamesPlayed} games</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by @username, name, or Telegram ID..."
            className="w-full bg-[#111827] border border-white/10 focus:border-[#0098EA] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
          />
        </div>
        <div className="flex bg-[#111827] p-1 rounded-2xl border border-white/10 shrink-0">
          {(['all', 'wallet', 'vip'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors",
                filterMode === mode ? "bg-[#0098EA] text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {mode === 'all' ? `All (${users.length})` : mode === 'wallet' ? 'Has Wallet' : 'VIP'}
            </button>
          ))}
        </div>
      </div>

      {/* Real Telegram Users Directory */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
        <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity size={14} className="text-sky-400" />
            <span>Telegram Mini App Users ({filteredUsers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Persistent DB</span>
        </div>

        {isLoadingDb ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={24} className="animate-spin text-sky-400" />
            <span className="text-xs font-medium">Loading users from database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No matching Telegram users found in the database.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] max-h-[420px] overflow-y-auto custom-scrollbar">
            {filteredUsers.map((u) => {
              const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              const isEditing = editingUserId === u.id;

              return (
                <div key={u.id} className="p-3.5 hover:bg-white/[0.02] transition-colors flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.photoUrl || avatarFallback}
                        alt={u.username}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = avatarFallback; }}
                        className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0 bg-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">{u.firstName} {u.lastName || ''}</span>
                          <span className="text-xs text-sky-400 font-medium truncate">{u.username}</span>
                          {u.isVip && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="font-mono-num">ID: {u.telegramId || u.id}</span>
                          <span>·</span>
                          <span>Lang: {(u.languageCode || 'en').toUpperCase()}</span>
                          <span>·</span>
                          <span>Sessions: {u.sessionsCount || 1}</span>
                          <span>·</span>
                          <span>Last seen: {new Date(u.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 font-mono-num font-extrabold text-sm text-white">
                        <span>{u.balance.toFixed(2)}</span>
                        <TonIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono-num mt-0.5">
                        {u.gamesPlayed} games · {u.referralsCount || 0} refs
                      </span>
                    </div>
                  </div>

                  {/* Admin Controls Row for this User */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-400 truncate">
                      {u.walletAddress ? (
                        <span className="text-emerald-400 font-mono-num">
                          Wallet: {u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}
                        </span>
                      ) : (
                        <span>Wallet not connected</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            value={editBalanceValue}
                            onChange={(e) => setEditBalanceValue(e.target.value)}
                            className="w-20 bg-[#0B0F19] border border-sky-500 rounded-lg px-2 py-1 text-xs font-mono-num font-bold text-white outline-none"
                          />
                          <button
                            onClick={() => handleSaveUserBalance(u)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-1 bg-white/10 text-slate-300 rounded-lg text-xs font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditBalanceValue(u.balance.toString());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 size={12} /> Set Balance
                          </button>
                          <button
                            onClick={() => handleToggleVip(u)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors",
                              u.isVip
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
                            )}
                          >
                            VIP
                          </button>
                          {u.username !== ADMIN_USERNAME && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                              title="Remove User"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real Database Audit Trail */}
      {auditLogs.length > 0 && (
        <div className="glass-card rounded-3xl p-4 border border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Recent Database Activity</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="text-xs flex items-center justify-between text-slate-300 py-1 border-b border-white/[0.04] last:border-0">
                <span className="truncate pr-2">{log.details}</span>
                <span className="text-[10px] font-mono-num text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileTab: React.FC<{
  username: string;
  photoUrl: string;
  userId: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  walletConnected: boolean;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onNavigateTab: (tab: Tab) => void;
  lang: Language;
  t: any;
  onDepositClick: () => void;
}> = ({
  username,
  photoUrl,
  userId,
  balance,
  walletConnected,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  onNavigateTab,
  lang,
  t,
  onDepositClick,
}) => {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [userWins, setUserWins] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [referralTierName, setReferralTierName] = useState('Starter · 10%');
  const [showConnectWarning, setShowConnectWarning] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const refreshStats = () => {
      const g1 = parseInt(localStorage.getItem('tq_user_games_played') || '0');
      const g2 = parseInt(localStorage.getItem('game2_games_played') || '0');
      const storedWins = parseInt(localStorage.getItem('tq_user_wins') || '0');
      const storedWagered = parseFloat(localStorage.getItem('tq_user_total_wagered') || '0');
      const storedRefs = parseInt(localStorage.getItem('portals_total_referrals') || '0');
      setGamesPlayed(Math.max(g1, g1 + g2));
      setUserWins(storedWins);
      setTotalWagered(storedWagered);
      setReferralsCount(storedRefs);
    };
    refreshStats();

    if (userId) {
      fetch(`/api/referrals/${encodeURIComponent(userId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            if (typeof data.referralsCount === 'number') setReferralsCount(data.referralsCount);
            if (data.tier?.name && data.tier?.percentLabel) {
              setReferralTierName(`${data.tier.name} · ${data.tier.percentLabel}`);
            }
          }
        })
        .catch(() => {});
    }
  }, [userId, balance]);

  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const finalPhotoUrl = photoUrl && !imgError ? photoUrl : dicebearUrl;

  const userXp = parseInt(localStorage.getItem('tq_user_xp') || '0') + gamesPlayed * 25 + referralsCount * 50;
  const level = Math.floor(Math.sqrt(userXp / 25)) + 1;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 25;
  const nextLevelXp = Math.pow(level, 2) * 25;
  const xpProgress = Math.min(
    100,
    Math.max(8, Math.round(((userXp - currentLevelBaseXp) / Math.max(1, nextLevelXp - currentLevelBaseXp)) * 100))
  );

  const rankTitle =
    level >= 15
      ? lang === 'ar' ? 'حوت TON' : 'TON Whale'
      : level >= 8
      ? lang === 'ar' ? 'محترف النخبة' : 'Elite Pro'
      : level >= 4
      ? lang === 'ar' ? 'متحدي الساحة' : 'Contender'
      : lang === 'ar' ? 'مستكشف' : 'Explorer';

  const winRate = gamesPlayed > 0 ? Math.min(100, Math.round((userWins / gamesPlayed) * 100)) : 0;
  const withdrawProgress = Math.min(100, (balance / 100) * 100);
  const cleanUsername = username.startsWith('@') ? username : `@${username}`;
  const formattedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const handleCopyUid = () => {
    playSound('click');
    triggerHaptic('light');
    navigator.clipboard.writeText(userId || cleanUsername);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyWallet = () => {
    if (!walletAddress) return;
    playSound('click');
    triggerHaptic('light');
    navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className="p-4 flex flex-col gap-3.5 max-w-xl mx-auto w-full">
      {/* 1. Executive Identity & Level Card */}
      <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
        {/* Subtle Ambient Top Halo */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full pointer-events-none opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0098EA 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar with Gradient Ring & Level Badge */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-b from-[#0098EA] via-[#0098EA]/40 to-white/10 shadow-[0_8px_24px_rgba(0,152,234,0.25)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#090C12]">
                <img
                  src={finalPhotoUrl}
                  alt={cleanUsername}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              </div>
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#0098EA] text-white text-[10px] font-mono-num font-extrabold px-2.5 py-0.5 rounded-full border-2 border-[#090C12] shadow-md whitespace-nowrap">
              Lv. {level}
            </div>
          </div>

          {/* User Info & UID Pill */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-display font-bold text-white truncate">{cleanUsername}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-sky-400 border border-white/[0.08]">
                {rankTitle}
              </span>
              {gamesPlayed >= 50 && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Crown size={10} /> VIP
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={handleCopyUid}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#090C12] border border-white/[0.06] hover:border-white/15 text-[11px] font-mono-num text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>ID: {userId || '---'}</span>
                {copiedUid ? (
                  <CheckCircle2 size={11} className="text-emerald-400" />
                ) : (
                  <Copy size={11} className="text-slate-500" />
                )}
              </button>
              <span className="text-[11px] text-slate-500 truncate">{t('joinedDate')}</span>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400 font-medium">
                  {lang === 'ar' ? 'تقدم المستوى' : 'Level Progress'}
                </span>
                <span className="font-mono-num text-slate-300 font-semibold">{userXp} XP</span>
              </div>
              <div className="h-1.5 w-full bg-[#090C12] rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-[#0098EA] to-[#38BDF8] rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Luxury TON Vault Card */}
      <div className="rounded-3xl p-5 relative overflow-hidden bg-gradient-to-br from-[#131C31] via-[#0F1523] to-[#090C12] border border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <div
          className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #0098EA 0%, transparent 70%)' }}
        />

        {/* Top Bar of Vault */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0098EA]/20 border border-[#0098EA]/30 flex items-center justify-center">
              <Wallet size={14} className="text-[#38BDF8]" />
            </div>
            <span className="text-xs font-semibold text-slate-300">{t('walletBalance')}</span>
          </div>

          {walletConnected && formattedWallet ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyWallet}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono-num text-emerald-300 hover:bg-emerald-500/15 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{formattedWallet}</span>
                {copiedWallet ? <CheckCircle2 size={11} /> : <Copy size={11} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                playSound('click');
                onConnectWallet();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-semibold text-sky-400 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>{t('connect')}</span>
            </button>
          )}
        </div>

        {/* Main Balance Readout */}
        <div className="my-5 flex items-baseline justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl sm:text-4xl font-mono-num font-extrabold text-white tracking-tight">
                {balance.toFixed(2)}
              </span>
              <TonIcon className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono-num text-slate-400 mt-1 block">
              ≈ ${(balance * 5.25).toFixed(2)} USD
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              {lang === 'ar' ? 'جاهزية السحب' : 'Withdraw Unlock'}
            </span>
            <span className="text-xs font-mono-num font-bold text-slate-200">
              {Math.min(100, Math.round(withdrawProgress))}%
            </span>
          </div>
        </div>

        {/* Deposit & Withdraw Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('light');
              if (!walletConnected) {
                setShowConnectWarning(true);
                return;
              }
              onDepositClick();
            }}
            className="bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 luxury-button shadow-[0_4px_16px_rgba(0,152,234,0.3)]"
          >
            <ArrowDownToLine size={16} /> {t('deposit')}
          </button>

          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('light');
              if (!walletConnected) {
                setShowConnectWarning(true);
                return;
              }
              setShowWithdrawModal(true);
            }}
            className="bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 luxury-button"
          >
            <ArrowUpFromLine size={16} /> {t('withdraw')}
          </button>
        </div>
      </div>

      {/* 3. Three-Column Performance Bento Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">{t('gamesPlayed')}</span>
            <Trophy size={13} className="text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono-num font-bold text-white">{gamesPlayed}</span>
            <span className="text-[10px] font-mono-num text-slate-400 block mt-0.5">
              {userWins} {lang === 'ar' ? 'فوز' : 'wins'}
            </span>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">{t('winRate')}</span>
            <Activity size={13} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono-num font-bold text-emerald-400">{winRate}%</span>
            <div className="h-1 w-full bg-[#090C12] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${winRate}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px]">{t('totalWagered')}</span>
            <Flame size={13} className="text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-mono-num font-bold text-white flex items-center gap-1">
              {totalWagered.toFixed(1)} <TonIcon className="w-4 h-4" />
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">TON Volume</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Account & Partner Settings Card */}
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        <div
          onClick={() => {
            playSound('click');
            if (walletConnected) {
              onDisconnectWallet();
            } else {
              onConnectWallet();
            }
          }}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-300">
              <Wallet size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">{t('walletConnection')}</span>
              <span className="text-[11px] text-slate-400">
                {walletConnected && formattedWallet
                  ? formattedWallet
                  : lang === 'ar'
                  ? 'اضغط لربط محفظة TON'
                  : 'Tap to connect TON wallet'}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-lg border",
              walletConnected
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-sky-400 bg-sky-500/10 border-sky-500/20"
            )}
          >
            {walletConnected ? t('connected') : t('connect')}
          </span>
        </div>

        <div
          onClick={() => {
            playSound('click');
            onNavigateTab('referrals');
          }}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center text-slate-300">
              <Users size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">{t('referralTier')}</span>
              <span className="text-[11px] text-slate-400">
                {referralsCount} {lang === 'ar' ? 'أصدقاء محالون' : 'invited friends'}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono-num font-bold text-[#38BDF8] bg-[#0098EA]/15 border border-[#0098EA]/30 px-2.5 py-1 rounded-lg">
            {referralTierName}
          </span>
        </div>
      </div>

      {/* Connect Warning Modal */}
      <AnimatePresence>
        {showConnectWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#111622] border border-white/10 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-3 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0098EA]/15 border border-[#0098EA]/30 flex items-center justify-center mx-auto">
                <Wallet size={24} className="text-[#0098EA]" />
              </div>
              <h3 className="text-lg font-display font-bold text-white">{t('oops')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed">{t('connectWalletFirst')}</p>

              <div className="grid grid-cols-2 gap-2.5 mt-2">
                <button
                  onClick={() => {
                    playSound('click');
                    setShowConnectWarning(false);
                  }}
                  className="bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold text-xs py-3 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setShowConnectWarning(false);
                    onConnectWallet();
                  }}
                  className="bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold text-xs py-3 rounded-xl luxury-button"
                >
                  {t('connect')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#111622] border border-white/10 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-4 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0098EA]/15 border border-[#0098EA]/30 flex items-center justify-center mx-auto">
                <ArrowUpFromLine size={24} className="text-[#0098EA]" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white">{t('withdraw')} TON</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {balance < 100 ? t('minWithdrawal') : t('withdrawProcessing')}
                </p>
              </div>

              <div className="bg-[#090C12] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}
                  </span>
                  <span className="font-mono-num font-bold text-white">
                    {balance.toFixed(2)} / 100 TON
                  </span>
                </div>
                <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0098EA] rounded-full transition-all duration-500"
                    style={{ width: `${withdrawProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setShowWithdrawModal(false);
                }}
                className="bg-[#0098EA] hover:bg-[#0088D1] text-white font-semibold text-xs py-3 rounded-xl luxury-button"
              >
                {t('ok')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

