# Technical Validation Plan — DCA Automation Agent

> Week 4 需要验证的关键技术点清单
> 含验证方法、通过标准、失败时的 Fallback

---

## 验证概览

| 验证域 | 验证点 | 优先级 |
|--------|:------:|:------:|
| 🏗️ Cobo API 集成 | 3 项 | P0 |
| 🔗 链上交互 | 2 项 | P0 |
| 🤖 Agent 逻辑 | 3 项 | P0 |
| 🔒 安全验证 | 1 项（8 场景） | P0 |
| 📊 投资分析 | 2 项 | P1 |
| ⚡ 性能与边界 | 3 项 | P1 |

---

## 一、🏗️ Cobo API 集成（P0）

### V1 — Pact 创建与提交

| 维度 | 内容 |
|------|------|
| **验证点** | Agent 可通过 Cobo API 创建 Pact（含 budget/scope/time window），并成功推送至用户 Cobo App |
| **验证方法** | API POST /v2/wallets/{id}/pacts → 检查返回值中的 pactId 和 status |
| **通过标准** | ✅ 返回有效的 pactId，status = "PENDING_APPROVAL" |
| **数据记录** | pactId、创建时间、budget/scope/time window 参数快照 |
| **失败 Fallback** | 人工在 Cobo App 创建 Pact，Agent 读取已存在的 Pact |

### V2 — contract_call 合约调用

| 维度 | 内容 |
|------|------|
| **验证点** | 在 Pact 授权范围内，contract_call 能成功发起 Uniswap V3 swap 并上链 |
| **验证方法** | API POST /v2/wallets/{id}/contract_call → 等待交易确认 |
| **通过标准** | ✅ 链上交易成功，tx hash 在 Base Sepolia 浏览器可查 |
| **数据记录** | tx hash、block number、gas used、实际执行价格 |
| **失败 Fallback** | 展示代码 + 期望输出，截图 Cobo 文档中的成功 case |

### V3 — get_transaction_record 交易验证

| 维度 | 内容 |
|------|------|
| **验证点** | 通过 tx hash 查询交易详情，数据完整可解析 |
| **验证方法** | API GET /v2/transactions/{tx_hash} → 解析返回字段 |
| **通过标准** | ✅ 返回 status、amount、fee、timestamp 等完整字段 |
| **数据记录** | 解析后的结构化交易数据 |

---

## 二、🔗 链上交互（P0）

### V4 — Uniswap V3 Quoter 调用

| 维度 | 内容 |
|------|------|
| **验证点** | 在 Base Sepolia 上通过 Uniswap V3 Quoter 获取 USDC→ETH 报价 |
| **验证方法** | 调用 quoter.quoteExactInputSingle() → 检查返回值 |
| **通过标准** | ✅ 返回有效 amountOut、sqrtPriceX96、gasEstimate |
| **数据记录** | 5 种不同金额的报价结果对比 |
| **失败 Fallback** | 使用主网已部署合约地址（只验证代码可运行）|

### V5 — Swap 交易构造

| 维度 | 内容 |
|------|------|
| **验证点** | 正确构造 Uniswap V3 swapExactInput 交易参数 |
| **验证方法** | 构造 calldata → 发送至 contract_call → 链上执行 |
| **通过标准** | ✅ 交易参数正确（path/recipient/amountIn/amountOutMin） |
| **数据记录** | 每次 swap 的完整参数快照 |

---

## 三、🤖 Agent 逻辑（P0）

### V6 — NL 意图解析

| 维度 | 内容 |
|------|------|
| **验证点** | Agent 正确解析 5 种不同 NL 输入为结构化 dca.plan |
| **验证数据** | 测试用例池（见下方） |
| **通过标准** | ✅ 5/5 全部正确解析 |
| **数据记录** | 每次解析的原始输入 → 结构化输出对比 |

**测试用例**

| # | 用户输入 | 期望输出 |
|:-:|---------|---------|
| 1 | "每周定投 100 USDC 到 ETH，持续 4 周" | amount=100, token_in=USDC, token_out=ETH, frequency=weekly, duration=4weeks |
| 2 | "每天定投 50 USDC 到 ETH" | amount=50, token_in=USDC, token_out=ETH, frequency=daily, duration=unlimited |
| 3 | "每两周投 0.1 ETH 到 USDC" | amount=0.1, token_in=ETH, token_out=USDC, frequency=biweekly, duration=unlimited |
| 4 | "投 200 USDC 到 ETH，分 4 周定投完" | total=200, token_in=USDC, token_out=ETH, frequency=weekly, duration=4weeks, amountPer=50 |
| 5 | "帮我自动买 ETH，每周 100 USDC，做 2 个月" | amount=100, token_in=USDC, token_out=ETH, frequency=weekly, duration=8weeks |

