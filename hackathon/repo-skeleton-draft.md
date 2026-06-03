# DCA Automation Agent

> 基于 Cobo Agentic Wallet 的自动化定投 Agent
> 赛道：Cobo Hackathon — Agentic Economy × Cobo Agentic Wallet

---

## Problem

个人 Web3 用户想自动化执行 DCA 定投策略（如"每周定投 100 USDC 到 ETH，持续 4 周"），但现有方案存在以下问题：

- **手动操作繁琐**：每次需要打开 Uniswap、输入金额、确认交易，无法自动化
- **安全顾虑**：现有的自动化方案通常要求把私钥交给机器人或脚本，风险极高
- **权限失控**：一旦授权，Agent 可能超支或执行预期外的操作，缺乏预算限制和自动终止机制
- **投资盲区**：定投一段时间后，难以追踪总投资额、平均成本、盈亏情况

## Target User

个人 Web3 用户，有一定的 DeFi 使用经验，希望通过自动化定投积累资产，但不想牺牲安全性。

## Track

**Cobo｜Agentic Economy × Cobo Agentic Wallet**

项目利用 Cobo CAW 的 Pact（任务级授权）、Policy Engine（策略强制执行）和 MPC 签名基础设施，让 Agent 在可控边界内安全执行链上交易。

## MVP Flow

```
用户输入 NL 意图
    ↓
① Agent 解析 → dca.plan（结构化参数）
    ↓
② 构造 Pact → 用户审核批准（Cobo App）
    ↓  Pact 生效
③ Agent 报价（Uniswap V3 Quoter）
    ↓
④ Policy Engine 检查 → MPC 签名 → 链上 swap
    ↓
⑤ 交易验证（Cobo get_transaction_record）
    ↓
⑥ 投资回看分析（用户查询时触发）
    ↓
完成条件触发 → Pact 自动撤销
```

### 自动 vs 人工边界

| 级别 | 操作 | 执行方式 |
|:----:|------|:--------:|
| L0 | 报价查询、交易验证 | ✅ 自动 |
| L1 | Pact 内 swap / x402 | ✅ 自动（Policy Engine 保护） |
| L2 | 失败后有限重试 | ✅ 自动 |
| L3 | 超预算/连续失败/非白名单 | ❌ 暂停，通知人类 |
| L4 | 创建/撤销 Pact | ❌ 仅人类操作 |

## Tech Stack

| 组件 | 技术选型 |
|------|---------|
| **Agent 框架** | Hermes Agent / 自定义 Agent |
| **LLM** | 意图解析（NL→结构化参数）+ 投资分析报告生成 |
| **钱包基础设施** | Cobo Agentic Wallet（MPC 签名） |
| **任务授权** | Cobo Pact（budget / scope / time window） |
| **策略引擎** | Cobo Policy Engine（白名单/金额上限/频率） |
| **DEX** | Uniswap V3（Quoter + Router） |
| **测试网** | Base Sepolia |
| **支付协议** | x402（P1 功能） |

## Directory Structure

```
Cobo-Agentic-Hackathon/
├── README.md              ← 本文件
├── src/
│   ├── agent/             ← Agent 核心逻辑
│   │   ├── dca_plan.py    — NL→结构化参数
│   │   ├── pact.py        — Pact 构造与提交
│   │   ├── swap.py        — swap 执行
│   │   └── analysis.py    — 投资回看分析
│   ├── cobo/              ← Cobo API 封装
│   │   ├── client.py      — API 客户端
│   │   ├── pact.py        — Pact API
│   │   └── tx.py          — 交易查询
│   └── uniswap/           ← Uniswap 交互
│       ├── quoter.py      — 报价
│       └── router.py      — swap
├── tests/
│   ├── test_dca_plan.py
│   ├── test_pact.py
│   └── test_swap.py
├── docs/
│   ├── architecture.md     — 架构设计
│   └── api.md              — API 参考
├── scripts/
│   ├── setup.sh            — 环境初始化
│   └── demo.sh             — 演示脚本
└── .env.example            — 环境变量模板
```

## Risks

| 风险 | 等级 | 缓解 |
|------|:----:|------|
| Cobo API 依赖 | 🔴 高 | Pact 机制无替代方案，架构深度绑定 |
| API Key 泄露 | 🟡 中 | 最小权限 + 人类可 Revoke |
| 报价不准确 | 🟡 中 | Agent 层 TWAP 对比校验 |
| 用户审核不严 | 🟡 中 | Policy Engine 做二次保险 |
| 测试网与主网差异 | 🟡 中 | 测试网验证后仍需主网安全审计 |

## User Investment Analysis

定投不只是"自动买"，用户更需要了解**投得怎么样**。

### Trigger

用户主动查询，例如：
- "我这 4 周的 DCA 情况怎么样？"
- "我一共投了多少 USDC？均价多少？"
- "现在是赚了还是亏了？"

### Analysis Flow

```
用户查询
    ↓
① Agent 拉取 Cobo 历史交易记录（get_transaction_record）
    ↓
② 获取当前 token 价格（Uniswap Quoter / 价格喂价）
    ↓
③ 计算投资指标：总投资额、买入总量、平均成本、当前市值、盈亏
    ↓
④ LLM 生成结构化投资报告（表格 + 自然语言总结）
    ↓
返回给用户
```

### Sample Output

> 📊 **DCA 定投总结（过去 4 周）**
>
> | 指标 | 数值 |
> |------|------|
> | 总投入 | 400 USDC |
> | 累计买入 ETH | 0.152 ETH |
> | 平均成本 | 2,631 USDC/ETH |
> | 当前市值 | 433.2 USDC |
> | **盈亏** | **+33.2 USDC (+8.3%)** |
>
> **明细：** 每次执行的价格、数量、时间一一列出

### Why This Matters

- DCA 用户最关心"投了多少、现在值多少"——没有它，用户只能去 Etherscan 手动查
- Agent 从"自动执行机器"升级为"投资助手"，是 AI 差异化的关键体现

## Validation Plan

1. **功能验证** — Base Sepolia 上跑完整 DCA 周期：NL 输入 → Pact → swap → 验证
2. **分析验证** — 执行 3 次 DCA 后，查询投资报告，验证总投资额、平均成本、盈亏数据准确
3. **安全验证** — 模拟 Prompt Injection / 伪造返回 / 越权指令，确认 Policy Engine 拦截率 ≥ 6/8
4. **边界验证** — Pact 完成条件触发后 API Key 是否即时失效
5. **回退验证** — 人类 Revoke Pact 后 Agent 调用是否返回 401

## Week 4 Sprint (Planned)

| 日期 | 目标 |
|:----:|------|
| 6/8(一) | Cobo 测试钱包 + API Key 配置 + Uniswap Quoter 调用 |
| 6/9(二) | dca.plan NL 解析 + Pact 构造与提交 |
| 6/10(三) | swap.execute + 交易验证 + 投资回看分析 |
| 6/11(四) | 端到端联调 + 攻击模拟测试 |
| 6/12(五) | Demo 准备 + 提交材料整理 |

---

*Hackathon 项目 · AI × Web3 School Cohort 0*
