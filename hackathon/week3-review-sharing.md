# Week 3 学习复盘 — DCA Automation Agent

> 6.05 Week 3 例会学习反思
> 按时提交文字版（未上麦分享）

---

## 本周进展摘要

**项目方向**：DCA Automation Agent（Cobo｜Agentic Economy 赛道）

**Week 3 完成的关键文档：**

| 文档 | 说明 |
|------|------|
| Direction Card | 项目定位、目标用户、MVP |
| Proposal Memo | 1 页 Proposal |
| Repo Skeleton | 技术栈 + 目录结构 |
| Week 4 Sprint Plan | 6/8-6/12 每日目标 |
| Scope Review | P0/P1/P2 范围矩阵 |
| Risk / Assumption Memo | 关键前提 + Fallback A/B/C |
| Sponsor / Mentor 问题 | 3 个 Cobo 实现问题 |
| Cobo Track Alignment | 钱包/预算/交易/风险对齐 |
| SDK / API Integration Plan | 6 个 API 集成方案 |
| Workshop Notes | Cobo 工具链笔记 |
| Technical Validation Plan | 14 个验证点 |
| Project Flow Diagram | 完整流程图 |
| Deep Research Pack | Cobo Pact / Uniswap V3 / ERC-4337 |

## 本周最大的收获

理解了 AI Agent 参与链上经济的完整闭环：

> Agent 不自持私钥 → Pact 授权边界 → Policy Engine 安全兜底 → MPC 签名执行 → 链上可验证

Cobo Agentic Wallet 的 **Pact + Policy Engine** 解决了 Agent 自动化的核心矛盾：既要 Agent 能自动执行，又要防止 Agent 失控。

## 下周（Week 4）目标

**Day 1（6/8）最优先**：确认 Cobo API Sandbox 可用性
- 如果可用 → 按 Sprint Plan 推进
- 如果不可用 → 启动 Fallback 方案

**核心目标**：在 Demo Day 展示从 NL 输入到链上 swap 的完整闭环

---

*AI × Web3 School Cohort 0 · Week 3 Review · 2026-06-05*
*未上麦分享，提交文字版复盘*
