import OpenAI from 'openai';

export const walletTools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_wallet',
      description: 'Create a new Solana wallet and store it locally with a given name',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'A unique name/label for the wallet (e.g., "main", "savings", "trading")',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_balance',
      description: 'Get the SOL balance of a wallet by name or public address',
      parameters: {
        type: 'object',
        properties: {
          wallet: {
            type: 'string',
            description: 'Wallet name (as stored locally) or a Solana public key address',
          },
        },
        required: ['wallet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_sol',
      description: 'Send SOL from a local wallet to another address',
      parameters: {
        type: 'object',
        properties: {
          from_wallet: {
            type: 'string',
            description: 'The name of the local wallet to send from',
          },
          to_address: {
            type: 'string',
            description: 'The recipient Solana public key address',
          },
          amount: {
            type: 'number',
            description: 'Amount of SOL to send',
          },
        },
        required: ['from_wallet', 'to_address', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_address',
      description: 'Show the public address (public key) of a local wallet',
      parameters: {
        type: 'object',
        properties: {
          wallet: {
            type: 'string',
            description: 'The name of the local wallet',
          },
        },
        required: ['wallet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'export_private_key',
      description: 'Export the private key of a local wallet in base58 format. Use with caution — never share your private key!',
      parameters: {
        type: 'object',
        properties: {
          wallet: {
            type: 'string',
            description: 'The name of the local wallet',
          },
        },
        required: ['wallet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_wallets',
      description: 'List all locally saved wallets with their names and addresses',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_waitlist',
      description: 'Add an email to the ShellPayCli waitlist',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email address to add to the waitlist',
          },
          name: {
            type: 'string',
            description: 'Optional name of the person joining the waitlist',
          },
          wallet_address: {
            type: 'string',
            description: 'Optional Solana wallet address to associate with the waitlist entry',
          },
        },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_waitlist',
      description: 'Show all entries on the waitlist with their position, email, name and wallet address',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_airdrop',
      description: 'Request a SOL airdrop for a wallet (only works on devnet/testnet, not mainnet)',
      parameters: {
        type: 'object',
        properties: {
          wallet: {
            type: 'string',
            description: 'The name of the local wallet to receive the airdrop',
          },
          amount: {
            type: 'number',
            description: 'Amount of SOL to airdrop (default: 1)',
          },
        },
        required: ['wallet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_network',
      description: 'Show the current Solana network and RPC endpoint being used',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];
