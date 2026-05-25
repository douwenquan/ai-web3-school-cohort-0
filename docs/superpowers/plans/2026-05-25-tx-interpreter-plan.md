# Transaction Interpreter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal interactive web app that takes an Ethereum tx hash, fetches on-chain data via Etherscan, and uses DeepSeek to generate a structured explanation with clear AI/human boundary annotations.

**Architecture:** Single-page React app with two data pipelines: Etherscan fetch (tx detail → receipt/logs → ABI) then LLM inference (structured context → DeepSeek → 6-block explanation). API keys persist in localStorage. No backend.

**Tech Stack:** React 18 + Vite + TypeScript, OpenAI SDK (for DeepSeek), ethers v6 (ABI decoding), plain CSS

---

### Task 1: Project Scaffolding

**Files:**
- Create: `experiments/tx-interpreter/package.json`
- Create: `experiments/tx-interpreter/tsconfig.json`
- Create: `experiments/tx-interpreter/tsconfig.app.json`
- Create: `experiments/tx-interpreter/vite.config.ts`
- Create: `experiments/tx-interpreter/index.html`
- Create: `experiments/tx-interpreter/src/main.tsx`
- Create: `experiments/tx-interpreter/src/vite-env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "tx-interpreter",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "ethers": "^6.13.0",
    "openai": "^4.73.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 3: Create tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 5: Create index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Transaction Interpreter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 7: Create src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 8: Install dependencies and verify**

Run: `cd /Users/izumi/Documents/code/ai-web3-school-cohort-0/experiments/tx-interpreter && npm install`
Expected: installs without errors

Run: `npx vite build`
Expected: builds successfully (will have empty App.tsx warnings which is fine)

---

### Task 2: Types and Constants

**Files:**
- Create: `experiments/tx-interpreter/src/types/index.ts`

- [ ] **Step 1: Create types/index.ts**

```typescript
export type Chain = 'mainnet';

export interface ChainConfig {
  name: string;
  etherscanBaseUrl: string;
  explorerUrl: string;
}

export const CHAIN_CONFIGS: Record<Chain, ChainConfig> = {
  mainnet: {
    name: 'Ethereum Mainnet',
    etherscanBaseUrl: 'https://api.etherscan.io',
    explorerUrl: 'https://etherscan.io',
  },
};

export interface TxDetail {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  nonce: string;
  input: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex: string;
}

export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  decoded?: DecodedEvent | null;
}

export interface DecodedEvent {
  name: string;
  params: Record<string, unknown>;
}

export interface AbiItem {
  type: string;
  name?: string;
  inputs?: { name: string; type: string; indexed?: boolean }[];
  outputs?: { name: string; type: string }[];
  stateMutability?: string;
  anonymous?: boolean;
}

export interface TxContext {
  chain: Chain;
  txHash: string;
  txDetail: TxDetail;
  eventLogs: EventLog[];
  contractABI: AbiItem[] | null;
  manualABI: boolean;
  decodedInput: { name: string; params: Record<string, unknown> } | null;
}

export interface Explanation {
  actionSummary: string;
  assetsAndAddresses: string;
  onChainData: string;
  modelInference: string;
  uncertainties: string;
  securityChecklist: string;
}
```

---

### Task 3: Etherscan Service

**Files:**
- Create: `experiments/tx-interpreter/src/services/etherscan.ts`

- [ ] **Step 1: Create services/etherscan.ts**

```typescript
import { ethers } from 'ethers';
import {
  Chain,
  CHAIN_CONFIGS,
  TxDetail,
  EventLog,
  AbiItem,
} from '../types';

function buildUrl(chain: Chain, params: Record<string, string>): string {
  const base = CHAIN_CONFIGS[chain].etherscanBaseUrl;
  const searchParams = new URLSearchParams(params);
  return `${base}/api?${searchParams.toString()}`;
}

