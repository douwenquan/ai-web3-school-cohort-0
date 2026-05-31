# Week 2｜总交付｜方向深挖包与项目初步 Proposal

> 主方向：Payment / Commerce / Settlement
> 项目：DCA Automation Agent（Cobo CAW + x402 自主支付闭环）
> 日期：2026-05-31

---

## ① AI × Web3 问题地图

> 见 `tasks/2026-05-27-week2-direction-analysis.md`（Module A 方向研究）

覆盖 6 个方向：

| 方向 | AI 作用 | Web3 机制 | 在周期中的位置 |
|------|---------|-----------|--------------|
| Payment / Commerce | Agent 理解 402、做支付决策、处理异常 | 链上结算、Pact 策略强制执行、MPC 签名 | 🏠 主方向 |
| Identity / Reputation | Agent 能力声明、行为分析 | ERC-8004 身份注册、链上声誉 | ✅ 已完成（Module C） |
| Wallet / Permission | 权限策略设计、自动/人工划分 | Pact、Policy Engine、Session Key | ✅ 已完成（Module D） |
| DeFi Execution | 报价分析、错误分析、策略调整 | Uniswap V3、MPC 签名 | ✅ 已完成（Module E） |
| Security / Privacy | Threat model、攻击模拟 | Policy Engine 架构强制拦截 | ✅ 已完成（Module F） |
| Governance | 会议转行动项、预算对比 | 链上提案、Snapshot、多签执行 | ✅ 已完成（Module G） |

---

## ② 方向选择说明

> **主方向：Payment / Commerce / Settlement**

### 为什么不是纯 AI 问题

AI 可以自动识别 402 响应、解析付款要求、检查预算边界、处理异常，但 **Agent 不能自己持有私钥、不能自己签名、不能决定花多少钱**。真正的"怎么付钱"需要 MPC 签名基础设施、Policy Engine 强制执行、Pact 的任务级授权——这些都不是 AI 能提供的。

### 为什么不是纯 Web3 问题

Cobo CAW 提供了 Pact、Policy Engine、MPC 签名，但这些基础设施 **不会自己理解人类的意图**。没有人把 Pact 的 intent 字段（"帮我每周一定投 100 USDC 到 ETH"）翻译成结构化参数——Agent 的 NL→结构化能力是不可替代的。同样，交易失败后分析 revert 原因、生成调整建议，也需要 AI 的理解能力。

### 一句话

> Agent 负责**理解意图、做决策、处理异常**，Web3 负责**安全执行、强制执行、不可篡改记录**。缺 AI，Agent 只是个签名的 API；缺 Web3，Agent 只是嘴皮子工程。

---

## ③ 问题拆解

> 参与方、流程、AI 作用、Web3 机制、自动化边界、人工确认点、验证方式、主要风险

### 参与方

| 参与方 | 角色 |
|--------|------|
| 人类（钱包所有者） | 提出 DCA 需求、审核批准 Pact、验收执行结果、紧急撤销 |
| DCA Automation Agent（AI） | 理解意图、构造 Pact、报价、执行、验证、处理异常 |
| Cobo CAW（基础设施） | MPC 签名、Policy Engine 检查、Pact 生命周期管理、审计日志 |
| Uniswap V3（链上协议） | 报价（Quoter）+ 交易执行（Router） |
| x402 API Server（外部服务） | 收费 API → 返回 402 → 接收付款 → 交付数据 |

### 流程

```
人类 NL 意图 → Agent 解析参数 → Agent 构造 Pact → 人类审核批准
    → Pact 生效 → Agent 报价(Quoter) → Policy Engine 检查
    → MPC 签名 → 链上 swap → Agent 验证 → 记录日志
    → 完成条件触发 → Pact 自动撤销
```

### AI 作用 vs Web3 机制

| 环节 | AI 作用 | Web3 机制 |
|------|---------|-----------|
| 意图解析 | 核心：NL→结构化参数 | 无 |
| Pact 构造 | 核心：策略翻译为结构化 Pact | 核心：Pact 基础设施、Policy Engine |
| 报价查询 | 无 | 核心：Uniswap Quoter（链上只读） |
| 交易执行 | 中等：错误分析 | 核心：MPC 签名、链上结算 |
| 交易验证 | 无 | 核心：链上不可篡改记录 |
| x402 支付 | 核心：边界判断与决策 | 核心：链上结算 |
| 异常处理 | 核心：错误分析、调整建议 | 无（AI 输出，人类决策） |

### 自动化边界与人工确认点

| 级别 | 操作 | 执行方式 |
|------|------|---------|
| L0 无风险 | 报价查询、交易验证 | ✅ 自动执行 |
| L1 低风险 | swap/x402 在 Pact 内 | ✅ 自动执行（Policy Engine 保护） |
| L2 中风险 | 失败后调整参数重试 | ✅ 自动执行（有限范围） |
| L3 高风险 | 超预算/非白名单/连续失败 | ❌ 暂停，通知人类 |
| L4 不可自动 | 创建/续期/撤销 Pact | ❌ 仅人类操作 |

