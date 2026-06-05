# Risk / Assumption Memo — DCA Automation Agent

> 项目成立依赖的前提、最可能失败的地方、和 Week 4 的 Fallback Plan
> Hackathon：AI × Web3 School Cohort 0
> 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet

---

## 一、关键假设（项目成立的前提）

如果以下任何一条不成立，项目需要重新评估甚至换方向：

### 🔴 H1 — Cobo Agentic Wallet API 可用且稳定
| 维度 | 假设 | 验证方式 |
|------|------|---------|
| Pact 创建 | Agent 可通过 API 创建 Pact，用户在 Cobo App 审核 | Week 4 第 1 天测试沙箱 |
| contract_call | Pact 授权后可发起 contract_call 执行 swap | 测试网验证一次完整流程 |
| get_transaction_record | 交易后可获取执行记录用于验证和投资分析 | 测试网验证 |
| Policy Engine | 金额上限、白名单、频率限制按预期工作 | Prompt Injection 测试 |

**依赖等级**：🔴 **项目存亡级** — Pact/contract_call 任一不可用则核心流程断裂

### 🟡 H2 — Base Sepolia 测试网可正常工作
| 维度 | 假设 |
|------|------|
| Uniswap V3 已部署 | Base Sepolia 上有可调用的 Uniswap V3 Quoter + Router |
| 水龙头可用 | 可获取测试网 ETH 用于 gas |
| RPC 稳定 | 测试网 RPC 在 Sprint 期间不频繁断连 |

### 🟡 H3 — NL 意图解析覆盖核心场景
用户输入的定投意图（"每周定投 100 USDC 到 ETH，持续 4 周"）可被 Agent 正确解析为结构化参数。需要覆盖：
- 金额单位（USDC / ETH / 百分比）
- 频率（每天/每周/每两周）
- 目标 token
- 持续时间（周数/总金额/无限）

### 🟢 H4 — Cobo App 审核流程在 Demo 中可展示
用户审核 Pact 需要在 Cobo App 中操作。Demo 时要么：
- 在手机上展示 App 通知截图
- 或提前模拟审核完成状态

---

## 二、风险矩阵

| # | 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|:-:|------|:----:|:----:|:----:|---------|
| R1 | Cobo API 沙箱无权限/配额不足 | 🔴 中 | 🔴 项目阻塞 | 🔴 **致命** | Day1 先确认 API 可用性；不可用则换 Mock 模式 |
| R2 | Pact 创建后 contract_call 失败 | 🔴 中 | 🔴 核心流程断裂 | 🔴 **致命** | 准备 Cobo 官方文档 + 支持渠道备用 |
| R3 | NL 解析边界案例出错（如「每两周投 0.1 ETH」） | 🟡 高 | 🟡 需人工修正 | 🟡 **高** | 解析校验层 + 用户确认回退 |
| R4 | Base Sepolia RPC 不稳定 | 🟡 中 | 🟡 测试中断 | 🟡 **高** | 备选 RPC 端点列表 |
| R5 | Uniswap 报价与实际执行有偏差 | 🟡 中 | 🟡 投资分析不准 | 🟡 **中** | Agent 层做报价校验，记录 slippage |
| R6 | 投资回看分析数据源不足 | 🟡 中 | 🟢 P1 降级 | 🟡 **中** | P1 功能，P0 完成后有余力再做 |
| R7 | 时间不够完成全部 P0 | 🟡 高 | 🟡 Demo 不完整 | 🟡 **高** | 见下方 Fallback Plan |
| R8 | 用户审核 Pact 流程在 Demo 时操作复杂 | 🟢 低 | 🟡 展示不流畅 | 🟢 **低** | 提前准备截图/录屏 |

---

## 三、最可能失败的点

### Top 3 失败模式

**1. 🥇 Cobo API Sandbox 权限问题**
- 现象：API Key 创建后有权限但 Pact 或 contract_call 返回 403
- 概率：中等
- 后果：❌ 项目无法推进
- 判断时间线：Week 4 Day 1（6/8）

