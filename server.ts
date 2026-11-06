import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'telegram_users.json');

export interface TelegramUserRecord {
  id: string; // Telegram user ID or fallback device UID
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
  referralCode: string;
  referralsCount: number;
  referralEarnings: number;
  claimableReferralRewards: number;
  claimedMilestones: number[];
  referredBy?: string | null;
  referredByUsername?: string | null;
  referredAt?: string | null;
  rewardGeneratedForReferrer?: number;
  walletAddress?: string | null;
  isVip?: boolean;
  isBanned?: boolean;
  firstSeenAt: string;
  lastActiveAt: string;
  sessionsCount: number;
  platform?: string;
}

export interface ReferralEvent {
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

interface DatabaseSchema {
  users: Record<string, TelegramUserRecord>;
  referralEvents: ReferralEvent[];
  auditLogs: {
    id: string;
    timestamp: string;
    action: string;
    targetUserId: string;
    details: string;
  }[];
}

export const REFERRAL_MILESTONES = [
  { count: 3, reward: 0.15, label: '3 Friends' },
  { count: 10, reward: 0.50, label: '10 Friends' },
  { count: 25, reward: 1.50, label: '25 Friends' },
  { count: 50, reward: 3.50, label: '50 Friends' },
];

export function getReferralTier(referralsCount: number) {
  if (referralsCount >= 50) {
    return {
      name: 'Ambassador',
      rate: 0.20,
      percentLabel: '20%',
      nextTierName: null,
      nextTierTarget: 50,
      progressPercent: 100,
    };
  }
  if (referralsCount >= 15) {
    return {
      name: 'Gold',
      rate: 0.15,
      percentLabel: '15%',
      nextTierName: 'Ambassador (20%)',
      nextTierTarget: 50,
      progressPercent: Math.min(100, Math.round(((referralsCount - 15) / (50 - 15)) * 100)),
    };
  }
  if (referralsCount >= 5) {
    return {
      name: 'Silver',
      rate: 0.12,
      percentLabel: '12%',
      nextTierName: 'Gold (15%)',
      nextTierTarget: 15,
      progressPercent: Math.min(100, Math.round(((referralsCount - 5) / (15 - 5)) * 100)),
    };
  }
  return {
    name: 'Starter',
    rate: 0.10,
    percentLabel: '10%',
    nextTierName: 'Silver (12%)',
    nextTierTarget: 5,
    progressPercent: Math.min(100, Math.round((referralsCount / 5) * 100)),
  };
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: {},
      referralEvents: [],
      auditLogs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const users: Record<string, TelegramUserRecord> = parsed.users || {};
    // Backfill referral fields on any existing user records
    for (const [key, u] of Object.entries(users)) {
      if (!u.referralCode) u.referralCode = `ref_${key}`;
      if (typeof u.referralEarnings !== 'number') u.referralEarnings = 0;
      if (typeof u.claimableReferralRewards !== 'number') u.claimableReferralRewards = 0;
      if (!Array.isArray(u.claimedMilestones)) u.claimedMilestones = [];
      if (typeof u.rewardGeneratedForReferrer !== 'number') u.rewardGeneratedForReferrer = 0;
    }
    return {
      users,
      referralEvents: parsed.referralEvents || [],
      auditLogs: parsed.auditLogs || [],
    };
  } catch (err) {
    console.error('Failed to read DB file, initializing empty DB:', err);
    return { users: {}, referralEvents: [], auditLogs: [] };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

function resolveReferrer(
  db: DatabaseSchema,
  rawCode: string | null | undefined,
  currentUserKey: string,
  currentUsername?: string
): TelegramUserRecord | null {
  if (!rawCode || typeof rawCode !== 'string') return null;
  const trimmed = rawCode.trim();
  if (!trimmed) return null;

  const cleanId = trimmed.replace(/^ref_/i, '').trim();
  const cleanUsername = trimmed.startsWith('@') ? trimmed.toLowerCase() : `@${trimmed.toLowerCase()}`;

  for (const candidate of Object.values(db.users)) {
    const matchesId =
      candidate.id === trimmed ||
      candidate.id === cleanId ||
      (candidate.telegramId && String(candidate.telegramId) === cleanId) ||
      (candidate.referralCode && candidate.referralCode.toLowerCase() === trimmed.toLowerCase());

    const matchesUsername =
      candidate.username &&
      candidate.username !== '@TelegramUser' &&
      candidate.username.toLowerCase() === cleanUsername;

    if (matchesId || matchesUsername) {
      // Anti-fraud checks:
      // 1. Prevent self-referral by ID or username
      if (candidate.id === currentUserKey) return null;
      if (
        currentUsername &&
        currentUsername !== '@TelegramUser' &&
        candidate.username.toLowerCase() === currentUsername.toLowerCase()
      ) {
        return null;
      }
      // 2. Prevent circular referral (if candidate was already referred by currentUserKey)
      if (candidate.referredBy === currentUserKey) return null;

      return candidate;
    }
  }
  return null;
}

function bindReferralAndReward(
  db: DatabaseSchema,
  invitee: TelegramUserRecord,
  referrer: TelegramUserRecord
): { inviterReward: number; inviteeBonus: number } {
  const now = new Date().toISOString();
  const isPremium = Boolean(invitee.isPremium);
  const inviterReward = isPremium ? 0.10 : 0.05;
  const inviteeBonus = isPremium ? 0.05 : 0.02;

  invitee.referredBy = referrer.id;
  invitee.referredByUsername = referrer.username;
  invitee.referredAt = now;
  invitee.balance = Number((invitee.balance + inviteeBonus).toFixed(4));
  invitee.rewardGeneratedForReferrer = Number(
    ((invitee.rewardGeneratedForReferrer || 0) + inviterReward).toFixed(4)
  );

  // Recalculate accurate referral count for referrer
  const currentReferredCount = Object.values(db.users).filter(
    (u) => u.referredBy === referrer.id || u.id === invitee.id
  ).length;
  referrer.referralsCount = Math.max((referrer.referralsCount || 0) + 1, currentReferredCount);
  referrer.referralEarnings = Number(((referrer.referralEarnings || 0) + inviterReward).toFixed(4));
  referrer.claimableReferralRewards = Number(
    ((referrer.claimableReferralRewards || 0) + inviterReward).toFixed(4)
  );

  db.referralEvents.unshift({
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    referrerId: referrer.id,
    referredUserId: invitee.id,
    referredUsername: invitee.username,
    referredFirstName: invitee.firstName,
    referredPhotoUrl: invitee.photoUrl || '',
    type: isPremium ? 'PREMIUM_SIGNUP_BONUS' : 'SIGNUP_BONUS',
    amount: inviterReward,
    details: `${invitee.firstName} (${invitee.username}) joined via referral link${isPremium ? ' [Telegram Premium]' : ''}`,
  });
  db.referralEvents = db.referralEvents.slice(0, 300);

  db.auditLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    action: 'REFERRAL_VERIFIED',
    targetUserId: referrer.id,
    details: `${referrer.username} referred ${invitee.username} (+${inviterReward.toFixed(2)} TON to referrer, +${inviteeBonus.toFixed(2)} TON welcome bonus)`,
  });
  db.auditLogs = db.auditLogs.slice(0, 100);

