# Sponsor / Mentor 问题清单

> 针对 DCA Automation Agent 的 Cobo Agentic Wallet 集成问题
> 项目：DCA Automation Agent（自动化定投 Agent）
> Sponsor：Cobo

---

## Q1 — Pact 的预算消耗时机与状态查询

**背景**
DCA 定投需要每周执行一次 swap，持续 4 周。Pact 的 `budget` 字段可以在创建时设定总预算上限（如 400 USDC）。但我不确定：

1. Pact 的 `budget` 是在**每次 contract_call 时实时扣减**，还是只在最终结算时校验？
2. 如果某次 swap 实际只花了 95 USDC（slippage 保护内），剩余额度是继续累积到下次，还是按 Pact 定义的总预算硬控？
3. Agent 能否通过 API 查询 Pact 的**剩余预算**，以便在投资报告中显示「预算余额」？

**预期回答**
- 理解 Pact 的预算管理机制，确定 Agent 能否在每次 swap 前做预算校验
- 如果不能查询剩余预算，投资分析功能需要从交易历史反推

---

## Q2 — Policy Engine 的规则范围与 Prompt Injection 防护

**背景**
项目的核心安全假设是：即使 Agent 被 Prompt Injection 攻击，Cobo Policy Engine 也能兜底。我需要明确：

1. Policy Engine 能限制的维度：
   - ✅ 白名单合约地址 → 只允许 Uniswap V3 Router
   - ✅ 单笔金额上限 → 不超过定投预算
   - ✅ 调用频率 → 每周最多 1 次 swap
   - ❓ 是否支持**输入参数校验**（如只允许 `swapExactInput` 方法，拒绝 `approve`）？
   - ❓ 是否支持**返回数据校验**（如报价偏离超过阈值则拒绝执行）？
2. 如果 Agent 被注入恶意指令试图调用非白名单合约，Policy Engine 是**在提交时就拒绝**，还是**在链上执行时拒绝**？两种场景下 Agent 会收到什么错误码？

**预期回答**
- 明确 Policy Engine 的实际能力边界
- 确定哪些安全防护需要 Agent 层自己实现（如报价偏差检测）

---

## Q3 — contract_call 的 Gas 估算与失败重试策略

**背景**
Agent 自动化执行 swap 时，需要处理交易失败和 Gas 波动的场景：

1. Cobo 的 `contract_call` 是否支持指定 `gasLimit`？如果不填，是自动估算还是用默认值？
2. 如果链上交易由于 `OUT_OF_GAS` 或价格波动导致 revert，Agent 能否通过 API 获取**明确的失败原因**（不仅仅是 tx status = failed）？
3. 推荐的**重试策略**是什么？
   - 直接重新发起相同的 contract_call？
   - 重新 Quoter 报价后再发起？
   - 有频率限制（Rate Limit）吗？

**预期回答**
- 确定 Agent 在 swap 失败后的自动重试逻辑
- 如果失败信息不够明确，需要在 Agent 层做额外处理（如交易回执解析）