export async function getTxDetail(
  txHash: string,
  apiKey: string,
  chain: Chain,
): Promise<TxDetail> {
  const url = buildUrl(chain, {
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash: txHash,
    apikey: apiKey,
  });

  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    throw new Error(`Etherscan error: ${json.error.message}`);
  }
  if (!json.result) {
    throw new Error('Transaction not found. Check the tx hash and chain.');
  }

  const r = json.result;
  return {
    hash: r.hash,
    from: r.from,
    to: r.to,
    value: r.value,
    gas: r.gas,
    gasPrice: r.gasPrice,
    nonce: r.nonce,
    input: r.input,
    blockNumber: r.blockNumber,
    blockHash: r.blockHash,
    transactionIndex: r.transactionIndex,
  };
}

export async function getEventLogs(
  txHash: string,
  apiKey: string,
  chain: Chain,
): Promise<EventLog[]> {
  const url = buildUrl(chain, {
    module: 'proxy',
    action: 'eth_getTransactionReceipt',
    txhash: txHash,
    apikey: apiKey,
  });

  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    throw new Error(`Etherscan error: ${json.error.message}`);
  }
  if (!json.result) {
    return [];
  }

  return json.result.logs.map(
    (log: { address: string; topics: string[]; data: string; blockNumber: string; transactionHash: string; logIndex: string }) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      logIndex: log.logIndex,
    }),
  );
}

function decodeLogs(logs: EventLog[], abi: AbiItem[]): EventLog[] {
  try {
    const iface = new ethers.Interface(abi);
    return logs.map((log) => {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed) {
          const params: Record<string, unknown> = {};
          for (const [key, val] of parsed.args.entries() as Iterable<[string, unknown]>) {
            params[key] = String(val);
          }
          return {
            ...log,
            decoded: { name: parsed.name, params },
          };
        }
      } catch {
        // event not in this ABI, return undecoded
      }
      return { ...log, decoded: null };
    });
  } catch {
    return logs.map((log) => ({ ...log, decoded: null }));
  }
}

export async function getContractABI(
  contractAddress: string,
  apiKey: string,
  chain: Chain,
): Promise<AbiItem[] | null> {
  const url = buildUrl(chain, {
    module: 'contract',
    action: 'getabi',
    address: contractAddress,
    apikey: apiKey,
  });

  const res = await fetch(url);
  const json = await res.json();

  if (json.status === '0') {
    return null; // unverified contract
  }

  try {
    return JSON.parse(json.result);
  } catch {
    return null;
  }
}

function decodeTxInput(input: string, abi: AbiItem[]): {
  name: string;
  params: Record<string, unknown>;
} | null {
  if (input === '0x' || input === '0x0') return null;

  try {
    const iface = new ethers.Interface(abi);
    const parsed = iface.parseTransaction({ data: input });
    if (parsed) {
      const params: Record<string, unknown> = {};
      for (const [key, val] of parsed.args.entries() as Iterable<[string, unknown]>) {
        params[key] = String(val);
      }
      return { name: parsed.name, params };
    }
  } catch {
    // input doesn't match any ABI function
  }
  return null;
}

export interface FetchResult {
  context: {
    chain: Chain;
    txHash: string;
    txDetail: TxDetail;
    eventLogs: EventLog[];
    contractABI: AbiItem[] | null;
    manualABI: boolean;
    decodedInput: { name: string; params: Record<string, unknown> } | null;
  };
}

