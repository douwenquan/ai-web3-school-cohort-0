# Week 2｜Agent Identity｜DCA Automation Agent Profile 与能力声明草图

> 基于 Module C（Identity / Reputation / Capability / Interoperability）学习
> 以 Module B 的 DCA Agent 作为 profile 对象，使用 ERC-8004 注册文件格式输出
> 日期：2026-05-31

---

## 一、Agent Identity 概述

### 身份摘要

| 字段 | 内容 |
|------|------|
| **名称** | DCA Automation Agent |
| **开发者/维护者** | 用户（人类钱包所有者） |
| **Purpose** | 帮助用户自动化 DCA（Dollar Cost Averaging）定投策略——接收自然语言意图，构造 Cobo Pact，在 Pact 边界内执行定期 Uniswap V3 swap，处理异常，记录审计日志 |
| **部署环境** | 消费端 Agent（运行在用户指定的执行环境，通过 Cobo API + HTTP 与服务交互） |
| **AI 模型** | 具备自然语言理解和错误分析能力 |
| **钱包机制** | 不持有私钥，通过 Cobo MPC 签名执行链上操作 |
| **授权机制** | Cobo Pact（人类审核批准后才生效，任务完结后权限自动失效） |


---

## 二、Agent Profile 草图


### Profile 卡片

```
┌──────────────────────────────────────────────────────────┐
│              DCA Automation Agent                           │
│              定投自动化 Agent                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🆔 身份：ERC-8004 Identity Registry (NFT)                │
│  👤 维护者：钱包所有者（人类）                               │
│  ⚡ Purpose：接收自然语言，自动化 DCA 定投策略                │
│  🔐 钱包：Cobo MPC（Agent 不持私钥）                        │
│  📋 授权：Cobo Pact（人类审核 → 边界内自动执行）             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🧩 核心能力（6）                                          │
│                                                          │
│  ┌────── ────── ────── ────── ────── ────── ────── ┐   │
│  │  ① dca.plan     NL → 结构化 DCA 参数              │   │
│  │  ② pact.submit  构造并提交 Pact                   │   │
│  │  ③ dex.quote    Uniswap V3 报价查询               │   │
│  │  ④ swap.execute 在 Pact 边界内执行 swap            │   │
│  │  ⑤ tx.verify    交易验证 + 审计日志                 │   │
│  │  ⑥ x402.pay     自动识别并响应 402 付款要求         │   │
│  └────── ────── ────── ────── ────── ────── ────── ┘   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔗 调用方式                                              │
│    • MCP:  https://dca-agent.example/mcp                 │
│    • HTTP:  https://dca-agent.example/api/v1             │
│    • A2A:   https://dca-agent.example/.well-known/...    │
│                                                          │
│  💰 支付                                                 │
│    • 接受 USDC / ETH（Base, Base Sepolia）               │
│    • x402 自动支付（Pact 边界内）                          │
│    • 批量结算支持（Batch Settlement）                     │
│                                                          │
│  ✅ 信任                                                 │
│    • L1: Pact 授权（人类审核）                             │
│    • L2: 链上 tx hash + Cobo 审计日志                     │
│    • L3: 历史执行记录                                     │
│    • L4: 可插拔验证器（zkML/TEE/质押重执行）               │
│                                                          │
│  📎 参考                                                  │
│    • ERC-8004: eips.ethereum.org/EIPS/eip-8004          │
│    • Cobo CAW: cobo.com/products/agentic-wallet          │
│    • Module B: tasks/2026-05-30-module-b-complete.md    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 一句话摘要

> **DCA Automation Agent** 是一个基于 Cobo CAW Pact 授权的自动化定投 Agent，通过自然语言理解用户意图，在 Pact 边界内自动执行 Uniswap V3 swap 和 x402 支付，所有链上操作由 Cobo MPC 签名完成。Agent 的身份和能力声明遵循 ERC-8004 注册文件格式，具备可发现、可调用、可验证的特性。

---

## 三、ERC-8004 注册文件

如果这个 Agent 注册到 **ERC-8004 Identity Registry**，它的注册文件将如下所示：

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "DCA Automation Agent",
  "description": "AI agent that automates Dollar Cost Averaging strategies. Accepts natural language intent, constructs Cobo Pact with user-defined policies (budget, frequency, slippage, chain), executes periodic Uniswap V3 swaps within Pact boundaries, handles transaction failures by analysing revert reasons, and maintains a full audit trail through Cobo infrastructure. All token approvals and signatures are performed by Cobo MPC — the agent never holds private keys.",
  "image": "ipfs://QmExampleDCAgentImageCID",
  "services": [
    {
      "name": "MCP",
      "endpoint": "https://dca-agent.example/mcp",
      "version": "2025-06-18",
      "description": "Model Context Protocol endpoint — exposes all DCA capabilities as MCP tools for LLM-driven orchestration"
    },
    {
      "name": "web",
      "endpoint": "https://dca-agent.example/api/v1",
      "description": "REST API for direct HTTP integration"
    },
    {
      "name": "A2A",
      "endpoint": "https://dca-agent.example/.well-known/agent-card.json",
      "version": "0.3.0",
      "description": "Agent-to-Agent protocol card for peer agent discovery"
    }
  ],
  "x402Support": true,
  "x402Details": {
    "acceptedNetworks": ["eip155:8453", "eip155:84532"],
    "acceptedTokens": ["USDC", "ETH"],
    "defaultPrice": "0.001",
    "defaultScheme": "exact"
  },
  "active": true,
  "supportedTrust": [
    "reputation",
    "crypto-economic"
  ],
  "registrations": [],
  "agentWallet": null
}
```

