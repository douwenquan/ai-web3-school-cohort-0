# MVP — Minimal Verifiable Main Flow

> Pay-per-Use Research Agent 最小可验证主流程

---

## 主流程

```
用户输入研究问题 + 设定预算
    ↓
Agent 创建结构化研究计划
    ↓
Agent 调用免费数据源 → 返回数据
    ↓
Agent 调用付费数据源 → 返回 402 Payment Required
    ↓
Agent 检查预算策略 → 预算充足
    ↓
Agent 创建支付收据（模拟或真实 Base Sepolia USDC 转账）
    ↓
Agent 携带支付凭证重试 → 付费数据解锁
    ↓
Agent 生成研究报告 + 审计追踪
    ↓
UI 展示：报告 + 支付收据 + 数据哈希 + 交易链接
```

## 验证记录

| 步骤 | 验证方式 | 结果 |
|:----:|---------|:----:|
| 1 | UI 输入研究问题 + 设置预算 = 2 test USDC | ✅ |
| 2 | API 返回结构化研究计划 | ✅ |
| 3 | 免费数据源（defillama_tvl, snapshot_governance）返回数据 | ✅ |
| 4 | 付费数据源返回 402 + payment scheme | ✅ |
| 5 | 预算策略：0.35 + 0.25 ≤ 2.0 → 放行 | ✅ |
| 6 | 支付收据创建（本地 mock receipt） | ✅ |
| 7 | 携带 x-payment header 重试 → 数据返回 | ✅ |
| 8 | 报告生成 + UI 展示 | ✅ |
| 9 | 审计追踪：数据哈希 + 收据哈希 + 报告哈希 | ✅ |
| 10 | npm run dev 本地启动成功 | ✅ |
| 11 | npm run test 通过 | ✅ |
| 12 | npm run build 通过 | ✅ |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 15 + Tailwind CSS + TypeScript |
| Agent API | Express + TypeScript |
| 数据供应商 | Express 模拟服务 |
| 支付 | 模拟收据 / Base Sepolia USDC（viem）|
| 链上存证 | ResearchReceiptRegistry.sol |
| 测试 | Node.js assert/strict |

## 项目仓库

https://github.com/douwenquan/AI-pay-per-use-research-agent

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
