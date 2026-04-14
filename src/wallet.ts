import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { getDatabase } from './database';

export interface WalletRecord {
  id: number;
  name: string;
  public_key: string;
  private_key: string;
  created_at: string;
}

export interface WalletInfo {
  name: string;
  address: string;
  createdAt: string;
}

export async function createWallet(name: string): Promise<WalletInfo> {
  const db = await getDatabase();
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);

  try {
    db.prepare('INSERT INTO wallets (name, public_key, private_key) VALUES (?, ?, ?)').run(name, publicKey, privateKey);
  } catch (err: unknown) {
    const error = err as { message?: string };
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`A wallet named "${name}" already exists.`);
    }
    throw err;
  }

  return { name, address: publicKey, createdAt: new Date().toISOString() };
}

export async function getWallet(name: string): Promise<WalletRecord> {
  const db = await getDatabase();
  const wallet = db.prepare('SELECT * FROM wallets WHERE name = ?').get<WalletRecord>(name);
  if (!wallet) {
    throw new Error(`No wallet found with name "${name}".`);
  }
  return wallet;
}

export async function listWallets(): Promise<WalletInfo[]> {
  const db = await getDatabase();
  const wallets = db
    .prepare('SELECT name, public_key, created_at FROM wallets ORDER BY created_at DESC')
    .all<{ name: string; public_key: string; created_at: string }>();
  return wallets.map(w => ({ name: w.name, address: w.public_key, createdAt: w.created_at }));
}

export async function getWalletAddress(name: string): Promise<string> {
  const wallet = await getWallet(name);
  return wallet.public_key;
}

export async function exportPrivateKey(name: string): Promise<string> {
  const wallet = await getWallet(name);
  return wallet.private_key;
}

export async function getKeypair(name: string): Promise<Keypair> {
  const wallet = await getWallet(name);
  const secretKey = bs58.decode(wallet.private_key);
  return Keypair.fromSecretKey(secretKey);
}