### 注册文件字段说明

| 字段 | 说明 |
|------|------|
| `name` | Agent 名称，人类可读 |
| `description` | 自然语言描述 Agent 做什么、怎么工作、边界是什么 |
| `services` | 支持的服务协议端点（MCP / A2A / HTTP API） |
| `x402Support` | 是否支持 x402 支付（Agent 可在 Pact 边界内自动为付费 API 付款） |
| `supportedTrust` | 支持的信任机制类型 |
| `agentWallet` | Agent 关联的钱包地址（通过 EIP-712 或 ERC-1271 签名设置，转让时清除） |

---

## 四、Capability 拆解

Agent 的能力分为 6 个核心能力，每个能力标注：**输入 → 输出 → 依赖 → 失败模式**

---

### 能力 1：意图解析（dca.plan）

| 维度 | 内容 |
|------|------|
| **描述** | 将人类自然语言转化为结构化的 DCA 参数 |
| **输入** | 自然语言指令，例如："帮我每周一定投 100 USDC 到 ETH" |
| **输出** | `{ amount, sourceToken, targetToken, frequency, chain, duration, maxSlippage }` |
| **依赖** | LLM、Pact schema 定义 |
| **失败模式** | 参数缺失或歧义 → 请求人类澄清 |
| **AI 作用** | 核心——自然语言理解和结构化提取 |
| **Web3 机制** | 无（纯 AI 任务） |

---

### 能力 2：Pact 构造（pact.submit）

| 维度 | 内容 |
|------|------|
| **描述** | 将结构化 DCA 参数翻译为 Cobo Pact 的四要素并提交 |
| **输入** | `{ intent, policies（预算上限、单笔限额、白名单合约、允许链、时间窗口）, executionPlan, terminationConditions }` |
| **输出** | Pact ID → 等待人类审核/批准 |
| **依赖** | Cobo `submit_pact` API、Cobo Policy Engine |
| **失败模式** | Pact 被人类拒绝 → 根据反馈修改后重新提交 |
| **AI 作用** | 核心——将策略翻译为结构化 Pact |
| **Web3 机制** | 核心——Pact 是链下授权基础设施，Policy Engine 强制执行 |

---

### 能力 3：报价查询（dex.quote）

