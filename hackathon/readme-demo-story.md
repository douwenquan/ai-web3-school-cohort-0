# README & Demo Story — Pay-per-Use Research Agent

> 项目说明 + 3-5 分钟 Demo 脚本

---

## 项目说明

### 一句话

AI 研究 Agent 在用户设定的预算范围内，自主购买按次付费数据，执行结构化研究计划，生成附带支付与来源证据的可审计报告。

### Problem

| 问题 | 说明 |
|------|------|
| 链上研究需要多源数据 | 免费数据有限，高质量数据需要付费 |
| 手动购买数据成本高 | 每次需要手动操作、验证、记录 |
| 研究过程难以审计 | 用了哪些数据、花了多少钱、怎么得出的结论 |

### Why AI

Agent 可以自主：
- 发现需要哪些数据源
- 处理 HTTP 402 支付流程
- 在预算约束下决策买不买
- 生成结构化研究报告

### Why Web3

- 通过 Base Sepolia 实现真实的机器间 USDC 支付
- 链上存证报告哈希，提供可验证的审计追踪

### How It Works

```
用户 → 输入问题 + 预算 → Agent API → 免费数据 + 付费数据(402) → 预算校验 → USDC 支付 → 报告生成 → 链上存证
```

---

## Demo 脚本（3-5 分钟）

### 开场（30 秒）

> "这是一个 AI 研究 Agent，可以在用户给的预算范围内，自主购买按次付费的数据，做研究报告，并附带支付和审计证据。"

### 操作流程（2 分钟）

1. **打开 UI** → 显示研究问题输入框和预算设置
2. **默认问题**：*"Which Base DeFi protocols grew fastest in TVL over the last 30 days, and why?"*
3. **设置预算**：`2 test USDC`
4. **点击 Run Research**

### 展示时间线（1 分钟）

| 阶段 | 展示重点 |
|------|---------|
| Plan Created | Agent 拆解为 4 个数据源调用计划 |
| Free Data | 免费数据源返回 TVL 数据 |
| 402 Payment Required | 付费接口返回 402，Agent 收到支付要求 |
| Budget Check | Agent 检查预算：0.35 + 0.25 ≤ 2.0 ✅ |
| Payment Authorized | Agent 创建支付收据 |
| Premium Data | 付费数据成功解锁 |
| Report Generated | 研究报告生成 |

### 审计追踪（30 秒）

- 展示支付收据列表
- 展示数据哈希和报告哈希
- 如果有真实交易，打开 Basescan 链接

### 边界说明（30 秒）

> "支付可以是真实的 Base Sepolia USDC 转账，但付费数据供应商和数据集是本地演示服务。"

### 结尾（30 秒）

> "这个 Agent 可以自主购买按次付费数据、在预算策略内执行、并生成附带支付和来源证据的可审计研究报告。"

---

## 完整 README

已在项目仓库：https://github.com/douwenquan/AI-pay-per-use-research-agent

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
