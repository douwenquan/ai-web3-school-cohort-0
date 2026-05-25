# Transaction Interpreter — Design Spec

## Overview

A minimal interactive web app that takes an Ethereum transaction hash, fetches on-chain data (transaction details, event logs, contract ABI), and uses an LLM (DeepSeek) to generate a structured, human-readable explanation. The project serves as a learning artifact demonstrating AI-Web3 crossover: chain-aware context, web3 tool use (RPC/Etherscan), and LLM structured output.

**Target directory**: `experiments/tx-interpreter/`

## Key Types

```typescript
// Chain configuration
type Chain = 'mainnet';  // reserved: | 'arbitrum' | 'optimism' | 'base'

// Parsed LLM output — the 6 explanation blocks
interface Explanation {
  actionSummary: string;     // 动作摘要
  assetsAndAddresses: string; // 资产/地址
  onChainData: string;        // 链上数据 (populated from Etherscan, not LLM)
  modelInference: string;     // 模型推断
  uncertainties: string;      // 不确定项
  securityChecklist: string;  // 安全检查
}

// Raw context fed into the LLM prompt
interface TxContext {
  chain: Chain;
  txHash: string;
  txDetail: TxDetail;          // from Etherscan proxy
  eventLogs: EventLog[];       // from receipt
  contractABI: AbiItem[] | null; // from Etherscan or manual input
  manualABI: boolean;           // true if ABI was manually provided
}
```

## Chain Support

- **Initial**: Ethereum Mainnet only, using `api.etherscan.io`
- **Multi-chain reserved**: All service functions accept a `chain` parameter. Adding a new chain requires only a new entry in a `CHAIN_CONFIG` map (base URL + explorer URL). Chain selector in UI shows only `mainnet` for now, with the dropdown extensible by adding items to the config array.

## Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Plain CSS (no UI library — keeps it minimal)
- **Blockchain data**: Etherscan API (mainnet, with multi-chain architecture reserved)
- **LLM**: DeepSeek API (OpenAI-compatible SDK), user provides API key
- **Deployment**: Static HTML via `vite build`, or `vite dev` for local use

## Architecture

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component, state orchestration
├── components/
│   ├── ConfigPanel.tsx   # API key inputs (Etherscan + DeepSeek)
│   ├── InputPanel.tsx    # Chain selector + Tx hash + optional manual ABI
│   ├── RawDataPanel.tsx  # Display raw on-chain data (tx details, events, ABI)
│   └── ExplanationPanel.tsx # 6-block AI explanation output
├── services/
│   ├── etherscan.ts      # Etherscan API client (tx, events, ABI)
│   └── llm.ts            # DeepSeek API client (OpenAI SDK)
├── prompts/
│   └── explain.ts        # System prompt template for transaction explanation
├── types/
│   └── index.ts          # Shared TypeScript types
└── App.css               # Styles
```

## Data Flow

```
User enters Tx Hash
  → Etherscan API: get tx details + event logs + contract ABI
  → Assemble structured context (raw data)
  → Display Step 1: raw on-chain data
  → Build prompt: system prompt + structured context
  → DeepSeek API: generate explanation
  → Parse LLM output into 6 blocks
  → Display Step 2: structured explanation
  → Annotate each block with AI/Human boundary
```

## API Configuration

- Etherscan API key: stored in browser localStorage, user enters once
- DeepSeek API key + custom base URL: stored in localStorage, user enters once
- No backend proxy — all requests made directly from browser

## The 6 Explanation Blocks

| Block | Content | Source |
|-------|---------|--------|
| 动作摘要 | What action the user initiated (transfer, swap, approve, mint...) | AI inference from function signature + params |
| 资产/地址 | Assets and addresses involved, with labels where available | Derived from tx value, token transfers, event logs |
| 链上数据 | Raw on-chain facts: block, gas, nonce, state changes | Direct from Etherscan, not inferred |
| 模型推断 | What the model infers beyond raw data (intent, counterparty, context) | LLM inference, explicitly labeled |
| 不确定项 | What the model is uncertain about, with confidence levels | LLM self-assessment |
| 安全检查 | If signing a similar tx, what to verify (spender, amount, calldata) | LLM generated, human-review-required |

## AI / Human Boundary Annotation

Each explanation block carries a visual tag:
- **🤖 AI 生成** — content produced by LLM (blocks: 动作摘要, 资产/地址, 模型推断, 不确定项, 安全检查)
- **📡 链上数据** — directly from Etherscan, verified by tool (block: 链上数据)
- **⚠️ 需人工验证** — LLM inference that should be cross-checked (blocks: 模型推断, 安全检查)

Manual ABI input (when Etherscan doesn't have it) is a **human-verified** data source, tagged accordingly.

## Non-Goals (for this iteration)

- Wallet connection / live transaction signing
- Historical transaction search or browsing
- Multi-chain deployment (architecture reserved but not implemented)
- Mobile responsive design (desktop-first for demo)
- Offline support, i18n, analytics

## File-by-File Scope

### `services/etherscan.ts`
- `getTxDetail(txHash, apiKey, chain)` — calls `eth_getTransactionByHash` equivalent via Etherscan
- `getEventLogs(txHash, apiKey, chain)` — calls `eth_getTransactionReceipt` for logs
- `getContractABI(contractAddress, apiKey, chain)` — calls Etherscan Contract ABI endpoint

### `services/llm.ts`
- `explainTransaction(context, apiKey, baseUrl)` — sends prompt to DeepSeek, returns parsed explanation
- Uses OpenAI SDK with `baseURL` pointing to `https://api.deepseek.com`

### `prompts/explain.ts`
- System prompt template defining the 6-block output format
- Requests structured JSON output from LLM for reliable parsing
- Includes chain-awareness instructions (Ethereum mainnet specifics)

### Components
Each component is self-contained, receiving data via props, emitting user actions via callbacks. No global state management library needed — App-level useState is sufficient.

## Error Handling

- Etherscan free tier: 5 calls/sec, 100k/day. Single analysis makes 3 calls (tx + receipt + ABI). No need for rate limiting in this app.
- Invalid tx hash → inline error message, no API call
- Etherscan API error (rate limit, invalid key, not found) → show error in Step 1 area
- DeepSeek API error → show error in Step 2 area
- Unverified contract (no ABI) → show warning + prompt user to paste ABI manually
- LLM returns malformed JSON → show raw LLM output as fallback + error note

## Testing

- No automated tests for this iteration (demo artifact)
- Manual testing checklist in the impl plan
