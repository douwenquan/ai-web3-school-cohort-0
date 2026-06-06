# Sponsor Workshop 笔记 — Cobo Agentic Wallet

> 与 DCA Automation Agent 最相关的 Sponsor Workshop 笔记
> Workshop：Cobo Agentic Wallet — 构建 Agentic Economy 的基础设施
> 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet

---

## Workshop 概览

| 维度 | 内容 |
|------|------|
| **Sponsor** | Cobo |
| **核心产品** | Cobo Agentic Wallet（CAW） |
| **解决的问题** | AI Agent 如何在安全可控的边界内持有钱包、管理预算、执行链上交易 |
| **适用赛道** | Agentic Economy / 支付 / DeFi Automation |
| **Demo 方向** | 自动化定投、自动支付、Agent 间结算 |

---

## 一、Sponsor 解决什么问题

### 核心痛点

AI Agent 要参与链上经济活动，面临三个关键问题：

| 问题 | 传统方案的问题 | Cobo 的方案 |
|------|--------------|------------|
| **私钥管理** | Agent 持有私钥 → 泄露即失控 | MPC 分片签名，Agent 无法触及完整私钥 |
| **权限控制** | 要么全权委托，要么每次人工审批 | Pact（任务级授权）+ Policy Engine（策略强制） |
| **预算管理** | 无内置机制，需外部合约实现 | Pact budget 硬上限 + 自动过期 |

### 一句话总结

> Cobo Agentic Wallet 让 Agent「有权限但受限制、能执行但可撤销、可自动化但有边界」。

---

## 二、Cobo 提供什么工具

### 2.1 核心工具链

| 工具 | 用途 | 项目中如何使用 |
|------|------|--------------|
| **CAW（智能钱包）** | MPC 托管钱包，Agent 不自持私钥 | 用户 Cobo App 内的钱包作为执行载体 |
| **Pact（任务级授权）** | 创建有时间/金额/范围约束的授权 | 每次 DCA 定投策略创建一个 Pact |
| **Policy Engine（策略引擎）** | 合约白名单/金额上限/频率限制 | 安全兜底：即使 Agent 被攻击也无法越权 |
| **contract_call（合约调用）** | 在 Pact 授权内执行链上调用 | 发起 Uniswap V3 swap |
| **get_transaction_record** | 查询交易状态和详情 | 投资回看分析的数据源 |
| **x402** | 机器间小额支付协议 | P1 功能：Agent 间结算 |

### 2.2 接入方式

- **API**：RESTful API，标准 HTTP 调用
- **SDK**：提供 Python / TypeScript SDK 封装
- **测试环境**：Cobo Sandbox（Base Sepolia）

---

## 三、适合哪个赛道

### 最佳匹配：Cobo Hackathon

| 赛道 | 匹配度 | 理由 |
|:----:|:------:|------|
| **Cobo Hackathon ⭐** | ⭐ 最高 | CAW + Pact + Policy Engine 是项目核心基础设施 |
| Agent Tooling | ⭐ 高 | 可封装 Cobo API 为 MCP Server |
| DeFi Automation | ✅ 可 | DCA 是 DeFi 自动化经典场景 |

### 为什么 Cobo 赛道最合适

1. **项目核心依赖 Clobo 的 Pact 机制**：没有替代方案
2. **Policy Engine 解决安全核心假设**：即使 Prompt Injection 也能兜底
3. **投资回看分析需要 get_transaction_record**：独家数据源
4. **Demo 中可展示 Cobo App 审核流程**：用户体验完整闭环

---

## 四、可以做什么 Demo

### 推荐 Demo：DCA Automation Agent（本项目）

```
用户: "每周定投 100 USDC 到 ETH，持续 4 周"
    ↓
Agent 解析 → Pact 构造 → 用户 Cobo App 审核批准
    ↓
每周自动：Quoter 报价 → Policy Engine 校验 → contract_call swap → 验证
    ↓
4 周后：Pact 自动撤销 → 投资回看报告
```

### 其他 Demo 可能性

| Demo 方向 | 说明 |
|----------|------|
| **自动支付网关** | Agent 根据账单自动支付，Pact 控制月预算 |
| **Agent 间结算** | 两个 Agent 通过 x402 自动结算服务费 |
| **限价单 Agent** | 价格到达条件时自动执行，Pact 控制单笔上限 |

---

## 五、从 Workshop 获得的关键信息

1. **Pact 的设计哲学**：不是「信任 Agent」而是「给 Agent 受限的权限+可撤销的钥匙」—— 这一思路直接决定了 DCA Automation Agent 的架构
2. **Policy Engine 是第二道防线**：即使 Agent 层的 NL 解析和意图判断出错，Policy Engine 的合约白名单和金额上限仍能阻止越权操作
3. **Demo 中要展示「审批->执行->验证」闭环**：Cobo App 审核是用户体验的关键环节，不能跳过

---

## 六、与项目的关联

| Workshop 知识点 | 项目中的应用 |
|----------------|-------------|
| Pact 的 budget/scope/time window 设计 | DCA Plan 的结构化参数直接映射到 Pact 字段 |
| Policy Engine 的规则配置 | Agent 层不需要重复实现安全逻辑，交给 Cobo |
| x402 作为支付原语 | P1 功能：Agent 在未来可自动化结算数据查询等外部服务 |
| Cobo App 审核流程 | Demo 中展示：用户手机上确认 Pact → Agent 自动执行 |

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*与 DCA Automation Agent 最相关的 Sponsor Workshop 笔记*