  return { inviterReward, inviteeBonus };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Sync Telegram User on App Entry & State Change
  app.post('/api/users/sync', (req, res) => {
    try {
      const db = ensureDatabase();
      const {
        id,
        telegramId,
        username,
        firstName,
        lastName,
        photoUrl,
        languageCode,
        isPremium,
        balance,
        gamesPlayed,
        wins,
        totalWagered,
        referredBy,
        walletAddress,
        platform,
        isInitialSession,
      } = req.body;

      const userKey = String(telegramId || id || '').trim();
      if (!userKey) {
        res.status(400).json({ error: 'Missing user identifier' });
        return;
      }

      const now = new Date().toISOString();
      const existing = db.users[userKey];

      if (!existing) {
        const cleanUsername = username || '@TelegramUser';
        const newUser: TelegramUserRecord = {
          id: userKey,
          telegramId: telegramId ? Number(telegramId) : null,
          username: cleanUsername,
          firstName: firstName || cleanUsername.replace(/^@/, '') || 'Telegram User',
          lastName: lastName || '',
          photoUrl: photoUrl || '',
          languageCode: languageCode || 'en',
          isPremium: Boolean(isPremium),
          balance: typeof balance === 'number' ? balance : 0,
          gamesPlayed: typeof gamesPlayed === 'number' ? gamesPlayed : 0,
          wins: typeof wins === 'number' ? wins : 0,
          totalWagered: typeof totalWagered === 'number' ? totalWagered : 0,
          referralCode: `ref_${userKey}`,
          referralsCount: 0,
          referralEarnings: 0,
          claimableReferralRewards: 0,
          claimedMilestones: [],
          referredBy: null,
          referredByUsername: null,
          referredAt: null,
          rewardGeneratedForReferrer: 0,
          walletAddress: walletAddress || null,
          isVip: (gamesPlayed || 0) >= 50,
          isBanned: false,
          firstSeenAt: now,
          lastActiveAt: now,
          sessionsCount: 1,
          platform: platform || 'Telegram WebApp',
        };

        db.users[userKey] = newUser;

        // Resolve & bind referrer if valid referral code was passed
        let referralBonusGranted = 0;
        const referrer = resolveReferrer(db, referredBy, userKey, cleanUsername);
        if (referrer) {
          const { inviteeBonus } = bindReferralAndReward(db, newUser, referrer);
          referralBonusGranted = inviteeBonus;
        }

        db.auditLogs.unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: now,
          action: 'USER_JOINED',
          targetUserId: userKey,
          details: `${newUser.username} (${newUser.firstName}) entered from Telegram${referrer ? ` (invited by ${referrer.username})` : ''}`,
        });
        db.auditLogs = db.auditLogs.slice(0, 100);
        saveDatabase(db);
        res.json({ user: newUser, isNew: true, referralBonusGranted });
        return;
      }

      // Existing user: check if they opened a referral link and don't have a referrer yet
      let referralBonusGranted = 0;
      if (!existing.referredBy && referredBy) {
        const referrer = resolveReferrer(db, referredBy, userKey, username || existing.username);
        if (referrer) {
          const { inviteeBonus } = bindReferralAndReward(db, existing, referrer);
          referralBonusGranted = inviteeBonus;
        }
      }

      // Check if user wagered more TON since last sync -> credit lifetime commission to their referrer!
      const prevWagered = existing.totalWagered || 0;
      const incomingWagered = typeof totalWagered === 'number' ? totalWagered : prevWagered;
      const deltaWagered = Number((incomingWagered - prevWagered).toFixed(4));

      if (deltaWagered > 0 && existing.referredBy && db.users[existing.referredBy]) {
        const referrer = db.users[existing.referredBy];
        const tier = getReferralTier(referrer.referralsCount || 0);
        // Referrer gets tier.rate (10% to 20%) of game volume house share (or min 0.002 TON per wager)
        const commission = Number(Math.max(0.002, deltaWagered * tier.rate * 0.1).toFixed(4));
        referrer.referralEarnings = Number(((referrer.referralEarnings || 0) + commission).toFixed(4));
        referrer.claimableReferralRewards = Number(
          ((referrer.claimableReferralRewards || 0) + commission).toFixed(4)
        );
        existing.rewardGeneratedForReferrer = Number(
          ((existing.rewardGeneratedForReferrer || 0) + commission).toFixed(4)
        );

        db.referralEvents.unshift({
          id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: now,
          referrerId: referrer.id,
          referredUserId: existing.id,
          referredUsername: existing.username,
          referredFirstName: existing.firstName,
          referredPhotoUrl: existing.photoUrl || '',
          type: 'WAGER_COMMISSION',
          amount: commission,
          details: `${tier.percentLabel} commission from ${existing.username} playing ${deltaWagered.toFixed(2)} TON`,
        });
        db.referralEvents = db.referralEvents.slice(0, 300);
      }

      // Update existing user record
      existing.username = username || existing.username;
      existing.firstName = firstName || existing.firstName;
      if (lastName !== undefined) existing.lastName = lastName;
      if (photoUrl) existing.photoUrl = photoUrl;
      if (languageCode) existing.languageCode = languageCode;
      if (isPremium !== undefined) existing.isPremium = Boolean(isPremium);
      if (typeof balance === 'number' && !isNaN(balance)) {
        existing.balance = Number((balance + referralBonusGranted).toFixed(4));
      }
      if (typeof gamesPlayed === 'number') existing.gamesPlayed = Math.max(existing.gamesPlayed, gamesPlayed);
      if (typeof wins === 'number') existing.wins = Math.max(existing.wins, wins);
      if (typeof totalWagered === 'number') existing.totalWagered = Math.max(existing.totalWagered, totalWagered);
      if (walletAddress) existing.walletAddress = walletAddress;
      if (platform) existing.platform = platform;
      if (existing.gamesPlayed >= 50) existing.isVip = true;
      existing.lastActiveAt = now;
      if (isInitialSession) {
        existing.sessionsCount = (existing.sessionsCount || 1) + 1;
      }

      // Keep referralsCount synced with actual referred records
      const realReferredCount = Object.values(db.users).filter((u) => u.referredBy === userKey).length;
      existing.referralsCount = Math.max(existing.referralsCount || 0, realReferredCount);

      db.users[userKey] = existing;
      saveDatabase(db);
      res.json({ user: existing, isNew: false, referralBonusGranted });
    } catch (err) {
      console.error('Error in /api/users/sync:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2. Get Real Referral Dashboard Data for a User
  app.get('/api/referrals/:userId', (req, res) => {
    try {
      const db = ensureDatabase();
      const userId = String(req.params.userId || '').trim();
      const user = db.users[userId];

      // Find all users actually invited by this userId
      const invitedUsers = Object.values(db.users)
        .filter((u) => u.referredBy === userId)
        .sort((a, b) => new Date(b.referredAt || b.firstSeenAt).getTime() - new Date(a.referredAt || a.firstSeenAt).getTime())
        .map((u) => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName || '',
          photoUrl: u.photoUrl || '',
          isPremium: Boolean(u.isPremium),
          gamesPlayed: u.gamesPlayed || 0,
          totalWagered: u.totalWagered || 0,
          joinedAt: u.referredAt || u.firstSeenAt,
          lastActiveAt: u.lastActiveAt,
          rewardGenerated: u.rewardGeneratedForReferrer || (u.isPremium ? 0.10 : 0.05),
        }));

      const referralsCount = user
        ? Math.max(user.referralsCount || 0, invitedUsers.length)
        : invitedUsers.length;

      if (user && user.referralsCount !== referralsCount) {
        user.referralsCount = referralsCount;
        saveDatabase(db);
      }

      const tier = getReferralTier(referralsCount);

      const userEvents = db.referralEvents
        .filter((e) => e.referrerId === userId)
        .slice(0, 40);

      // Build real leaderboard from database users
      const leaderboard = Object.values(db.users)
        .map((u) => {
          const actualCount = Object.values(db.users).filter((child) => child.referredBy === u.id).length;
          const count = Math.max(u.referralsCount || 0, actualCount);
          return {
            id: u.id,
            username: u.username,
            firstName: u.firstName,
            photoUrl: u.photoUrl || '',
            referralsCount: count,
            referralEarnings: u.referralEarnings || 0,
            tierName: getReferralTier(count).name,
          };
        })
        .filter((u) => u.referralsCount > 0 || u.id === userId)
        .sort((a, b) => {
          if (b.referralsCount !== a.referralsCount) return b.referralsCount - a.referralsCount;
          return b.referralEarnings - a.referralEarnings;
        })
        .slice(0, 15);

      const referredByUser =
        user?.referredBy && db.users[user.referredBy]
          ? {
              id: db.users[user.referredBy].id,
              username: db.users[user.referredBy].username,
              firstName: db.users[user.referredBy].firstName,
            }
          : null;

      res.json({
        referralCode: user?.referralCode || `ref_${userId}`,
        referralsCount,
        premiumReferralsCount: invitedUsers.filter((u) => u.isPremium).length,
        totalEarned: user?.referralEarnings || 0,
        claimableRewards: user?.claimableReferralRewards || 0,
        claimedMilestones: user?.claimedMilestones || [],
        milestones: REFERRAL_MILESTONES,
        tier,
        referredByUser,
        invitedUsers,
        events: userEvents,
        leaderboard,
      });
    } catch (err) {
      console.error('Error in GET /api/referrals/:userId:', err);
      res.status(500).json({ error: 'Failed to load referral data' });
    }
  });