| 维度 | 内容 |
|------|------|
| **描述** | 调用 Uniswap V3 Quoter 获取实时报价 |
| **输入** | `{ amountIn, tokenIn, tokenOut, fee }` |
| **输出** | `{ amountOut, priceImpact, estimatedGas }` |
| **依赖** | Uniswap V3 Quoter 合约（eth_call 只读） |
| **失败模式** | 流动性不足 → 建议替代 DEX 或降低金额 |
| **AI 作用** | 无（纯合约调用） |
| **Web3 机制** | 核心——链上只读查询，去中心化报价源 |

---

### 能力 4：交易执行（swap.execute）

| 维度 | 内容 |
|------|------|
| **描述** | 在 Pact 批准后，按计划调用 Uniswap swap |
| **输入** | swap 参数（从报价结果读取） |
| **输出** | tx hash / 失败原因 |
| **依赖** | Cobo `contract_call` API、Policy Engine(逐笔检查)、MPC 签名 |
| **失败模式** | 交易 revert → 分析错误类型并生成调整建议；超限拒绝 → 通知人类 |
| **AI 作用** | 中等——解析 revert 原因，生成调整建议 |
| **Web3 机制** | 核心——MPC 签名、链上结算、可验证 tx hash |

---

### 能力 5：交易验证（tx.verify）

| 维度 | 内容 |
|------|------|
| **描述** | 查询交易执行结果并记录日志 |
| **输入** | `{ requestId / txHash }` |
| **输出** | `{ status（success/failed）, actualOutput, gasUsed }` |
| **依赖** | Cobo `get_transaction_record_by_request_id` API |
| **失败模式** | 交易 pending → 轮询；交易失败 → 记录并通知人类 |
| **AI 作用** | 无（纯查询） |
| **Web3 机制** | 核心——链上记录不可篡改，任何人都可验证 |

---

### 能力 6：x402 支付（x402.pay）

| 维度 | 内容 |
|------|------|
| **描述** | 识别 HTTP 402 响应，检查 Pact 边界，执行或拒绝链上付款 |
| **输入** | `{ 402 response（amount, network, payTo）, Pact boundaries }` |
| **输出** | tx hash（付款成功）/ 拒绝原因（超出边界） |
| **依赖** | Cobo `transfer_tokens` API、x402 协议、Pact 边界检查 |
| **失败模式** | 超出 Pact 边界 → 请求人类批准新 Pact；付款后服务端不返回 → 有限次重试后通知人类 |
| **AI 作用** | 核心——解析 402 响应、检查 Pact 边界、做自动/人工支付决策 |
| **Web3 机制** | 核心——链上结算、Pact 策略强制执行 |

---

### 能力关系图

```
人类（自然语言）
    │
    ▼
┌──────────────────────────────┐
│  dca.plan（意图解析）          │  ← AI 核心
│  输出结构化 DCA 参数          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  pact.submit（Pact 构造）      │  ← AI + Web3 交界
│  提交后等人类审核批准          │
└──────────┬───────────────────┘
           │ Pact Approved
           ▼
┌──────────────────────────────┐
│  dex.quote（报价查询）         │  ← Web3 只读
│  Uniswap V3 Quoter           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  swap.execute（交易执行）       │  ← AI + Web3
│  Cobo MPC + Policy Engine    │  Agent 错误分析
└──────────┬───────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
tx.verify    x402.pay     ← Web3 验证 / AI 支付决策
（交易验证）   （自动支付）
     │
     ▼
  Audit Log + 人类最终验收
```

---

## 五、Interoperability 接口

### 支持的协议

| 协议 | 用途 | 当前状态 |
|------|------|---------|
| **MCP** | 暴露 Agent 的 6 个能力作为 LLM 可调用的工具（tools） | 推荐主接口 |
| **A2A** | 与 peer Agent 协作（例如：另一个 Agent 请求 DCA Agent 执行策略） | 可选，当前版本未启用 |
| **HTTP REST API** | 直接通过 HTTP 调用 Agent 能力 | 备选接口 |
| **x402** | 作为 Buyer：为调用付费外部 API 自动付款 | ✅ 支持 |
| **x402** | 作为 Seller：对外提供收费的 DCA 执行服务 | 未来扩展 |

