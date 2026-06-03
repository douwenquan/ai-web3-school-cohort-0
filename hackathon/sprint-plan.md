# Week 4 Sprint Plan

> 项目：DCA Automation Agent
> 赛道：Cobo Hackathon
> 周期：6/8（一）~ 6/12（五）
> 最终提交截止：6/12

---

## 概要

| 维度 | 说明 |
|------|------|
| **目标** | 在 Base Sepolia 测试网上跑通完整 DCA 闭环：NL 输入 → Pact → swap → 验证 → 投资回看 |
| **技术栈** | Cobo CAW API + Uniswap V3 Quoter/Router + LLM + Python |
| **参赛形式** | Solo 单人 |

---

## 每日计划

### Day 1 — 6/8（一）：环境搭建 ✅ 真实实现

| 时间 | 任务 | 类型 | 说明 |
|:----:|------|:----:|------|
| ~2h | Cobo 测试钱包创建 | **真实** | 在 Cobo 控制台创建 Base Sepolia 测试钱包 |
| | 获取测试 USDC / ETH | **真实** | 从 faucet 获取测试代币 |
| | API Key 配置 | **真实** | 创建 API Key，配置最小权限 |
| | Uniswap Quoter 调用 | **真实** | 用 Python 调用链上 Quoter，验证报价返回 |

**验收标准：** 能通过 API 获取 ETH/USDC 的实时报价

---

### Day 2 — 6/9（二）：Agent 核心逻辑

| 时间 | 任务 | 类型 | 说明 |
|:----:|------|:----:|------|
| ~1h | dca.plan — NL→结构化参数 | **真实** | 用 LLM 将"每周定投 100 USDC 到 ETH"解析为 plan 对象 |
| ~1.5h | Pact 构造与提交 | **真实** | 调用 Cobo submit_pact API，构造 Pact（budget / scope / time window） |
| | 人类审核 Pact 流程 | **Mock** | Cobo App 审核需真实账户，演示时用截图说明 |

**验收标准：** 能提交 Pact，返回 Pact ID

---

### Day 3 — 6/10（三）：执行 + 验证 + 分析

| 时间 | 任务 | 类型 | 说明 |
|:----:|------|:----:|------|
| ~1h | swap.execute — Pact 内执行 swap | **真实** | 调用 Cobo contract_call 执行 swap |
| ~30min | 交易验证 | **真实** | 用 get_transaction_record 验证交易状态 |
| ~1h | 投资回看分析 | **真实** | 拉取 tx history → 计算指标 → LLM 生成报告 |

**验收标准：** 跑完一轮完整 DCA：输入 → Pact → swap → 验证 → 分析报告

---

### Day 4 — 6/11（四）：测试 + 安全

| 时间 | 任务 | 类型 | 说明 |
|:----:|------|:----:|------|
| ~1h | 多轮 DCA 执行 | **真实** | 模拟 3 轮定投，积累交易记录 |
| ~1h | 攻击模拟测试 | **真实** | 模拟 Prompt Injection / 伪造返回 / 越权指令，验证 Policy Engine 拦截 |
| ~30min | 边界测试 | **真实** | Pact 完成后 API Key 是否失效；Revoke 后是否返回 401 |

**验收标准：** 8 种攻击 ≥6 种被拦截；Pact 撤销后 API 返回 401

---

### Day 5 — 6/12（五）：Demo 准备 + 提交

| 时间 | 任务 | 类型 | 说明 |
|:----:|------|:----:|------|
| ~1h | Demo 脚本录制 | **真实** | 录制完整流程演示视频 |
| ~30min | README 完善 | **真实** | 更新 README：demo 链接、架构图、验证结果 |
| ~30min | 提交材料整理 | **真实** | 按 WCB 要求提交：repo / demo / 合约地址 / tx hash |
| | **12:00 Week 4 例会 + Demo** | **活动** | 参加例会，展示项目 |

---

## 真实实现 vs Mock/Fallback

| 模块 | 实现方式 | 风险 | Fallback |
|------|:--------:|:----:|----------|
| Cobo 测试钱包 | ✅ 真实 | Cobo 测试环境可用性 | 用 curl 模拟 API 返回 |
| Uniswap Quoter | ✅ 真实 | 测试网流动性不足 | 硬编码报价 |
| dca.plan NL 解析 | ✅ 真实 | LLM API 调用失败 | 手动输入结构化参数 |
| Pact 构造与提交 | ✅ 真实 | Cobo API 限流/报错 | 保存 Pact 请求 JSON 作为 proof |
| swap.execute | ✅ 真实 | 测试网 Gas 不足 | 记录 tx 构建过程作为 proof |
| 交易验证 | ✅ 真实 | tx 确认延迟 | 轮询等待 |
| 投资回看分析 | ✅ 真实 | Cobo API 无历史数据 | 用模拟数据生成报告 |
| 攻击模拟 | ✅ 真实 | 测试环境与生产差异 | 记录攻击场景设计文档 |
| 人类审核 Pact | ⚠️ Mock | 需要 Cobo App 真实账户 | 截图 + 流程说明 |
| 多 Agent 协作 | ❌ 延后 | MVP 不包含 | 列入 Future Work |

---

## 验证清单

| # | 验证项 | 预期结果 | 状态 |
|:-:|--------|---------|:----:|
| 1 | NL→plan 解析 | 输出结构化 DCA 参数 | ☐ |
| 2 | Pact 提交 | 返回 Pact ID，状态生效 | ☐ |
| 3 | Uniswap 报价 | 返回当前价格 + 滑点 | ☐ |
| 4 | swap 执行 | tx 成功，hash 可查 | ☐ |
| 5 | tx 验证 | 交易记录匹配预期 | ☐ |
| 6 | 投资报告 | 数据与链上一致 | ☐ |
| 7 | Pact 自动撤销 | 完成后 API 返回 401 | ☐ |
| 8 | 攻击拦截 | ≥6/8 被 Policy Engine 拦截 | ☐ |

---

## 每日时间分配

| 日期 | 计划耗时 | 核心交付 |
|:----:|:--------:|---------|
| 6/8（一） | ~2h | Cobo 环境就绪 + Quoter 通 |
| 6/9（二） | ~2.5h | NL→Pact 链路通 |
| 6/10（三） | ~2.5h | 完整 DCA 闭环通 |
| 6/11（四） | ~2.5h | 安全测试通过 |
| 6/12（五） | ~2h | Demo + 提交 |
| **合计** | **~11.5h** | |

---

*本文档对应 WCB 任务：Week 3｜最低完成路径｜Week 4 Sprint Plan（20分）*
