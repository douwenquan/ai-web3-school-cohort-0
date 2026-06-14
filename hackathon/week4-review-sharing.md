# Week 4 学习复盘 — Pay-per-Use Research Agent

> 6.12 Week 4 例会项目进展分享

---

## 项目简介

AI Research Agent with Pay-per-Use Data — 在用户设定的预算范围内，自主购买按次付费数据，生成附带支付与来源证据的可审计研究报告。

## 当前进展

- ✅ 完整 monorepo（Next.js + Express + Solidity）
- ✅ HTTP 402 支付流程实现
- ✅ 预算策略强制
- ✅ 支付收据 + SHA-256 哈希存证
- ✅ 可选 Base Sepolia 真实 USDC 转账
- ✅ E2E 测试通过

## 关键技术点

- Agent 不自持私钥，通过 viem 发起链上 USDC transfer
- 预算使用微单位计算避免浮点误差
- 双模式支付：模拟收据 / 真实测试网

---

*AI × Web3 School Cohort 0 · Week 4 · 2026-06*
