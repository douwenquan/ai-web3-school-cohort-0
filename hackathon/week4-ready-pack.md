# Week 4 Ready Pack — DCA Automation Agent

> 完整准备包：Direction Card + Proposal Memo + Repo Skeleton + Sprint Plan + Risk Memo + 问题清单
> Hackathon：AI × Web3 School Cohort 0
> 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet

---

## 一、Hackathon Direction Card

**项目名称**：DCA Automation Agent
**赛道**：Cobo｜Agentic Economy × Cobo Agentic Wallet
**目标用户**：个人 Web3 用户，有 DeFi 经验，想自动定投但不牺牲安全性
**要解决的问题**：手动操作繁琐、私钥暴露风险、权限失控、投资盲区

👉 完整文档：[direction-card.md](../hackathon/direction-card.md)

---

## 二、Proposal Memo（1 页纸）

一句话项目说明：
> 基于 Cobo Agentic Wallet（Pact + Policy Engine + MPC），让用户用自然语言定义 DCA 定投策略，Agent 在预授权的安全边界内自动执行链上 swap，并支持投资回看分析。

**MVP 功能（P0，6 项）**

| # | 功能 | 说明 |
|:-:|------|------|
| 1 | NL→结构化参数 | 用户自然语言 → dca.plan |
| 2 | Pact 构造 | budget/scope/time window |
| 3 | Uniswap 报价 | V3 Quoter |
| 4 | swap 执行 | Cobo contract_call |
| 5 | 交易验证 | get_transaction_record |
| 6 | 安全攻击测试 | 8 种场景验证 |

👉 完整文档：[proposal-memo.md](../hackathon/proposal-memo.md)

---

## 三、Repo Skeleton

**技术栈**

| 组件 | 选型 |
|------|------|
| Agent 框架 | Python + Hermes Agent |
| 钱包基础设施 | Cobo CAW（MPC 签名）|
| 任务授权 | Cobo Pact |
| 策略引擎 | Cobo Policy Engine |
| DEX | Uniswap V3（Quoter + Router）|
| 测试网 | Base Sepolia |
| 支付协议 | x402（P1 功能）|

**目录结构**

```
src/
├── agent/
│   ├── dca_plan.py       — NL→结构化参数
│   ├── pact.py           — Pact 构造与提交
│   ├── swap.py           — swap 执行
│   └── analysis.py       — 投资回看分析
├── cobo/
│   ├── client.py         — Cobo API 客户端
│   ├── pact.py           — Pact CRUD
│   └── tx.py             — 交易查询
├── uniswap/
│   ├── quoter.py         — 报价
│   └── router.py         — swap 交易构造
└── config.py             — 配置管理
```

👉 完整文档：[repo-skeleton-draft.md](../hackathon/repo-skeleton-draft.md)

---

## 四、Week 4 Sprint Plan

| 日期 | 目标 | P0 | P1 |
|:----:|------|:--:|:--:|
| 6/8（一） | Cobo 测试钱包 + API Key + Uniswap Quoter | ✅ | — |
| 6/9（二） | dca.plan NL 解析 + Pact 构造 | ✅ | — |
| 6/10（三） | swap 集成 + 交易验证 | ✅ | 投资回看分析 |
| 6/11（四） | 端到端联调 + 8 种攻击模拟 | ✅ | x402 探索 |
| 6/12（五） | Demo 准备 + 提交材料 | ✅ | Demo 优化 |

**Sprint 规则**
1. P0 未完成 → 禁止碰 P1
2. 6/10 仍卡 Pact → 降级 Mock
3. 6/11 端到端失败 → 截图/代码/架构图演示

👉 完整文档：[sprint-plan.md](../hackathon/sprint-plan.md)

---

## 五、Risk / Assumption Memo

**关键前提（项目存亡级）**
- 🔴 Cobo Agentic Wallet API（Pact + contract_call）在测试沙箱中可用

**Fallback 决策树**

```
Day 1 — Cobo API 可用？
    ├── ✅ 可用 → 按计划推进
    └── ❌ 不可用 → Fallback A: Mock Mode

Day 3 — swap 执行成功？
    ├── ✅ 成功 → 继续
    └── ❌ 失败 → Fallback B: Code Demo

Day 4 — 端到端打通？
    ├── ✅ 打通 → 安全测试 + 打磨 Demo
    └── ❌ 不通 → Fallback C: Screenshot Demo
```

👉 完整文档：[risk-assumption-memo.md](../hackathon/risk-assumption-memo.md)
👉 范围界定：[scope-review.md](../hackathon/scope-review.md)

---

## 六、Sponsor / Mentor 问题清单

| # | 问题 | 方向 |
|:-:|------|------|
| Q1 | Pact budget 是实时扣减还是最终结算？可查剩余预算吗？ | 投资分析功能依赖 |
| Q2 | Policy Engine 能限制合约方法参数和返回数据校验吗？ | Agent 层安全边界确认 |
| Q3 | contract_call 的 Gas 估算和失败重试策略是什么？ | Agent 自动化逻辑设计 |

👉 完整文档：[sponsor-mentor-questions.md](../hackathon/sponsor-mentor-questions.md)

---

## 七、Cobo 集成方案

**接入的 Cobo API**
- Pact 创建（P0）、contract_call（P0）、get_transaction_record（P0）
- Pact 撤销（P0）、x402（P1）

**Week 4 工时预估：~10.5h（每天 2-3h，可行）**

👉 Cobo Track Alignment：[cobo-track-alignment.md](../hackathon/cobo-track-alignment.md)
👉 SDK Plan：[sdk-integration-plan.md](../hackathon/sdk-integration-plan.md)
👉 Workshop Notes：[workshop-notes-cobo.md](../hackathon/workshop-notes-cobo.md)

---

## 八、Week 4 第一天 Checklist

### 6/8（周一）启动清单

- [ ] 确认 Cobo Sandbox 开通 + API Key 权限
- [ ] 安装 Python 依赖（web3.py, httpx）
- [ ] 编写 cobo_client.py 骨架
- [ ] 测试 Uniswap V3 Quoter 调用（Base Sepolia）
- [ ] 确认 Base Sepolia 测试网水龙头可用
- [ ] 如果有 Cobo 官方技术群 → 提 Q1（Pact 预算查询）

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*Week 4 Ready Pack — 所有预备材料已就绪 🚀*
