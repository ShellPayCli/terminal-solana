#!/usr/bin/env node

import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ShellPayChat } from './chat';
import { closeDatabase, DB_PATH } from './database';

const c = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function startThinking(): NodeJS.Timeout {
  const frames = ['|', '/', '-', '\\'];
  let i = 0;
  process.stdout.write(`\n  ${c.yellow}ShellPay${c.reset} ${c.dim}thinking ${frames[0]}${c.reset}`);
  return setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.write(`\r  ${c.yellow}ShellPay${c.reset} ${c.dim}thinking ${frames[i]}${c.reset}`);
  }, 100);
}

function stopThinking(timer: NodeJS.Timeout): void {
  clearInterval(timer);
  process.stdout.write('\r\x1b[2K');
}

const BANNER = `
╔═══════════════════════════════════════════╗
║          ShellPay CLI  v1.0.0             ║
║   AI-Powered Solana Wallet Assistant      ║
╚═══════════════════════════════════════════╝

Type your message to interact with your Solana wallets.
Commands: /clear (reset chat), /history, /exit
`;

function loadEnv(): void {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

async function main(): Promise<void> {
  loadEnv();

  console.log(`${c.cyan}${BANNER}${c.reset}`);
  console.log(`${c.dim}  Database: ${DB_PATH}${c.reset}`);
  console.log(`${c.dim}  Network:  ${process.env.SOLANA_NETWORK || 'mainnet-beta'}${c.reset}`);
  console.log('');

  let chat: ShellPayChat;

  try {
    chat = new ShellPayChat();
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error(`${c.red}  Error: ${error.message}${c.reset}`);
    console.error(`${c.red}  Make sure OPENAI_API_KEY is set in your .env file or environment.${c.reset}`);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const prompt = (): void => {
    rl.question(`\n  ${c.green}${c.bold}You${c.reset}${c.green}: ${c.reset}`, async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed === '/exit' || trimmed === '/quit') {
        console.log(`\n${c.dim}  Goodbye!\n${c.reset}`);
        closeDatabase();
        rl.close();
        process.exit(0);
      }

      if (trimmed === '/clear') {
        chat.clearHistory();
        console.log(`${c.dim}  [Chat history cleared]${c.reset}`);
        prompt();
        return;
      }

      if (trimmed === '/history') {
        const history = chat.getHistory();
        if (history.length === 0) {
          console.log(`${c.dim}  [No chat history]${c.reset}`);
        } else {
          console.log(`\n${c.dim}  --- Chat History ---${c.reset}`);
          for (const msg of history) {
            if (msg.role === 'user') {
              console.log(`\n  ${c.green}${c.bold}You${c.reset}${c.green}: ${msg.content}${c.reset}`);
            } else {
              console.log(`\n  ${c.yellow}${c.bold}ShellPay${c.reset}: ${msg.content}`);
            }
          }
          console.log(`${c.dim}  -------------------${c.reset}`);
        }
        prompt();
        return;
      }

      const spinner = startThinking();

      try {
        const response = await chat.chat(trimmed);
        stopThinking(spinner);
        const lines = response.split('\n');
        process.stdout.write(`  ${c.yellow}${c.bold}ShellPay${c.reset}: ${lines[0]}\n`);
        for (let i = 1; i < lines.length; i++) {
          console.log(`  ${lines[i]}`);
        }
      } catch (err: unknown) {
        stopThinking(spinner);
        const error = err as { message?: string };
        console.log(`${c.red}  [Error] ${error.message}${c.reset}`);
      }

      prompt();
    });
  };

  rl.on('close', () => {
    closeDatabase();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log(`\n\n${c.dim}  Goodbye!\n${c.reset}`);
    closeDatabase();
    process.exit(0);
  });

  prompt();
}

main();
