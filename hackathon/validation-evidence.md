# Validation Evidence — Pay-per-Use Research Agent

> SDK / Agent Trace / On-chain Records 验证证据

---

## 1. 代码证据

| 模块 | 文件 | 功能 |
|------|------|------|
| Agent 工作流 | `apps/api/src/workflow.ts` | 核心研究流程编排 |
| 预算策略 | `apps/api/src/money.ts` | 微单位 USDC 计算 |
| 支付层 | `apps/api/src/payments.ts` | 模拟收据 + 真实 USDC 转账 |
| 来源存证 | `apps/api/src/provenance.ts` | SHA-256 哈希 + 可选链上事件 |
| 研究计划器 | `apps/api/src/planner.ts` | 确定性数据源调度 |
| 数据供应商 | `apps/data-vendors/` | 免费 + 402 付费接口 |
| 智能合约 | `contracts/ResearchReceiptRegistry.sol` | 链上报告存证事件 |
| 前端 | `apps/web/src/app/page.tsx` | UI + 语言切换 + 时间线 |

## 2. 测试证据

```
npm run test → ✅ 通过
apps/api/src/workflow.test.ts
  - 完整 E2E 流程测试（plan → free → 402 → pay → report）
  - 预算不足跳过付费源
  - 支付收据验证
  - 哈希生成验证
```

## 3. 构建证据

```
npm run build → ✅ 通过
  - packages/shared → dist/
  - apps/api → dist/
  - apps/data-vendors → dist/
  - apps/web → .next/
```

## 4. 技术栈验证

| 维度 | 验证内容 |
|------|---------|
| TypeScript strict 模式 | tsconfig strict: true |
| Zod 运行时校验 | 请求/响应 schema 验证 |
| viem 链上交互 | Base Sepolia USDC transfer |
| HTTP 402 流程 | Paid API → 402 → payment → retry → data |
| Next.js App Router | React 19 + 服务端组件 |

## 5. 项目仓库

https://github.com/douwenquan/AI-pay-per-use-research-agent

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