export async function fetchTxData(
  txHash: string,
  apiKey: string,
  chain: Chain,
  manualABIJson?: string,
): Promise<FetchResult> {
  const txDetail = await getTxDetail(txHash, apiKey, chain);

  const [eventLogs, contractABI] = await Promise.all([
    getEventLogs(txHash, apiKey, chain),
    txDetail.to ? getContractABI(txDetail.to, apiKey, chain) : Promise.resolve(null),
  ]);

  let abi = contractABI;
  let manualABI = false;

  if (manualABIJson) {
    try {
      abi = JSON.parse(manualABIJson);
      manualABI = true;
    } catch {
      throw new Error('Manual ABI is not valid JSON.');
    }
  }

  const decodedLogs = abi ? decodeLogs(eventLogs, abi) : eventLogs;
  const decodedInput = abi ? decodeTxInput(txDetail.input, abi) : null;

  return {
    context: {
      chain,
      txHash,
      txDetail,
      eventLogs: decodedLogs,
      contractABI: abi,
      manualABI,
      decodedInput,
    },
  };
}
```

---

### Task 4: LLM Service and Prompt

**Files:**
- Create: `experiments/tx-interpreter/src/prompts/explain.ts`
- Create: `experiments/tx-interpreter/src/services/llm.ts`

- [ ] **Step 1: Create prompts/explain.ts**

```typescript
export const SYSTEM_PROMPT = `You are an Ethereum transaction interpreter. Given raw on-chain transaction data, you produce a structured explanation in Chinese.

Your output MUST be valid JSON with exactly these 6 fields:

1. "actionSummary": A concise summary of what action the user initiated (e.g., "在 Uniswap V3 上将 1000 USDC 兑换为 0.5 ETH"). Infer the action from function signature, decoded input, event logs, and value transfer. If the transaction is a plain ETH transfer (input is 0x), just describe the transfer.

2. "assetsAndAddresses": List all assets and addresses involved. For each address, note its role (from, to, contract, token, spender, recipient). For each asset, note the amount and token symbol if identifiable from events/logs. Format as bullet points.

3. "onChainData": Summarize the raw on-chain facts that are directly verifiable from the transaction data (not inferred). Include: block number, gas used/price, nonce, the raw calldata/input, and key event log topics. These are mechanical facts — present them as-is.

4. "modelInference": What you are inferring BEYOND the raw data. This includes: the likely protocol/dApp name (e.g., guessing "Uniswap V3" from contract address patterns), the user's probable intent, the economic meaning of the transaction (e.g., "this looks like adding liquidity"), and any pattern matching against known protocols. Be explicit that these are inferences, not facts.

5. "uncertainties": List everything you are NOT certain about. Be specific: "不确定合约 0x... 是否为 Uniswap V3 Router，也可能是其他 DEX 聚合器", "无法确定代币 0x... 的 symbol，链上数据中未出现该代币的 Transfer 事件", "ABI 缺失，无法解码 calldata，函数名是猜测的". If confidence is high on some parts and low on others, note the split.

6. "securityChecklist": If the user were to sign a similar transaction, what should they check? Include: verifying the spender address (especially for approve), checking amounts are reasonable, understanding what permission approve gives, verifying the recipient address, checking for unusual calldata. Format as actionable checklist items in Chinese.

IMPORTANT RULES:
- Write ALL text content in Chinese.
- If the decoded input/events are available, reference them specifically.
- If ABI was manually provided, note that it should be verified.
- Do NOT invent data not present in the context. If something is unknown, say so in uncertainties.
- Output ONLY the JSON object, no markdown fences, no extra text.`;

export function buildUserPrompt(contextJson: string): string {
  return `Here is the transaction data:

${contextJson}

Generate the structured explanation JSON.`;
}
```

- [ ] **Step 2: Create services/llm.ts**

```typescript
import OpenAI from 'openai';
import { Explanation, TxContext } from '../types';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/explain';

export async function explainTransaction(
  context: TxContext,
  apiKey: string,
  baseUrl: string,
): Promise<Explanation> {
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl || 'https://api.deepseek.com',
    dangerouslyAllowBrowser: true,
  });

  const contextJson = JSON.stringify(context, null, 2);
  const userPrompt = buildUserPrompt(contextJson);

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek returned empty response.');
  }

  // Try to parse JSON — handle markdown code fences if present
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  let parsed: Explanation;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse LLM response as JSON. Raw output:\n${content}`);
  }

  // Validate required fields
  const requiredFields: (keyof Explanation)[] = [
    'actionSummary',
    'assetsAndAddresses',
    'onChainData',
    'modelInference',
    'uncertainties',
    'securityChecklist',
  ];
  for (const field of requiredFields) {
    if (typeof parsed[field] !== 'string') {
      throw new Error(`LLM response missing required field: ${field}`);
    }
  }

  return parsed;
}
```

