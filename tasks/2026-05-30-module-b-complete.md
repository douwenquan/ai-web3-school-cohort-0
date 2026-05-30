# Week 2｜Payment / Commerce｜最小支付与商业流程拆解

> 基于 Cobo Agentic Wallet + Pact 机制的场景分析
> 日期：2026-05-29

---

## 一、场景选择：AI Agent 自动化 DCA 定投

### 场景描述

用户希望 Agent 帮自己执行一个简单的 DCA（Dollar Cost Averaging）策略：每周一自动将 100 USDC 兑换为 ETH，通过 Uniswap V3 在 Base 链上执行，持续 4 周。

### 为什么选这个场景

- 链路完整：涉及下单 → 授权 → 执行 → 验收 → 终止 全流程
- 边界清晰：金额、频率、DEX、链都是确定的
- 有真实需求：定投是 DeFi 用户最常见的自动化需求之一
- 和 Cobo Agentic Wallet 的 Pact 机制完美匹配

---

## 二、完整流程拆解（谁下单、谁执行、谁验收、谁付款、谁仲裁）

### 角色定义

| 角色 | 是谁 | 做什么 |
|------|------|--------|
| **用户（人类）** | 钱包所有者 | 提出需求 → 审核 Pact → 批准/调整/拒绝 → 最终验收 |
| **Agent（AI）** | 自动化程序 | 理解意图 → 构造 Pact → 在边界内执行 → 处理异常 |
| **Cobo 基础设施** | 托管与执行层 | MPC 签名、Policy Engine 检查、审计日志、Pact 生命周期管理 |

### 分步流程

| 步骤 | 角色 | 动作 | 备注 |
|------|------|------|------|
| ① 需求提出 | 用户 | 告诉 Agent："帮我每周一定投 100 USDC 到 ETH" | 自然语言输入 |
| ② Pact 构造 | Agent | 将需求翻译为 Pact 四要素并提交 | 调 `submit_pact` API |
| ③ Pact 审核 | 用户 | 在 Cobo App 中审核 Pact 内容 | 可批准/调整/拒绝 |
| ④ Pact 批准 | 用户 | 确认 Pact | 至此 Agent 获得授权 |
| ⑤ 执行 swap | Agent | 每周一 9am 调用 Uniswap swap | 调 `contract_call` API |
| ⑥ 策略检查 | Cobo | Policy Engine 检查每笔交易 | 超限即 denial |
| ⑦ 完成验证 | Agent | 查询 tx hash，记录结果 | 调 `get_transaction_record` |
| ⑧ 用户验收 | 用户 | 查看余额变化和交易记录 | 通过 Cobo App 或浏览器 |
| ⑨ Pact 终止 | Cobo | 条件触发后自动撤销权限 | API Key 即时失效 |

### 关键问题回答

| 问题 | 答案 |
|------|------|
| **谁下单？** | 用户（人类），通过自然语言向 Agent 描述需求 |
| **谁执行？** | Agent（AI），在 Pact 边界内自动调用 Cobo API 完成链上操作 |
| **谁验收？** | 用户（人类），查看 tx hash、余额变化、审计日志 |
| **谁付款？** | Agent 通过 Cobo 的 MPC 签名完成链上支付；人类不接触私钥 |
| **谁仲裁？** | 没有第三方仲裁。Pact 的 Policies 就是规则，Policy Engine 强制执行，超限即拒绝 |

---

## 三、最小 Payment / Commerce Flow 设计

### 流程图

```
┌─────────────────────────────────────────────────────────┐
│                     完整 Commerce Flow                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  用户 → Agent：需求描述（自然语言）                        │
│    ↓                                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │            Pact 生命周期（授权层）                  │    │
│  │                                                   │    │
│  │  Agent 构造 Pact → 人类审核 → 批准/调整 → 生效     │    │
│  └─────────────────────────────────────────────────┘    │
│    ↓                                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Commerce 执行层（可循环多次）              │    │
│  │                                                   │    │
│  │  报价（Uniswap Quoter）→ 执行（swap）→ 验收（tx）   │    │
│  │        ↕ 每步被 Policy Engine 检查                 │    │
│  └─────────────────────────────────────────────────┘    │
│    ↓                                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │            结算与收尾层                             │    │
│  │                                                   │    │
│  │  链上结算完成 → 审计日志记录 → Pact 自动终止        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 各阶段详解

#### Phase 1：报价（Quote）

```
Agent 调用 Uniswap Quoter 合约（链上只读，eth_call）
  ↓
