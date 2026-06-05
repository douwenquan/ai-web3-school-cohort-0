# Scope Review — DCA Automation Agent

> 项目范围界定，防止 Week 4 Sprint 期间 Scope Creep
> Hackathon 赛道：Cobo｜Agentic Economy × Cobo Agentic Wallet
> 项目：DCA Automation Agent（自动化定投 Agent）

---

## 一、项目一句话

基于 Cobo Agentic Wallet（Pact + Policy Engine + MPC），让用户用自然语言定义 DCA 定投策略，Agent 在预授权的安全边界内自动执行链上 swap，并支持投资回看分析。

---

## 二、范围矩阵

### ✅ P0 — 核心 MVP（必须完成）

| # | 功能 | 说明 | 验证标准 |
|:-:|------|------|---------|
| 1 | NL → 结构化 DCA 参数 | 用户说「每周定投 100 USDC 到 ETH，持续 4 周」→ Agent 解析为 `dca.plan` | 5 种不同 NL 输入，全部正确解析 |
| 2 | Pact 构造与提交 | Agent 根据 plan 构造 Cobo Pact（budget/scope/time window）→ 推送至 Cobo App 供用户审核 | Pact 结构完整，可在 Cobo App 中看到待审核 |
| 3 | Uniswap V3 报价 | 在 Base Sepolia 上通过 Uniswap V3 Quoter 获取交易报价 | 返回有效报价，包含 executionPrice、estimatedGas |
| 4 | Pact 内 swap 执行 | 通过 Cobo `contract_call` 在 Pact 授权范围内执行 swap | 链上交易成功，tx hash 可查 |
| 5 | 交易验证与日志 | Cobo `get_transaction_record` 验证，结果写入本地日志 | 每次执行后 30s 内可查到 tx record |
| 6 | 安全边界测试 | Prompt Injection / 伪造返回 / 越权指令 8 种攻击场景 | Policy Engine 拦截率 ≥ 6/8 |

### 🔵 P1 — 差异化亮点（尽力而为）

| # | 功能 | 说明 | 优先级理由 |
|:-:|------|------|-----------|
| 7 | 投资回看分析 | 用户查询时，Agent 拉历史记录计算总投资额、均价、盈亏 | 核心差异化 — 区分「自动执行机器」和「投资助手」 |
| 8 | x402 支付 | 通过 x402 协议实现机器间小额支付 | P1，MVP 不依赖此功能 |

### ⚪ P2 — 锦上添花（有时间再做）

| # | 功能 | 说明 |
|:-:|------|------|
| 9 | 多 token 支持 | 不只是 ETH，支持用户指定任意 ERC-20 |
| 10 | Telegram / Discord Bot | 通过聊天界面与 Agent 交互 |
| 11 | Grafana 看板 | 可视化 DCA 执行情况 |
| 12 | Tenderly 模拟 | 交易执行前模拟验证 |

---

## 三、技术边界

```
Agent（Hermes Agent / Python）
    ↓
Pact API（Cobo CAW）— 任务级授权
    ↓
Policy Engine — 策略强制（白名单/金额上限/频率）
    ↓
contract_call（Cobo）— MPC 签名执行
    ↓
Uniswap V3 Router（Base Sepolia）
```

**显式排除：**
- ❌ 不做自己的钱包 / 私钥管理（依赖 Cobo CAW）
- ❌ 不做非 EVM 链支持（限于 Base Sepolia / 主网 Base）
- ❌ 不做 Limit Order / Stop Loss（仅 DCA）
- ❌ 不做跨链桥集成
- ❌ 不做代币 Launch / DEX 做市

---

## 四、风险边界

| 风险 | 等级 | 缓解措施 |
|------|:----:|----------|
| Cobo API 依赖 — Pact 不可用则项目不可行 | 🔴 | 架构深度绑定，无替代方案 |
| API Key 泄露 — 但 Pact 限制作用域 | 🟡 | 最小权限 + 政策检查双保险 |
| Base Sepolia 与主网行为差异 | 🟡 | 测试网验证后需安全审计 |
| Uniswap 报价不准确（MEV/滑点） | 🟡 | Agent 层 TWAP 对比校验 |
| 用户 Cobo App 审核延迟 | 🟢 | MVP 阶段可手动简化流程 |

---

## 五、Week 4 Sprint 锚定

| 日期 | P0 目标 | P1 目标 |
|:----:|---------|---------|
| 6/8（一） | Cobo 测试钱包 + API Key 配置 + Uniswap Quoter 调用 | — |
| 6/9（二） | dca.plan NL 解析 + Pact 构造与提交 | — |
| 6/10（三） | swap.execute + 交易验证 | 投资回看分析 |
| 6/11（四） | 端到端联调 + 8 种攻击模拟测试 | x402 探索 |
| 6/12（五） | Demo 准备 + 提交材料整理 | Demo 优化 |

**Sprint 规则：**
1. P0 未完成 → 禁止碰 P1
2. 每天结束时检查当日 P0 是否达标
3. 如果 6/10 仍卡在 Pact 集成 → 降级为本地 Mock + Cobo App 手动演示
4. 如果 6/11 端到端失败 → 准备截图/代码/架构图作为「尽力展示」

---

## 六、验收标准（Done = ?）

项目在 Week 4 Demo Day 展示时，必须满足：

1. ✅ 用户输入 NL 意图 → Agent 解析为结构化参数
2. ✅ Pact 构造完成，推送到 Cobo App（演示截图）
3. ✅ 至少一次通过 Cobo contract_call 发起的链上 swap 成功
4. ✅ 交易验证结果可在日志中查询
5. ✅ Demo 流程完整，不依赖讲师/工作人员协助
6. ✅ README 包含项目说明、架构图、Setup 步骤、Demo 流程

---

*Hackathon 项目 · AI × Web3 School Cohort 0 · 2026-06*
*这是参与文档，不是承诺的交付物 — 项目范围以实际成果为准。*