---

### Task 5: ConfigPanel Component

**Files:**
- Create: `experiments/tx-interpreter/src/components/ConfigPanel.tsx`

- [ ] **Step 1: Create components/ConfigPanel.tsx**

```typescript
import { useState, useEffect } from 'react';

interface Config {
  etherscanKey: string;
  deepseekKey: string;
  deepseekBaseUrl: string;
}

interface ConfigPanelProps {
  onConfigured: () => void;
}

const STORAGE_KEY = 'tx-interpreter-config';

function loadConfig(): Config | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return null;
}

function saveConfig(config: Config): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function ConfigPanel({ onConfigured }: ConfigPanelProps) {
  const saved = loadConfig();
  const [etherscanKey, setEtherscanKey] = useState(saved?.etherscanKey ?? '');
  const [deepseekKey, setDeepseekKey] = useState(saved?.deepseekKey ?? '');
  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState(
    saved?.deepseekBaseUrl ?? 'https://api.deepseek.com',
  );
  const [saved_, setSaved_] = useState(!!saved);

  useEffect(() => {
    if (saved) {
      onConfigured();
    }
  }, []);

  function handleSave() {
    if (!etherscanKey.trim() || !deepseekKey.trim()) return;
    saveConfig({ etherscanKey: etherscanKey.trim(), deepseekKey: deepseekKey.trim(), deepseekBaseUrl: deepseekBaseUrl.trim() || 'https://api.deepseek.com' });
    setSaved_(true);
    onConfigured();
  }

  if (saved_) {
    return (
      <div className="config-panel config-panel--saved">
        <span>API 配置已就绪</span>
        <button onClick={() => setSaved_(false)}>修改</button>
      </div>
    );
  }

  return (
    <div className="config-panel">
      <h3>API 配置</h3>
      <div className="config-field">
        <label htmlFor="etherscan-key">Etherscan API Key</label>
        <input
          id="etherscan-key"
          type="password"
          value={etherscanKey}
          onChange={(e) => setEtherscanKey(e.target.value)}
          placeholder="从 etherscan.io 获取"
        />
      </div>
      <div className="config-field">
        <label htmlFor="deepseek-key">DeepSeek API Key</label>
        <input
          id="deepseek-key"
          type="password"
          value={deepseekKey}
          onChange={(e) => setDeepseekKey(e.target.value)}
          placeholder="sk-..."
        />
      </div>
      <div className="config-field">
        <label htmlFor="deepseek-url">DeepSeek Base URL</label>
        <input
          id="deepseek-url"
          type="text"
          value={deepseekBaseUrl}
          onChange={(e) => setDeepseekBaseUrl(e.target.value)}
          placeholder="https://api.deepseek.com"
        />
      </div>
      <button onClick={handleSave}>保存配置</button>
    </div>
  );
}
```

---

### Task 6: InputPanel Component

**Files:**
- Create: `experiments/tx-interpreter/src/components/InputPanel.tsx`

- [ ] **Step 1: Create components/InputPanel.tsx**

