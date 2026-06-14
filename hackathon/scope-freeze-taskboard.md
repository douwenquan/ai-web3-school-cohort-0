# Scope Freeze and Task Board — Pay-per-Use Research Agent

> Week 4 范围冻结 + 任务看板

---

## 项目一句话

AI 研究 Agent 在用户设定的预算范围内，自主购买按次付费数据，执行结构化研究计划，生成附带支付与来源证据的可审计报告。

## 范围冻结

### ✅ P0 — 核心 MVP（已完成）

| # | 功能 | 状态 |
|:-:|------|:----:|
| 1 | Agent 接收研究问题和预算输入 | ✅ 已实现 |
| 2 | Agent 创建结构化研究计划 | ✅ 已实现 |
| 3 | Agent 调用免费数据源 | ✅ 已实现 |
| 4 | HTTP 402 支付流程 | ✅ 已实现 |
| 5 | 后端预算策略强制 | ✅ 已实现 |
| 6 | Agent 创建支付收据 | ✅ 已实现 |
| 7 | 付费数据解锁返回 | ✅ 已实现 |
| 8 | 研究报告生成 | ✅ 已实现 |
| 9 | UI 展示时间线 + 审计追踪 | ✅ 已实现 |
| 10 | Base Sepolia 真实 USDC 转账（可选）| ✅ 已实现 |
| 11 | ResearchReceiptRegistry 链上事件（可选）| ✅ 已实现 |

### 🟡 P1 — 差异化功能（演示前可加）

| # | 功能 | 优先级 |
|:-:|------|:------:|
| 12 | 替换 demo TVL 数据为真实 DefiLlama API | 🟡 |
| 13 | 用 LLM 替换确定性计划器 | 🟡 |

### ⚪ P2 — 演示后迭代

| # | 功能 |
|:-:|------|
| 14 | 真实 x402 facilitator 集成 |
| 15 | 供应商 Dashboard |
| 16 | IPFS / Arweave 存证 |

## Task Board

### Must-Do（Demo 前必须完成）

| 任务 | 状态 |
|------|:----:|
| 项目 README | ✅ 已有 |
| PROJECT_OVERVIEW 文档 | ✅ 已有 |
| Demo 脚本 | ✅ PROJECT_OVERVIEW 已有 |
| 集成测试 | ✅ workflow.test.ts |
| npm run dev 本地验证 | ✅ |
| 运行截图/录屏 | ⬜ 待补 |

### Should-Do（有时间就做）

| 任务 | 状态 |
|------|:----:|
| 演示视频录制 | ⬜ |
| 提交材料整理 | ⬜ |

### Could-Do

| 任务 |
|------|
| 真实 DefiLlama API 集成 |
| LLM 计划器 |

## Demo 展示流程

```
1. 打开 UI  → 显示研究问题输入框
2. 输入问题：Which Base DeFi protocols grew fastest in TVL?
3. 设置预算：2 test USDC
4. 点击 Run Research
5. 展示时间线：
   - Plan created → Free data → 402 → Budget check → Payment → Premium data → Report
6. 展示支付收据（模拟或真实 tx）
7. 展示审计追踪
```

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