获取：预期输出量、价格冲击、Gas 估算
  ↓
Agent 将报价信息附加到 Pact 的 Execution Plan 中
  ↓
人类审核时可以看到：预期能收到多少 ETH，滑点是多少
```

- **涉及技术：** Uniswap V3 Quoter、`eth_call` 静态调用
- **AI 角色：** 无（纯合约调用）
- **Cobo 角色：** 不参与（只读操作不需要 Pact）

#### Phase 2：执行（Execute）

```
到达执行时间（每周一 9am）
  ↓
Agent 调 Cobo API：estimate_contract_call_fee（估算 Gas 费）
  ↓
Agent 调 Cobo API：contract_call（执行 Uniswap swap）
  ↓
Cobo Policy Engine 检查：
  ├─ 本次交易金额 ≤ Pact 中的单笔限额？✅
  ├─ 目标合约 = Uniswap V3 Router（在白名单中）？✅
  └─ 累计花费 ≤ Pact 中的总预算？✅
  ↓
Cobo MPC 签名 → 交易广播上链 → 返回 tx hash
```

- **涉及技术：** Cobo `contract_call` API、Cobo Policy Engine、MPC 签名
- **AI 角色：** 如果交易失败，AI 解析 revert 原因并生成调整建议
- **Cobo 角色：** 策略检查、签名、广播（全部在 Pact 边界内）

#### Phase 3：验收（Verify）

```
Agent 调 Cobo API：get_transaction_record_by_request_id
  ↓
获取：tx status（success/failed）、实际输出量、Gas 消耗
  ↓
Agent 将结果记录到日志
  ↓
用户可在 Cobo App 中查看所有交易记录和审计日志
```

- **涉及技术：** Cobo `get_transaction_record` API
- **AI 角色：** 无（纯查询）
- **人类角色：** 自行打开区块浏览器做最终验证

#### Phase 4：失败处理（Failure Handling）

```
交易失败 → Cobo 返回 denial 或 tx reverts
  ↓
Agent 解析错误类型：
  ├─ INSUFFICIENT_OUTPUT_AMOUNT → 滑点过低
  ├─ TRANSFER_FROM_FAILED → 余额不足
  └─ 其他 → 链状态异常
  ↓
Agent 生成调整建议 + 提交新的 Pact 更新
  ↓
人类审核 → 批准调整后的策略 → 重新执行
```

- **AI 角色：** 核心作用——解析错误原因、生成调整建议
- **不做：** AI 不能自动修改 Pact（需要人类审核）

#### Phase 5：记录证明（Proof & Audit）

```
每次操作都产生记录：
  ├─ Cobo 端：审计日志（谁、什么时间、做了什么、被拒绝还是通过）
  ├─ 链上：tx hash（公开可查）
  └─ Agent 端：操作日志（执行时间、结果、异常）
  ↓
Pact 终止时：
  ├─ 所有 API Key 即时失效
  ├─ 生成完整的 Pact 活动总结
  └─ 用户可在 Cobo App 中导出审计报告
