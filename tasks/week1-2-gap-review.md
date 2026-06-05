# Week 1–2 缺口诊断

> 日期：2026-06-05
> 项目：DCA Automation Agent（Cobo 赛道）
> 结论：✅ 可以直接进入 Hackathon

---

## 一、已完成任务总览

### Week 1 — 基础夯实

| 类别 | 完成项 | 状态 |
|------|--------|:----:|
| AI 基础 | Handbook 笔记：LLM / Prompt / Context / RAG / Agent / Frameworks / MCP / Evaluation | ✅ |
| Web3 基础 | Handbook 笔记：Network / Cryptography / Wallet / Smart Contract / Account Abstraction / DeFi / Oracle / Indexing / Security | ✅ |
| Bridge | Chain-aware Context / Web3 Tool Use / Agent Workflow | ✅ |
| 实战 | DeFi Swap 受限助手工作流设计（414 行，含 Pre-flight Simulation + Permit2 + 三条铁律） | ✅ |
| 拆解 | INFINIT — AI 驱动 DeFi 执行层项目分析 | ✅ |
| WCB | 23 项任务，385 pts（16 APPROVED + 7 SUBMITTED） | ✅ |
| 工具 | Hermes Agent 配置 / WCB Agent API / 公共 RPC / Git 工作流 | ✅ |

### Week 2 — 方向探索

| 类别 | 完成项 | 状态 |
|------|--------|:----:|
| Module A | 方向地图（6 个方向分析）+ 主方向选择（Payment/Commerce） | ✅ |
| Module B | x402 + CAW Agent 自主支付闭环拆解 | ✅ |
| Module C | Agent Profile 与 ERC-8004 身份注册设计 | ✅ |
| Module D | 权限策略设计（Pact / Policy Engine / MPC / Session Key） | ✅ |
| Module E | DeFi 执行风险矩阵 + 5 协议详解（Uniswap / Aave / Hyperliquid / Lido / Polymarket） | ✅ |
| Module F | Threat Model + 8 种攻击模拟 + 低风险自动/高风险人工策略 | ✅ |
| Module G | DAO 治理流程拆解 + Meeting-to-Action 草图 | ✅ |
| 总交付 | 方向深挖包 + 项目 Proposal + Backlog | ✅ |
| 竞品分析 | 18 个项目调研 | ✅ |

### Week 3 — Hackathon 准备（进行中）

| 类别 | 完成项 | 状态 |
|:----:|--------|:----:|
| 🛡️ 最低路径 | Direction Card / 赛道选择 / 组队确认 / Repo Skeleton / Sprint Plan / 一句话说明 | ✅ 全清 |
| 📘 推荐完成 | Proposal Memo | ✅ |
| 线上活动 | VC视角 / OpenDay / 赛道实战 / 支付场景 / AI区块链 / Week 3例会 | ✅ 全清 |

---

## 二、未完成任务

### 本周剩余

| 分类 | 任务 | 优先级 |
|:----:|------|:------:|
| 🎤 | Weekly Review Sharing 提交（截止 6/7） | 🟢 有时限 |
| 📘 | Scope Review | 🟢 对 Week 4 重要 |
| 📘 | Sponsor / Mentor 问题清单 | 🟡 |
| 📘 | Risk / Assumption Memo | 🟡 |
| 🏗️ | Cobo 赛道对齐任务 | 🟡 |
| 🏗️ | Workshop 笔记 | 🟡 |
| ⚡ | 加分挑战（流程图/验证计划/Ready Pack 等） | ⚪ 有余力再做 |

### 尚未开始（Week 4 补）

| 项目 | 说明 |
|------|------|
| Cobo API 实操 | 测试钱包 / API Key / Pact 调用 / swap 执行 |
| Uniswap V3 链上交互 | Quoter / Router / 报价模拟 |
| Agent 代码实现 | dca.plan → Pact → swap → 验证 → 分析 |

---

## 三、需要补齐的材料

| # | 材料 | 准备方式 | 计划时间 |
|:-:|------|---------|:--------:|
| 1 | Cobo 测试钱包 + API Key | Week 4 Day 1 配置 | 6/8 |
| 2 | Uniswap Quoter 调用脚本 | Python 调用链上 Quoter | 6/8 |
| 3 | dca.plan NL 解析模块 | LLM + 结构化输出 | 6/9 |
| 4 | Pact 构造与提交代码 | Cobo submit_pact API | 6/9 |
| 5 | swap.execute 实现 | Cobo contract_call API | 6/10 |
| 6 | 投资回看分析模块 | tx history → 计算 → LLM 报告 | 6/10 |
| 7 | 攻击模拟测试脚本 | 模拟 8 种攻击场景 | 6/11 |

---

## 四、Hackathon 就绪评估

| 维度 | 评估 | 说明 |
|:----:|:----:|------|
| 方向清晰度 | ✅ 明确 | DCA Automation Agent，Cobo 赛道 |
| 技术路径 | ✅ 明确 | Cobo CAW + Uniswap V3 + Base Sepolia |
| 人机边界 | ✅ 已设计 | 4 级自动化边界（L0-L4），Pact + Policy Engine 双保险 |
| 安全模型 | ✅ 已设计 | 8 种攻击模拟，Threat Model 完整 |
| 团队状态 | ✅ Solo | 单人，每日 2-3h |
| Sprint | ✅ 有计划 | 6/8-6/12 每日目标清晰 |
| 代码实现 | 🟡 未开始 | Week 4 集中开发 |
| Cobo API 实操 | 🟡 未开始 | Week 4 Day 1 开始 |

**结论：✅ 可以直接进入 Hackathon。** 方向、设计、安全模型、Sprint 计划均已就绪，Week 4 只需按计划执行开发即可。
