# AI × Web3 Bridge 学习笔记：Chain-aware Context（链感知上下文）

> 基于 Handbook AI × Web3 Bridge 章节  
> AI 不仅要读文档，还要感知链上状态——且这些状态持续变化，直接关联资产和权限

---

## 0. 为什么需要链感知上下文

### 传统 AI 上下文的局限

```
普通 AI 上下文:
  文档、知识库、聊天历史

AI × Web3 需要的上下文:
  文档 + 链上状态（实时变化 + 关联资产/权限/交易）

链上状态的特点是:
  - 持续变化（余额、交易、合约状态每分每秒都在变）
  - 不可逆（一旦执行无法回滚）
  - 关联真实资产（错误理解 = 实际损失）
```

### 链感知上下文的七种信息来源

| # | 信息来源 | 说明 |
|---|----------|------|
| 1 | **Onchain Data** | 链上可直接验证的数据 |
| 2 | **Contract Doc** | 合约设计意图、参数含义、权限边界 |
| 3 | **ABI & Event** | 合约可调用能力和历史行为 |
| 4 | **Transaction History** | 用户/合约过往操作记录 |
| 5 | **Explorer Content** | 区块浏览器的可视化链上证据 |
| 6 | **Index Content** | 索引后的产品级数据查询 |
| 7 | **Citation** | 可追溯、可验证的链上证据引用 |

---

## 1. Onchain Data（链上数据）

### 核心定义

**Onchain Data** 是链上可以直接验证的数据，包括交易余额、日志、合约状态和区块信息。

### 常见来源

| 来源 | 说明 | 示例 |
|------|------|------|
| **RPC** | 节点直接交互 | eth_getBalance, eth_call |
| **区块浏览器 API** | Etherscan、Sepoliscan | 交易详情、合约验证 |
| **索引器** | The Graph、Subgraph 等 | 结构化链上数据查询 |
| **协议 API** | Uniswap、Aave 等官方 API | 池子状态、利率数据 |

### 实践示例

> 昨天的 INFINIT Demo 项目就使用了 RPC 节点和 Ethereum API 来读取链上状态。

### ⚠️ 使用链上数据的注意事项

```
- 数据源可能过时 → 需要确认数据新鲜度（区块时间戳/序号）
- RPC 节点可能返回不同数据 → 需要多源验证或聚合
- 合约状态可能被篡改（闪电贷攻击后） → 需要异常检测
```

---

## 2. Contract Doc（合约文档）

### 核心定义

**Contract Doc** 帮助模型理解合约的设计意图、参数含义、权限边界和使用方式。

### 为什么 ABI 不够

```
ABI 能告诉 Agent:
  ✅ 函数名、参数类型、返回值类型
  ✅ 有哪些 Event

ABI 不能告诉 Agent:
  ❌ 这个函数做什么用（业务语义）
  ❌ 参数的含义和边界（比如 amount 的单位）
  ❌ 谁是 owner？谁能调用哪些函数？
  ❌ 有没有时间锁？有没有 pause 机制？

补充材料: README、审计报告、NatSpec 注释
```

### 合约文档的风险

```
文档可能过期
  - 合约升级了，但 README 没更新
  - ABI 变了，但文档还写着旧的函数签名

解决方案:
  Agent 读取文档后，仍需使用链上数据去验证
  - 实际调用的函数是否存在？
  - 参数类型是否匹配？
  - 返回值是否合理？
```

---

## 3. ABI & Event（ABI 与事件）

### 核心定义

**ABI 和 Event** 是 Agent 理解合约可调用能力和历史行为的核心结构。

### ABI 的作用

| 用途 | 说明 |
|------|------|
| **编码函数调用** | 把 Agent 的参数转为合约能理解的字节码 |
| **解码返回值** | 把合约返回的字节码转为 Agent 能理解的数据 |
| **解析事件** | 把 Event 日志转为结构化数据 |
| **接口发现** | 知道合约有哪些函数和事件 |

### Event 的作用

Event（事件）就是链上的**日志**。合约每执行一个关键操作，通常会 emit 一个 Event。

```
emit Transfer(from, to, amount)
  → Agent 通过解析 Event 知道:
    "0xabc 向 0xdef 转了 1000 USDC"
```

### ABI + Event = Agent 的合约感知基础

```
Agent 想和合约交互:
  1. 读取 ABI → 知道有哪些函数、怎么调用
  2. 读取 Event → 知道合约过去发生了什么
  3. 构造调用 → 通过 ABI 编码函数数据
  4. 解析结果 → 通过 ABI 解码返回值
```

---

## 4. Transaction History（交易历史）

### 核心定义

**Transaction History** 帮助 Agent 理解用户或合约过去做过哪些事情。

