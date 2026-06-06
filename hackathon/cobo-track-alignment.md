# Cobo 赛道对齐任务 — DCA Automation Agent

> 说明项目中 AI Agent 如何在可控边界内持有钱包、管理预算、执行支付/交易/资源采购，并记录风险边界。
> 项目：DCA Automation Agent（自动化定投 Agent）
> 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet

---

## 一、钱包持有：Agent 不自管私钥

### 实现方式

Agent **不自持钱包、不管理私钥**。所有链上操作通过 **Cobo Agentic Wallet** 的 MPC 签名基础设施执行：

```
Agent（NL 意图） → Cobo API（contract_call） → Cobo MPC 节点签名 → 链上交易
```

| 维度 | 实现 | 说明 |
|------|------|------|
| 私钥持有 | Cobo MPC 分片存储 | Agent 永远无法接触完整私钥 |
| 签名触发 | Cobo 节点验证 Pact 规则后签名 | Agent 不能绕过规则自行签名 |
| 钱包归属 | 用户 Cobo App 内的 CAW | Agent 没有自己的独立钱包地址 |

### 可控边界

Agent 能使用的钱包权限由 **Cobo Pact** 严格定义：

| 边界 | 实现方式 |
|------|---------|
| 🎯 目标合约 | Pact 白名单 → 只允许 Uniswap V3 Router |
| 💰 最大支出 | Pact budget → 总预算硬上限（如 400 USDC） |
| ⏰ 有效时段 | Pact time window → 定投周期内有效 |
| 🔄 调用频率 | Policy Engine → 每周最多 1 次 swap |

### 撤销机制

- **自动撤销**：Pact 到期（如 4 周后）→ Cobo 自动移除授权
- **手动撤销**：用户在 Cobo App 一键 Revoke → Agent 调用返回 401

---

## 二、预算管理：分层控制

### 预算层级

```
┌─────────────────────────────────────┐
│ 用户意图：每月定投 400 USDC 到 ETH    │
├─────────────────────────────────────┤
│         ↓ Agent NL 解析              │
├─────────────────────────────────────┤
│ Level 1: Pact budget                │ ← 总预算上限 400 USDC
│   ├── 单笔上限: 100 USDC            │ ← 每次不超过 100
│   └── 频率: 每周 1 次，共 4 周       │ ← 总执行次数限制
├─────────────────────────────────────┤
│ Level 2: Policy Engine              │ ← 策略强制执行
│   ├── 合约白名单: Uniswap V3 Router │
│   ├── 方法限制: swapExactInput only │
│   └── 金额校验: 不超过 budget 剩余   │
├─────────────────────────────────────┤
│ Level 3: Agent 层校验                │ ← 执行前自检
│   ├── 报价偏差检测: >5% 则暂停      │
│   ├── 连续失败计数: 3 次则告警       │
│   └── 预算余额检查: 余额不足跳过     │
└─────────────────────────────────────┘
```

### 预算生命周期

```
Pact 创建（400 USDC budget）
    ↓
Week 1: swap 100 USDC → 剩余 300 USDC
    ↓
Week 2: swap 95 USDC（slippage 保护内） → 剩余 205 USDC
    ↓
Week 3: swap 100 USDC → 剩余 105 USDC
    ↓
Week 4: swap 100 USDC → 剩余 5 USDC（Pact 到期自动撤销）
    ↓
❌ 试图第 5 次 swap → Policy Engine 拒绝 → Agent 收到错误码
```

### 超出预算的处理

| 场景 | 处理 |
|------|------|
| 单笔超出 Pact 上限 | Policy Engine 拒绝 → Agent 记录日志 → 通知用户 |
| 累计超出总 budget | Pact 到期 → 无需额外操作 |
| Gas 费用不足 | Cobo MPC 节点需要 gas → 用户预存 gas → Agent 检查余额 |
| Slippage 导致实际花费超出预期 | Quoter 时设置 maxSlippage → 超出则回退 |

---

## 三、交易执行：Pact 内自动化

### 执行流程

