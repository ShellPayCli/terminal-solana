import OpenAI from 'openai';
import { walletTools } from './tools';
import { createWallet, listWallets, getWalletAddress, exportPrivateKey } from './wallet';
import { getBalance, sendSol, requestAirdrop, getNetwork, getRpcEndpoint } from './solana';
import { addToWaitlist, getWaitlist } from './waitlist';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ShellPayChatOptions {
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
}

export class ShellPayChat {
  private client: OpenAI;
  private model: string;
  private history: OpenAI.Chat.ChatCompletionMessageParam[];

  constructor(options: ShellPayChatOptions = {}) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY env variable or pass apiKey option.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model || process.env.OPENAI_MODEL || 'gpt-4o';

    const systemPrompt = options.systemPrompt || `You are ShellPay, an AI-powered Solana wallet assistant running in the terminal.
You help users manage their Solana wallets, send SOL, check balances, manage a waitlist, and more.
You have access to wallet tools. Always be helpful, clear, and concise.
When showing wallet addresses or private keys, format them clearly.
When showing balances, always include the SOL unit.
Warn users clearly before exporting private keys that they should keep them safe and never share.
When listing waitlist entries, show them in a numbered, readable format.
Current network: ${getNetwork()}.`;

    this.history = [{ role: 'system', content: systemPrompt }];
  }

  async chat(userMessage: string): Promise<string> {
    this.history.push({ role: 'user', content: userMessage });

    let response = await this.client.chat.completions.create({
      model: this.model,
      messages: this.history,
      tools: walletTools,
      tool_choice: 'auto',
    });

    let message = response.choices[0].message;

    while (message.tool_calls && message.tool_calls.length > 0) {
      this.history.push(message);

      const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      for (const toolCall of message.tool_calls) {
        const result = await this.executeTool(toolCall.function.name, toolCall.function.arguments);
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      this.history.push(...toolResults);

      response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.history,
        tools: walletTools,
        tool_choice: 'auto',
      });

      message = response.choices[0].message;
    }

    const assistantContent = message.content || '';
    this.history.push({ role: 'assistant', content: assistantContent });
    return assistantContent;
  }

  private async executeTool(name: string, argsJson: string): Promise<string> {
    try {
      const args = JSON.parse(argsJson);

      switch (name) {
        case 'create_wallet': {
          const wallet = await createWallet(args.name);
          return JSON.stringify({
            success: true,
            name: wallet.name,
            address: wallet.address,
            createdAt: wallet.createdAt,
          });
        }

        case 'get_balance': {
          const balance = await getBalance(args.wallet);
          return JSON.stringify({ success: true, wallet: args.wallet, balance, unit: 'SOL' });
        }

        case 'send_sol': {
          const signature = await sendSol(args.from_wallet, args.to_address, args.amount);
          return JSON.stringify({
            success: true,
            signature,
            from: args.from_wallet,
            to: args.to_address,
            amount: args.amount,
            unit: 'SOL',
          });
        }

        case 'show_address': {
          const address = await getWalletAddress(args.wallet);
          return JSON.stringify({ success: true, wallet: args.wallet, address });
        }

        case 'export_private_key': {
          const privateKey = await exportPrivateKey(args.wallet);
          return JSON.stringify({
            success: true,
            wallet: args.wallet,
            privateKey,
            warning: 'KEEP THIS PRIVATE. Never share your private key with anyone.',
          });
        }

        case 'list_wallets': {
          const wallets = await listWallets();
          return JSON.stringify({ success: true, wallets, count: wallets.length });
        }

        case 'add_to_waitlist': {
          const entry = await addToWaitlist(args.email, args.name, args.wallet_address);
          return JSON.stringify({ success: true, ...entry });
        }

        case 'show_waitlist': {
          const entries = await getWaitlist();
          return JSON.stringify({ success: true, waitlist: entries, total: entries.length });
        }

        case 'request_airdrop': {
          const signature = await requestAirdrop(args.wallet, args.amount || 1);
          return JSON.stringify({ success: true, wallet: args.wallet, signature, amount: args.amount || 1 });
        }

        case 'show_network': {
          return JSON.stringify({
            success: true,
            network: getNetwork(),
            rpcEndpoint: getRpcEndpoint(),
          });
        }

        default:
          return JSON.stringify({ success: false, error: `Unknown tool: ${name}` });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      return JSON.stringify({ success: false, error: error.message || String(err) });
    }
  }

  clearHistory(): void {
    const systemMessage = this.history[0];
    this.history = [systemMessage];
  }

  getHistory(): ChatMessage[] {
    return this.history
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : '',
      }));
  }
}