### 验证方式

| 验证内容 | 方式 | 谁做 |
|---------|------|------|
| 报价是否正确 | Agent 记录报价，人类抽查 | Agent 自动 / 人类验收 |
| 交易是否成功 | Cobo get_transaction_record | Agent 自动 |
| 是否按 Pact 执行 | Cobo 审计日志 + 链上 tx hash | 人类（验收） |
| 执行是否合规 | Policy Engine 逐笔检查 | 基础设施强制 |

### 主要风险

| 风险 | 缓解 |
|------|------|
| API Key 泄露 → 攻击者消耗预算 | API Key 绑定 Pact + 权限分离 + 人类可 Revoke |
| 虚假报价 → Agent 接受不利价格 | Agent 层报价合理性检查（对比 TWAP） |
| 连续失败 → 资金沉没在 Gas | 3 次失败后暂停，通知人类 |
| Pact 策略设计错误 → Agent 做不该做的事 | 人类审核 Pact + Policy Engine 架构强制 |
| Cobo 基础设施故障 → 无法执行 | Cobo 企业级 SLA |

---

## ④ 项目初步 Proposal

### 项目名称

**DCA Automation Agent — 基于 Cobo CAW 的自动化定投 Agent**

### 目标用户

个人 Web3 用户，希望自动化执行 DCA 定投策略但：
- 不想每次手动操作 Uniswap
- 不想把私钥交给 Agent
- 想要明确的预算控制和自动终止

### 真实场景

> "我每周想自动定投 100 USDC 到 ETH，连续做 4 周。但我不是每天都看链，也不想让 Agent 能无限花我的钱。"

用户说一句话 → Agent 构造 Pact → 用户在 Cobo App 审核批准 → Agent 每周自动执行 → 4 周后权限自动消失。

### 最小功能（MVP）

| 功能 | 优先级 | 依赖 |
|------|--------|------|
| NL→结构化 DCA 参数（dca.plan） | P0 | LLM |
| Pact 构造与提交（pact.submit） | P0 | Cobo submit_pact API |
| Uniswap V3 报价（dex.quote） | P0 | 链上 Quoter |
| Pact 内 swap 执行（swap.execute） | P0 | Cobo contract_call API |
| 交易验证与日志（tx.verify） | P0 | Cobo get_transaction_record |
| x402 自动支付（x402.pay） | P1 | x402 API + Cobo transfer_tokens |
| 失败分析与重试 | P1 | Agent 错误分类逻辑 |
| 多 Agent 协作（A2A 接口） | P2 | 未来扩展 |

### 验证方式

1. **功能验证** — 在 Base Sepolia 测试网上用 10 USDC 跑一轮完整的 DCA 周期
2. **安全验证** — 模拟 8 种攻击（Module F），确认 Policy Engine 拦截通过率 ≥6/8
3. **边界验证** — 测试 Pact 完成条件触发后，API Key 是否即时失效
4. **回退验证** — 人类在 Cobo App 中 Revoke Pact 后，Agent 的下一次 API 调用是否返回 401

### 主要风险

| 风险 | 等级 | 缓解 |
|------|:----:|------|
| Cobo API 依赖 | 🔴 高 | 架构设计采用 Pact，无替代方案 |
| API Key 泄露 | 🟡 中 | 最小权限 + 人类可撤销 |
| 报价不准确 | 🟡 中 | Agent 层 TWAP 对比 |
| 用户审核不严 | 🟡 中 | Pact 的 Policy Engine 做二次保险 |

### 可能赛道

| 赛道 | 适配性 |
|------|--------|
| **Cobo Hackathon / Workshop** | ⭐ 最高 — Cobo Agentic Wallet 是基础设施 |
| **AI × Web3 Agent Tooling** | ⭐ 高 — MCP Server + CAW 集成 |
| **DeFi Automation** | ✅ 可以 — DCA 是经典 DeFi 场景 |

### Week 3 下一步

| 方向 | 行动项 |
|------|--------|
| **强度 1：原型开发** | 在 Base Sepolia 上跑通最小闭环——NL 输入 → Pact → swap → 验证 |
| **强度 2：协议论文** | 整理 x402 + Cobo CAW 的支付闭环设计，写成技术说明 |
| **强度 3：安全报告** | 扩展 Module F 的攻击模拟，加入更多攻击向量和防御方案 |

---

## ⑤ 参考资料清单