```

- **涉及技术：** Cobo `get_audit_logs` API
- **Web3 的价值：** 链上记录不可篡改，任何人都可以验证

---

## 四、协议比较

本部分留空，待学习 x402、MPP、ERC-8004、ERC-8183 后补充。

需要比较的内容：
- x402 — HTTP 402 Payment Required 的链上支付协议
- MPP — Stripe Machine Payments Protocol
- ERC-8004 — Agent trust & identity
- ERC-8183 — Agent job, escrow & evaluator

选 2 个比较它们在支付、验证、身份、结算或仲裁中的角色。

---

## 五、Cobo 相关接口参考

| 用途 | 接口 | 类型 |
|------|------|------|
| 提交 Pact | `submit_pact` | Agent → Cobo |
| 查询 Pact | `get_pact` / `list_pacts` | Agent → Cobo |
| 转账 | `transfer_tokens` | Agent → Cobo |
| 合约调用 | `contract_call` | Agent → Cobo |
| 估算费用 | `estimate_contract_call_fee` | Agent → Cobo |
| 查交易记录 | `get_transaction_record_by_request_id` | Agent → Cobo |
| 查审计日志 | `get_audit_logs` | Agent → Cobo |
| 查余额 | `get_balance` | Agent → Cobo |
| 批准 Pact | Cobo App 内操作 | 人类 → Cobo |

---

## 六、人机边界总结

| 环节 | AI / Agent | 人类 |
|------|-----------|------|
| 需求理解 | 解析自然语言 → 提取结构化参数 | 提出需求 |
| Pact 构造 | 生成四要素草案 | 审核、批准、调整、拒绝 |
| 报价查询 | 调 Quoter（无风险） | 无需介入 |
| 交易执行 | 在 Pact 边界内自动调用 | 无需介入（边界已在 Pact 中设定） |
| 异常处理 | 解析错误、生成调整建议 | 审核调整后的策略 |
| 最终验收 | 提供 tx hash 和日志 | 打开区块浏览器验证 |

---

## 七、参考资料

- Cobo Agentic Wallet 文档：https://cobo.com/products/agentic-wallet/manual/llms.txt
- Pact 机制详解：https://www.cobo.com/products/agentic-wallet/manual/start-here/what-is-a-pact
- Developer Quickstart：https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview
- x402 Docs：https://docs.x402.org/introduction
- MPP introduction：https://stripe.com/blog/machine-payments-protocol
- ERC-8004：https://eips.ethereum.org/EIPS/eip-8004
- ERC-8183：https://eips.ethereum.org/EIPS/eip-8183

---

# x402 Paywall + Cobo CAW Agent 自主支付闭环 — 设计文档

> Week 2 进阶实践任务 · 架构设计
> 日期：2026-05-29

---

## 一、架构总览

### 系统角色

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户（人类钱包所有者）                           │
│   在 Cobo App 中创建钱包 · 审核并批准 Pact · 查看审计日志 · 最终验收      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ 审核 / 批准 / 查看
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Cobo Agentic Wallet 基础设施                        │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Policy Engine │  │  MPC 签名    │  │  审计日志     │                │
│  │ 策略强制执行  │  │  多方计算签名 │  │  全链路记录   │                │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘                │
│         │                │                  │                        │
│  ┌──────┴──────────────────┴──────────────────┴──────┐              │
│  │               Pact 生命周期管理                      │              │
│  │  提交 → 审核 → 批准 → 执行（受策略约束）→ 自动终止    │              │
│  └─────────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                            ▲
                            │ 调用 Cobo API（在 Pact 边界内）
                            │
              ┌─────────────┴──────────────┐
              │   消费端 Agent（AI）         │
              │                            │
              │  · 发起 HTTP 请求           │
              │  · 识别 402 响应            │
              │  · 调 Cobo transfer_tokens  │
              │  · 重试请求获取结果          │
              │  · 记录审计日志              │
              └─────────────┬──────────────┘
                            │ HTTP 请求 / 402 / 付款后重试
                            ▼
              ┌──────────────────────────────┐
              │  服务端 API（x402 Seller）     │
              │                              │
              │  · 收费 API 接口              │
              │  · 返回 402 + PAYMENT-REQUIRED│
              │  · 验证付款证明               │
              │  · 返回数据 + PAYMENT-RESPONSE│
              └─────────────┬────────────────┘
                            │ 验证 / 结算
                            ▼
              ┌──────────────────────────────┐
              │  x402 Facilitator（清算方）    │
              │  协助验证付款 · 协助结算       │
              └──────────────────────────────┘
```

### 三层架构说明

| 层 | 包含 | 职责 |
|----|------|------|
| **应用层** | 服务端 API + 消费端 Agent | 业务逻辑：收费接口、请求处理、付款决策 |
| **授权层** | Cobo CAW（Pact + Policy Engine） | 权限控制：预算限制、策略检查、审计日志 |
| **结算层** | 区块链 + x402 Facilitator | 价值转移：链上交易、付款验证、结算确认 |

