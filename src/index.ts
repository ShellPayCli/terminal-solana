export { ShellPayChat } from './chat';
export type { ChatMessage, ShellPayChatOptions } from './chat';

export {
  createWallet,
  getWallet,
  listWallets,
  getWalletAddress,
  exportPrivateKey,
  getKeypair,
} from './wallet';
export type { WalletInfo, WalletRecord } from './wallet';

export {
  getBalance,
  sendSol,
  requestAirdrop,
  getConnection,
  getNetwork,
  getRpcEndpoint,
} from './solana';

export {
  addToWaitlist,
  getWaitlist,
  getWaitlistPosition,
  getWaitlistCount,
} from './waitlist';
export type { WaitlistEntry, WaitlistResult } from './waitlist';

export { getDatabase, closeDatabase, DB_PATH } from './database';