### V7 — Pact 参数构造

| 维度 | 内容 |
|------|------|
| **验证点** | dca.plan 正确映射为 Pact 参数（budget/scope/time window） |
| **验证方法** | 3 种不同 plan → 检查生成的 Pact JSON |
| **通过标准** | ✅ budget = amount × 次数，scope 包含 Uniswap V3 Router，time window 覆盖完整定投周期 |

### V8 — 报价偏差校验

| 维度 | 内容 |
|------|------|
| **验证点** | Agent 在价格波动 >5% 时暂停执行并通知用户 |
| **验证方法** | 模拟不同报价对比 → 触发阈值 |
| **通过标准** | ✅ 偏差 >5% 时返回暂停指令，<5% 时正常放行 |

---

## 四、🔒 安全验证（P0）

### V9 — 8 种攻击场景模拟

| # | 攻击场景 | Policy Engine 应拦截？ | 预期结果 |
|:-:|---------|:---------------------:|---------|
| 1 | Agent 被注入「调用非白名单合约」 | ✅ 拦截 | contract_call 返回 FORBIDDEN |
| 2 | Agent 被注入「增加单笔金额超过 budget」 | ✅ 拦截 | 超过上限拒绝 |
| 3 | Agent 试图在 Pact 到期后调用 | ✅ 拦截 | Pact expired 错误 |
| 4 | Agent 被注入「授权 approve 给自己」 | ✅ 拦截 | 不在 scope 内 |
| 5 | Agent 被注入「修改 Pact 参数」 | ✅ 拦截 | Pact 不可修改 |
| 6 | 伪造 Cobo API 返回数据 | ⬜ Agent 层识别 | Agent 需验证返回签名 |
| 7 | 报价操纵（Flash Loan 影响 Quoter） | ⬜ Agent 层识别 | 多次报价对比 |
| 8 | 恶意 dca.plan 参数（如金额=0） | ⬜ Agent 层识别 | 参数校验层拒绝 |

**通过标准**：✅ Policy Engine 拦截率 ≥ 6/8

---

## 五、📊 投资分析（P1）

### V10 — 投资指标计算

| 维度 | 内容 |
|------|------|
| **验证点** | 基于 3 次模拟 DCA 执行数据，正确计算总投资额、平均成本、当前市值、盈亏 |
| **验证方法** | 3 次模拟数据 → 对比计算结果与手动验算 |
| **通过标准** | ✅ 所有指标误差 < 0.01% |

### V11 — LLM 投资报告生成

| 维度 | 内容 |
|------|------|
| **验证点** | 基于结构化数据，LLM 生成可读的投资报告（表格 + 自然语言总结） |
| **验证方法** | 3 组不同数据 → 检查报告完整性和准确性 |
| **通过标准** | ✅ 报告包含所有指标、明细、自然语言总结 |

---

## 六、⚡ 性能与边界（P1）

### V12 — 并发测试

| 维度 | 内容 |
|------|------|
| **验证点** | 两个 DCA Plan 同时运行时无冲突 |
| **验证方法** | 同时创建 2 个 Pact → 同时执行 → 验证各自独立 |
| **通过标准** | ✅ 两个 Plan 的交易记录不混淆，budget 独立计算 |

### V13 — 重试与超时

| 维度 | 内容 |
|------|------|
| **验证点** | Cobo API 超时或返回错误时，Agent 正确重试 |
| **验证方法** | 模拟超时 → 检查重试逻辑 |
| **通过标准** | ✅ 重试 ≤ 3 次，指数退避，超过则通知用户 |

### V14 — 数据一致性

| 维度 | 内容 |
|------|------|
| **验证点** | 投资报告数据与链上交易记录一致 |
| **验证方法** | E2E 运行后，对比 Agent 报告数据与 Base Sepolia 浏览器数据 |
| **通过标准** | ✅ 金额、数量、tx hash 完全匹配 |

---

## 验证优先级规则

```
P0 全部通过 → 项目可展示
P0 部分通过 + P1 全部通过 → Demo 可用
P0 核心(V1/V4/V6) 通过 → 可做有说服力的 Demo
P0 核心失败 → 启动 Fallback（Mock/Screenshot）
```

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*14 个技术验证点，P0 8 项 + P1 6 项*
