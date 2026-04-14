# @shellpaycli/solana

![enter image description here](https://olive-chemical-haddock-701.mypinata.cloud/ipfs/bafkreihovki4sfhnf6pecbbafvloymr4v77ndbjnqbnqcw3nynbpb6q4p4)
  
<div align="center">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/CLI-Terminal-black?style=for-the-badge&logo=gnubash&logoColor=white" />
<img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
<img src="https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black" />
<img src="https://img.shields.io/badge/NPM-@shellpaycli/solana-red?style=for-the-badge&logo=npm" />
<img src="https://img.shields.io/badge/Web3-Terminal%20AI-black?style=for-the-badge" />
<img src="https://img.shields.io/badge/RPC-Solana%20Network-purple?style=for-the-badge" />
<img src="https://img.shields.io/badge/AI-Agent-green?style=for-the-badge" />
</div>
An AI-powered Solana wallet assistant for the terminal. Manage wallets, send SOL, track a waitlist, and interact with the Solana blockchain through a natural language chat interface powered by OpenAI.

  

---

  

## Installation

  

```bash

npm  install  @shellpaycli/solana

```

  

Or install globally to use the CLI anywhere:

  

```bash

npm  install  -g  @shellpaycli/solana

```

  

---

  

## Quick Start

  

### 1. Set up environment

  

Copy the example env file and fill in your values:

  

```bash

cp  .env.example  .env

```

  

At minimum, set your OpenAI API key:

  

```

OPENAI_API_KEY=sk-...

```

  

### 2. Launch the interactive assistant

  

```bash

shellpay

```

  

You will see a chat prompt where you can type in plain English:

  

```

You: create a wallet called main

ShellPay: Created wallet "main"! Address: 5Gh7...Rk9

  

You: show my balance for main

ShellPay: Your wallet "main" has 0.00 SOL.

  

You: send 0.1 SOL from main to 7xKp...Bz3

ShellPay: Sent 0.1 SOL! Transaction: 2Fd9...Xw1

  

You: add alice@example.com to the waitlist

ShellPay: Added alice@example.com to the waitlist at position #1.

```

  

---

  

## Features

  

| Feature | Command (natural language example) |

|---|---|

| Create wallet | "create a wallet called savings" |

| Show balance | "what's the balance of my main wallet?" |

| Send SOL | "send 0.5 SOL from main to <address>" |

| Show address | "show the address of my trading wallet" |

| Export private key | "export private key for main wallet" |

| List all wallets | "list my wallets" |

| Add to waitlist | "add john@email.com to the waitlist" |

| Show waitlist | "show the waitlist" |

| Airdrop (devnet) | "airdrop 2 SOL to my test wallet" |

| Network info | "what network am I on?" |

  

### CLI Commands

  

| Command | Description |

|---|---|

| `/clear` | Clear chat history |

| `/history` | Show conversation history |

| `/exit` | Exit the assistant |

  

---

  

## Programmatic SDK Usage

  

```typescript

import  {

ShellPayChat,

createWallet,

getBalance,

sendSol,

addToWaitlist,

getWaitlist,

}  from  '@shellpaycli/solana';

  

// Interactive AI chat

const  chat = new  ShellPayChat({ apiKey:  'sk-...'  });

const  response = await  chat.chat('Create a wallet called main');

console.log(response);

  

// Direct wallet operations

const  wallet = createWallet('savings');

console.log(wallet.address);

  

const  balance = await  getBalance('savings');

console.log(`${balance} SOL`);

  

const  sig = await  sendSol('savings', 'RECIPIENT_ADDRESS', 0.01);

console.log(`TX: ${sig}`);

  

// Waitlist management

addToWaitlist('user@example.com', 'Alice', wallet.address);

const  list = getWaitlist();

console.log(list);

```

  

---

  

## SDK Reference

  

### `ShellPayChat`

  

```typescript

const  chat = new  ShellPayChat(options?: {

apiKey?: string; // OpenAI API key

model?: string; // OpenAI model (default: 'gpt-4o')

systemPrompt?: string;

});

  

await  chat.chat(message: string): Promise<string>

chat.clearHistory(): void

chat.getHistory(): ChatMessage[]

```

  

### Wallet Functions

  

```typescript

createWallet(name: string): WalletInfo

getWallet(name: string): WalletRecord

listWallets(): WalletInfo[]

getWalletAddress(name: string): string

exportPrivateKey(name: string): string

getKeypair(name: string): Keypair

```

  

### Solana Functions

  

```typescript

getBalance(walletNameOrAddress: string): Promise<number>

sendSol(fromWallet: string, toAddress: string, amount: number): Promise<string>

requestAirdrop(walletName: string, amount?: number): Promise<string>

getConnection(): Connection

getNetwork(): string

```

  

### Waitlist Functions

  

```typescript

addToWaitlist(email: string, name?: string, walletAddress?: string): WaitlistResult

getWaitlist(): WaitlistResult[]

getWaitlistPosition(email: string): WaitlistResult

getWaitlistCount(): number

```

  

---

  

## Configuration

  

| Variable | Default | Description |

|---|---|---|

| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |

| `OPENAI_MODEL` | `gpt-4o` | OpenAI model to use |

| `SOLANA_NETWORK` | `mainnet-beta` | Network: `mainnet-beta`, `devnet`, `testnet` |

| `SOLANA_RPC_URL` | Public endpoint | Custom RPC URL |

| `SHELLPAY_DB_PATH` | `~/.shellpaycli/shellpay.db` | SQLite database path |

  

---

  

## Database

  

ShellPayCli uses SQLite stored locally at `~/.shellpaycli/shellpay.db` (configurable via `SHELLPAY_DB_PATH`).

  

Three tables are created automatically:

  

-  **wallets** — stores wallet names, public keys, and encrypted private keys

-  **waitlist** — stores waitlist entries (email, name, wallet address)

-  **transactions** — stores a history of sent transactions

  

---

  

## Security

  

- Private keys are stored locally in the SQLite database in base58 format.

-  **Never share your private key** with anyone.

- For production use, consider using a hardware wallet or dedicated key management solution.

- Use a dedicated RPC provider for better performance and rate limits.

  

---

  

## Networks

  

| Network | Use Case |

|---|---|

| `mainnet-beta` | Real SOL, production |

| `devnet` | Testing, free airdrops |

| `testnet` | Testing, no airdrops |

  

To switch to devnet for testing:

  

```

SOLANA_NETWORK=devnet

```

  

Then use `request_airdrop` to get free devnet SOL.

  

---

  

## License

  

MIT