### 调用方式

**通过 MCP（推荐）：**
```
Agent → MCP Client → List Tools → Call dca.plan → Call swap.execute → Return Result
```

**通过 HTTP API（备选）：**
```
POST /api/v1/dca/plan
POST /api/v1/pact/submit
POST /api/v1/swap/execute
GET  /api/v1/tx/{id}
POST /api/v1/x402/pay
```

### 与外部系统的协作关系

```
┌──────────────────────────────────────────────────────────────────┐
│                      DCA Automation Agent                         │
│                                                                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐        │
│  │ dca.plan │→│ pact.submit│→│ dex.quote│→│ swap.exec│→ tx.verify│
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┘
│       │              │              │             │               │
│       │     ┌────────┴────────┐     │             │               │
│       │     │  Cobo CAW       │     │             │               │
│       │     │  submit_pact    │     │             │               │
│       │     │  contract_call  │     │             │               │
│       │     │  transfer_tokens│     │             │               │
│       │     └─────────────────┘     │             │               │
│       │                    ┌────────┴────────┐    │               │
│       │                    │  Uniswap V3      │    │               │
│       │                    │  Quoter          │    │               │
│       │                    │  Router (swap)   │    │               │
│       │                    └─────────────────┘    │               │
│       │                              ┌────────────┴────────┐     │
│       │                              │  x402 API Server    │     │
│       │                              │  (付费外部 API)      │     │
│       │                              └─────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                ↕ (人类审核Pact / 接收通知)
          ┌──────────────────┐
          │  Human（钱包所有者）│
          │  批准/拒绝/验收    │
          └──────────────────┘
```

---

## 六、Reputation & 信任

### 信任层级（从低到高）

| 层级 | 机制 | 适用场景 |
|------|------|---------|
| **L1: Pact 授权信任** | 人类审核并批准 Pact，Agent 只能在边界内执行 | 默认——所有新 Agent 至少需要此层级 |
| **L2: 交易记录信任** | 链上 tx hash + Cobo 审计日志作为可验证执行证明 | 单次执行完成后的验收 |
| **L3: 历史信誉积累** | Agent 的历史执行记录（成功率、错误率、平均响应时间） | 长期使用同一 Agent 时 |
| **L4: 可插拔验证** | 第三方验证器（pact reputation、质押重执行、zkML、TEE） | 高价值任务（大额资金、关键决策） |

### 验证方法

| 验证维度 | 方法 | 谁来做 |
|----------|------|--------|
| **Agent 身份** | 查询 ERC-8004 Identity Registry → 验证 Agent URI 指向的注册文件 | 人类 / 另一 Agent |
| **Agent 能力** | 调用注册文件中声明的服务端点，验证能力是否匹配声明 | 人类 / 自动化测试 |
| **执行证明** | 查看 Cobo 审计日志 + 链上 tx hash → 验证交易是否按 Pact 执行 | 人类（区块浏览器） |
| **付款验证** | 对于 x402 支付：验证 tx hash 对应的付款金额和收款地址正确 | 人类 / Facilitator |
| **失败责任** | Agent 的失败日志是否记录了错误原因和补救措施 | 人类（事后再现） |

### 谁负责

| 场景 | 责任归属 |
|------|---------|
| Agent 在 Pact 边界内执行且成功 | ✅ Agent 执行成功，人类验收 |
| Agent 在 Pact 边界内执行但失败 | ✅ Agent 提供错误分析和调整建议，人类决策下一步 |
| Agent 尝试执行但被 Policy Engine 拒绝（超限） | ✅ Pact 机制生效，人类决定是否更新 Pact |
| Agent 超出 Pact 边界执行（理论不应发生） | ❌ 严重的架构故障，需检查 Cobo Policy Engine 配置 |
| x402 付款后服务端不返回结果 | ⚠️ Agent 有限次重试，重试耗尽后通知人类 |
| 服务端/链下基础设施宕机 | ⚠️ Agent 记录日志并通知人类，资产不受影响 |