---

## 二、完整交互流程

### Phase 0：准备（一次性配置）

```
用户                    消费端 Agent              Cobo 基础设施
│                           │                        │
│  ① 在 Cobo App 创建钱包 ──┤                        │
│                           │                        │
│                           │  ② 提交 Pact ──────────┤
│                           │     Intent：自动支付 API
│                           │     Policies：10 USDC上限
│                           │              仅Base Sepolia
│                           │              白名单地址
│                           │                        │
│  ③ 审核并批准 Pact ◄──────┤                        │
│                           │                        │
│                           │  ④ Pact approved ◄─────┤
│                           │                        │
```

#### Phase 0 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 用户 | 创建钱包、审核并批准 Pact | 人类唯一需要参与的环节 |
| 消费端 Agent | 构造并提交 Pact | AI 将策略翻译为结构化 Pact |
| Cobo 基础设施 | 存储 Pact、Policy Engine 就绪 | 后续所有操作受此 Pact 约束 |

---

### Phase 1：请求

```
消费端 Agent                服务端 API                x402 Facilitator
     │                          │                          │
     │  ① GET /ai-summary ──────┤                          │
     │                          │                          │
     │                          │  ② 检查请求头             │
     │                          │     无有效付款凭证        │
     │                          │                          │
     │  ③ 402 Payment Required ◄┤                          │
     │     PAYMENT-REQUIRED header                          │
     │     {                                                 │
     │       scheme: "exact",                                │
     │       price: "0.001",    (0.001 USDC)                 │
     │       network: "eip155:84532", (Base Sepolia)         │
     │       payTo: "0xSellerAddress..."                     │
     │     }                                                 │
     │                          │                          │
```

#### Phase 1 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 消费端 Agent | 发起 HTTP 请求 | 传统 API 调用 |
| 服务端 API | 检查凭证、返回 402 | x402 中间件自动处理 |
| AI 做了什么 | 无 | 纯 HTTP 协议交互 |

---

### Phase 2：支付决策

```
消费端 Agent
     │
     │  ① 解析 402 响应
     │     · 金额：0.001 USDC
     │     · 网络：Base Sepolia
     │     · 收款地址：0xSellerAddress
     │
     │  ② 检查 Pact 边界
     │     · 0.001 ≤ 10 USDC（Pact 总预算）？ ✅
     │     · Base Sepolia ∈ 允许的链？ ✅
     │     · 0xSellerAddress ∈ 白名单？ ✅
     │     · 累计花费 + 0.001 ≤ 10 USDC？ ✅
     │
     │  ③ 决策结果：在 Pact 范围内，自动继续
     │
```

#### Phase 2 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 消费端 Agent | 解析 402、检查 Pact 边界 | **AI 核心作用**——理解付款要求并判断是否在授权范围内 |
| AI 做了什么 | 解析结构化的付款要求、与 Pact 策略比对 | 如果超出范围，Agent 可以请求用户批准新的 Pact |
| 人类 | 无需介入 | 边界已在 Pact 中设定 |

---

### Phase 3：支付

```
消费端 Agent                Cobo 基础设施                区块链
     │                          │                        │
     │  ① transfer_tokens ──────┤                        │
     │     amount: 0.001 USDC   │                        │
     │     to: 0xSellerAddress  │                        │
     │     chain: Base Sepolia  │                        │
     │                          │                        │
     │                   ② Policy Engine 检查             │
     │                      · 在 Pact 范围内？ ✅         │
     │                      · 单笔未超限？ ✅              │
     │                      · 累计未超预算？ ✅            │
     │                          │                        │
     │                   ③ MPC 签名 ──────────────────┤  │
     │                          │                   │    │
     │                          │   ④ 交易广播 ◄────┘    │
     │                          │                        │
     │  ⑤ tx hash ◄────────────┤                        │
     │     0xabc...def          │                        │
     │                          │                        │
```