  // 3. Manually or Programmatically Bind a Referral Code
  app.post('/api/referrals/bind', (req, res) => {
    try {
      const db = ensureDatabase();
      const { userId, refCode } = req.body;
      const cleanUserId = String(userId || '').trim();
      const user = db.users[cleanUserId];

      if (!user) {
        res.status(404).json({ error: 'User record not found. Please wait a moment and try again.' });
        return;
      }
      if (user.referredBy) {
        res.status(400).json({ error: 'You have already bound an invite code.' });
        return;
      }

      const referrer = resolveReferrer(db, refCode, cleanUserId, user.username);
      if (!referrer) {
        res.status(400).json({ error: 'Invalid invite code or self-referral is not allowed.' });
        return;
      }

      const { inviterReward, inviteeBonus } = bindReferralAndReward(db, user, referrer);
      saveDatabase(db);

      res.json({
        success: true,
        user,
        referrer: {
          id: referrer.id,
          username: referrer.username,
          firstName: referrer.firstName,
        },
        inviterReward,
        inviteeBonus,
      });
    } catch (err) {
      console.error('Error in POST /api/referrals/bind:', err);
      res.status(500).json({ error: 'Failed to bind referral code' });
    }
  });

  // 4. Claim Available Referral Rewards into User Balance
  app.post('/api/referrals/claim', (req, res) => {
    try {
      const db = ensureDatabase();
      const { userId } = req.body;
      const cleanUserId = String(userId || '').trim();
      const user = db.users[cleanUserId];

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const claimable = Number((user.claimableReferralRewards || 0).toFixed(4));
      if (claimable <= 0) {
        res.status(400).json({ error: 'No claimable referral rewards available' });
        return;
      }

      user.balance = Number((user.balance + claimable).toFixed(4));
      user.claimableReferralRewards = 0;

      const now = new Date().toISOString();
      db.referralEvents.unshift({
        id: `claim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        referrerId: user.id,
        referredUserId: user.id,
        referredUsername: user.username,
        referredFirstName: user.firstName,
        type: 'CLAIM_PAYOUT',
        amount: claimable,
        details: `Claimed ${claimable.toFixed(2)} TON referral rewards to main balance`,
      });
      db.referralEvents = db.referralEvents.slice(0, 300);

      db.auditLogs.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        action: 'REFERRAL_CLAIMED',
        targetUserId: user.id,
        details: `${user.username} claimed ${claimable.toFixed(2)} TON from referrals`,
      });

      saveDatabase(db);
      res.json({ success: true, claimedAmount: claimable, user });
    } catch (err) {
      console.error('Error in POST /api/referrals/claim:', err);
      res.status(500).json({ error: 'Failed to claim referral rewards' });
    }
  });

  // 5. Claim Referral Milestone Bonus (3, 10, 25, 50 Friends)
  app.post('/api/referrals/claim-milestone', (req, res) => {
    try {
      const db = ensureDatabase();
      const { userId, milestoneCount } = req.body;
      const cleanUserId = String(userId || '').trim();
      const user = db.users[cleanUserId];

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const milestone = REFERRAL_MILESTONES.find((m) => m.count === Number(milestoneCount));
      if (!milestone) {
        res.status(400).json({ error: 'Invalid milestone' });
        return;
      }

      const actualCount = Object.values(db.users).filter((u) => u.referredBy === cleanUserId).length;
      const totalRefs = Math.max(user.referralsCount || 0, actualCount);

      if (totalRefs < milestone.count) {
        res.status(400).json({ error: 'Milestone not reached yet' });
        return;
      }

      if (!Array.isArray(user.claimedMilestones)) user.claimedMilestones = [];
      if (user.claimedMilestones.includes(milestone.count)) {
        res.status(400).json({ error: 'Milestone already claimed' });
        return;
      }

      user.claimedMilestones.push(milestone.count);
      user.balance = Number((user.balance + milestone.reward).toFixed(4));
      user.referralEarnings = Number(((user.referralEarnings || 0) + milestone.reward).toFixed(4));

      const now = new Date().toISOString();
      db.referralEvents.unshift({
        id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        referrerId: user.id,
        referredUserId: user.id,
        referredUsername: user.username,
        referredFirstName: user.firstName,
        type: 'MILESTONE_BONUS',
        amount: milestone.reward,
        details: `Unlocked ${milestone.count} Referrals Milestone (+${milestone.reward.toFixed(2)} TON)`,
      });

      saveDatabase(db);
      res.json({
        success: true,
        rewardAmount: milestone.reward,
        claimedMilestones: user.claimedMilestones,
        user,
      });
    } catch (err) {
      console.error('Error in POST /api/referrals/claim-milestone:', err);
      res.status(500).json({ error: 'Failed to claim milestone' });
    }
  });

  // 6. Admin: Get all real Telegram users & aggregated platform analytics
  app.get('/api/admin/users', (req, res) => {
    try {
      const db = ensureDatabase();
      const usersList = Object.values(db.users).sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );

      const nowMs = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      const totalUsers = usersList.length;
      const activeLast24h = usersList.filter(
        (u) => nowMs - new Date(u.lastActiveAt).getTime() <= dayMs
      ).length;
      const totalBalance = usersList.reduce((acc, u) => acc + (u.balance || 0), 0);
      const totalWagered = usersList.reduce((acc, u) => acc + (u.totalWagered || 0), 0);
      const totalGamesPlayed = usersList.reduce((acc, u) => acc + (u.gamesPlayed || 0), 0);
      const connectedWallets = usersList.filter((u) => Boolean(u.walletAddress)).length;
      const telegramPremiumCount = usersList.filter((u) => Boolean(u.isPremium)).length;

      res.json({
        users: usersList,
        auditLogs: db.auditLogs.slice(0, 30),
        metrics: {
          totalUsers,
          activeLast24h,
          totalBalance,
          totalWagered,
          totalGamesPlayed,
          connectedWallets,
          telegramPremiumCount,
          estimatedHouseRevenue: Number((totalWagered * 0.03).toFixed(2)),
        },
      });
    } catch (err) {
      console.error('Error in GET /api/admin/users:', err);
      res.status(500).json({ error: 'Failed to load users from database' });
    }
  });

  // 7. Admin: Update specific user's balance or status in DB
  app.post('/api/admin/users/:id/update', (req, res) => {
    try {
      const db = ensureDatabase();
      const targetId = req.params.id;
      const user = db.users[targetId];
      if (!user) {
        res.status(404).json({ error: 'User not found in database' });
        return;
      }

      const { balance, isVip, isBanned } = req.body;
      const changes: string[] = [];

      if (typeof balance === 'number' && !isNaN(balance)) {
        changes.push(`balance ${user.balance.toFixed(2)} -> ${balance.toFixed(2)} TON`);
        user.balance = balance;
      }
      if (typeof isVip === 'boolean') {
        changes.push(`VIP -> ${isVip}`);
        user.isVip = isVip;
      }
      if (typeof isBanned === 'boolean') {
        changes.push(`Banned -> ${isBanned}`);
        user.isBanned = isBanned;
      }

      db.users[targetId] = user;
      db.auditLogs.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        action: 'ADMIN_UPDATE',
        targetUserId: targetId,
        details: `Updated ${user.username}: ${changes.join(', ')}`,
      });
      db.auditLogs = db.auditLogs.slice(0, 100);

      saveDatabase(db);
      res.json({ user, success: true });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // 8. Admin: Delete user record
  app.delete('/api/admin/users/:id', (req, res) => {
    try {
      const db = ensureDatabase();
      const targetId = req.params.id;
      const target = db.users[targetId];
      if (!target) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      delete db.users[targetId];
      db.auditLogs.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        action: 'ADMIN_DELETE',
        targetUserId: targetId,
        details: `Deleted user ${target.username}`,
      });
      saveDatabase(db);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TonQash Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