### 交易历史必须保留的信息

| 字段 | 说明 |
|------|------|
| **Transaction Hash** | 交易的唯一标识 |
| **Block Number** | 在哪一个区块被确认 |
| **From / To** | 发送方和接收方 |
| **Method** | 调用的函数名（通过 ABI 解码） |
| **Value** | 转账的 ETH 数量 |
| **Token Transfer** | 涉及的代币转账明细 |
| **Logs** | 触发的事件日志 |

### ⚠️ 不要只看自然语言总结

```
❌ 错误做法:
  "用户昨天在 Uniswap 做了一次 swap"

✅ 正确做法:
  tx: 0xabc...
  block: 12345678
  from: 0xuser → to: 0xUniswapRouter
  method: swapExactTokensForTokens
  input: 1000 USDC → output: 0.5 ETH
  logs: Transfer, Swap
```

---

## 5. Explorer Content（区块浏览器内容）

### 核心定义

**Explorer Content** 是区块浏览器提供的**可视化链上证据**，适合给用户和 Agent 提供可检查的入口。

### 在 AI × Web3 产品中的使用

```
Agent 提供链上分析后 →
  不仅要给出结果
  还要提供可以直接核验的链接和入口

示例:
  "这笔交易的 Gas 费用异常高"
  → 附上 Etherscan 链接: https://sepolia.etherscan.io/tx/0x...
  → 用户可以点击验证
```

### 设计原则

```
AI 的分析 = 观点
Explorer 的链接 = 证据

没有链上链接的 AI 解释 = 不可验证的观点
有链上链接的 AI 解释 = 可验证的分析
```

---

## 6. Index Content（索引内容）

### 核心定义

**Index Content** 把链上的事件整理成面向产品的数据查询——就是 Web3 基础中的 **Indexing（索引）**。

### Agent 使用索引内容的场景

| 查询类型 | 示例 |
|----------|------|
| **用户行为分析** | "这个用户最近 30 天有哪些 DeFi 操作？" |
| **协议状态** | "这个池子的 TVL 变化如何？" |
| **Agent 行为追踪** | "这个 Agent 做过哪些支付？" |
| **市场分析** | "过去 7 天 Uniswap 上 USDC/ETH 的交易量趋势？" |

### 索引 vs 原始 RPC 查询

```
RPC 查询:
  "查一下这个地址的最近 100 笔交易"
  → 需要遍历区块 → 慢 → 贵

索引查询:
  "这个地址最近 30 天的 DeFi 操作"
  → 直接从数据库查询 → 快 → 便宜
```

---

## 7. Citation（引用）

### 核心定义

**Citation** 让模型回答能追溯到具体的链上证据或文档来源。

### 链上场景中的 Citation

| 可引用的证据 | 示例 |
|-------------|------|
| **交易哈希** | https://etherscan.io/tx/0xabc... |
| **区块号** | Block #12345678 |
| **合约地址** | 0xContract... |
| **Event Log** | Transfer(from, to, amount) |
| **文档链接** | README、审计报告链接 |

### 为什么 Citation 对链上场景特别重要

```
没有 Citation:
  "这笔交易有风险" → 只是观点

有 Citation:
  "这笔交易有风险（交易细节: 0xabc..., 
   涉及的合约: 0xdef..., 
   对比历史交易: 0xghi...）"
  → 可以被验证和追责
```

### 设计原则

```
✅ 带 Citation 的解释 = 可验证、可追责的分析
❌ 无 Citation 的解释 = 不可验证的个人观点
```

---

## Chain-aware Context 全景总结

```
Agent 需要感知链上状态的 7 层上下文:

                  ┌─────────────┐
                  │  Citation    │ ← 所有输出都必须可追溯
                  └──────┬──────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌──────────┐  ┌────────────┐  ┌──────────┐
   │ Onchain   │  │ Explorer   │  │  Index   │  ← 链上数据来源
   │ Data     │  │ Content   │  │ Content  │
   └──────────┘  └────────────┘  └──────────┘
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐  ┌────────────┐  ┌──────────┐
   │  ABI &   │  │ Contract   │  │  Tx      │  ← 合约理解数据
   │ Event    │  │   Doc      │  │ History  │
   └──────────┘  └────────────┘  └──────────┘

核心原则:
  AI 的分析 = 观点
  链上证据 + Citation = 可验证的事实
  Agent 必须区分: 哪些是模型推断，哪些是链上事实
```

---

**学习日期**: 2026-05-26  
**Handbook 章节**: [AI × Web3 Bridge - Chain-aware Context](https://aiweb3.school/zh/handbook/bridge/chain-aware-context/)  
**学习方式**: 概念口述 + Agent 结构化整理