#### Phase 3 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 消费端 Agent | 调 Cobo transfer_tokens | 传统 API 调用 |
| Cobo Policy Engine | 策略检查 | 基础设施强制执行，不可绕过 |
| Cobo MPC | 签名并广播 | 私钥分片存储，无单点故障 |
| AI 做了什么 | 无 | 支付执行是传统 API 调用 |

---

### Phase 4：验证与获取结果

```
消费端 Agent                服务端 API              x402 Facilitator
     │                          │                        │
     │  ① Retry with            │                        │
     │     PAYMENT-SIGNATURE ────┤                        │
     │                          │                        │
     │                   ② 发送验证请求 ──────────────────┤
     │                          │                        │
     │                          │   ③ 确认交易已确认 ◄───┤
     │                          │      tx 0xabc...def    │
     │                          │      status: success   │
     │                          │                        │
     │  ④ 200 OK ◄──────────────┤                        │
     │     PAYMENT-RESPONSE      │                        │
     │     { result: "summary"}  │                        │
     │                          │                        │
```

#### Phase 4 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 消费端 Agent | 带上付款凭证重试请求 | 传统 HTTP 重试 |
| 服务端 API | 通过 Facilitator 验证付款 | x402 中间件自动处理 |
| x402 Facilitator | 确认交易状态 | 验证链上交易是否确认 |
| AI 做了什么 | 无 | 纯协议交互 |

---

### Phase 5：完成

```
消费端 Agent                Cobo 基础设施               用户
     │                          │                        │
     │  ① 记录结果              │                        │
     │     · tx 0xabc...def     │                        │
     │     · 花费 0.001 USDC    │                        │
     │     · API 返回成功       │                        │
     │                          │                        │
     │                   ② 审计日志 ──────────────────┤  │
     │                      · 谁调了什么接口             │  │
     │                      · 花了多少钱                 │  │
     │                      · 被拒绝还是通过              │  │
     │                      · 时间戳                     │  │
     │                          │                        │
     │                          │   ③ Cobo App 查看 ◄───┤
     │                          │     所有交易和审计记录   │
     │                          │                        │
     │  ④ Pact 条件满足时自动终止                         │
     │     预算花完 / 时间到                              │
     │     API Key 即时失效                               │
```

#### Phase 5 角色分工

| 角色 | 动作 | 说明 |
|------|------|------|
| 消费端 Agent | 记录执行结果 | 传统日志记录 |
| Cobo 基础设施 | 记录审计日志 | 全链路可追溯 |
| 用户 | 在 Cobo App 查看验收 | **最终验证** |
| AI 做了什么 | Agent 记录结构化日志 | 便于后续分析和调试 |

---

## 三、关键接口说明

### x402 协议接口

x402 基于 HTTP 标准，用三个 Header 完成支付交互：

| Header | 方向 | 格式 | 说明 |
|--------|------|------|------|
| `PAYMENT-REQUIRED` | 服务端 → 客户端 | Base64 JSON | 402 响应中附带的付款要求 |
| `PAYMENT-SIGNATURE` | 客户端 → 服务端 | Base64 JSON | 重试请求时附带的付款凭证 |
| `PAYMENT-RESPONSE` | 服务端 → 客户端 | Base64 JSON | 结算结果确认 |

**PAYMENT-REQUIRED 示例（服务端返回）：**
```
PAYMENT-REQUIRED: eyJzY2...uIn0=
```
解码后：
```json
{
  "scheme": "exact",
  "price": "0.001",
  "network": "eip155:84532",
  "payTo": "0xSellerAddress..."
}
```

**PAYMENT-SIGNATURE 示例（客户端重试）：**
```
PAYMENT-SIGNATURE: eyJ0eF...QifQ==
```
解码后：
```json
{
  "tx_hash": "0xabc...def",
  "amount": "0.001",
  "scheme": "exact"
}
```

### Cobo CAW 接口

| 接口 | 用途 | 调用时机 |
|------|------|---------|
| `submit_pact` | 提交 Pact 申请 | Phase 0：启动时 |
| `transfer_tokens` | 支付转账 | Phase 3：需要付款时 |
| `estimate_transfer_fee` | 估算转账 Gas 费 | Phase 3：付款前 |
| `get_transaction_record_by_request_id` | 查询交易状态 | Phase 3：付款后确认 |
| `get_audit_logs` | 查询审计日志 | Phase 5：任何时间 |