```
┌─────────────────────────────────────────┐
│ 用户: "这周自动定投 ETH"                   │
├─────────────────────────────────────────┤
│                     ↓                    │
│ ① Agent 检查当前 Pact 状态 (budget 剩余)  │
│                     ↓                    │
│ ② Uniswap V3 Quoter 获取报价              │
│    → 执行价格 + 预估 gas                  │
│                     ↓                    │
│ ③ Agent 层校验                            │
│    - 报价是否在合理范围？                  │
│    - budget 是否足够？                     │
│    - 是否在 Pact 有效期内？                │
│                     ↓                    │
│ ④ Cobo contract_call 发起                │
│    → Policy Engine 自动验证               │
│    → MPC 节点多签                         │
│    → 链上 swap 执行                       │
│                     ↓                    │
│ ⑤ Cobo get_transaction_record 验证       │
│    → 写入本地日志                          │
│    → 更新投资报告数据                       │
│                     ↓                    │
│ ⑥ 通知用户：定投完成 + 最新持仓            │
└─────────────────────────────────────────┘
```

### 失败处理

| 失败类型 | Agent 行为 |
|----------|-----------|
| 报价获取失败 | 重试 2 次（不同 RPC）→ 失败则跳过本轮 |
| contract_call 失败 | 获取失败原因 → 判断是否可重试 → 重试或跳过 |
| Policy Engine 拒绝 | 记录拒绝原因 → 通知用户 → 等待人工处理 |
| 链上 revert | 解析 revert reason → 记录日志 → 跳过本轮 |

---

## 四、资源采购：x402 探索

### P1 功能：机器间支付

Agent 在发现需要链上资源（如额外数据查询、计算资源）时，可通过 **x402 协议** 进行小额机器间支付：

```
Agent A → x402 请求 → Agent B 处理 → 链上结算
```

### 预算关联

- x402 支付同样受 Pact budget 约束
- 单笔 x402 金额纳入总预算，不会无上限消费
- 如果 budget 不足，Agent 先通知用户补充

---

## 五、风险边界记录

### 风险记录方式

```
每次执行后，Agent 自动记录：

[DCA Record #4] 2026-06-15 10:30 UTC
├── 执行参数
│   ├── 金额：100 USDC → ETH
│   ├── 报价：2,631 USDC/ETH
│   ├── Slippage：0.5%
│   └── Gas：0.003 ETH
├── 执行结果
│   ├── Tx Hash：0xabc...def
│   ├── 状态：✅ SUCCESS
│   └── 实际花费：100.5 USDC（含滑点）
├── 安全检查
│   ├── Pact 校验：✅ pass
│   ├── Policy Engine：✅ pass
│   └── 报价偏差：0.3% (< 5% threshold ✅)
└── 边界触及记录
    ├── 连续失败：0（正常）
    └── 剩余预算：299.5 USDC
```

### 风险边界触发记录

| 边界类型 | 触发条件 | Agent 动作 | 记录方式 |
|---------|---------|-----------|---------|
| 硬边界 | Pact budget 用尽 | 停止执行，等待下个 Pact | 日志 + 通知 |
| 软边界 | 报价偏差 >5% | 暂停，通知人工确认 | 日志 + 告警 |
| 安全边界 | 疑似 Prompt Injection | 记录注入内容，通知人工处理 | 日志 + 紧急通知 |
| 性能边界 | 连续 3 次失败 | 暂停 Agent，等待人工确认 | 日志 + 状态变更 |

---

## 六、与 Cobo Agentic Wallet 的能力映射

| Cobo 能力 | 项目中如何使用 |
|-----------|--------------|
| **CAW（智能钱包）** | 用户通过 Cobo App 管理的 MPC 钱包，Agent 不自持 |
| **Pact（任务级授权）** | 每次定投策略创建为一个 Pact（budget/scope/time window） |
| **Policy Engine（策略引擎）** | 合约白名单、金额上限、频率限制作为安全兜底 |
| **contract_call（合约调用）** | Agent 通过此接口发起 Uniswap V3 swap |
| **MPC 签名** | 交易需 Cobo 节点多签，单 Agent 无法签名 |
| **get_transaction_record** | 投资回看分析的数据源 |
| **x402（机器间支付）** | P1 功能：Agent 间小额结算（探索中） |

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*Cobo｜Agentic Economy × Cobo Agentic Wallet 赛道对齐任务*
