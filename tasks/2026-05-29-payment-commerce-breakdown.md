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
