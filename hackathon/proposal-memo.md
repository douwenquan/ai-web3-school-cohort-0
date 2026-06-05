# DCA Automation Agent — Project Proposal

> 基于 Cobo Agentic Wallet 的自动化定投 Agent
> Hackathon 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet

---

## 目标用户

个人 Web3 用户，有 DeFi 使用经验，希望通过自动化定投策略（如"每周定投 100 USDC 到 ETH"）积累资产，但：
- 不想每次手动操作 Uniswap
- 不想把私钥交给任何机器人或脚本
- 想要明确的预算控制和自动终止机制
- 定投后能方便查看投资情况

## 真实场景

> "我每周想自动定投 100 USDC 到 ETH，连续做 4 周。但我不是每天都看链，也不想让 Agent 能无限花我的钱。"

用户说一句话 → Agent 解析意图 → 构造 Pact → 用户在 Cobo App 审核批准 → Agent 每周自动执行 → 4 周后权限自动消失。期间用户可以随时查询投资报告。

## 最小功能（MVP）

| 功能 | 优先级 | 说明 |
|:----:|:------:|------|
| NL→结构化 DCA 参数 | P0 | 用户说"每周定投 100 USDC 到 ETH" → Agent 解析为 plan |
| Pact 构造与提交 | P0 | Agent 构建 Pact（budget / scope / time window）→ 用户审核 |
| Uniswap V3 报价 | P0 | 调用链上 Quoter 获取报价 |
| Pact 内 swap 执行 | P0 | 通过 Cobo contract_call 在 Pact 内执行 swap |
| 交易验证与日志 | P0 | Cobo get_transaction_record 验证 |
| 投资回看分析 | P1 | 用户查询时，Agent 分析历史数据生成投资报告 |

## 验证方式

1. **功能验证** — Base Sepolia 上跑完整 DCA 周期
2. **分析验证** — 3 次 DCA 后查询投资报告，验证数据准确性
3. **安全验证** — 模拟 8 种攻击场景，Policy Engine 拦截率 ≥ 6/8
4. **边界验证** — Pact 完成后 API Key 即时失效
5. **回退验证** — 人类 Revoke 后 Agent 调用返回 401

## 风险边界

| 风险 | 等级 | 缓解 |
|------|:----:|------|
| Cobo API 依赖 | 🔴 高 | 架构深度绑定 Pact 机制，无替代方案 |
| API Key 泄露 | 🟡 中 | 最小权限 + 人类可 Revoke |
| 报价不准确 | 🟡 中 | Agent 层 TWAP 对比校验 |
| 用户审核不严 | 🟡 中 | Policy Engine 做二次保险 |

## 技术路径

| 组件 | 选型 |
|------|------|
| Agent 框架 | Python + Hermes Agent |
| 钱包基础设施 | Cobo CAW（MPC 签名）|
| 任务授权 | Cobo Pact（budget / scope / time window）|
| 策略引擎 | Cobo Policy Engine |
| DEX | Uniswap V3（Quoter + Router）|
| 测试网 | Base Sepolia |

## 可能赛道

| 赛道 | 适配性 |
|:----:|--------|
| **Cobo Hackathon** | ⭐ 最高 — Cobo CAW 是核心基础设施 |
| Agent Tooling | ⭐ 高 — MCP Server + CAW 集成 |
| DeFi Automation | ✅ 可 — DCA 是经典 DeFi 场景 |

---

*1 页 Proposal · DCA Automation Agent · AI × Web3 School Cohort 0*
