import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getKeypair, getWalletAddress } from './wallet';
import { getDatabase } from './database';

const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';

export function getConnection(): Connection {
  const endpoint =
    NETWORK === 'devnet'
      ? 'https://api.devnet.solana.com'
      : NETWORK === 'testnet'
      ? 'https://api.testnet.solana.com'
      : process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  return new Connection(endpoint, 'confirmed');
}

export async function getBalance(addressOrWalletName: string): Promise<number> {
  const connection = getConnection();
  let pubkey: PublicKey;

  try {
    pubkey = new PublicKey(addressOrWalletName);
  } catch {
    const address = await getWalletAddress(addressOrWalletName);
    pubkey = new PublicKey(address);
  }

  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function sendSol(
  fromWalletName: string,
  toAddress: string,
  amountSol: number
): Promise<string> {
  const connection = getConnection();
  const keypair = await getKeypair(fromWalletName);

  let toPubkey: PublicKey;
  try {
    toPubkey = new PublicKey(toAddress);
  } catch {
    throw new Error(`Invalid recipient address: ${toAddress}`);
  }

  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey,
      lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

  const db = await getDatabase();
  db.prepare(
    'INSERT INTO transactions (wallet_name, signature, amount, recipient) VALUES (?, ?, ?, ?)'
  ).run(fromWalletName, signature, amountSol, toAddress);

  return signature;
}

export async function requestAirdrop(walletName: string, amountSol: number = 1): Promise<string> {
  if (NETWORK === 'mainnet-beta') {
    throw new Error('Airdrop is not available on mainnet. Switch to devnet by setting SOLANA_NETWORK=devnet');
  }

  const connection = getConnection();
  const address = await getWalletAddress(walletName);
  const pubkey = new PublicKey(address);

  const lamports = amountSol * LAMPORTS_PER_SOL;
  const signature = await connection.requestAirdrop(pubkey, lamports);
  await connection.confirmTransaction(signature);

  return signature;
}

export function getNetwork(): string {
  return NETWORK;
}

export function getRpcEndpoint(): string {
  return RPC_ENDPOINT;
}
