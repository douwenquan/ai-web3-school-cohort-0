# 赛道选择说明

> 项目：DCA Automation Agent
> 日期：2026-06-02

---

## 选择的赛道

| 字段 | 内容 |
|------|------|
| **主赛道** | **Cobo Hackathon**（Agentic Wallet / Agentic Commerce） |
| **备选** | AI × Web3 Agent Tooling、DeFi Automation |

---

## 为什么选 Cobo 赛道

### 1. 项目核心依赖 Cobo 基础设施

DCA Automation Agent 的**核心链上操作**——签名、策略执行、权限控制——全部依赖 Cobo Agentic Wallet 的基础设施：

| 项目组件 | 依赖的 Cobo 能力 | 是否有替代方案 |
|---------|-----------------|:-------------:|
| 任务级授权 | **Pact**（budget / scope / time window） | ❌ 无，ERC-4337 Session Key 不满足"任务级+人类审核" |
| 权限强制执行 | **Policy Engine**（白名单/金额上限/频率限制） | ❌ 无，Safe Guard 不支持 Pact 级别的自动化 |
| 安全签名 | **MPC** 门限签名 | ⚠️ 部分，可用其他 MPC 方案但需自行搭建 |
| 审计日志 | **get_transaction_record** | ⚠️ 部分，Etherscan 可查但无法和 Pact 关联 |
| 资产托管 | **Cobo 机构钱包** | ❌ 无，自托管方案不适合生产环境 |

**结论：** Cobo CAW 是项目的关键基础设施，放在 Cobo 赛道是最自然的选择。

### 2. 与 Cobo 赛道主题高度对齐

Cobo Hackathon 赛道聚焦 **Agentic Wallet 和 Agentic Commerce**，DCA Automation Agent 正好落在这个交叉点上：

| Cobo 赛道关注点 | DCA Agent 对应 |
|----------------|----------------|
| Agent 如何安全地使用钱包 | Pact 做任务级授权 + Policy Engine 边界检查 |
| Agent 如何自主完成交易 | NL 理解意图 → 报价 → swap → 验证，全流程自动化 |
| 人类如何控制 Agent 权限 | 人类审核 Pact + 随时 Revoke + Policy Engine 二次保险 |
| 如何让 Agent commerce 可审计 | Cobo get_transaction_record 提供完整执行链路 |

---

## 为什么不是 AI × Web3 Agent Tooling

| 维度 | Agent Tooling 赛道 | 为什么 DCA Agent 不太适配 |
|------|-------------------|--------------------------|
| 定位 | 做工具/框架让其他开发者用 | DCA Agent 是一个面向终端用户的**产品**，不是开发工具 |
| 用户 | 开发者 | 个人 Web3 用户 |
| 产出 | SDK / MCP Server / CLI 工具 | 可直接运行的 Agent 产品 |
| 验证 | 开发者能否用它快速搭建 | 用户能否完成一轮 DCA 定投 |

**结论：** Agent Tooling 更适合做基础设施层的项目。DCA Agent 偏产品层，放在 Cobo 赛道更合理。

---

## 为什么不是 DeFi Automation

| 维度 | DeFi Automation 赛道 | 为什么 DCA Agent 不太适配 |
|------|---------------------|--------------------------|
| 核心 | 多协议优化收益、套利 | DCA Agent 的核心是**安全执行**，不是收益最大化 |
| 风险 | 高（涉及多协议交互、清算、MEV） | 中（仅 swap，受 Pact 策略严格控制） |
| 差异化 | 策略复杂度和收益表现 | 安全架构（Pact + Policy Engine 双保险） |

**结论：** 如果项目范围扩展到多协议（Aave/Lido/Hyperliquid），可以考虑 DeFi Automation 作为备选。MVP 阶段还是 Cobo 赛道最合适。

---

## 对齐检查清单

| # | 检查项 | 状态 | 说明 |
|:-:|--------|:----:|------|
| 1 | 是否使用了 Cobo CAW API | ✅ | Pact / Policy Engine / contract_call / get_transaction_record |
| 2 | Agent 是否需要钱包能力 | ✅ | 需要 MPC 签名执行链上交易 |
| 3 | 是否设计人机边界 | ✅ | Pact 审核(P0)、Pact 撤销(P0)、失败告警(P1) 均为人类操作 |
| 4 | 是否有安全机制 | ✅ | Policy Engine 强制执行 + 三层风控（Pact → Policy → 人工） |
| 5 | 是否可审计 | ✅ | Cobo tx record + 链上交易哈希 |