```typescript
import { useState } from 'react';
import { Chain, CHAIN_CONFIGS } from '../types';

interface InputPanelProps {
  onAnalyze: (txHash: string, chain: Chain, manualABI?: string) => void;
  loading: boolean;
}

export default function InputPanel({ onAnalyze, loading }: InputPanelProps) {
  const [txHash, setTxHash] = useState('');
  const [chain, setChain] = useState<Chain>('mainnet');
  const [manualABI, setManualABI] = useState('');
  const [showManualABI, setShowManualABI] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txHash.trim()) return;
    const abi = showManualABI && manualABI.trim() ? manualABI.trim() : undefined;
    onAnalyze(txHash.trim(), chain, abi);
  }

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <div className="input-row">
        <select value={chain} onChange={(e) => setChain(e.target.value as Chain)}>
          {Object.entries(CHAIN_CONFIGS).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="输入交易哈希 (0x...)"
          className="tx-input"
        />
        <button type="submit" disabled={loading || !txHash.trim()}>
          {loading ? '分析中...' : '分析'}
        </button>
      </div>
      <div className="manual-abi-toggle">
        <button type="button" onClick={() => setShowManualABI(!showManualABI)} className="link-btn">
          {showManualABI ? '收起' : '+ 手动粘贴 ABI（可选）'}
        </button>
      </div>
      {showManualABI && (
        <textarea
          value={manualABI}
          onChange={(e) => setManualABI(e.target.value)}
          placeholder="粘贴合约 ABI JSON..."
          rows={6}
          className="abi-textarea"
        />
      )}
    </form>
  );
}
```

---

### Task 7: RawDataPanel Component

**Files:**
- Create: `experiments/tx-interpreter/src/components/RawDataPanel.tsx`

- [ ] **Step 1: Create components/RawDataPanel.tsx**

```typescript
import { TxContext } from '../types';

interface RawDataPanelProps {
  context: TxContext;
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <details className="raw-block">
      <summary>{title}</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}

export default function RawDataPanel({ context }: RawDataPanelProps) {
  return (
    <div className="raw-data-panel">
      <h3>
        <span className="badge badge-data">📡 链上数据</span>
        原始链上数据
      </h3>
      <JsonBlock title="交易详情" data={context.txDetail} />
      <JsonBlock title={`事件日志 (${context.eventLogs.length})`} data={context.eventLogs} />
      {context.contractABI && (
        <JsonBlock
          title={`合约 ABI ${context.manualABI ? '(人工提供)' : '(Etherscan 获取)'}`}
          data={context.contractABI}
        />
      )}
      {!context.contractABI && (
        <div className="raw-block warning">
          未能获取合约 ABI（合约可能未验证），LLM 只能根据原始 calldata 推断。
        </div>
      )}
    </div>
  );
}
```

---

### Task 8: ExplanationPanel Component

**Files:**
- Create: `experiments/tx-interpreter/src/components/ExplanationPanel.tsx`

- [ ] **Step 1: Create components/ExplanationPanel.tsx**

```typescript
import { Explanation } from '../types';

interface ExplanationPanelProps {
  explanation: Explanation;
}

interface BlockConfig {
  key: keyof Explanation;
  title: string;
  badge: { text: string; className: string };
}

const BLOCKS: BlockConfig[] = [
  {
    key: 'actionSummary',
    title: '动作摘要',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'assetsAndAddresses',
    title: '资产与地址',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'onChainData',
    title: '链上数据摘要',
    badge: { text: '📡 链上数据', className: 'badge-data' },
  },
  {
    key: 'modelInference',
    title: '模型推断',
    badge: { text: '⚠️ 需人工验证', className: 'badge-verify' },
  },
  {
    key: 'uncertainties',
    title: '不确定项',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'securityChecklist',
    title: '安全检查清单',
    badge: { text: '⚠️ 需人工验证', className: 'badge-verify' },
  },
];

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <div className="explanation-panel">
      <h3>AI 解释</h3>
      <div className="explanation-grid">
        {BLOCKS.map((block) => (
          <div key={block.key} className="explanation-block">
            <div className="block-header">
              <h4>{block.title}</h4>
              <span className={`badge ${block.badge.className}`}>{block.badge.text}</span>
            </div>
            <div className="block-content">
              {explanation[block.key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 9: App.tsx Integration

**Files:**
- Create: `experiments/tx-interpreter/src/App.tsx`

- [ ] **Step 1: Create App.tsx**

```typescript
import { useState, useCallback } from 'react';
import ConfigPanel from './components/ConfigPanel';
import InputPanel from './components/InputPanel';
import RawDataPanel from './components/RawDataPanel';
import ExplanationPanel from './components/ExplanationPanel';
import { fetchTxData } from './services/etherscan';
import { explainTransaction } from './services/llm';
import { Chain, TxContext, Explanation } from './types';

