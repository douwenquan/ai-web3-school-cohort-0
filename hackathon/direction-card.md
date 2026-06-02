# Hackathon Direction Card

> DCA Automation Agent
> 赛道：Cobo Hackathon（Agentic Wallet / Agentic Commerce）

---

## 项目信息

| 字段 | 内容 |
|------|------|
| **项目名称** | **DCA Automation Agent** |
| **一句话说明** | 基于 Cobo Agentic Wallet 的自动化定投 Agent——用户说一句话，Agent 帮你自动执行 DCA 策略，还能随时回顾你的投资收益，资金安全由 Pact + Policy Engine 保障 |
| **赛道** | **Cobo Hackathon**（Agentic Wallet / Agentic Commerce） |
| **备选赛道** | AI × Web3 Agent Tooling、DeFi Automation |
| **技术栈** | Cobo CAW（Pact / Policy Engine / MPC）、Uniswap V3（Quoter + Router）、x402、LLM（意图解析 + 分析生成）、Base Sepolia（测试网） |

## 问题定义

**用户痛点：** 个人 Web3 用户想自动化执行 DCA 定投（如"每周定投 100 USDC 到 ETH"），但：

- ❌ 不想每次手动操作 Uniswap
- ❌ 不想把私钥交给任何 Agent 或机器人
- ❌ 想要明确的预算控制和自动终止机制
- ❌ 定投一段时间后，很难知道自己到底投了多少、均价多少、赚了还是亏了——需要在不同平台间手动拼凑数据

**现有方案的缺陷：** 市场上有一些 DCA / 定投工具，但都有明显短板——具体等你补充你观察到的缺点。

**为什么不是纯 AI 问题：** AI 能理解意图、做决策、生成分析报告，但不能自己持有私钥、不能自己签名、不能决定花多少钱——需要 MPC 签名、Policy Engine 强制执行和 Pact 任务级授权。

**为什么不是纯 Web3 问题：** Cobo CAW 提供了链上基础设施和执行记录，但不会自己理解用户的意图，也不会把交易历史转化成通俗易懂的投资分析报告。

## MVP 功能

| 功能 | 优先级 | 说明 |
|:----:|:------:|------|
| NL→结构化 DCA 参数 | P0 | 用户说"每周定投 100 USDC 到 ETH 做 4 周" → Agent 解析为结构化 plan |
| Pact 构造与提交 | P0 | Agent 构建 Pact（budget / scope / time window）→ 用户审核批准 |
| Uniswap V3 报价 | P0 | 调用链上 Quoter 获取当前报价 |
| Pact 内 swap 执行 | P0 | 通过 Cobo contract_call 在 Pact 内执行 swap |
| 交易验证与日志 | P0 | Cobo get_transaction_record 验证 + 记录 |
| **投资回看分析** | **P1** | **用户问"我这段时间定投怎么样了？"→ Agent 分析历史执行数据，生成投资报告** |
| x402 自动支付 | P1 | Agent 自主识别 402 响应并完成付款 |
| 失败分析与重试 | P1 | Agent 错误分类 + 有限范围内自动重试 |

### 投资回看分析功能详解

**触发场景：** 用户定投了几周后，想了解自己的投资情况。

**用户提问示例：**
- "我这 4 周的 DCA 定投情况怎么样？"
- "我一共投了多少 USDC？均价多少？"
- "现在是亏了还是赚了？"
- "帮我看看每次执行的价格和数量"

**Agent 做的事情：**

| 步骤 | 说明 |
|------|------|
| ① 查询执行历史 | 通过 Cobo get_transaction_record 拉取 Pact 内的所有历史交易记录 |
| ② 获取当前价格 | 调用 Uniswap Quoter 或链上价格喂价，获取当前 token 价格 |
| ③ 计算投资指标 | 总投资额、买入总量、平均成本、当前市值、盈亏金额、盈亏比例 |
| ④ 生成报告 | LLM 将数据组织成自然语言的投资总结 + 结构化表格 |

**产出示例：**

> 📊 **DCA 定投总结（过去 4 周）**
>
> | 指标 | 数值 |
> |------|------|
> | 总投入 | 400 USDC |
> | 累计买入 ETH | 0.152 ETH |
> | 平均成本 | ~~2,631 USDC/ETH~~ |
> | 当前价格 | ~~2,850 USDC/ETH~~ |
> | 当前市值 | ~~433.2 USDC~~ |
> | 盈亏 | **+33.2 USDC (+8.3%)** |
>
> **明细：**
> | # | 日期 | 投入 | 价格 | 获得 ETH |
> |:-:|:----:|:----:|:----:|:--------:|
> | 1 | 6/2 | 100 USDC | 2,600 | 0.0385 |
> | 2 | 6/9 | 100 USDC | 2,550 | 0.0392 |
> | 3 | 6/16 | 100 USDC | 2,700 | 0.0370 |
> | 4 | 6/23 | 100 USDC | 2,650 | 0.0377 |

**为什么这个功能有价值：**
- DCA 用户最关心的就是"投了多少钱、现在值多少"——没有这个功能，用户只能去 Etherscan 手动查
- 展示 Agent 不仅仅是"自动执行"，还能**理解和分析**——这才是 AI Agent 的差异化

## MVP vs 未来功能

| 范围 | 功能 |
|:----:|------|
| **MVP** | NL 解析 + Pact 构造 + 报价 + swap 执行 + 交易验证 + **投资回看分析** |
| **未来** | x402 自动支付、多策略（不止 DCA）、多链、多协议（Aave/Lido）、多 Agent 协作 |

## 执行流程

```
用户 NL 意图 ("每周定投 100 USDC 到 ETH")
    ↓
Agent 解析 → dca.plan（结构化参数）
    ↓
Agent 构造 Pact → 用户审核并批准（Cobo App）
    ↓
Pact 生效 → Agent 报价（Uniswap Quoter）
    ↓
Policy Engine 检查 → MPC 签名 → 链上 swap
    ↓
交易验证 → 记录日志（Cobo tx record）
    ↓
完成条件触发 → Pact 自动撤销
    ↓
══════════════════════════════
用户问 "投得怎么样了？"       ← 新增
    ↓
Agent 拉取 tx history         ← 新增
    ↓
计算投资指标 + LLM 生成报告    ← 新增
    ↓
返回结构化投资总结             ← 新增
    ↓
Emergency: 人类可随时 Revoke
```

## 验证方式

1. **功能验证** — Base Sepolia 上跑一个完整 DCA 周期：NL 输入 → Pact → swap → 验证
2. **分析验证** — 执行至少 3 次 DCA 后，输入"看看我投得怎么样了"，验证报告数据准确
3. **安全验证** — 模拟攻击场景，确认 Policy Engine 拦截率
4. **边界验证** — Pact 完成/撤销后 API Key 是否即时失效
5. **回退验证** — 人类 Revoke Pact 后 Agent 调用是否返回 401

## 主要风险

| 风险 | 等级 | 缓解 |
|------|:----:|------|
| Cobo API 依赖 | 🔴 高 | 架构依赖 Pact 机制，无替代方案 |
| API Key 泄露 | 🟡 中 | 最小权限 + 人类可撤销 |
| 报价不准确 | 🟡 中 | Agent 层 TWAP 对比 |
| 用户审核不严 | 🟡 中 | Policy Engine 做二次保险 |
