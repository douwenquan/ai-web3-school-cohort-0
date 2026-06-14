# Week 4 Final Submission Pack — Pay-per-Use Research Agent

> 最终提交包：仓库 + README + Demo + 验证证据 + 赛道说明 + 风险说明

---

## 1. 项目信息

| 维度 | 内容 |
|------|------|
| 项目名称 | AI Research Agent with Pay-per-Use Data |
| 赛道 | Agentic Commerce / Payment / DeFi |
| 仓库 | https://github.com/douwenquan/AI-pay-per-use-research-agent |
| 技术栈 | Next.js 15 / Express / TypeScript / viem / Solidity |

## 2. 核心功能

| 功能 | 说明 |
|------|------|
| Agent 自主研究 | 接收自然语言问题，结构化研究计划 |
| 免费 + 付费数据源 | 免费数据直取，付费数据走 HTTP 402 流程 |
| 预算策略强制 | 后端强制检查，超额跳过 |
| 支付层 | 模拟收据 / Base Sepolia 真实 USDC 转账 |
| 来源存证 | SHA-256 哈希 + 可选的链上事件 |
| 审计追踪 | UI 展示全部支付收据、数据哈希、报告哈希 |

## 3. 验证证据

- ✅ 完整代码（monorepo: apps/api, apps/web, apps/data-vendors, packages/shared）
- ✅ 集成测试通过（npm run test）
- ✅ 构建通过（npm run build）
- ✅ 本地可运行（npm run dev）
- ✅ PROJECT_OVERVIEW 技术文档
- ✅ 3-5 分钟 Demo 脚本
- ✅ Base Sepolia 链上存证合约（ResearchReceiptRegistry.sol）

## 4. 真实 vs Mock 边界

| 组件 | 状态 |
|------|:----:|
| Web UI | 真实 |
| Agent 计划器 | 确定性逻辑（非 LLM）|
| 预算策略 | 真实后端强制 |
| HTTP 402 流程 | Demo 实现 |
| Base Sepolia USDC | 可选真实测试网转账 |
| 付费数据供应商 | 本地模拟 |
| 付费数据集 | 模拟数据 |
| TVL 数据 | demo 数据集 |
| 链上存证 | 可选真实测试网交易 |

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
