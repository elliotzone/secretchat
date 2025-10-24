# SecretChat - Blockchain-Powered Private Messaging with FHE

A decentralized, privacy-preserving messaging platform that leverages Fully Homomorphic Encryption (FHE) to enable secure, end-to-end encrypted communication on the blockchain. SecretChat combines the transparency and immutability of blockchain with the confidentiality of advanced cryptographic techniques, ensuring that only the intended sender and recipient can read messages.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why SecretChat?](#why-secretchat)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Problems Solved](#problems-solved)
- [Advantages](#advantages)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Smart Contract Setup](#smart-contract-setup)
  - [Frontend Setup](#frontend-setup)
- [Deployment](#deployment)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

SecretChat is a revolutionary messaging platform that brings true privacy to blockchain-based communication. Unlike traditional blockchain applications where all data is publicly visible, SecretChat uses **Fully Homomorphic Encryption (FHE)** via Zama's FHEVM protocol to encrypt sensitive message keys directly on-chain, while message content is encrypted client-side using AES-GCM.

This dual-layer encryption approach ensures that:
- Messages are encrypted before leaving the user's device
- Symmetric encryption keys are protected by FHE on the blockchain
- Only authorized parties (sender and recipient) can decrypt messages
- No intermediary or third party can access message content
- All communication remains tamper-proof and auditable on-chain

## Key Features

### Core Functionality

- **Username System**: Register human-readable usernames on-chain for easy identification
- **Private Messaging**: Send encrypted messages to other users by username or address
- **Inbox Management**: View and decrypt received messages
- **Outbox Tracking**: Keep track of sent messages
- **End-to-End Encryption**: Dual-layer encryption combining client-side AES-GCM and on-chain FHE
- **Decentralized Architecture**: No central server storing or processing messages
- **Wallet Integration**: Seamless connection with MetaMask and other Web3 wallets via RainbowKit

### Privacy Features

- **FHE-Protected Keys**: Symmetric encryption keys are encrypted using Fully Homomorphic Encryption
- **Selective Decryption**: Only the sender and recipient can decrypt message keys
- **Client-Side Encryption**: Messages are encrypted on the user's device before transmission
- **On-Chain Confidentiality**: Encrypted data stored on blockchain remains confidential
- **No Plaintext Storage**: Neither messages nor keys are ever stored in plaintext on-chain

## Why SecretChat?

Traditional messaging platforms face several challenges:

1. **Centralization**: Most platforms rely on centralized servers that can be compromised, censored, or shut down
2. **Trust Requirements**: Users must trust platform operators with their private data
3. **Limited Transparency**: Closed-source systems make it difficult to verify security claims
4. **Data Ownership**: Users don't truly own their messages or conversation history
5. **Metadata Exposure**: Even with encryption, metadata often reveals communication patterns

SecretChat addresses these issues by:
- **Eliminating Central Servers**: All data is stored on the blockchain
- **Removing Trust Requirements**: Cryptography ensures privacy, not corporate promises
- **Open Source**: All code is transparent and auditable
- **User Ownership**: Messages are owned by the users, not a platform
- **Blockchain Security**: Immutable, tamper-proof message storage

## Architecture

SecretChat employs a sophisticated three-layer architecture:

### Layer 1: Smart Contract (On-Chain)

The `SecretChat.sol` contract manages:
- **User Registry**: Mapping of addresses to usernames
- **Message Storage**: Encrypted message metadata and ciphertext
- **Key Management**: FHE-encrypted symmetric keys with access control
- **Access Control**: Automatic permission granting to sender and recipient

```
┌─────────────────────────────────────────┐
│         SecretChat Contract             │
├─────────────────────────────────────────┤
│  • Username Registration                │
│  • Message Metadata Storage             │
│  • FHE-Encrypted Key Storage            │
│  • Access Control Lists                 │
│  • Inbox/Outbox Management              │
└─────────────────────────────────────────┘
```

### Layer 2: Encryption Layer (FHE + AES-GCM)

Two complementary encryption schemes work together:

**Client-Side Encryption (AES-GCM)**:
- Random 8-digit symmetric key generated for each message
- Message content encrypted with AES-GCM-256
- Produces ciphertext + IV (Initialization Vector)

**On-Chain Encryption (FHE)**:
- Symmetric key encrypted using FHEVM's euint32 type
- Encrypted key stored on blockchain
- Automatic access control via ACL (Access Control List)

```
Plaintext Message
       ↓
  [AES-GCM Encryption] ← Random 8-digit Key
       ↓
  Ciphertext + IV
       ↓
  Store on Blockchain ← [FHE Encryption of Key]
```

### Layer 3: Frontend Application (React + Web3)

A modern, responsive web application featuring:
- **Wallet Connection**: RainbowKit integration for multi-wallet support
- **Username Registration**: Simple interface for claiming usernames
- **Message Composer**: Intuitive UI for sending encrypted messages
- **Message Lists**: Separate inbox and outbox views
- **Real-Time Decryption**: Client-side decryption of received messages
- **Zama Integration**: Direct interaction with FHEVM for key encryption/decryption

## Technology Stack

### Smart Contract Layer

- **Solidity 0.8.27**: Latest stable Solidity version with enhanced security features
- **FHEVM by Zama**: Fully Homomorphic Encryption Virtual Machine
  - `@fhevm/solidity`: FHE operations in Solidity
  - `@zama-fhe/oracle-solidity`: Decryption oracle integration
  - `encrypted-types`: Type-safe FHE operations
- **OpenZeppelin Contracts**: Battle-tested smart contract libraries
- **Hardhat**: Ethereum development environment
  - `@fhevm/hardhat-plugin`: FHE-specific Hardhat extensions
  - `hardhat-deploy`: Deployment management
  - `hardhat-gas-reporter`: Gas usage analysis

### Frontend Layer

- **React 19**: Latest React with concurrent features and performance improvements
- **TypeScript 5.8**: Type-safe development with latest TS features
- **Vite 7**: Lightning-fast build tool and dev server
- **Ethers.js 6**: Ethereum interaction library
- **Wagmi 2**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum interface
- **RainbowKit**: Beautiful wallet connection UI
- **TanStack Query**: Powerful data synchronization

### Development Tools

- **TypeChain**: TypeScript bindings for smart contracts
- **Mocha + Chai**: Testing framework
- **ESLint + Prettier**: Code quality and formatting
- **Solhint**: Solidity linting
- **Hardhat Network**: Local Ethereum network for testing

### Cryptography

- **FHE (euint32)**: Fully Homomorphic Encryption for keys (on-chain)
- **AES-GCM-256**: Authenticated encryption for messages (client-side)
- **SHA-256**: Key derivation for AES keys
- **Web Crypto API**: Browser-native cryptographic operations

## How It Works

### Message Sending Flow

```
┌──────────────┐
│   Sender     │
│ Application  │
└──────┬───────┘
       │ 1. Generate random 8-digit key
       │ 2. Encrypt message with AES-GCM
       ↓
┌──────────────────────────────────┐
│     Encrypted Message            │
│  (Ciphertext + IV)               │
└──────┬───────────────────────────┘
       │ 3. Send to smart contract
       ↓
┌────────────────────────────────────────┐
│        SecretChat Contract             │
│  • Encrypt key with FHE (euint32)      │
│  • Grant access to sender & recipient  │
│  • Store message + encrypted key       │
│  • Update inbox/outbox mappings        │
└────────┬───────────────────────────────┘
         │
         │ Blockchain Storage
         ↓
┌────────────────────────────────────┐
│     Permanent Record               │
│  • Encrypted message ciphertext    │
│  • FHE-encrypted symmetric key     │
│  • Message metadata                │
│  • Timestamp                       │
└────────────────────────────────────┘
```

### Message Retrieval Flow

```
┌──────────────┐
│  Recipient   │
│ Application  │
└──────┬───────┘
       │ 1. Query inbox message IDs
       ↓
┌────────────────────────────────────┐
│     SecretChat Contract            │
│  • Retrieve message metadata       │
│  • Retrieve encrypted ciphertext   │
│  • Request encrypted key (FHE)     │
└────────┬───────────────────────────┘
         │ 2. Get encrypted key
         ↓
┌────────────────────────────────────┐
│        Zama Gateway/Oracle         │
│  • Decrypt FHE key (euint32)       │
│  • Verify recipient authorization  │
│  • Return plaintext symmetric key  │
└────────┬───────────────────────────┘
         │ 3. Receive symmetric key
         ↓
┌────────────────────────────────────┐
│      Recipient Application         │
│  • Use symmetric key               │
│  • Decrypt ciphertext with AES-GCM │
│  • Display plaintext message       │
└────────────────────────────────────┘
```

### Username Resolution

```
User Input: "alice"
     ↓
Contract: keccak256("alice") → bytes32 hash
     ↓
Lookup: usernameToAddress[hash] → 0x1234...5678
     ↓
Verify: usernames[0x1234...5678] == "alice"
     ↓
Result: Validated address for recipient
```

## Problems Solved

### 1. Public Blockchain Transparency

**Problem**: All data on traditional blockchains is publicly visible, making private communication impossible.

**Solution**: SecretChat uses FHE to encrypt sensitive data directly on-chain, allowing computations on encrypted data while maintaining confidentiality.

### 2. Centralized Messaging Platforms

**Problem**: Traditional platforms like WhatsApp, Telegram, and Signal rely on centralized servers that can be:
- Hacked or compromised
- Subject to government surveillance
- Shut down or censored
- Changed by corporate decisions

**Solution**: SecretChat is fully decentralized with no central server. Messages are stored on the immutable blockchain, ensuring availability and censorship resistance.

### 3. Trust in Service Providers

**Problem**: Users must trust messaging platforms to:
- Not read their messages
- Not sell their data
- Properly implement encryption
- Respect their privacy

**Solution**: With SecretChat, trust is replaced by cryptographic guarantees. The smart contract code is open-source and verifiable, and encryption happens on the user's device.

### 4. Key Exchange Complexity

**Problem**: Traditional end-to-end encrypted systems require complex key exchange protocols (like Diffie-Hellman) and key management infrastructure.

**Solution**: SecretChat simplifies key exchange by storing FHE-encrypted keys on-chain with automatic access control, eliminating the need for separate key exchange protocols.

### 5. Metadata Privacy

**Problem**: Even with encrypted messages, metadata (who talks to whom, when, how often) can reveal sensitive information.

**Solution**: While on-chain data shows sender/recipient addresses, users can maintain privacy through:
- Multiple addresses for different contexts
- Optional username pseudonymity
- On-chain obfuscation techniques (future enhancement)

### 6. Message Persistence and Ownership

**Problem**: Centralized platforms control message storage, backup, and deletion. Users don't truly own their communication history.

**Solution**: Messages on SecretChat are stored on the blockchain, providing:
- Permanent, tamper-proof storage
- User ownership of data
- Verifiable message history
- No platform-controlled deletion

### 7. Single Point of Failure

**Problem**: Centralized servers create single points of failure for availability, security, and data integrity.

**Solution**: Blockchain distribution means no single point of failure. The network remains available as long as Ethereum nodes are running.

## Advantages

### Privacy Advantages

1. **True End-to-End Encryption**: Messages encrypted before transmission, decrypted only by recipient
2. **No Plaintext Exposure**: Neither blockchain validators nor anyone else can read message content
3. **Cryptographic Access Control**: FHE ensures only authorized parties can decrypt keys
4. **Client-Side Encryption**: Message content never touches the blockchain in plaintext
5. **Confidential On-Chain Data**: FHE allows encrypted data to be stored and processed on-chain

### Security Advantages

1. **Open Source**: All code is auditable and transparent
2. **Smart Contract Immutability**: Logic cannot be changed after deployment
3. **Blockchain Security**: Inherits Ethereum's robust security model
4. **No Server Vulnerabilities**: No centralized servers to hack
5. **Cryptographic Guarantees**: Security based on mathematics, not trust
6. **Tamper-Proof Storage**: Blockchain prevents message modification

### Decentralization Advantages

1. **Censorship Resistance**: No central authority can block users or messages
2. **Always Available**: Operates 24/7 as long as Ethereum network is running
3. **No Platform Lock-in**: Users own their data and can switch interfaces
4. **Global Accessibility**: Available anywhere with internet access
5. **Permissionless**: Anyone can send messages without approval

### User Advantages

1. **Username System**: Human-readable identifiers instead of long addresses
2. **Message History**: Permanent, verifiable communication record
3. **Multi-Device Access**: Access from any device with wallet access
4. **No Account Required**: Just connect wallet and start messaging
5. **No Subscription Fees**: Only pay blockchain gas fees
6. **Data Portability**: Messages accessible via any interface

### Technical Advantages

1. **Modern Tech Stack**: React 19, TypeScript 5.8, Vite 7
2. **Type Safety**: Full TypeScript coverage for fewer bugs
3. **Developer-Friendly**: Well-documented code and standard tools
4. **Extensible**: Modular architecture for easy feature additions
5. **Gas Optimized**: Efficient Solidity code minimizes transaction costs
6. **Battle-Tested Libraries**: OpenZeppelin, Ethers.js, Hardhat

### Innovation Advantages

1. **Cutting-Edge Cryptography**: Among first applications using FHEVM
2. **Novel Architecture**: Unique combination of FHE + client-side encryption
3. **Research Contribution**: Demonstrates practical FHE usage
4. **Educational Value**: Showcases advanced blockchain + cryptography patterns

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
  ```bash
  node --version  # Should be >= 20.0.0
  ```

- **npm**: Version 7 or higher (comes with Node.js)
  ```bash
  npm --version  # Should be >= 7.0.0
  ```

- **Git**: For cloning the repository
  ```bash
  git --version
  ```

- **MetaMask or Compatible Wallet**: For blockchain interaction

### Smart Contract Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/secretchat.git
cd secretchat
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

SecretChat uses Hardhat's secure variable system:

```bash
# Set your wallet mnemonic (12-24 word seed phrase)
npx hardhat vars set MNEMONIC

# Set Infura API key for Sepolia network access
# Get one free at https://infura.io
npx hardhat vars set INFURA_API_KEY

# (Optional) Set Etherscan API key for contract verification
# Get one free at https://etherscan.io
npx hardhat vars set ETHERSCAN_API_KEY
```

> **Security Warning**: Never commit your mnemonic or private keys to version control. Hardhat vars are stored securely outside the project directory.

#### 4. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile `SecretChat.sol` and dependencies
- Generate TypeScript types with TypeChain
- Output artifacts to `artifacts/` directory
- Create type definitions in `types/` directory

#### 5. Run Tests

```bash
# Run tests on local Hardhat network (FHE mock mode)
npm run test

# Run specific test file
npx hardhat test test/SecretChat.ts

# Run tests with gas reporting
REPORT_GAS=true npm run test
```

Expected output:
```
  SecretChat
    ✓ registers and resolves usernames (1234ms)
    ✓ sends messages with encrypted keys (2345ms)

  2 passing (3s)
```

#### 6. Deploy Locally

Start a local Hardhat node with FHEVM mock:

```bash
# Terminal 1: Start node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:localhost
```

The deployment will output:
```
SecretChat contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Save this address for frontend configuration.

#### 7. Deploy to Sepolia Testnet

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

> **Note**: Sepolia deployment requires:
> - Sepolia ETH for gas fees (get from [Sepolia faucet](https://sepoliafaucet.com))
> - Valid INFURA_API_KEY
> - Properly configured MNEMONIC with funded account

### Frontend Setup

#### 1. Navigate to Frontend Directory

```bash
cd frontend
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Configure Contract Address

Create or edit `frontend/src/config/contracts.ts`:

```typescript
// For local development
export const SECRET_CHAT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// For Sepolia testnet
// export const SECRET_CHAT_ADDRESS = '0xYourSepoliaContractAddress';
```

Alternatively, use environment variables in `frontend/.env`:

```env
VITE_SECRETCHAT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_CHAIN_ID=11155111  # Sepolia chain ID
```

#### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

#### 5. Connect Wallet

1. Open the application in your browser
2. Click "Connect Wallet" button
3. Select MetaMask (or your preferred wallet)
4. Approve the connection
5. Ensure you're on the correct network (localhost:8545 or Sepolia)

#### 6. Register Username

1. Enter a unique username (1-64 characters)
2. Click "Register Username"
3. Approve the transaction in your wallet
4. Wait for transaction confirmation

#### 7. Send Your First Message

1. Switch to "Compose" tab
2. Enter recipient username or address
3. Type your message
4. Click "Send Message"
5. Approve the transaction
6. Your encrypted message is now on the blockchain!

## Deployment

### Local Development Deployment

For development and testing:

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost

# Terminal 3: Start frontend
cd frontend && npm run dev
```

### Sepolia Testnet Deployment

For public testnet deployment:

#### Contract Deployment

```bash
# Ensure you have Sepolia ETH
# Deploy contract
npm run deploy:sepolia

# Expected output:
# SecretChat contract: 0xABCD...1234

# Verify on Etherscan
npx hardhat verify --network sepolia 0xABCD...1234
```

#### Frontend Deployment

Build the frontend for production:

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to your hosting provider:

**Vercel**:
```bash
npm i -g vercel
vercel --prod
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**IPFS** (for fully decentralized hosting):
```bash
npm i -g ipfs-deploy
ipfs-deploy dist/
```

### Environment-Specific Configuration

Create different config files for each environment:

**`frontend/src/config/contracts.local.ts`**:
```typescript
export const SECRET_CHAT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CHAIN_ID = 31337;
```

**`frontend/src/config/contracts.sepolia.ts`**:
```typescript
export const SECRET_CHAT_ADDRESS = '0xYourSepoliaAddress';
export const CHAIN_ID = 11155111;
```

**`frontend/src/config/contracts.mainnet.ts`**:
```typescript
export const SECRET_CHAT_ADDRESS = '0xYourMainnetAddress';
export const CHAIN_ID = 1;
```

## Usage

### Basic Usage

#### 1. Register Username

```typescript
// Via frontend or Hardhat console
await secretChat.registerUsername("alice");
```

#### 2. Send Message

```typescript
// Via frontend
// 1. Generate random key
const key = generateRandomKey(); // e.g., "12345678"

// 2. Encrypt message
const ciphertext = await encryptMessage("Hello Bob!", key);

// 3. Encrypt key with FHE
const input = await fhevm.createEncryptedInput(contractAddress, senderAddress);
await input.add32(parseInt(key));
const { handles, inputProof } = await input.encrypt();

// 4. Send transaction
await secretChat.sendMessage(
  "bob",                    // recipient username
  ethers.ZeroAddress,       // or direct address
  ciphertext,               // encrypted message
  handles[0],               // encrypted key handle
  inputProof                // encryption proof
);
```

#### 3. Read Messages

```typescript
// Get inbox IDs
const inboxIds = await secretChat.getInboxIds(recipientAddress);

// For each message
for (const messageId of inboxIds) {
  // Get metadata
  const metadata = await secretChat.getMessageMetadata(messageId);

  // Get encrypted key
  const encryptedKey = await secretChat.getEncryptedKey(messageId);

  // Decrypt key using Zama gateway
  const plaintextKey = await fhevmInstance.decrypt(encryptedKey);

  // Decrypt message
  const message = await decryptMessage(metadata.ciphertext, plaintextKey);

  console.log(`From ${metadata.senderUsername}: ${message}`);
}
```

### Advanced Usage

#### Sending to Address (Without Username)

```typescript
await secretChat.sendMessage(
  "",                          // empty username
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // direct address
  ciphertext,
  encryptedKey,
  proof
);
```

#### Username Validation

```typescript
// Check if username is available
const owner = await secretChat.resolveUsername("alice");
if (owner === ethers.ZeroAddress) {
  console.log("Username available!");
} else {
  console.log(`Username taken by ${owner}`);
}
```

#### Batch Message Retrieval

```typescript
async function getAllMessages(account: string) {
  const inboxIds = await secretChat.getInboxIds(account);
  const outboxIds = await secretChat.getOutboxIds(account);

  const messages = await Promise.all([
    ...inboxIds.map(id => getFullMessage(id)),
    ...outboxIds.map(id => getFullMessage(id))
  ]);

  return messages;
}
```

#### Error Handling

```typescript
try {
  await secretChat.sendMessage(...);
} catch (error) {
  if (error.message.includes("Sender not registered")) {
    console.error("Please register a username first");
  } else if (error.message.includes("Recipient not found")) {
    console.error("Recipient username or address not found");
  } else if (error.message.includes("Cannot message self")) {
    console.error("Cannot send messages to yourself");
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Project Structure

```
secretchat/
├── contracts/                      # Smart contracts
│   └── SecretChat.sol             # Main messaging contract
│
├── deploy/                         # Deployment scripts
│   └── deploy.ts                  # Contract deployment configuration
│
├── tasks/                          # Hardhat custom tasks
│   ├── accounts.ts                # Account management tasks
│   └── SecretChat.ts              # SecretChat-specific tasks
│
├── test/                           # Test suite
│   └── SecretChat.ts              # Contract tests
│
├── frontend/                       # React frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── SecretChatApp.tsx  # Main app component
│   │   │   ├── Header.tsx         # App header
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── MessageComposer.tsx
│   │   │   └── MessageList.tsx
│   │   │
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useZamaInstance.ts # FHEVM instance hook
│   │   │   └── useEthersSigner.ts # Ethers signer hook
│   │   │
│   │   ├── utils/                 # Utility functions
│   │   │   └── encryption.ts      # AES-GCM encryption logic
│   │   │
│   │   ├── config/                # Configuration files
│   │   │   ├── contracts.ts       # Contract addresses
│   │   │   ├── wagmi.ts          # Wagmi configuration
│   │   │   └── secretChatAbi.ts  # Contract ABI
│   │   │
│   │   ├── styles/                # CSS stylesheets
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   │
│   ├── public/                    # Static assets
│   ├── index.html                 # HTML template
│   ├── vite.config.ts            # Vite configuration
│   └── package.json              # Frontend dependencies
│
├── types/                          # Generated TypeScript types
│   └── (TypeChain generated files)
│
├── artifacts/                      # Compiled contracts
│   └── (Hardhat compilation output)
│
├── .gitignore                      # Git ignore rules
├── hardhat.config.ts              # Hardhat configuration
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # This file
└── LICENSE                        # Project license
```

### Key Files Explained

**`contracts/SecretChat.sol`**
- Core smart contract implementing the messaging logic
- Manages usernames, messages, and FHE-encrypted keys
- Implements access control for encrypted data

**`frontend/src/utils/encryption.ts`**
- Client-side encryption utilities
- AES-GCM encryption/decryption functions
- Key generation and derivation

**`frontend/src/components/SecretChatApp.tsx`**
- Main application component
- Manages app state and navigation
- Coordinates between child components

**`hardhat.config.ts`**
- Hardhat network configuration
- Compiler settings for FHE compatibility
- Plugin configuration for FHEVM

**`tasks/SecretChat.ts`**
- Custom Hardhat tasks for contract interaction
- CLI utilities for testing and debugging

## Security Considerations

### Cryptographic Security

1. **FHE Security**: The FHEVM protocol uses state-of-the-art FHE schemes. Security depends on:
   - TFHE (Torus Fully Homomorphic Encryption) hardness
   - Proper key management by Zama's decryption oracle
   - Correct implementation of access control

2. **AES-GCM Security**: Client-side encryption uses AES-GCM-256, which provides:
   - Confidentiality (encryption)
   - Authenticity (integrity checking)
   - Protection against tampering

3. **Key Generation**: Random keys use `Math.random()` which is **NOT cryptographically secure**
   - **Production Recommendation**: Use `crypto.getRandomValues()` for key generation
   - Current implementation is for demonstration purposes

### Smart Contract Security

1. **Access Control**:
   - FHE keys automatically restricted to sender and recipient
   - No external parties can decrypt keys
   - ACL (Access Control List) enforced by FHEVM

2. **Input Validation**:
   - Username length limits (1-64 characters)
   - Empty message prevention
   - Self-messaging prevention
   - Username uniqueness enforcement

3. **No Reentrancy**: Contract has no external calls that could enable reentrancy attacks

4. **Integer Overflow**: Solidity 0.8.27 has built-in overflow protection

### Operational Security

1. **Private Key Management**:
   - Never share your wallet mnemonic
   - Use hardware wallets for production
   - Store keys in secure, offline locations

2. **Transaction Verification**:
   - Always verify recipient address before sending
   - Check contract address before interacting
   - Review transaction details in wallet

3. **Network Security**:
   - Use HTTPS for frontend access
   - Verify SSL certificates
   - Avoid public WiFi for transactions

### Privacy Considerations

1. **Metadata Leakage**:
   - Sender/recipient addresses are public on-chain
   - Message timestamps are visible
   - Message count per user is observable
   - **Mitigation**: Use different addresses for different contexts

2. **Timing Attacks**:
   - Message send times can reveal activity patterns
   - **Mitigation**: Batch messages or use time delays

3. **Browser Security**:
   - Client-side encryption depends on browser security
   - Malicious browser extensions could compromise keys
   - **Mitigation**: Use dedicated, hardened browsers for sensitive operations

### Known Limitations

1. **Key Size**: FHE keys are limited to euint32 (32-bit), constraining symmetric key space
2. **Gas Costs**: FHE operations are expensive (higher gas costs than standard transactions)
3. **Decryption Latency**: FHE key decryption requires oracle interaction (network delay)
4. **No Forward Secrecy**: Compromised keys reveal all past messages
5. **No Sender Anonymity**: Sender addresses are always visible on-chain

### Security Best Practices

1. **For Users**:
   - Verify contract address from official sources
   - Use hardware wallets for large-scale usage
   - Never reuse symmetric keys (app handles this automatically)
   - Regularly update wallet software

2. **For Developers**:
   - Audit smart contract code before deployment
   - Use testnet for development and testing
   - Implement rate limiting on frontend
   - Monitor contract for anomalous activity

3. **For Auditors**:
   - Focus on FHE key management logic
   - Verify ACL implementation correctness
   - Check for username squatting vulnerabilities
   - Test edge cases in message sending flow

## Testing

### Unit Tests

Run the comprehensive test suite:

```bash
# Run all tests
npm run test

# Run with detailed output
npm run test -- --verbose

# Run specific test
npx hardhat test test/SecretChat.ts

# Run with gas reporting
REPORT_GAS=true npm run test
```

### Test Coverage

Generate coverage report:

```bash
npm run coverage
```

This creates an HTML report in `coverage/index.html`.

**Current Coverage** (example):
```
--------------------|---------|----------|---------|---------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines |
--------------------|---------|----------|---------|---------|
 contracts/         |      100 |    95.45 |      100 |      100 |
  SecretChat.sol    |      100 |    95.45 |      100 |      100 |
--------------------|---------|----------|---------|---------|
```

### Integration Tests

Test full end-to-end flow:

```bash
# Start local node
npx hardhat node

# In another terminal, run integration tests
npx hardhat test --network localhost
```

### Frontend Tests

(Note: Frontend tests to be implemented)

```bash
cd frontend
npm run test  # Placeholder for future tests
```

### Manual Testing Checklist

- [ ] Register unique username successfully
- [ ] Attempt to register taken username (should fail)
- [ ] Send message to valid username
- [ ] Send message to valid address
- [ ] Attempt to send message without username (should fail)
- [ ] Attempt to send message to self (should fail)
- [ ] View inbox messages
- [ ] View outbox messages
- [ ] Decrypt received message successfully
- [ ] Verify sender can decrypt sent message
- [ ] Test with multiple accounts
- [ ] Switch between networks (localhost, Sepolia)

### Testing on Sepolia

To test on the live Sepolia testnet:

```bash
# Get Sepolia ETH from faucet
# https://sepoliafaucet.com

# Run tests on Sepolia
npm run test:sepolia

# Or deploy and interact manually
npm run deploy:sepolia
# Then use frontend to test
```

**Note**: Sepolia tests require:
- Real Sepolia ETH for gas
- Zama gateway access
- Network latency tolerance (slower than local tests)

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)

- [ ] **Group Messaging**: Multi-party encrypted conversations
  - Shared key distribution mechanism
  - Group member management
  - Admin controls and permissions

- [ ] **Message Reactions**: React to messages with emojis
  - On-chain reaction storage
  - Privacy-preserving reaction system

- [ ] **Read Receipts**: Optional read confirmation
  - Encrypted read status
  - User-configurable privacy settings

- [ ] **Message Editing**: Edit sent messages with version history
  - Append-only edit log
  - Verification of original content

### Phase 2: Advanced Privacy (Q3 2025)

- [ ] **Enhanced Metadata Privacy**:
  - Stealth addresses for recipient anonymity
  - Mixing services for sender anonymity
  - Time-delayed message sending

- [ ] **Forward Secrecy**:
  - Ephemeral key exchange
  - Automatic key rotation
  - Per-message key derivation

- [ ] **Zero-Knowledge Proofs**:
  - ZK proofs for username registration
  - Private recipient verification
  - Anonymous reputation system

- [ ] **Onion Routing**:
  - Multi-hop message routing
  - Network-level privacy
  - Tor integration for metadata protection

### Phase 3: User Experience (Q4 2025)

- [ ] **Mobile Applications**:
  - React Native iOS app
  - React Native Android app
  - WalletConnect integration
  - Push notifications via decentralized services

- [ ] **Rich Media Support**:
  - Image sharing (encrypted on IPFS)
  - File attachments (encrypted storage)
  - Voice messages (encrypted audio)
  - Video messages (encrypted video)

- [ ] **Message Search**:
  - Client-side indexed search
  - Privacy-preserving search algorithms
  - Full-text search on decrypted content

- [ ] **Contact Management**:
  - Address book with encrypted contacts
  - Contact verification system
  - Import/export contact lists

### Phase 4: Scaling & Performance (Q1 2026)

- [ ] **Layer 2 Integration**:
  - Optimism/Arbitrum deployment
  - ZK-rollup compatibility
  - Cross-layer messaging

- [ ] **Gas Optimization**:
  - Batch message sending
  - Optimized storage patterns
  - Message compression

- [ ] **Caching & Performance**:
  - Local message caching
  - Optimistic UI updates
  - Background synchronization
  - Service worker for offline support

- [ ] **Scalability Solutions**:
  - Off-chain message storage with on-chain proofs
  - Message expiration and pruning
  - Sharded message storage

### Phase 5: Enterprise Features (Q2 2026)

- [ ] **Multi-Signature Messages**:
  - Require multiple approvals for sending
  - Organizational message controls
  - Role-based access control

- [ ] **Compliance Tools**:
  - Optional regulatory reporting
  - Audit trail generation
  - Selective disclosure mechanisms

- [ ] **Integration APIs**:
  - Webhook support
  - Third-party app integrations
  - Bot framework for automated messaging

- [ ] **Analytics Dashboard**:
  - Privacy-preserving usage metrics
  - Network health monitoring
  - Performance analytics

### Phase 6: Advanced Cryptography (Q3 2026)

- [ ] **Post-Quantum Cryptography**:
  - Quantum-resistant encryption
  - Lattice-based cryptography
  - Future-proof security

- [ ] **Threshold Encryption**:
  - Distributed key management
  - M-of-N decryption schemes
  - No single point of key compromise

- [ ] **Homomorphic Operations**:
  - Computation on encrypted messages
  - Private message analytics
  - Encrypted voting on messages

### Phase 7: Cross-Chain & Interoperability (Q4 2026)

- [ ] **Multi-Chain Support**:
  - Ethereum mainnet
  - Polygon
  - Binance Smart Chain
  - Avalanche
  - Other EVM chains

- [ ] **Cross-Chain Messaging**:
  - Bridge protocols
  - Unified inbox across chains
  - Cross-chain username resolution

- [ ] **Protocol Integrations**:
  - XMTP compatibility
  - Lens Protocol integration
  - Farcaster integration
  - Matrix protocol bridge

### Research & Exploration

- [ ] **Decentralized Identity**:
  - ENS integration
  - DID (Decentralized Identifiers)
  - Verifiable credentials

- [ ] **Incentive Mechanisms**:
  - Token rewards for relay nodes
  - Reputation systems
  - Spam prevention mechanisms

- [ ] **Governance**:
  - DAO for protocol upgrades
  - Community governance
  - Feature voting

- [ ] **AI Integration**:
  - Encrypted AI assistants
  - Private sentiment analysis
  - Smart reply suggestions (local processing)

### Community Goals

- [ ] Documentation improvements
- [ ] Video tutorials and guides
- [ ] Developer workshops and hackathons
- [ ] Bug bounty program
- [ ] Security audit by reputable firm
- [ ] Translation to multiple languages
- [ ] Accessibility improvements (WCAG compliance)

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, improving documentation, or spreading the word, your help is appreciated.

### How to Contribute

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/yourusername/secretchat.git
   cd secretchat
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run compile
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # Use conventional commits format
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create Pull Request on GitHub
   ```

### Contribution Guidelines

#### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint and Prettier configs provided
- **Comments**: Document complex logic and public functions
- **Naming**: Use descriptive names for variables and functions

#### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add group messaging support
fix: resolve username collision bug
docs: update README with deployment instructions
test: add tests for message encryption
chore: update dependencies
refactor: simplify encryption logic
```

#### Pull Request Process

1. **Description**: Clearly describe what your PR does and why
2. **Testing**: Include test results and manual testing notes
3. **Screenshots**: Add screenshots for UI changes
4. **Breaking Changes**: Clearly mark any breaking changes
5. **Linked Issues**: Reference related issues with "Closes #123"

#### Areas for Contribution

**Good First Issues**:
- Documentation improvements
- UI/UX enhancements
- Test coverage expansion
- Bug fixes

**Advanced Contributions**:
- New features from roadmap
- Performance optimizations
- Security enhancements
- Protocol improvements

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests to ensure everything works
5. Make your changes
6. Submit a PR

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help newcomers learn and contribute
- Report inappropriate behavior

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Featured on project website (future)

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What This Means

- ✅ **You can**: Use, modify, and distribute this software
- ✅ **You can**: Use it commercially
- ✅ **You can**: Modify it for private use
- ✅ **You must**: Include the license and copyright notice
- ✅ **You must**: State significant changes made
- ❌ **You cannot**: Hold the authors liable
- ❌ **No patent grant**: Patent rights not explicitly granted

### License Text

```
BSD 3-Clause Clear License

Copyright (c) 2025, SecretChat Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software without
  specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY THIS
LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Support

### Getting Help

**Documentation**:
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev)

**Community**:
- [GitHub Discussions](https://github.com/yourusername/secretchat/discussions) - Ask questions and share ideas
- [Zama Discord](https://discord.gg/zama) - FHE and FHEVM community
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com) - Smart contract questions

**Issue Reporting**:
- [GitHub Issues](https://github.com/yourusername/secretchat/issues) - Report bugs or request features
- Use issue templates provided
- Include reproduction steps for bugs
- Attach relevant logs and screenshots

### Frequently Asked Questions

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE allows computation on encrypted data without decrypting it first. In SecretChat, it enables the blockchain to store and manage encrypted keys without ever exposing them.

**Q: How much does it cost to send a message?**
A: Costs depend on Ethereum gas prices. FHE operations are more expensive than standard transactions. On Sepolia testnet (using free test ETH), you can experiment without real costs.

**Q: Can anyone read my messages?**
A: No. Messages are encrypted client-side, and only the recipient (and sender) can decrypt the symmetric key needed to read the message content.

**Q: What happens if I lose my wallet?**
A: You lose access to your messages. There's no password recovery since there's no central authority. Always back up your wallet seed phrase securely.

**Q: Is SecretChat production-ready?**
A: SecretChat is a demonstration project showcasing FHE technology. While functional, it should be audited and tested more extensively before production use with sensitive data.

**Q: Which networks are supported?**
A: Currently supports Ethereum Sepolia testnet and local Hardhat network. Mainnet and other L2s are planned (see roadmap).

**Q: Can I use SecretChat without cryptocurrency?**
A: No, you need ETH (or test ETH) to pay for transaction gas fees. This is inherent to how Ethereum works.

**Q: How is this different from Signal or WhatsApp?**
A: SecretChat is decentralized (no central server), blockchain-based (immutable storage), and uses FHE (privacy-preserving on-chain encryption). Traditional apps rely on centralized servers and require trust in the service provider.

### Stay Updated

- **GitHub**: Star and watch the repository for updates
- **Twitter**: Follow [@YourTwitterHandle] for announcements
- **Blog**: [YourBlogURL] for technical deep-dives
- **Newsletter**: [Subscribe link] for monthly updates

### Acknowledgments

Built with:
- [Zama FHEVM](https://zama.ai) - Fully Homomorphic Encryption technology
- [Hardhat](https://hardhat.org) - Ethereum development environment
- [OpenZeppelin](https://openzeppelin.com) - Secure smart contract libraries
- [React](https://react.dev) - Frontend framework
- [RainbowKit](https://rainbowkit.com) - Wallet connection UI
- [Ethers.js](https://ethers.org) - Ethereum library

Special thanks to the Zama team for pioneering FHE on blockchain.

---

**Built with privacy at its core. Powered by cryptography, not trust.**

Made with ❤️ by the SecretChat community

[⬆ Back to Top](#secretchat---blockchain-powered-private-messaging-with-fhe)
