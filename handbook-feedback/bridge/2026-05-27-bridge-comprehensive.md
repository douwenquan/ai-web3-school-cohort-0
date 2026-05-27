# AI × Web3 Bridge 全貌速览（05-27 综合汇报）

> 涵盖 Agent Wallet、Machine Payment、Settlement & Escrow、Agent Identity、Trust & Reputation、AI Security、Governance AI、Decentralized AI 等剩余 Bridge 章节

---

## 核心认知

AI 与 Web3 Bridge 的核心是把 **AI Agent 与链嵌合** 使用，嵌入实际工作流的过程中会遇到：

```
隐私安全问题   权责边界确认   可执行步骤拆解   异常回滚策略
```

---

## 一、Agent Wallet（智能体钱包）

### 核心问题

Agent 开始连接钱包、生成交易、调用合约、支付服务费时：

> Agent 到底能不能花钱？能花多少钱？对谁花？能不能修改？出错怎么停？

### 设计原则

| 原则 | 说明 |
|------|------|
| ❌ 不能直接控制主资产 | Agent 不可持有用户主私钥 |
| ❌ 不能拿到用户私钥 | 永远不暴露 |
| ✅ 高风险动作 → 用户授权 | 大额/首次/未知操作必须人肉确认 |
| ✅ 钱包 = 权限系统 | 不只是签名按钮，而是完整的权限管理体系 |
| ✅ 必须可撤销 | 用户可以随时收回权限 |
| ✅ 用户可见 | 拿了什么权限、做过什么事情、怎么关 |

### 关键技术组件

| 组件 | 说明 |
|------|------|
| **Smart Account** | 合约账户，可编程的权限逻辑 |
| **Session Key** | 临时有限权限的钥匙，降低用户操作繁琐度 |
| **Policy** | 规则层，定义 Agent 可以做什么 |
| **Guard** | 确定性拦截层，在执行前做检查 |
| **Simulation** | 预演签名和广播的后果 |
| **Revocation** | 可撤销能力 |
| **Human Check** | 人工确认节点 |

### Session Key 的作用

> 一把临时有限权限的小钥匙：
> - 降低用户操作繁琐度（不需要每次都签名）
> - 权限受限（时间、额度、合约、方法）
> - 用完即弃，风险可控

---

## 二、Machine Payment（机器支付）

### 核心场景

把 Agent 钱包嵌入实际工作流，适合 **Stablecoin Payment** 场景。

### Budget Cap（预算上限）

| 维度 | 说明 |
|------|------|
| **最大总额度** | 钱包总支出不能超过 X |
| **每笔最大额度** | 单笔不超过 Y |
| **次数限制** | 每段时间内最多 N 次 |

### Payment Intent（支付意图）

> 用户或 Agent 想为某个服务付款，但还没真正结算完成。
> 可以理解成一种**授权**，通常在结算前创建，为后续支付提供上下文。

### X402（HTTP 402 Payment Required）

尝试把 HTTP 402 变成**互联网原生支付流程**：

```
客户端请求资源
    ↓ 402 Payment Required
服务端返回付款要求
    ↓ 用户完成支付
客户端带着付款证明重新请求
    ↓ 200 OK
服务端返回资源
```

### MPP（Machine Payment Protocol）

关注**机器与机器之间**的支付协商和结算。

### Micro Payment（小额支付）

| 优势 | 挑战 |
|------|------|
| 适合小额高频自动化服务 | 手续费占比高 |
| 适合 Agent 经济场景 | 批量结算复杂 |
| 潜力大 | 欺诈控制要求高 |
| — | 信任问题难解决 |

> 个人认为可能是比较好的赛道，但信任问题会是难点。

---

## 三、Settlement & Escrow（结算与托管）

### ERC-8183：Agent Task Currency 草案标准

围绕 Agent 任务支付、Escrow 交付和验证形成**统一流程**。

| 传统 | ERC-8183 |
|------|---------|
| 随便发一笔钱 | 结构化的交易模型 |
| 无标准格式 | 任务状态、Proof、Settlement、Dispute 都可被系统理解 |

### ERC-8183 vs ERC-8004

| 标准 | 侧重点 |
|------|--------|
| **ERC-8004** | Agent 身份、声誉和验证 |
| **ERC-8183** | 任务支付、托管和交付 |

> 两者互补：8004 解决 "你是谁"，8183 解决 "怎么付怎么交"

---

## 四、Agent Identity（智能体身份）

### Agent Profile 必须回答的问题

| 问题 | 说明 |
|------|------|
| **谁拥有 Agent？** | Ownership — 谁可以更新配置 |
| **Agent 可以做什么？** | Capability — 任务描述 + 所需输入和权限 |
| **如何调用它？** | Service Endpoint |
| **历史声誉在哪查？** | 验证记录和声誉数据来源 |

### Capability（能力声明）

Agent 需要描述：
- 可以完成哪些任务
- 需要哪些输入
- 需要哪些权限

### Service Endpoint（服务端点）

外部系统调用的入口：

