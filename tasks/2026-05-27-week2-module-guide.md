# Week 2 共学营模块参考手册

> AI × Web3 School · Cohort 0 · 2026-05-25 ~ 2026-06-01
> 本文档为共学营官方模块内容的整理与归档，供后续学习参考。

---

## 目录

- [模块 A：问题空间与方向地图](#模块-a问题空间与方向地图)
- [模块 B：Payment / Commerce / Settlement](#模块-bpayment--commerce--settlement)
- [模块 C：Identity / Reputation / Capability / Interoperability](#模块-cidentity--reputation--capability--interoperability)
- [模块 D：Wallet / Permission / Safe Execution](#模块-dwallet--permission--safe-execution)
- [模块 E：Agent DeFi Execution](#模块-eagent-defi-execution从意图到安全链上执行)
- [模块 F：Privacy / Security / Sovereignty](#模块-fprivacy--security--sovereignty)
- [模块 G：Governance / Coordination / Public Goods](#模块-ggovernance--coordination--public-goods)
- [Week 2 总交付清单](#week-2-总交付清单)
- [WCB 任务索引](#wcb-任务索引)

---

## 模块 A｜问题空间与方向地图

### 核心知识点

- 交叉方向至少可以从 **payment / commerce、identity / reputation、capability / interoperability、wallet / permission、privacy / security、governance / coordination** 等问题域理解。
- 一个方向是否成立，不看它用了多少新词，而看 **AI 能力和 Web3 机制是否同时不可替代**。
- 真正有价值的问题通常会落在 **"机器执行 + 经济交换 + 权限控制 + 可验证记录"** 的交界处。
- 早期 proposal 不需要完整实现，但必须能说清楚 **目标用户、真实场景、最小功能、验证方式、风险边界**。

### 方向速览：先看全局，再选主线

模块 A 的重点是先快速看完整个 AI × Web3 的几大交叉领域，再选择一个主方向深入。学员不需要在这一页把所有方向都做成项目，但需要知道每个方向的核心问题、典型入口、适合什么类型的学员，以及它可能落在产品、工具、协议还是研究层。

| 方向 | 核心问题 | 适合谁 | 层面 |
|------|---------|--------|------|
| **Payment / Commerce / Settlement** | 机器或 agent 如何购买 API、数据、算力和服务，以及报价、验收、托管、争议处理和结算如何闭环 | 对商业闭环、支付、标准和协议感兴趣的学员 | 产品 / 协议 |
| **Identity / Reputation / Capability / Interoperability** | Agent 如何被发现、描述、调用、验证和协作 | 对 MCP、A2A、ERC-8004、registry、agent profile、能力声明感兴趣的学员 | 协议 / 工具 |
| **Wallet / Permission / Safe Execution** | Agent 接触钱包、签名、预算和链上动作时，如何做权限分层、自动化边界、人工确认、撤销与审计 | 对账户抽象、Safe、policy、guard、session key 感兴趣的学员 | 工具 / 产品 |
| **Privacy / Security / Sovereignty** | Prompt injection、tool abuse、敏感数据、模型供应商依赖、私钥/API Key 暴露、本地执行和用户主权 | 对安全、隐私、可信执行、审计和风险控制感兴趣的学员 | 研究 / 工具 |
| **Dev Tooling / Agent Workflow** | AI 是否能真正改善 Web3 builder 工作流（docs-to-agent、合约阅读、交易解释、部署助手等） | 希望做工具、开发者体验或 workflow 的学员 | 工具 |
| **Governance / Coordination / Public Goods** | AI 如何辅助 DAO、社区、公共物品项目做提案总结、会议行动项、贡献记录、预算 checklist 和透明执行 | 对社区协作、公共物品和组织流程感兴趣的学员 | 协议 / 产品 |

**框架说明：** Agent DeFi Execution 保留为第五个模块，定位为 sponsor-defined applied path。它不是新的第七个基础方向，而是把 Payment / Commerce、Wallet / Permission 和 Privacy / Security 放到 DeFi 链上执行场景中集中检验；学员可以把它作为 Cobo 相关 Hackathon / workshop 的优先应用路径。

### 主方向选择方法

1. 先从 6 个方向中选出 **2 个感兴趣方向**，各写一句：这个方向的真实用户是谁。
2. 再写一句：**如果没有 AI，这个问题为什么难以解决；如果没有 Web3，这个问题为什么缺一块。**
3. 再判断它更适合做：**产品 demo、developer tooling、protocol / standard、risk model，还是 research memo**。
4. 最后只选 **1 个主方向** 作为 Week 2 深入探索对象，其余方向放入 backlog，不要同时开太多线。

### 方向判断矩阵

| 维度 | 问题 |
|------|------|
| **结构性需求** | 这个问题是否长期存在，还是只因为某个热点项目出现？ |
| **验证可能性** | 能否用 demo、流程图、交易记录、日志、用户访谈或 reference implementation 验证？ |
| **最小切入点** | 一周内能不能做出问题拆解、流程图、mock、repo skeleton 或最小 prototype？ |
| **风险边界** | 是否涉及私钥、签名、资金、身份、敏感数据、治理权力或不可逆动作？ |
| **后续承接** | 它能否自然进入 Week 3 的 proposal、Hackathon track/challenge 或长期 handbook / research backlog？ |

### 推荐学习材料

- [Ethereum 技术入门指南](https://ethereum.org/developers/docs/intro-to-ethereum/) — 以太坊网络技术理解的基础入口
- [比特币白皮书](https://bitcoin.org/files/bitcoin-paper/bitcoin_zh_cn.pdf) — 理解 Web3 最早解决的问题
- [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) / [A2A](https://github.com/a2aproject/A2A) — Agent 与工具/Agent 之间的协作接口
- [GLM-5.1 Agentic Coding 指南](https://docs.z.ai/guides/llm/glm-5.1#agentic-coding) — Agent 规划、tool use、coding 场景下的能力定位
- [Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) — GLM-5.1 的核心接口，5 分钟跑通第一个 function calling 请求
- [Web Search Tool](https://docs.z.ai/api-reference/tools/web-search) — 内置可调用的 web 检索能力

### 任务 / 挑战

- 画一张 AI × Web3 问题地图，把 **至少 5 个方向** 放进去，并说明每个方向的 AI 作用和 Web3 机制。
- 从地图里选 2 个方向，分别写出 **"为什么不是纯 AI 问题 / 为什么不是纯 Web3 问题"**。
- 选择一个方向作为自己的 **Week 2 主线**，后续模块都围绕这个方向继续拆解。

---

## 模块 B｜Payment / Commerce / Settlement

### 核心问题

Agent 经济活动不是普通支付问题的简单延长。真正困难的不是"能不能转账"，而是**报价、预算、授权、交付、验证、托管、争议处理、收据和结算**如何连成一个可控链路。

- AI agent 作为消费者或服务提供者时，需要明确 **预算、支付条件、交付标准和失败补救**。
- **payment 只是链路中的一段**；commerce 还包括发现服务、协商价格、执行任务、验收结果、处理争议和结算。
- 链上记录可以提供收据、状态和结算基础，但不能自动解决服务质量、仲裁和信任问题。

### 深入探索路径：从场景到协议

```
场景层 → 流程层 → 验证层 → 协议层
```

**场景层：** 先明确 agent 购买的到底是什么——API 调用、数据查询、计算任务、人工服务、内容生成，还是链上执行。不同服务决定不同验收方式。

**流程层：** 把"发现服务 → 报价 → 授权预算 → 执行任务 → 交付结果 → 验收 → 付款/退款/争议"画成流程图。

**验证层：** 判断交付是否能被自动验证。如果不能自动验证，就要说明谁来验收、验收标准是什么、争议如何处理。

**协议层：** 再判断这个问题需要的是 checkout、invoice、receipt、escrow、reputation、evaluator，还是更完整的 marketplace / settlement layer。

**反例：** 如果只是让 agent 帮用户点一个传统支付按钮，但没有预算控制、交付证明、可验证记录或争议处理，这更像普通自动化，不一定是 AI × Web3 的强方向。

### 案例：Cobo CAW 在 Agent Commerce 链路中的作用

**预算与权限控制：** 在 agent commerce 中，用户不能只给 agent 一个"可以支付"的笼统权限，而需要限制它能花多少钱、在哪些链上操作、调用哪些合约、在什么时间窗口内执行。Cobo CAW 的 Pact 机制可以作为一个案例：用户围绕某个具体任务批准预算和执行范围，agent 只能在 Pact 定义的边界内操作，超出范围的动作会被拒绝。

**审计与可验证记录：** Agent 完成交易或任务后，系统需要留下可追溯的记录，包括授权内容、执行动作、链上交易、状态变化和异常日志。Cobo CAW 的审计能力可以作为案例，说明 agent commerce 不只是"支付成功"，还需要形成后续可验证、可追责、可复盘的执行记录。

**边界说明：** CAW 更偏向钱包与执行安全层，适合解决预算控制、权限约束和审计问题；但完整的 agent commerce 还需要结合报价、交付、验收、escrow、evaluator、reputation 和 dispute resolution 等协议或产品层能力。

- CAW 介绍文档：https://www.cobo.com/products/agentic-wallet/manual/start-here/introduction
- CAW 索引页：https://cobo.com/products/agentic-wallet/manual/llms.txt

### Task：x402 Paywall + CAW Agent 自主支付闭环

搭建一个简单的 x402 paywall 服务，例如收费的数据接口或 AI 推理接口。服务端在收到请求时返回付款要求，消费端由一个接入 Cobo CAW 的 agent 自动识别付款条件，并在预设 Pact / policy / budget 范围内完成付款、获取结果。

该任务的目标是跑通一个最小化的 agent 自主支付闭环：

- 服务提供方：提供受 x402 保护的 API 或 AI 推理服务
- 消费方：由 agent 发起请求、识别付款要求并完成支付
- 权限控制：通过 CAW / Pact 限制预算、操作范围和时间窗口
- 链上结算：完成 payment settlement，并保留可审计记录
- 结果获取：付款成功后，agent 自动拿到接口返回结果

**重点理解：** Agent commerce 的关键不是"自动付款"，而是"在明确授权、预算控制和可审计记录下完成自动交易"。

### 推荐学习材料

- [x402 Docs](https://docs.x402.org/introduction) — 开放支付入口与 machine payment framing
- [MPP introduction](https://stripe.com/blog/machine-payments-protocol) — Machine Payments Protocol 问题背景
- [MPP 官方文档](https://docs.stripe.com/payments/machine/mpp) — Machine Payments Protocol 文档入口
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) / [ERC-8183](https://eips.ethereum.org/EIPS/eip-8183) — Agent trust、job、escrow、evaluator 等协议方向参考
- [Stripe Agentic Commerce](https://stripe.com/agentic-commerce) — Web2/fintech 侧 agent commerce 对照材料
- [Olas](https://olas.network/) — Agent economy / autonomous services 方向参考

### 任务

- 选一个"agent 帮人完成任务并收款"的场景，拆出完整流程：谁下单、谁执行、谁验收、谁付款、谁仲裁。
- 设计一个最小 payment / commerce flow：报价、执行、验收、付款、失败处理、记录证明。
- 比较 **x402、MPP、ERC-8004、ERC-8183** 中任意两个，说明它们分别解决支付、验证、身份、结算或仲裁中的哪一段。

---

## 模块 C｜Identity / Reputation / Capability / Interoperability

### 核心问题

Agent 不只是"会执行的程序"，还需要可发现、可描述、可验证、可协作的能力层。这个模块要分清身份、能力声明、通信协议、任务协作和信誉积累各自在解决什么。

- **identity** 解决"你是谁"，**capability** 解决"你能做什么"，**reputation** 解决"别人为什么信你"。
- **interoperability** 关注不同 agent、工具、服务和系统如何交换上下文、任务与结果。
- **MCP、A2A、ERC-8004、MPP** 不是同一种东西：它们处在不同层级，解决的问题和约束条件也不同。
- 真正有价值的方向，不是给 agent 起一个 DID 名字，而是让 **发现、协作、调用、验证** 形成完整链路。

### 深入探索路径：从 agent profile 到协作网络

```
Profile → Capability → Interoperability → Reputation
```

**Profile：** 描述 agent 是谁、由谁维护、能做什么、输入输出是什么、收费方式是什么、失败责任由谁承担。

**Capability：** 把"会做事"拆成具体能力，例如读取文档、调用 API、部署合约、解释交易、生成报告、执行付款。

**Interoperability：** 判断它需要与工具协作、与另一个 agent 协作，还是与链上合约/registry/payment layer 协作。不同层级对应 MCP、A2A、ERC-8004、MPP 等不同接口。

**Reputation：** 信誉不是头像或名字，而是历史任务、交付记录、评价、stake、slashing、可验证证据或第三方背书。

**反例：** 如果一个系统只是给 agent 发一个 NFT 名片，但没有能力声明、调用接口、交付记录或验证方式，它通常不能构成完整 identity / reputation 方向。

### 推荐学习材料

- [MCP 官方文档](https://modelcontextprotocol.io/docs/getting-started/intro) — 工具上下文与 agent-tool 接口
- [A2A 官方仓库](https://github.com/a2aproject/A2A) — Agent-to-agent 协作协议参考
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) / [ERC-8183](https://eips.ethereum.org/EIPS/eip-8183) — Agent trust / job / evaluator 方向参考
- [MPP 官方文档](https://docs.stripe.com/payments/machine/mpp) — Machine payment 与 agent 经济活动接口参考
- [ENS 官方文档](https://docs.ens.domains/) — 去中心化自主身份（identity）的实现
- [EAS 官方网站](https://attest.org/) — 链上或链下证明

### 任务 / 挑战

- 选一个你熟悉的 agent 或 workflow，写清它的 **identity、capability、输入输出、协作对象与失败点**。
- 比较 **MCP、A2A、ERC-8004、MPP** 中任意两个，说明它们分别适合解决哪类协作、支付或接口问题。
- 设计一个 **agent profile 草图**：它能做什么、如何被调用、如何收费、如何被验证、失败如何处理。

---

## 模块 D｜Wallet / Permission / Safe Execution

### 基本原理

- **MPC 原理：** 私钥不以完整形式存在于任何单一设备，签名需要多方协作完成，任意单点被攻破不影响资产安全。
- **机构钱包：** 面向企业和团队的 MPC 方案，通常结合策略引擎与审计能力，Cobo 是这个方向的代表产品之一

### 核心问题

当 agent 参与链上动作时，最重要的问题不是"怎么调用签名 API"，而是 **权限如何授予、限制、撤销、审计和恢复**。

- Agent 参与链上动作时，需要区分 **可自动执行步骤** 与 **必须人工确认步骤**。
- 授权不是一次性动作，而是 **预算、范围、时间、操作类型和失败处理** 的组合。
- 账户抽象、智能账户、多签、guard / policy 可以为 agent 执行提供更细粒度的控制，但也会增加系统复杂度。

在此基础上，还可以引入 **任务级授权** 的思路：不是给 agent 一个长期权限，而是围绕一次具体任务生成临时授权。例如 Cobo CAW 的 Pact：用户先确认 agent 的任务意图、预算、操作范围、时间窗口和失败处理策略，agent 只能在该 Pact 定义的边界内执行，任务结束后权限随之失效。

**与模块 E 的关系：** 本模块只讲通用的钱包、权限和可恢复执行原则；具体到 swap / approve / deposit / borrow 等 DeFi 动作时，统一进入 Module E 展开，不在这里重复场景细节。

### 深入探索路径：从授权到可恢复执行

| 维度 | 问题 |
|------|------|
| **授权对象** | Agent 被允许代表谁执行？用户钱包、团队多签、项目金库、测试钱包，还是只读 API？ |
| **授权范围** | 限制可调用合约、函数、金额、频率、时间窗口、网络、token、counterparty 和最大损失 |
| **执行策略** | 低风险动作可自动执行，高风险动作必须暂停（签名、转账、授权、部署、升级、治理投票、密钥处理） |
| **恢复机制** | 必须设计暂停、撤销、回滚、告警、日志、事后审计和人工接管。没有恢复机制的自动化不应进入真实资产场景 |

**反例：** 如果一个 AI wallet 只能展示"自然语言发交易"，但不能解释权限限制、失败处理和审计方式，就更像危险 demo，而不是可靠产品方向。

### 推荐学习材料

- [ERC-4337 官方文档](https://eips.ethereum.org/EIPS/eip-4337) — 账户抽象基础协议
- [ERC-7702 官方文档](https://eips.ethereum.org/EIPS/eip-7702) — 允许将标准外部账户转变为功能强大的智能合约
- [Coinbase Policy Engine](https://help.coinbase.com/en/prime/onchain-wallet/onchain-policy-engine) — 如何自定义交易政策
- [Cobo Agentic Wallet 开发者助手](https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview) — 如何集成原生 Agent 钱包
- [Safe 是什么](https://docs.safe.global/home/what-is-safe) / [Safe Smart Account Guards](https://docs.safe.global/advanced/smart-account-guards) — 多签、智能账户与 guard / policy 参考
- [MetaMask — 使用 ERC-8004 为人工智能代理设计服务器钱包](https://docs.metamask.io/tutorials/design-server-wallets/) — "Agent identity + backend signer + wallet execution" 的生产架构
- [LI.FI Agent 文档](https://docs.li.fi/agents/overview) — Agent 如何查询链、token、交易状态并执行跨链动作

### 任务 / 挑战

- 画出一个 **"agent 发起链上动作"的执行流程图**，标出哪些步骤可自动化，哪些步骤必须由人确认。
- 为一个 agent wallet 场景设计 **权限策略**：预算、可调用合约、可执行动作、人工确认阈值、撤销方式、日志记录。
- 解释 **ERC-4337、Safe、guard / policy** 为什么重要，以及它们解决的是哪一类风险。

---

## 模块 E｜Agent DeFi Execution：从意图到安全链上执行

### 核心问题

- Agent 参与 DeFi 操作时，真正执行的是什么链上动作？
- 如何限制 agent 的 **预算、协议、token、合约、时间窗口和最大损失**？
- **Swap、approve、deposit、borrow、withdraw、redeem** 等动作分别有什么风险？
- 哪些动作可以在 Pact / policy 范围内自动执行？
- 哪些动作必须暂停并请求人工确认？
- 执行完成后，如何通过 tx record 和 audit log 进行验证、复盘和追责？

### 典型协议

| 协议 | 适用场景 | 关键概念 |
|------|---------|---------|
| **Uniswap** | DEX swap | Slippage、allowance、MEV、token 白名单、交易前模拟 |
| **Aave** | 存款、借贷 | 健康因子、清算风险、oracle 风险、自动化监控 |
| **Polymarket** | 预测市场 | 下注、赎回、事件结算、争议处理、合规边界 |
| **Hyperliquid** | 链上永续合约 | 市价/限价/TWAP/止损、跨仓/逐仓保证金、资金费率、清算风险 |
| **Lido / Jito** | 流动性质押 | 收益凭证、赎回延迟、脱锚风险、协议白名单 |

### 推荐学习材料

- [理解提示词注入攻击](https://openai.com/index/prompt-injections/) — OpenAI 关于 Prompt Injection 的介绍
- [敏感信息披露](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/) — OWASP 敏感信息披露基本常识
- [代理过剩](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) — OWASP 代理过剩基本知识

---

## 模块 F｜Privacy / Security / Sovereignty

### 核心问题

一旦 agent 持有上下文、凭证、API Key、私钥或预算，安全问题就不再是边角料，而是**系统前提**。

- 常见风险包括：**prompt injection、tool abuse、越权执行、敏感数据泄露、模型供应商依赖、不可审计操作**。
- 安全设计要回答：agent 能看到什么、能调用什么、能花多少钱、能代表谁做决定、出了错谁负责。
- **Privacy / sovereignty** 不只是"本地模型"四个字，还涉及数据边界、供应商依赖、可迁移性、审计和用户控制权。

**与模块 E 的关系：** 本模块只讲通用 threat model 与安全边界；DeFi 执行中的具体攻击面、policy 检查和审计记录，作为 Module E 的应用场景处理。

### 深入探索路径：从 threat model 到安全边界

```
资产清单 → 攻击入口 → 控制手段 → 主权问题
```

**资产清单：** 列出系统持有什么——私钥、API Key、session token、用户数据、交易权限、预算、敏感文档或治理权限。

**攻击入口：** Prompt injection、恶意网页/文档、被污染的工具返回、伪造交易说明、钓鱼链接、模型幻觉、供应商故障。

**控制手段：** 最小权限、只读优先、human-in-the-loop、allowlist、预算上限、沙箱、日志、模拟执行、异常告警。

**主权问题：** 用户能否导出数据、更换模型、更换执行环境、撤销授权，并在不依赖单一供应商的情况下继续使用核心资产。

**反例：** 如果系统要求用户把私钥、全部交易权限和完整上下文都托管给一个黑盒 agent，就必须把它标为高风险，不应作为默认学习路径。

### 推荐学习材料

- [Ethereum 开发者文档总览](https://ethereum.org/developers/docs/) — 理解链上状态、交易和合约执行的公开性
- [MCP 工具注入攻击](https://developer.microsoft.com/blog/protecting-against-indirect-injection-attacks-mcp) — 防止 MCP 中的间接提示注入攻击
- [Safe Smart Account Guards](https://docs.safe.global/advanced/smart-account-guards) — 受限执行与权限控制参考
- [dDocs](https://docs.fileverse.io/) — 端到端加密协作文档与自我主权生产力工具
- [可信执行环境（TEE）](https://en.wikipedia.org/wiki/Trusted_execution_environment) — TEE 基本概念和知识
- [新密码朋克运动](https://docs.fileverse.io/d/0200015f0008) — 理解新密码朋克运动

### 任务 / 挑战

- 模拟黑客对安装了 CAW 的 agent 进行攻击，包括 **prompt injection、伪造工具返回、越权指令** 等，观察 CAW 的策略检查能否在基础设施层拦截这些攻击，记录哪些攻击被拦截、哪些没有。
- 为一个 agent workflow 写 **threat model**：资产、权限、数据、工具调用、外部依赖、失败后果。
- 设计 **"低风险自动执行 / 高风险人工确认"** 的策略，并说明触发人工确认的条件。
- 找一个看似酷炫但风险很高的 AI × Web3 idea，写出**为什么现在不应该直接自动化**。

---

## 模块 G｜Governance / Coordination / Public Goods

### 核心问题

AI 可以帮助 DAO、社区、公共物品项目整理信息、追踪贡献、生成行动项和辅助透明执行，但**治理权力、预算动作和最终判断必须有清楚边界**。

- 适合 AI 辅助的部分：提案总结、讨论脉络整理、会议转行动项、贡献记录、预算执行 checklist、社区问答。
- 不适合直接交给 AI 的部分：价值判断、预算批准、惩罚/激励决策、代表社区发起不可逆动作。
- Web3 提供的不是"更热闹的社区工具"，而是 **公开记录、可验证贡献、透明预算和开放协作的机制**。

### 深入探索路径：从社区流程到可验证协作

```
信息整理 → 行动转化 → 贡献记录 → 治理边界
```

**信息整理：** AI 可以总结提案、会议、讨论串和任务状态，但需要保留来源链接和不确定项。

**行动转化：** 把会议纪要转为 action items、owner、deadline、dependency、预算影响和公开记录。

**贡献记录：** Web3 可以帮助记录贡献、资助、投票、执行状态和公开 accountability，但贡献质量仍需要人来判断。

**治理边界：** AI 可以辅助解释和提醒，不能替代社区做价值判断、预算批准、惩罚或最终治理决策。

**反例：** 如果一个治理 assistant 自动生成并通过预算提案，却没有人工确认、公开讨论和追责机制，它不是效率提升，而是治理风险。

### 推荐学习材料

- [Ethereum 治理基础](https://ethereum.org/governance/) — 以太坊链上治理的基础知识
- [去中心化自治组织（DAO）](https://ethereum.org/dao/) — DAO 的基本知识
- [Snapshot 官方文档](https://docs.snapshot.box/) — Offchain voting、proposal、space、strategy 等 DAO 治理基本工具
- [OpenZeppelin Governor 官方文档](https://docs.openzeppelin.com/contracts/5.x/api/governance) — Onchain execution 治理
- [Gitcoin 资助机制](https://gitcoin.co/mechanisms) — 公共物品资助机制

### 任务 / 挑战

- 选择一个 DAO / 社区流程，拆出 **AI 可以辅助的步骤**，以及**必须由人或治理流程确认的步骤**。
- 做一个 proposal summarizer、meeting-to-action workflow、contribution tracker 或 budget execution checklist 的**草图**。
- 标出哪些结论只是 AI 总结，哪些动作需要人工确认或治理流程通过。

---

## Week 2 总交付清单

如果 Week 2 结束后，你仍然只是在罗列热门名词，无法说明一个方向中的 AI 作用、Web3 机制、验证方式和风险边界，那么这一周还没有真正完成。

| # | 交付物 | 说明 |
|:-:|--------|------|
| ① | **AI × Web3 问题地图** | 至少覆盖 5 个方向，标出 AI 作用与 Web3 机制 |
| ② | **方向选择说明** | 选择 1 个主方向，解释为什么它不是纯 AI 或纯 Web3 问题 |
| ③ | **问题拆解** | 参与方、流程、AI 作用、Web3 机制、自动化边界、人工确认点、验证方式和主要风险 |
| ④ | **项目初步 Proposal** | 目标用户、真实场景、最小功能、验证方式、主要风险、可能赛道和 Week 3 下一步 |
| ⑤ | **参考资料清单** | 至少 5 条，并说明每条资料帮助你判断什么 |
| ⑥ | **主方向深挖包** | 围绕自己选定的 1 个主方向，补充至少 1 张流程图、1 个典型场景、1 个反例、1 组关键风险和 1 个最小验证计划 |
| ⑦ | **方向 Backlog** | 记录没有选择的 2–3 个方向，说明暂时不选的原因，避免后续讨论中反复摇摆 |

---

## WCB 任务索引

Week 2 对应的 WCB 提交通道（供提交时参考）：

| WCB 任务标题 | 积分 | 对应模块 |
|-------------|:----:|---------|
| Week 2｜方向研究｜AI × Web3 问题地图与主方向选择 | 20 | 模块 A |
| Week 2｜Payment / Commerce｜最小支付与商业流程拆解 | 20 | 模块 B |
| Week 2｜进阶实践｜x402 Paywall + CAW Agent 自主支付闭环 | 40 | 模块 B（实践） |
| Week 2｜Agent Identity｜Agent Profile 与能力声明草图 | 20 | 模块 C |
| Week 2｜Wallet / Permission｜Agent 链上动作权限策略 | 20 | 模块 D |
| Week 2｜Security / Privacy｜Agent Workflow Threat Model 与确认策略 | 20 | 模块 F |
| Week 2｜Governance / Coordination｜治理协作流程草图 | 20 | 模块 G |
| Week 2｜总交付｜方向深挖包与项目初步 Proposal | 40 | 全部 |
| Week 2｜例会分享｜5.29 上麦分享学习感受或信息观察 | 5 | — |

---

*本文档依据共学营官方模块内容整理，供个人学习参考。*
*生成日期：2026-05-27*


---

## 附录：模块速查摘要

---

## 附录：模块速查摘要

### 七模块一览

**模块一：问题空间与方向地图**
先看完整个 AI × Web3 的交叉领域全貌，再选择一个方向深入。核心判断标准：结构性需求、验证可能性、最小切入点、风险边界、后续承接。

**模块二：Payment / Commerce / Settlement**
Agent 作为消费者或服务提供者时，报价、预算、授权、交付、验证、托管、争议处理和结算如何闭环。关键概念：x402 Paywall、MPP、ERC-8004/8183、Cobo CAW Pact。

**模块三：Identity / Reputation / Capability / Interoperability**
Agent 如何被发现、描述、调用、验证和协作。Identity 解决你是谁，Capability 解决你能做什么，Reputation 解决别人为什么信你。关键概念：MCP、A2A、ENS、EAS。

**模块四：Wallet / Permission / Safe Execution**
Agent 接触钱包和签名时，权限如何授予、限制、撤销、审计和恢复。核心原则：任务级授权优于长期权限。关键概念：ERC-4337、ERC-7702、Safe、Guard/Policy、Session Key。

**模块五：Agent DeFi Execution**
Agent 做 Swap/Approve/Deposit/Borrow 等 DeFi 动作时，如何限制预算、协议、token、时间窗口和最大损失。关键协议：Uniswap、Aave、Polymarket、Hyperliquid、Lido/Jito。

**模块六：Privacy / Security / Sovereignty**
一旦 Agent 持有上下文、凭证、API Key 或预算，安全问题就是系统前提。深入路径：资产清单→攻击入口→控制手段→主权问题。

**模块七：Governance / Coordination / Public Goods**
AI 辅助 DAO 和社区做提案总结、会议行动项、贡献记录和透明执行，但治理权力和预算批准必须留给人。

### Week 2 总交付清单

① AI × Web3 问题地图（覆盖 ≥5 个方向）
② 方向选择说明（为什么非纯 AI / 非纯 Web3）
③ 问题拆解（参与方、流程、边界、风险）
④ 项目初步 Proposal（目标用户、场景、最小功能、验证方式）
⑤ 参考资料清单（≥5 条，附说明）
⑥ 主方向深挖包（流程图、场景、反例、风险、验证计划）
⑦ 方向 Backlog（未选方向 + 暂不选的原因）
