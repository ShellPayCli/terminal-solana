import { getDatabase } from './database';

export interface WaitlistEntry {
  id: number;
  email: string;
  name: string | null;
  wallet_address: string | null;
  created_at: string;
}

export interface WaitlistResult {
  position: number;
  email: string;
  name: string | null;
  walletAddress: string | null;
  joinedAt: string;
}

export async function addToWaitlist(email: string, name?: string, walletAddress?: string): Promise<WaitlistResult> {
  const db = await getDatabase();

  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required to join the waitlist.');
  }

  try {
    db.prepare('INSERT INTO waitlist (email, name, wallet_address) VALUES (?, ?, ?)').run(email, name || null, walletAddress || null);
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`"${email}" is already on the waitlist.`);
    }
    throw err;
  }

  const entry = db.prepare('SELECT * FROM waitlist WHERE email = ?').get<WaitlistEntry>(email)!;
  const pos = db.prepare('SELECT COUNT(*) as count FROM waitlist WHERE id <= ?').get<{ count: number }>(entry.id)!;

  return {
    position: pos.count,
    email: entry.email,
    name: entry.name,
    walletAddress: entry.wallet_address,
    joinedAt: entry.created_at,
  };
}

export async function getWaitlist(): Promise<WaitlistResult[]> {
  const db = await getDatabase();
  const entries = db.prepare('SELECT * FROM waitlist ORDER BY created_at ASC').all<WaitlistEntry>();
  return entries.map((entry, index) => ({
    position: index + 1,
    email: entry.email,
    name: entry.name,
    walletAddress: entry.wallet_address,
    joinedAt: entry.created_at,
  }));
}

export async function getWaitlistPosition(email: string): Promise<WaitlistResult> {
  const db = await getDatabase();
  const entry = db.prepare('SELECT * FROM waitlist WHERE email = ?').get<WaitlistEntry>(email);
  if (!entry) {
    throw new Error(`"${email}" is not on the waitlist.`);
  }
  const pos = db.prepare('SELECT COUNT(*) as count FROM waitlist WHERE id <= ?').get<{ count: number }>(entry.id)!;
  return {
    position: pos.count,
    email: entry.email,
    name: entry.name,
    walletAddress: entry.wallet_address,
    joinedAt: entry.created_at,
  };
}

export async function getWaitlistCount(): Promise<number> {
  const db = await getDatabase();
  const result = db.prepare('SELECT COUNT(*) as count FROM waitlist').get<{ count: number }>();
  return result?.count ?? 0;
}