const STORAGE_KEY = 'tx-interpreter-config';

interface Config {
  etherscanKey: string;
  deepseekKey: string;
  deepseekBaseUrl: string;
}

function getConfig(): Config | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type Phase =
  | { type: 'idle' }
  | { type: 'fetching' }
  | { type: 'fetched'; context: TxContext }
  | { type: 'explaining'; context: TxContext }
  | { type: 'done'; context: TxContext; explanation: Explanation }
  | { type: 'error'; message: string; partialContext?: TxContext };

export default function App() {
  const [configured, setConfigured] = useState(!!getConfig());
  const [phase, setPhase] = useState<Phase>({ type: 'idle' });

  const handleAnalyze = useCallback(async (txHash: string, chain: Chain, manualABI?: string) => {
    const config = getConfig();
    if (!config) {
      setPhase({ type: 'error', message: '请先配置 API Key。' });
      return;
    }

    setPhase({ type: 'fetching' });

    try {
      const { context } = await fetchTxData(txHash, config.etherscanKey, chain, manualABI);
      setPhase({ type: 'explaining', context });

      let explanation: Explanation;
      try {
        explanation = await explainTransaction(
          context,
          config.deepseekKey,
          config.deepseekBaseUrl,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setPhase({ type: 'error', message: `LLM 调用失败: ${msg}`, partialContext: context });
        return;
      }

      setPhase({ type: 'done', context, explanation });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPhase({ type: 'error', message: msg });
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Transaction Interpreter</h1>
        <p>输入以太坊交易哈希，查看 AI 对交易的完整解析 — 动作、资产、推断与安全检查</p>
      </header>

      <ConfigPanel onConfigured={() => setConfigured(true)} />

      {configured && (
        <InputPanel onAnalyze={handleAnalyze} loading={phase.type === 'fetching' || phase.type === 'explaining'} />
      )}

      {phase.type === 'fetching' && (
        <div className="status-msg">正在从 Etherscan 获取链上数据...</div>
      )}

      {(phase.type === 'fetched' || phase.type === 'explaining' || phase.type === 'done') && (
        <RawDataPanel context={phase.context} />
      )}

      {phase.type === 'explaining' && (
        <div className="status-msg">正在调用 DeepSeek 生成解释...</div>
      )}

      {phase.type === 'done' && (
        <>
          <RawDataPanel context={phase.context} />
          <ExplanationPanel explanation={phase.explanation} />
        </>
      )}

      {phase.type === 'error' && (
        <div className="error-msg">
          <strong>错误：</strong> {phase.message}
          {phase.partialContext && <RawDataPanel context={phase.partialContext} />}
        </div>
      )}
    </div>
  );
}
```

---

### Task 10: Styles

**Files:**
- Create: `experiments/tx-interpreter/src/App.css`

- [ ] **Step 1: Create App.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0d1117;
  color: #c9d1d9;
  line-height: 1.6;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}

.app-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-header h1 {
  font-size: 28px;
  color: #f0f6fc;
  margin-bottom: 8px;
}

.app-header p {
  color: #8b949e;
  font-size: 14px;
}

/* Config Panel */
.config-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.config-panel h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #f0f6fc;
}

.config-panel--saved {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.config-field {
  margin-bottom: 12px;
}

.config-field label {
  display: block;
  font-size: 13px;
  color: #8b949e;
  margin-bottom: 4px;
}

.config-field input,
.input-panel select,
.input-panel .tx-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #0d1117;
  color: #c9d1d9;
  font-size: 14px;
}

.config-field input:focus,
.input-panel select:focus,
.input-panel .tx-input:focus {
  outline: none;
  border-color: #58a6ff;
}

button {
  padding: 8px 16px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #21262d;
  color: #c9d1d9;
  font-size: 14px;
  cursor: pointer;
}

button:hover {
  background: #30363d;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-btn {
  border: none;
  background: none;
  color: #58a6ff;
  padding: 0;
  font-size: 13px;
}

.link-btn:hover {
  background: none;
  text-decoration: underline;
}

/* Input Panel */
.input-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row select {
  width: 180px;
  flex-shrink: 0;
}

.input-row .tx-input {
  flex: 1;
}

.input-row button {
  flex-shrink: 0;
}

.manual-abi-toggle {
  margin-top: 8px;
}

.abi-textarea {
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #0d1117;
  color: #c9d1d9;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

/* Raw Data Panel */
.raw-data-panel {
  margin-bottom: 20px;
}

.raw-data-panel h3 {
  font-size: 16px;
  color: #f0f6fc;
  margin-bottom: 12px;
}

.raw-block {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  margin-bottom: 8px;
}

.raw-block summary {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #c9d1d9;
}

.raw-block pre {
  padding: 0 16px 16px 16px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.raw-block.warning {
  padding: 12px 16px;
  color: #d2991d;
  font-size: 13px;
}

/* Explanation Panel */
.explanation-panel {
  margin-bottom: 20px;
}

.explanation-panel h3 {
  font-size: 16px;
  color: #f0f6fc;
  margin-bottom: 12px;
}

.explanation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.explanation-block {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 16px;
}

.explanation-block:first-child {
  grid-column: 1 / -1;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.block-header h4 {
  font-size: 15px;
  color: #f0f6fc;
}

.block-content {
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* Badges */
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.badge-ai {
  background: #1f2a48;
  color: #58a6ff;
  border: 1px solid #58a6ff44;
}

.badge-data {
  background: #1a2e1a;
  color: #3fb950;
  border: 1px solid #3fb95044;
}

.badge-verify {
  background: #3a2a1a;
  color: #d2991d;
  border: 1px solid #d2991d44;
}

/* Status and errors */
.status-msg {
  text-align: center;
  padding: 24px;
  color: #8b949e;
  font-size: 14px;
}

.error-msg {
  background: #2d1518;
  border: 1px solid #f8514944;
  border-radius: 8px;
  padding: 16px;
  color: #f85149;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-msg strong {
  display: block;
  margin-bottom: 4px;
}
```

---

### Task 11: Final Verification

- [ ] **Step 1: Build check**

Run: `cd /Users/izumi/Documents/code/ai-web3-school-cohort-0/experiments/tx-interpreter && npm run build`
Expected: `tsc` and `vite build` both pass with no errors.

- [ ] **Step 2: Dev server smoke test**

Run: `cd /Users/izumi/Documents/code/ai-web3-school-cohort-0/experiments/tx-interpreter && npx vite --host 0.0.0.0`
Expected: dev server starts, open in browser, see the app shell.

- [ ] **Step 3: Manual testing checklist**

Before claiming completion, verify these scenarios manually:

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Open app with no config | Shows ConfigPanel, InputPanel hidden |
| 2 | Enter Etherscan key + DeepSeek key, save | ConfigPanel collapses, InputPanel appears |
| 3 | Enter a valid mainnet tx hash (e.g., a simple ETH transfer: `0x...`) | Fetches data, shows RawDataPanel, then calls DeepSeek, shows 6-block explanation |
| 4 | Enter a tx hash for an unverified contract | Shows warning about missing ABI, LLM still generates best-effort explanation |
| 5 | Paste manual ABI with a tx hash | Uses manual ABI, tags it as 人工提供 |
| 6 | Enter invalid tx hash | Shows error message, no LLM call |
| 7 | DeepSeek returns malformed JSON | Shows raw output with error note |
| 8 | Refresh page | Config persists from localStorage |
| 9 | Modify config after saving | ConfigPanel expands, allows editing |