| # | 资料 | 帮助判断什么 | 对应模块 |
|:-:|------|------------|---------|
| 1 | [Cobo Agentic Wallet 文档](https://cobo.com/products/agentic-wallet/manual/llms.txt) | Pact 机制、API、Policy Engine 的实际能力 | B, D |
| 2 | [x402 官方文档](https://docs.x402.org/introduction) | HTTP 402 标准、Facilitator 架构、批量结算 | B |
| 3 | [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) / [ERC-8183](https://eips.ethereum.org/EIPS/eip-8183) | Agent 身份注册、任务托管仲裁标准 | C |
| 4 | [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) | 账户抽象基础、Session Key 概念 | D |
| 5 | [OpenAI Prompt Injection](https://openai.com/index/prompt-injections/) | AI 安全威胁的定义和防御策略 | E, F |
| 6 | [OWASP 代理过剩](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | Agent 权限边界设计原则 | F |
| 7 | [Uniswap V3 白皮书](https://uniswap.org/whitepaper-v3.pdf) | AMM 机制、滑点、MEV 风险 | E |
| 8 | [Snapshot 文档](https://docs.snapshot.box/) | 链下投票、提案流程 | G |
| 9 | [Safe + Guards](https://docs.safe.global/advanced/smart-account-guards) | 多签、Guard 拦截机制 | D |
| 10 | [Coinbase Policy Engine](https://docs.cdp.coinbase.com/wallets/security-and-policies/policy-engine/overview) | 企业级交易策略模型参考 | D |

---

## ⑥ 主方向深挖包

### 流程图

```
完整的 DCA Agent 执行流程（见 Module D 八、）：
  NL 输入 → dca.plan → pact.submit(A) → dex.quote → Policy Engine
  → MPC 签名 → swap.execute → tx.verify → 完成检查 → 自动撤销

  (A) = 人类审核点
  Emergency: Freeze / Revoke（仅人类）
```

对应文件：
- Module B：`tasks/2026-05-30-module-b-complete.md` — 支付与商业流程拆解
- Module D：`tasks/2026-05-31-module-d-wallet-permission.md` — 执行流程图
- Module E：`tasks/2026-05-31-module-e-defi-execution.md` — DeFi 执行链路图

### 典型场景

> 用户说"帮我每周一定投 100 USDC 到 ETH"，Agent 执行 4 周后自动停止。

见 Module B 的 DCA 场景拆解（谁下单、谁执行、谁验收、谁付款、谁仲裁）。

### 反例

> 一个 Agent 钱包只能展示"自然语言发交易"，但不能解释权限限制、失败处理和审计方式——更像危险 demo，而不是可靠产品方向。

DCA Agent 的反面设计：
- Agent 持有完整私钥 → 泄露即资产归零
- Agent 可以调任意合约 → 被注入即损失
- 无 Pact → 人类无法预知 Agent 能花多少钱
- 无审计日志 → 出事后无法追责

### 关键风险

| 风险 | 影响 | 已有缓解 |
|------|------|---------|
| API Key 泄露 | 攻击者能在 Pact 内操作 | Key 绑定 Pact + 人类 Revoke |
| 虚假报价 | Agent 接受不利价格 | 需 Agent 层 TWAP 校验（未来） |
| Cobo 基础设施故障 | 无法执行 | Cobo SLA |
| 策略设计错误 | Agent 做不该做的事 | 人类审核 + Policy Engine 双保险 |

### 最小验证计划

```
Week 3 目标：在 Base Sepolia 上跑通最小闭环

Step 1：Cobo 测试环境
  ├─ 创建 Cobo 测试钱包（Base Sepolia）
  ├─ 获取测试 USDC（faucet）
  └─ 配置 API Key 和 Pact 模板

Step 2：Agent 核心逻辑
  ├─ dca.plan：NL → 结构化参数（LLM 调用）
  ├─ pact.submit：构造并提交 Pact（Cobo API）
  └─ swap.execute：在 Pact 内执行 swap

Step 3：端到端验证
  ├─ 输入 NL → 输出 tx hash
  ├─ 验证 Pact 自动撤销
  └─ 验证人类 Revoke 后 API Key 失效

验证通过标准：
  ├─ 测试网上 3 个完整 DCA 周期成功
  ├─ 8 种模拟攻击 ≥6 种被拦截
  └─ Pact 自动撤销后 API 调用返回 401
```

---

## ⑦ 方向 Backlog

| 方向 | 为什么不选 | 什么时候再考虑 |
|------|-----------|--------------|
| **Identity / Reputation（ERC-8004）** | Module C 已完成 profile 设计，但这是一个协议层方向，需要更多生态建设才能落地。Week 2 时间有限，先做可以直接验证的支付闭环 | 当 ERC-8004 从 Draft 进入 Last Call 或已有可用的 Registry 部署时 |
| **Governance / Coordination** | Module G 已完成治理助手设计，但治理相关的工作流高度依赖具体社区，较难做可迁移的产品。比较适合做研究型输出 | 如果后续加入具体 DAO（如良心岛）的真实治理流程，可以做定制化工具 |
| **DeFi Execution（扩展协议）** | DCA Agent 已经覆盖了 Uniswap swap。扩展到 Aave / Hyperliquid / Lido 需要全新的风控模型，不适合在 Week 2 的 2 周 hackathon 窗口内完成 | 如果方向确定为 DeFi 自动化平台（多协议支持），可以作为 Week 3 的 proposal 方向 |

---

*本文档为 Week 2 总交付物，整合了 Module A-G 的学习成果，以 Payment/Commerce 为主方向，以 DCA Automation Agent 为项目载体。*