### x402 Facilitator 接口

| 接口 | 用途 | 调用方 |
|------|------|--------|
| `/verify` | 验证付款证明是否有效 | 服务端 API |
| `/settle` | 完成结算确认 | 服务端 API |

---

## 四、风险边界

### 延续 Week 1 的三条铁律

| 铁律 | 在本场景中的体现 | 机制保障 |
|------|----------------|---------|
| **永不接触密钥** | Agent 不持有私钥，签名由 Cobo MPC 完成 | MPC 分片存储，Agent 只有 API Key |
| **永不自动签名** | 每笔转账在广播前经过 Policy Engine 检查 | 架构强制执行，不可绕过 |
| **永不绕过确认** | Pact 需要人类审核批准后才能生效 | 没有 Pact = 没有权限 |

### 场景特定风险

| 风险 | 说明 | 缓解措施 |
|------|------|---------|
| **Agent 超预算付款** | Agent 持续调用付费 API 耗尽预算 | Pact 的累计预算限制 + Policy Engine 逐笔检查 |
| **收款地址欺诈** | 服务端伪造或替换收款地址 | Pact 中的白名单地址列表，Agent 只能向白名单地址付款 |
| **重复付款** | Agent 因重试逻辑多次支付同一请求 | x402 的 Payment-Identifier 扩展（幂等性） |
| **服务端不交付结果** | 收款后不返回数据 | 链上交易记录可作付款证明，服务端的信誉机制（需额外设计） |
| **Pact 权限泄露** | Agent 的 API Key 被盗用 | Pact 有完成条件，超过时间/预算后自动失效 |
| **Facilitator 不可用** | 验证服务宕机 | 服务端可降级为直接查链上交易状态 |

### 自动执行 vs 人工确认的边界

| 条件 | 自动执行 | 需人工确认 |
|------|---------|-----------|
| 单笔支付 ≤ Pact 预算余额 | ✅ Agent 自动付款 | — |
| 单笔支付 > Pact 预算余额 | — | ❌ 需提交新的 Pact，人类审核 |
| 收款地址在 Pact 白名单中 | ✅ 自动放行 | — |
| 收款地址不在白名单中 | — | ❌ 需人类确认地址后更新 Pact |
| 付款后获取结果成功 | ✅ 自动记录 | — |
| 付款后服务端未返回结果 | ⚠️ Agent 重试（有限次） | 重试耗尽后需人类介入 |
| Pact 即将到期但任务未完成 | — | ❌ 需人类决定是否续期 |

---

## 五、关键设计要点

### x402 + Cobo CAW 的互补关系

x402 解决"怎么收钱"——定义了 HTTP 协议层面的支付交互标准。
Cobo CAW 解决"怎么付钱"——在 Pact 边界内安全执行支付，保障人类控制权。

合在一起就是：**Agent 能自动付钱，但只在人类同意的范围内。**

### 为什么这个闭环是 AI × Web3

- **AI 角色：** Agent 理解 402 响应、检查 Pact 边界、做支付决策、处理异常（付款失败后调整策略）
- **Web3 角色：** 链上结算（公开可查）、Pact 策略强制执行（架构保障，非信任）、审计日志（不可篡改）
- **缺一不可：** 纯 Web3 做到链上付款但 Agent 不会自动识别 402；纯 AI 做到自动付款但缺乏安全边界

---

## 六、参考资料

- x402 官方文档：https://docs.x402.org/introduction
- x402 Seller Quickstart：https://docs.x402.org/getting-started/quickstart-for-sellers
- x402 Buyer Quickstart：https://docs.x402.org/getting-started/quickstart-for-buyers
- x402 GitHub 示例：https://github.com/x402-foundation/x402/tree/main/examples
- Cobo CAW 文档：https://cobo.com/products/agentic-wallet/manual/llms.txt
- Cobo Pact 机制：https://www.cobo.com/products/agentic-wallet/manual/start-here/what-is-a-pact
- Cobo Python SDK：https://www.cobo.com/products/agentic-wallet/manual/developer/api-client-python