**2. 🥇 Pact 功能与文档描述不一致**
- 现象：实际 API 行为与文档不符，或某些参数在测试环境不生效
- 概率：中等
- 后果：❌ 需要寻找 workaround 或降级

**3. 🥈 时间不足完成全部 P0**
- 每天可用 2-3h，P0 有 6 项功能
- 最耗时环节：Cobo API 集成（未知坑最多）
- 后果：Demo 时部分功能只能展示代码/截图，非实时

---

## 四、Week 4 Fallback Plan

### Fallback 决策树

```
Day 1 (6/8) — Cobo API 沙箱测试
    ├── ✅ Pact + contract_call 可用 → 按计划推进
    └── ❌ 不可用 ──→ Fallback A: 本地 Mock + API 调用截图

Day 2 (6/9) — dca.plan + Pact 构造
    ├── ✅ NL 解析 + Pact 提交成功 → 继续
    └── ❌ Pact 提交失败 → 人工构造 Pact，Agent 只做意图展示

Day 3 (6/10) — swap 执行 + 交易验证
    ├── ✅ contract_call swap 成功 → 继续
    └── ❌ swap 失败 → Fallback B: 展示代码 + 架构图 + Cobo App 截图

Day 4 (6/11) — 端到端联调 + 安全测试
    ├── ✅ 完整链路跑通 → 安全测试 + 打磨 Demo
    └── ❌ 仍不通 → Fallback C: 录制 Uniswap 交互 + Cobo 截图作为演示材料
```

### Fallback 等级详解

#### Fallback A — Mock Mode（Cobo API 不可用）
```
用户输入 NL → Agent 解析 → [Mock] 展示结构化 dca.plan
                 → [Mock] 展示 Pact 内容（budget/scope/time window 样例）
                 → [截图] Cobo App 中 Pact 审核界面截图（官方文档）
                 → [截图] Cobo contract_call 成功 tx 截图（官方文档）
```

#### Fallback B — Code Demo（contract_call 不通）
- Agent 代码完整展示 NL 解析 + Pact 构造
- Uniswap V3 Quoter 调用成功（这个是纯链上调用，不依赖 Cobo）
- Cobo API 调用代码 + 期望输出展示
- 架构图 + 流程图 + Sequence Diagram

#### Fallback C — Screenshot Demo（全链路不通）
- 准备完整的 Demo 录屏/截图流程
- 逐屏展示：用户输入 → 意图解析 → Pact 构造 → swap → 验证
- 每步附上真实代码执行截图和 Cobo 官方文档截图
- 配合讲解说明：这里 Agent 会做什么、Cobo 会怎么处理

---

## 五、决策触发点

| 时间 | 检查点 | 触发条件 | 行动 |
|:----:|--------|---------|------|
| 6/8 22:00 | Cobo API 可用性 | Pact 创建/contract_call 任一不通 | 启动 Fallback A |
| 6/9 22:00 | Pact 提交 | 无法通过 API 提交至 Cobo App | 人工构造，Agent 只展示 NL 解析 |
| 6/10 22:00 | swap 执行 | contract_call 无法发起链上交易 | 启动 Fallback B |
| 6/11 18:00 | 端到端 | 完整链路不通 | 启动 Fallback C |
| 6/11 22:00 | 最终决定 | 以上全部判明 | 确认 Demo 形式 |

---

## 六、总结

```
最理想 → Agent 端到端自动化定投 Demo（NL → swap → 验证 → 分析）
    ↓
可接受 → 代码 Demo（NL 解析 + Quoter 调用 + 架构图，Cobo 部分截图展示）
    ↓
保底   → 截图/录屏 Demo（清晰展示设计思路和架构）
```

**项目成立的关键前提只有一个：Cobo Agentic Wallet API（Pact + contract_call）在测试沙箱中可用。** 6/8 Day 1 第一件事就是验证这个前提。

---

*Hackathon 项目 · AI × Web3 School Cohort 0 · 2026-06*
*这是风险预案，不是悲观预期 — 承认风险才能管理风险。*