| 类型 | 说明 |
|------|------|
| HTTPS API | 标准 REST 接口 |
| A2A Endpoint | Agent-to-Agent 通信 |
| MCP Server | 模型上下文协议服务 |
| Webhook | 事件回调 |
| 链上 Registry | 链上服务地址指向 |

### Registry（注册表）

Agent 可以通过 Registry 来：
- **登记** 自己的身份和能力
- **发现** 其他 Agent
- **更新** 配置和状态

### DID + Verifiable Credential

| 概念 | 说明 |
|------|------|
| **DID** | 去中心化身份，可解析的身份标识 |
| **VC** | 可验证凭证，由某实体签发的声明 |
| **Ownership** | 决定谁可以更新 Agent Profile、收款地址、服务权限 |

---

## 五、Agent Trust & Reputation（信任与声誉）

### 为什么需要

> 把服务托管在 Agent 上，Agent 有风险。
> 需要知道：Agent 历史执行过哪些任务？是否出过问题？

### 质押（Staking）机制

项目方提供资金质押，出问题时可通过惩罚维护用户权益。

### 综合评估维度

```
大型项目方 + 高质押 + 能力一般
   vs
小型项目方 + 低质押 + 能力突出

用户需要综合多个维度去权衡
```

### ERC-8004：身份声誉验证 Registry

提供 Agent 身份、声誉和验证的标准草案：

```
Agent Identity → Registry → 发现和评价 Agent
Agent Reputation
Agent Validation
```

把三部分拆成可组合的 Registry，让不同应用用相同格式发现和评价 Agent。

---

## 六、AI Security（AI 安全）⭐ 重点

### 攻击面

Agent 一旦可以读链上信息、调用工具、生成交易、管理 Session Key，就给了攻击者入口。

```
攻击者可以通过:
  - 文档内容
  - 网页内容
  - 合约注释
  - 交易 Memo
  - API 返回值
  - 用户输入

影响模型的判断和行为
```

### 核心防御原则

| 原则 | 说明 |
|------|------|
| **模型在隔离层** | 可以建议，但不可以绕过权限 |
| **不信任所有上下文** | 可以读，但不可以相信链上所有上下文 |
| **工具需要 Policy + Log** | 每次工具调用都要有策略检查和日志记录 |
| **防范 Prompt Injection** | 防止恶意指令滥用 |
| **防范上下文注入** | 识别和过滤攻击指令 |
| **防范误导数据** | 验证数据源的可靠性 |

### 关键安全措施

| 措施 | 说明 |
|------|------|
| **Key Safety** | 私钥和 API Key 的安全管理 |
| **Permission Isolation** | 不同风险的工具、数据和动作隔离开 |
| **Sandbox** | 隔离环境运行代码、浏览网页、处理文件、调用 Web 工具 |

---

## 七、Governance AI（治理 AI）

### 背景

> 实际 DAO 治理中，项目日益复杂，参与率不高。
> AI 可以辅助治理，降低参与门槛。

### AI 在治理中的角色

| 能力 | 说明 |
|------|------|
| **Personal Summary** | 把长提案整理成：目标、背景、预算、执行范围、风险、待决选项 |
| **Meeting Action** | 把会议内容转化成可执行事项 |
| **贡献追踪** | 帮社区看到谁做了什么、哪些工作被低估 |
| **资金审查** | 审查资金来源和分配 |

---

## 八、Decentralized AI（去中心化 AI）

### 定位

> 对普通人来说门槛较高（涉及本地大模型等），先了解概念。

### 核心市场

| 市场 | 资源 |
|------|------|
| **Model Market** | 模型提供和消费 |
| **Data Market** | 数据提供和标注 |
| **Computing Market** | CPU、GPU 算力 |
| **Infrastructure Network** | 存储、带宽等基础设施 |

### 关键组件

```
Model Routing       — 路由到最合适的模型
Quality Benchmark   — 模型质量评测
Settlement          — 资源使用结算
```

---

## AI × Web3 Bridge 全貌速览表

| # | 章节 | 一句话概括 |
|---|------|-----------|
| 1 | Chain-aware Context | AI 不仅要读文档，还要感知链上状态 |
| 2 | Web3 Tool Use | 8 种工具构建 Agent-链交互工具箱 |
| 3 | Agent Workflow | 可拆解、可追踪、可审计的执行框架 |
| 4 | **Agent Wallet** | Agent 的权限系统，不是签名按钮 |
| 5 | **Machine Payment** | Agent 之间的支付结算 |
| 6 | **Settlement & Escrow** | ERC-8183 标准化的任务支付与交付 |
| 7 | **Agent Identity** | Agent 的身、能力、端点 |
| 8 | **Trust & Reputation** | ERC-8004 身份声誉验证 Registry |
| 9 | AI Security | 模型隔离、权限隔离、沙箱隔离 |
| 10 | Governance AI | AI 辅助 DAO 治理 |
| 11 | Decentralized AI | 模型/数据/算力市场 |

---

**学习日期**: 2026-05-27  
**学习方式**: 概念口述 + Agent 结构化整理