### 与 ERC-8004 Reputation Registry 的关系（未来扩展）

当前 Agent 还没有接入 ERC-8004 Reputation Registry，但 repo 结构支持未来接入：

- 声誉反馈字段示例：

| tag1 | 含义 | 数值示例 |
|------|------|---------|
| `dca.successRate` | 定投执行成功率 | 96/100 → `value=96, decimals=0` |
| `dca.totalSwaps` | 累计执行 swap 次数 | 42 → `value=42, decimals=0` |
| `x402.payments` | 累计完成 x402 支付笔数 | 15 → `value=15, decimals=0` |
| `uptime` | Agent 可用率 | 99.5% → `value=9950, decimals=2` |

- 验证人地址：用户钱包地址（防女巫过滤）
- 升级路径：Agent 首次部署 → 积累执行记录 → 数据同步到 ERC-8004 Reputation Registry → 后续 Agent 发现者可通过声誉选择此 Agent

### 反例：什么不是合格的 Agent Identity

模块指南中提到一个重要判断标准——如果只给 agent 发一个 NFT 名片，但没有能力声明、调用接口、交付记录或验证方式，就不构成完整的 identity/reputation 方向。

以下情况 **不能** 算作合格的 Agent Identity：

| 不够的做法 | 缺少什么 | 我们怎么解决的 |
|-----------|---------|--------------|
| 「这个 Agent 叫做 DCA Bot」——只有名字 | 没有身份声明、能力列表、服务端点 | ✅ 写了完整的 ERC-8004 注册文件 JSON |
| 「它能做 DCA」——只有一句话描述 | 没有拆解能力、输入输出、失败模式 | ✅ 拆了 6 个能力，每个标注了全部维度 |
| 「可以通过 API 调用」——只给一个端点 | 没有说明用什么协议、怎么验证、怎么收费 | ✅ 列出了 MCP/A2A/HTTP 三种协议 + x402 支付支持 |
| 「它很可靠」——没有证据 | 没有链上记录、审计日志、责任归属 | ✅ 定义了 4 层信任机制 + 责任矩阵 |
| 「它有 NFT」——只有链上身份标识 | 没有能力声明、调用方式、验证方法 | ✅ 用 ERC-8004 Identity Registry 标准格式，身份和能力绑定 |

**一句话：** 合格的 Agent Identity 不是一张名片，而是一个**可发现、可调用、可验证的完整能力描述包

---

## 七、能力声明速查表

| 能力 | AI 作用 | Web3 机制 | 是否需要人类 | 可自动执行 |
|------|---------|-----------|-------------|-----------|
| `dca.plan` | 核心（NL→结构化） | 无 | 可能（澄清歧义） | ✅（有歧义时暂停） |
| `pact.submit` | 核心（策略→结构化） | 核心（Pact 基础设施） | ✅ 必须审核批准 | ❌ |
| `dex.quote` | 无 | 核心（链上只读查询） | 否 | ✅ |
| `swap.execute` | 中等（错误分析） | 核心（MPC + Policy） | 否（Pact 已授权） | ✅（在边界内） |
| `tx.verify` | 无 | 核心（链上记录） | 否 | ✅ |
| `x402.pay` | 核心（边界判断） | 核心（链上支付） | 超出边界时 | ✅（边界内）/ ❌（超界） |

---

## 八、参考资料

- ERC-8004 提案：https://eips.ethereum.org/EIPS/eip-8004
- ERC-8004 讨论：https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
- MCP 官方文档：https://modelcontextprotocol.io/docs/getting-started/intro
- A2A 官方仓库：https://github.com/a2aproject/A2A
- ENS 官方文档：https://docs.ens.domains/
- EAS 官方网站：https://attest.org/
- Cobo Agentic Wallet 文档：https://cobo.com/products/agentic-wallet/manual/llms.txt
- Module B DCA Agent 设计文档：`tasks/2026-05-30-module-b-complete.md`
