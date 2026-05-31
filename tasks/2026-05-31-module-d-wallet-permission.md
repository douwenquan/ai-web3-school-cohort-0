# Week 2｜Wallet / Permission｜DCA Agent 链上动作权限策略

> 基于 Module D（Wallet / Permission / Safe Execution）学习
> 以 DCA Automation Agent 作为场景，从授权到可恢复执行
> 日期：2026-05-31

---

## 一、MPC 基本原理

### 什么是 MPC（Multi-Party Computation）

MPC（多方计算）是一种密码学技术，允许多个参与方**在不暴露各自私密输入的情况下**，共同完成一个计算任务。在区块链钱包场景中，这个"计算任务"就是**对交易进行签名**。

### MPC 签名的核心流程

```
私钥被拆分为多个碎片（Share）
     │
 碎片 A ─── 参与方 A（如：用户设备）
 碎片 B ─── 参与方 B（如：Cobo 服务器）
 碎片 C ─── 参与方 C（如：备份节点）
     │
当需要签名时，各方用自己的碎片参与计算
     │
     ▼
各方协同计算，产生一个完整的签名
     │
     ▼
任何人都可以用对应的公钥验证签名
     │
     ▼
签名过程中，私钥从未完整出现过
```

### 关键特性

| 特性 | 说明 |
|------|------|
| **无私钥** | 私钥不以完整形式存在于任何单一设备或服务器 |
| **无单点风险** | 任意一方被攻破，攻击者拿不到完整私钥 |
| **可恢复** | 如果一方丢失碎片，其他方可协作重新生成新碎片而不暴露私钥 |
| **不依赖硬件** | 纯软件方案，无需 HSM 等专用硬件 |

### MPC vs 其他签名方式

| 方式 | 私钥存储 | 签名方式 | 风险 |
|------|---------|---------|------|
| **单私钥（EOA）** | 一个设备持有完整私钥 | 单方签名 | 单点丢失=资产丢失 |
| **多签（Multi-Sig）** | 多个私钥分别存储 | N-of-M 签名 | 需要链上合约配合 |
| **智能合约钱包** | 私钥 + 合约逻辑 | 通过合约验证 | Gas 成本高，依赖链 |
| **MPC** | 私钥碎片分散存储 | 多方协同计算 | 通信成本高，实现复杂 |

### 为什么 MPC 适合 Agent Wallet

Agent 需要自主执行链上操作，但不能持有完整私钥。MPC 让：
- Agent 只有**调用签名 API 的权限**，没有私钥碎片
- 每次签名需要以 Cobo 服务器作为另一个参与方协同
- Cobo 的 Policy Engine 可以在 MPC 签名前插入策略检查

---

## 二、机构钱包

### 什么是机构钱包

机构钱包是面向**企业级用户**的加密资产管理方案。与个人钱包（MetaMask/Phantom）的核心区别：

| 维度 | 个人钱包 | 机构钱包 |
|------|---------|---------|
| **使用者** | 个人用户 | 团队/企业/DAO |
| **私钥管理** | 用户自行保管助记词 | MPC / HSM 托管 |
| **权限控制** | 单一私钥控制所有资产 | 多层级权限、审批流 |
| **审计** | 无 | 完整的审计日志 |
| **合规** | 无 | 支持 AML/KYC 等合规要求 |
| **恢复机制** | 助记词丢失=资产丢失 | 多方恢复流程 |

### Cobo 作为机构钱包的代表

Cobo 是机构钱包方向的主要产品之一，提供：

| 能力 | 说明 |
|------|------|
| **MPC 托管** | 私钥分片存储，无单点风险 |
| **Policy Engine** | 自定义交易策略——金额限制、地址白名单、审批流 |
| **审计日志** | 全链路操作记录，谁在什么时间做了什么 |
| **多签支持** | 结合 MPC 和多签，支持团队审批 |
| **Agentic Wallet** | 专门为 AI Agent 设计——Pact 机制、API Key、有限授权 |
| **开发者 SDK** | Python / TypeScript SDK + LangChain / CrewAI / MCP 集成 |

### 机构钱包与 Agent Wallet 的关系

```
机构钱包（Cobo）
    │
    ├── 传统 MPC 钱包 → 团队资产管理、审批流、合规
    │
    ├── Agentic Wallet（Pact）
    │     └── AI Agent 专用 → 任务级授权、自动执行、自动撤销
    │
    └── 开发者基础设施
          ├── API（submit_pact, contract_call, transfer_tokens）
          ├── SDK（Python / TypeScript / LangChain / CrewAI）
          └── MCP Server（Agent 可直接通过 MCP 调 Cobo）
```

Agentic Wallet 可以理解为**机构钱包的 Agent 扩展**——它复用了 MPC 的安全性，但增加了 Pact 这种**任务级临时授权**机制。

---

## 三、四类授权方案说明

### 方案 1：ERC-4337 — 账户抽象

#### 是什么

ERC-4337 定义了一种**无需改变以太坊共识层**的账户抽象方案。核心思想是把钱包从 EOA（外部账户）变成智能合约（Smart Account），让用户可以用任意签名逻辑来控制自己的账户。

#### 核心架构

```
用户操作（UserOperation）
    │
    ▼
Bundler（打包者）—— 将多个 UserOperation 打包
    │
    ▼
EntryPoint 合约 —— 验证并执行 UserOperation
    │
    ├── 验证阶段：调用 Wallet Contract 的 validateUserOp
    │     └── 签名验证、权限检查、支付 Gas 费
    │
    └── 执行阶段：调用 Wallet Contract 的 execute
          └── 实际链上操作（transfer, swap, etc.）
```

#### 关键组件

| 组件 | 作用 |
|------|------|
| **UserOperation** | 用户发起的"我要做什么"的结构化描述——目标合约、calldata、签名、Gas 限制 |
| **Bundler** | 将多个 UserOperation 打包成一笔交易提交到链上 |
| **EntryPoint** | 统一入口合约，负责执行验证和执行逻辑 |
| **Wallet Contract** | 用户的智能合约钱包，定义验证逻辑 |
| **Paymaster** | 可选的代付 Gas 服务 |

#### 核心能力

| 能力 | 说明 |
|------|------|
| **任意签名验证** | 不限于 ECDSA（secp256k1），支持 BLS、Passkey、社交恢复等 |
| **Gas 代付** | Paymaster 可以为用户代付 Gas（可以用 ERC-20 支付 Gas） |
| **批量交易** | 在一次 UserOperation 中执行多个链上操作 |
| **会话 Key** | 通过 Session Key 机制，给 Agent 临时签名权限（详见第六节） |
| **社交恢复** | 预先指定守护者，丢失访问权限后由守护者协助恢复 |

#### 为什么重要

ERC-4337 是**账户抽象的基础协议**，它让钱包不再仅仅是"一个私钥 = 一个账户"，而是变成了**可编程的智能合约账户**。Agent 可以：
- 获得**受限的签名权限**（Session Key，仅能签特定合约、特定金额）
- 即使 Agent 被攻击，攻击者也拿不到钱包的完整控制权
- 支持 Gas 代付——Agent 不需要持有主链 Gas 币

#### 局限性

- **Gas 成本高** — UserOperation 多了一层合约调用
- **依赖 Bundler 网络** — 如果 Bundler 不可用，交易无法提交
- **复杂性强** — 部署 Wallet Contract、配置验证逻辑对普通用户不友好

---

### 方案 2：Safe + Guard — 多签与策略拦截

#### 是什么

Safe（原 Gnosis Safe）是目前最广泛使用的**多签智能合约钱包**。需要 N-of-M 个签名者批准后，交易才能执行。**Guard** 是 Safe 的扩展机制——在交易执行前后插入自定义检查逻辑。

#### 核心架构

```
Safe（多签合约钱包）
    │
    ├── 所有者（Owners）：M 个地址
    ├── 阈值（Threshold）：需要 N 个签名
    ├── 模块（Modules）：可选的扩展功能
    └── Guards：执行前后拦截检查
          │
          ├── Before Guard：检查交易是否合规
          │     └── 例如：目标地址是否在白名单中
          │
          └── After Guard：检查执行后状态是否正常
                └── 例如：余额变化是否在预期范围内
```

#### 关键功能

| 功能 | 说明 |
|------|------|
| **N-of-M 多签** | 需要 N 个签名者批准，防单点故障 |
| **Guard** | 自定义检查逻辑——在交易签署前拦截，不符合策略则拒绝 |
| **Module** | 扩展模块——如自动执行、延迟执行、角色管理 |
| **批处理** | 在一个交易中执行多个合约调用 |
| **取消机制** | 交易可以被任一所有者取消 |
| **角色管理** | 不同的角色可以有不同的权限（只读、签名、管理） |

#### Guard 的具体作用

```
用户提交交易
    │
    ▼
Before Guard（前置拦截）：
  ├─ 目标合约 → 是否在 allowlist 中？
  ├─ 函数选择器 → 是否允许调用？
  ├─ 金额 → 是否在预算上限内？
  └─ 结果：通过 / 拦截
    │
    ▼
交易签名（N-of-M）
    │
    ▼
交易执行
    │
    ▼
After Guard（后置验证）：
  ├─ 余额变化 → 是否在预期范围？
  ├─ 合约状态 → 是否正常？
  └─ 结果：接受 / 回滚
```

#### 为什么重要

Safe + Guard 提供了**链上权限控制**。与 MPC 不同，Safe 的权限逻辑是写在智能合约里的，**公开可验证**。对 Agent 场景：
- 可以部署一个 Safe 作为 Agent 的钱包
- 通过 Guard 限制 Agent 只能调用特定合约、特定函数、特定金额
- 多签保证 Agent 做重大操作时（如更改 Guard 配置），需要人类一起签名

#### 局限性

- **Gas 成本** — 每次交易走合约逻辑，Gas 成本高于 EOA
- **部署复杂** — 需要创建 Safe 合约、编写 Guard 合约、配置 Module
- **不能阻止所有攻击** — Guard 可以拦截已知风险边界，但对合约内部的复杂攻击模式难以覆盖

---

### 方案 3：Cobo CAW Pact — 任务级授权

#### 是什么

Cobo Agentic Wallet（CAW）的 Pact 机制是专门为 AI Agent 设计的**任务级授权**方案。不是给 Agent 一个长期权限，而是围绕**一次具体任务**生成临时授权，任务结束后权限自动失效。

#### 核心架构

```
人类（钱包所有者）
    │
    ▼
① Agent 提交 Pact
  ├─ Intent：任务描述（如 DCA 定投）
  ├─ Execution Plan：具体执行步骤
  ├─ Policies：预算、白名单、限制条件
  └─ Completion Conditions：自动终止条件
    │
    ▼
② 人类审核并批准（Cobo App 中）
    │
    ▼
③ Pact 生效，Agent 获得 API Key
    │
    ▼
④ Agent 在 Pact 边界内执行
    └─ 每次操作 → Policy Engine 检查 → MPC 签名 → 链上广播
    │
    ▼
⑤ Pact 达到完成条件 → 自动撤销
  ├─ 预算花完
  ├─ 时间到期
  └─ Agent 主动终止
```

#### 四要素详解

| 要素 | 定义 | DCA 场景中的示例 |
|------|------|-----------------|
| **Intent** | Agent 被授权做什么 | "执行 DCA 定投策略 — 每周一 100 USDC → ETH" |
| **Execution Plan** | Agent 怎么做 | "调 Uniswap V3 Quoter 报价 → 调 contract_call 执行 swap → 验证 tx" |
| **Policies** | 边界约束 | "≤200 USDC/次，累计 ≤3,000 USDC，仅限定 Uniswap V3 Router 合约" |
| **Completion Conditions** | 什么时候自动终止 | "累计花费 ≥3,000 USDC 或 30 天已过" |

#### 关键能力与 DCA Agent 中的体现

| 能力 | 在 DCA Agent 中的体现 |
|------|---------------------|
| **预算限制** | 每笔 100 USDC 上限，累计 3,000 USDC 上限 |
| **合约白名单** | 仅允许调 Uniswap V3 Router 合约（Base 链） |
| **地址白名单** | 仅向 x402 Seller 的白名单地址付款 |
| **链限制** | 仅允许操作 Base 链或 Base Sepolia |
| **单笔限额** | 每笔 swap 不超过 200 USDC |
| **人工确认阈值** | Pact 本身是人类审核的，但执行过程中不需人工介入 |
| **自动撤销** | 4 周后或预算花完，API Key 即时失效 |
| **审计日志** | Cobo 记录所有操作——谁调了什么接口、花了多少钱、被拒绝还是通过 |

#### 为什么重要

Pact 是目前**唯一专为 AI Agent 设计的授权方案**。它的核心创新不在于"能不能签名"，而在于：
- **授权可逆**：人类可以随时在 Cobo App 中冻结或撤销 Pact
- **权限有界**：Agent 只能在 Pact 定义的边界内执行，Policy Engine 强制执行
- **过期即废**：任务完成或到期后，API Key 立即失效，不留僵尸权限

---

### 方案 4：Coinbase Policy Engine — 企业级交易策略引擎

#### 是什么

Coinbase Policy Engine 是 Coinbase 为其机构钱包（Prime Onchain Wallet）和开发者钱包（CDP Server Wallet / Embedded Wallet）提供的**可编程交易策略引擎**。它允许用户定义一系列规则（Rules），在签名操作执行前进行条件检查，符合规则的放行，不符合的拒绝。

#### 核心架构

```
Policy（策略）—— 一组规则的集合
    │
    ├── scope：应用范围（project / account）
    ├── description：策略描述
    │
    └── rules：规则数组
          │
          ├── action：匹配时执行的动作（accept / reject）
          ├── operation：应用的操作类型
          └── criteria：条件列表（逻辑 AND——所有条件满足才匹配）
                ├── 条件 1：目标地址 ∈ [0xAllowed1, 0xAllowed2...]
                ├── 条件 2：金额 ≤ 预算上限
                └── 条件 3：链 ID = Base 主网
```

#### 支持的签名操作

| 操作 | 说明 |
|------|------|
| `signEvmTransaction` | EVM 交易签名 |
| `sendEvmTransaction` | EVM 交易签名并广播 |
| `signEvmMessage` | EIP-191 消息签名 |
| `signEvmTypedData` | EIP-712 结构化数据签名 |
| `signSolTransaction` | Solana 交易签名 |
| `signEvmHash` | EVM Hash 签名（无 criteria 检查） |
| `sendEndUserOperation` | 智能钱包 User Operation 签名和发送 |

#### 支持的 criteria 维度

| 条件类型 | 检查什么 | 示例 |
|---------|---------|------|
| **to** | 目标合约地址 | `to in [0xUniswapRouter, 0xAavePool]` |
| **value** | 转账金额 | `value <= 0.1 ETH` |
| **contractAddress** | 交互合约地址 | `contractAddress == 0xUSDC` |
| **chainId** | 目标链 | `chainId == 8453 (Base)` |
| **functionSignature** | 调用的函数选择器 | `functionSignature == 0x095ea7b3 (approve)` |
| **gasLimit** | Gas 上限 | `gasLimit <= 500000` |
| **maxFeePerGas** | 最大 Gas 价格 | `maxFeePerGas <= 50 gwei` |

#### 两种作用范围

| 范围 | 适用产品 | 说明 |
|------|---------|------|
| **project** | Embedded Wallet | 策略应用于项目级别的所有钱包 |
| **account** | Server Wallet | 策略应用于特定的账户 |

#### 与 Cobo Policy Engine 的类比

| 维度 | Coinbase Policy Engine | Cobo Policy Engine |
|------|----------------------|-------------------|
| **触发时机** | 签名操作前 | Pact 内的每次操作前 |
| **规则类型** | accept / reject | 允许 / 拒绝 / 需审批 |
| **粒度** | 操作级别（signEvmTransaction 等） | 交易级别（金额、合约、链） |
| **适用范围** | Server Wallet / Embedded Wallet | Agentic Wallet |
| **审批流** | 规则内嵌 | 通过 Pact 的人类审核 + Policy Engine 强制执行 |
| **与 Agent 的关系** | 无专属 Agent 授权机制 | Pact 专为 Agent 任务级授权设计 |

#### 为什么重要

Coinbase Policy Engine 是**企业级交易策略控制的标准化方案**。它不是为 AI Agent 设计的（Cobo Pact 才是），但它的规则架构（Rule → Criteria → Accept/Reject）给了我们一个清晰的策略模型参考。任何 Agent 钱包的权限策略都可以用这种"规则 + 条件"的结构来描述。

---

## 四、四类授权方案对比总结

### 定位对比

| 维度 | ERC-4337 | Safe + Guard | Cobo CAW Pact | Coinbase Policy Engine |
|------|----------|-------------|--------------|----------------------|
| **类型** | 链上协议 | 链上合约 | 链下基础设施 | 链下策略引擎 |
| **核心机制** | UserOperation → EntryPoint | N-of-M 多签 + 前置/后置 Guard | 任务级 Pact + Policy Engine | Rule + Criteria → Accept/Reject |
| **签名方式** | 任意签名逻辑 | 多个 EOA 签名 | MPC 多方协同签名 | MPC / HSM 签名 |
| **权限粒度** | 合约级别（通过 Session Key 细化） | 交易级别（通过 Guard 细化） | 交易级别（通过 Policies 约束） | 操作级别（signEvmTransaction 等） |
| **是否链上** | ✅ 是（UserOperation 上链） | ✅ 是（Safe 合约） | ❌ 否（Policy Engine 是链下基础设施） | ❌ 否（策略在 Coinbase 侧执行） |
| **审计可见** | ✅ 链上公开 | ✅ 链上公开 | ❌ 链下审计日志（不可公开验证） | ❌ 链下审计日志 |
| **Gas 开销** | 高（每步合约调用） | 中（多签 + Guard 合约逻辑） | 低（仅链上交易有 Gas） | 低（仅链上交易有 Gas） |
| **Agent 适用性** | ⚠️（需额外 Session Key 合约） | ⚠️（需 Guard 合约编码） | ✅（专为 Agent 设计） | ❌（企业级，非 Agent 专用） |

### 适用场景

| 方案 | 最适合的场景 |
|------|------------|
| **ERC-4337** | 需要自定义签名逻辑（Passkey、社交恢复）、Gas 代付、批量交易的消费级钱包 |
| **Safe + Guard** | 团队/DAO 管理资产，需要多签审批 + 自定义检查逻辑 |
| **Cobo CAW Pact** | **AI Agent 自动化执行**——需要任务级临时授权、自动撤销、人工审核边界 |
| **Coinbase Policy Engine** | 企业大规模管理多个钱包，需要统一的、可编程的交易策略控制 |

### 在 DCA Agent 中的选择

对于 DCA Agent 场景，**Cobo CAW Pact** 是最直接的选择，原因：

| 需求 | 为什么 Pact 最合适 |
|------|------------------|
| Agent 需要自动执行 | Pact 在人类批准后，Agent 可独立执行 |
| 人有最终控制权 | Pact 需要人类审核批准，且随时可撤销 |
| 任务完成后权限消失 | Completion Conditions 触发自动撤销 |
| 不需要链上公开 | DCA 定投是个人策略，不需要公开 |
| 低 Gas 成本 | Pact 是链下机制，仅交易上链需付 Gas |

---

## 五、深入探索路径：从授权到可恢复执行

### 维度 1：授权对象

> **Agent 被允许代表谁执行？**

| 场景 | 授权对象 | 说明 |
|------|---------|------|
| 个人 DCA 定投 | 用户个人钱包 | 最简单——Agent 只代表一个钱包所有者执行 |
| 团队投资策略 | 团队多签 Safe | Agent 需要多个签名者批准后才能操作 |
| DAO 金库管理 | DAO 治理合约 | Agent 只能执行治理通过的提案 |
| 测试环境 | 测试网钱包（无真实资产） | 完全自动化，无需人工审核每个操作 |

**在 DCA Agent 中的体现：** 个人钱包（最简单的场景）。Agent 代表钱包所有者执行 DCA，Pact 绑定到该钱包，Agent 的 API Key 只有该 Pact 范围内的操作权限。

---

### 维度 2：授权范围

> **Agent 能做什么、不能做什么？**

授权范围不是单一的"给不给你签"，而是多个维度的组合：

| 维度 | 问题 | DCA Agent 中的限制 |
|------|------|-------------------|
| **合约** | 可以调哪些合约？ | 仅限 Uniswap V3 Router（Base 链上的特定合约地址） |
| **函数** | 可以调哪些函数？ | 仅限 swap 相关函数（exactInputSingle, exactInput） |
| **金额** | 可以花多少钱？ | 每笔 ≤200 USDC, 累计 ≤3,000 USDC |
| **频率** | 多久可以操作一次？ | 每周最多一次 swap |
| **时间窗口** | 什么时间可以操作？ | Pact 有效期内（30 天） |
| **网络** | 可以操作哪些链？ | 仅限 Base 主网（x402 额外支持 Base Sepolia 测试） |
| **Token** | 可以操作哪些 token？ | 仅限 USDC → ETH |
| **对手方** | 可以向哪些地址付款？ | x402 白名单地址（Pact 中硬编码） |

**设计原则：最小权限** — Agent 只需要调 Uniswap Router 这一个合约的 swap 函数，就不应该给它任何其他权限。

---

### 维度 3：执行策略

> **哪些步骤可以自动执行？哪些必须暂停等人确认？**

#### 自动执行 vs 人工确认的划分矩阵

| 操作类型 | 在 Pact 边界内？ | 执行方式 | 在 DCA Agent 中 |
|---------|----------------|---------|----------------|
| **报价查询（dex.quote）** | ✅ 只读，无资产风险 | ✅ **自动执行** | 无需人类介入 |
| **交易执行（swap.execute）** | ✅ 在 Pact 策略内 | ✅ **自动执行** | Policy Engine 逐笔检查 |
| **交易验证（tx.verify）** | ✅ 只读查询 | ✅ **自动执行** | 自动记录日志 |
| **Pact 构造（pact.submit）** | 🔄 新任务 | ❌ **必须人工审核** | 人类审核后才能生效 |
| **超出 Pact 边界的操作** | ❌ 策略外 | ❌ **拒绝后通知人类** | Agent 提供调整建议，人类决策 |
| **失败后的策略调整** | ⚠️ 需要更新 Pact | ❌ **必须人工审核** | Agent 生成建议，人类批准 |
| **紧急冻结** | 🔄 任意时刻 | ❌ **人类手动操作** | 人类在 Cobo App 中冻结 |
| **Pact 到期续期** | 🔄 新周期 | ❌ **必须人工决策** | 人类决定是否继续 |

#### 风险等级与执行策略

| 风险等级 | 定义 | 执行策略 | DCA 场景示例 |
|---------|------|---------|-------------|
| **L0: 无风险** | 只读操作，不影响资产 | 自动执行，无需审查 | 查余额、查报价、查 tx 状态 |
| **L1: 低风险** | 操作在 Pact 边界内 | 自动执行，但受 Policy Engine 约束 | 在预算内执行 swap |
| **L2: 中风险** | 操作在 Pact 边界外，但风险可控 | Agent 生成建议 → 人类决策 | 调整滑点、更换 DEX |
| **L3: 高风险** | 可能影响资产安全或控制权 | **必须人类确认** | 更新 Pact 策略、更改白名单 |
| **L4: 不可逆** | 一旦执行无法撤销 | **必须多签/多人确认** | 转移全部资产、更改钱包所有者 |

---

### 维度 4：恢复机制

> **出错了怎么办？如何暂停、撤销、回滚？**

#### 恢复机制层级

```
L1: 告警（Alert）
  └─ 操作异常时通知人类
  └─ DCA Agent：交易失败 → 通知人类 + 日志
    │
L2: 暂停（Pause）
  └─ 暂时停止 Agent 的执行权限
  └─ DCA Agent：Cobo App 中一键 Freeze
    │
L3: 撤销（Revoke）
  └─ 永久终止 Agent 的权限
  └─ DCA Agent：在 Cobo App 中 Revoke Pact，API Key 即时失效
    │
L4: 回滚（Rollback）
  └─ 尽可能恢复到出错前的状态
  └─ 链上：交易不可逆（无法回滚），但可以通过合约逻辑反向操作
    │
L5: 审计与追责（Audit）
  └─ 出事后查看日志，确定责任
  └─ DCA Agent：Cobo 审计日志 + 链上 tx hash
```

#### 各机制在 DCA Agent 中的实现

| 恢复机制 | 实现方式 | 谁触发 | 响应时间 |
|---------|---------|--------|---------|
| **异常告警** | Agent 记录失败日志，通过 Feishu/Telegram 通知人类 | Agent 自动 | 即时 |
| **冻结（Freeze）** | Cobo App 中一键冻结 Agent 的访问权限 | 人类手动 | 即时（服务器端） |
| **撤销（Revoke）** | Cobo App 中撤销 Pact，API Key 即时失效 | 人类手动 | 即时 |
| **Pact 修改** | 人类调整 Pact 的 Policies 后重新生效 | 人类手动 | 需重新审核 |
| **交易加速** | 通过 Cobo RBF（Replace-By-Fee）加速卡死的交易 | Agent 自动 / 人类 | 根据网络情况 |
| **责任追溯** | 查询 Cobo 审计日志 + 链上 tx hash | 人类（事后） | — |

#### 设计原则

> **没有恢复机制的自动化不应进入真实资产场景。**

每个自动化系统都必须回答：**出了问题，谁、在什么时间内、通过什么方式介入？**

---

### 反例

> 如果一个 AI Wallet 只能展示"自然语言发交易"，但不能解释权限限制、失败处理和审计方式，就更像危险 demo，而不是可靠产品方向。

以下情况**不能**算作合格的权限策略设计：

| 不够的做法 | 缺少什么 |
|-----------|---------|
| "Agent 可以帮用户发交易" —— 没有说 Agent 能发什么交易 | 没有授权范围定义 |
| "Agent 有权限限制" —— 没有说限制是什么 | 没有具体的 policies（金额/合约/时间） |
| "出错了会自动处理" —— 没有说怎么处理 | 没有失败模式和恢复机制 |
| "有审计功能" —— 没有说审计什么、谁看、怎么看 | 没有审计日志的内容范围和访问方式 |
| "Agent 拥有钱包权限" —— 没有说这个权限什么时候消失 | 没有自动撤销和终止条件 |

**一句话：** 合格的权限策略不是"能发交易"，而是**能发什么交易、能花多少钱、花到什么时候停、停了以后怎么办**。

---

## 六、DCA Agent 权限策略详细设计

### 授权对象

```
钱包类型：      Cobo MPC 托管钱包
钱包所有者：    人类（个人用户）
执行代理：      DCA Automation Agent（AI）
授权模型：      Cobo CAW Pact（任务级授权）
```

### 授权范围

```
Chain：
  ├─ 主网：Base（chainId: 8453）
  └─ 测试：Base Sepolia（chainId: 84532）

Tokens：
  ├─ 买入：USDC（0x833589f...）
  └─ 卖出：ETH（原生代币）

Contracts（白名单）：
  ├─ Uniswap V3 Router（0x2626...）
  └─ x402 收款地址列表（Pact 中硬编码）

Functions（函数白名单）：
  ├─ exactInputSingle（单一路径 swap）
  └─ exactInput（多路径 swap）
```

### 执行策略

```
低风险自动执行（Policy 自动检查 + MPC 签名）：
  ├─ dex.quote —— 报价查询（只读，无风险）
  ├─ swap.execute —— 在 Pact 边界内执行 swap
  ├─ tx.verify —— 查询交易结果
  └─ x402.pay —— 在 Pact 边界内付款

高风险人工确认：
  ├─ pact.submit —— 新任务需要人类审核
  ├─ 超出预算的操作 —— Agent 建议新 Pact
  ├─ 非白名单地址 —— 需要人类确认后更新 Pact
  └─ Pact 到期续期 —— 人类决定是否继续

紧急操作（人类手动，Cobo App）：
  ├─ Freeze —— 暂停 Agent 权限
  ├─ Revoke —— 永久撤销 Pact
  └─ Update Policies —— 修改策略后重新生效
```

### 人工确认阈值

| 阈值维度 | 阈值 | 超过后 |
|---------|------|--------|
| **单笔金额** | >200 USDC | 暂停，请求人类批准 |
| **累计金额** | >3,000 USDC | Pact 自动终止，人类决定是否续期 |
| **频率** | >1 次/天 | 暂停（定投策略不应高频执行） |
| **失败次数** | 连续 3 次交易失败 | 暂停，通知人类检查链状态 |
| **新合约地址** | 合约不在白名单中 | 暂停，人类确认后更新白名单 |
| **新收款地址** | x402 收款地址不在白名单 | 暂停，人类确认后加入白名单 |

### 撤销方式

| 撤销方式 | 触发条件 | 撤销内容 | 生效时间 |
|---------|---------|---------|---------|
| **自动完成（Completion Condition）** | 累计花费 ≥3,000 USDC 或 30 天已过 | API Key 即时失效，Pact 关闭 | 即时（服务器端） |
| **手动撤销（Revoke）** | 人类在 Cobo App 中操作 | API Key 即时失效，Pact 关闭 | 即时 |
| **手动冻结（Freeze）** | 人类在 Cobo App 中操作 | 暂停 API Key，Pact 保留 | 即时 |
| **临时停止** | Agent 检测到异常（连续失败、链拥堵） | 暂停执行，保留 Pact | Agent 主动暂停 |
| **Pact 更新** | 人类修改 Policies 后重新审核 | 旧策略失效，新策略生效 | 审核通过后 |

### 日志记录

| 日志类型 | 记录内容 | 存储位置 | 谁可访问 |
|---------|---------|---------|---------|
| **Cobo 审计日志** | 操作时间、API 调用、交易 hash、拒绝原因、金额 | Cobo 基础设施 | 钱包所有者 |
| **链上交易记录** | tx hash、发送方、接收方、金额、状态 | 区块链 | 公开 |
| **Agent 操作日志** | 执行计划、报价结果、错误分析、决策记录 | Agent 本地 | 钱包所有者 |
| **Pact 活动总结** | 总执行次数、总花费、成功率、失败原因分布 | Cobo App | 钱包所有者 |

---

## 七、任务级授权与 Session Key

### 什么是任务级授权

任务级授权的核心思想：**不是给 Agent 一个长期权限，而是围绕一次具体任务生成临时授权。**

```
传统 API Key：    一次性授权 → 永久有效 → 手动撤销 → 容易忘记
会话式授权：      单次对话 → 自动过期 → 随用随消
任务级授权（Pact）：一次任务 → 边界明确 → 完成后自动撤销
```

### Session Key 的概念

Session Key 是 ERC-4337 生态中的一个扩展机制，允许钱包所有者**颁发一个受限的临时签名密钥**给 Agent。

#### Session Key 的核心模型

```
钱包所有者
    │
    ▼
签发 Session Key
  ├─ 公钥 → Agent 持有
  ├─ 权限范围 → 可调用的合约、函数、金额上限
  ├─ 有效期 → 过期时间戳
  └─ 签名 → 钱包所有者的 EIP-712 签名
    │
    ▼
Agent 持有 Session Key
  └─ 在有效期内，可用 Session Key 签名特定操作
  └─ 超出范围或过期 → 签名无效
```

#### Session Key vs Cobo Pact 的对比

| 维度 | Session Key（ERC-4337） | Cobo Pact |
|------|------------------------|-----------|
| **授权载体** | 临时签发的 ECDSA 密钥对 | Agent 的 API Key + Pact 绑定 |
| **权限描述** | 链上合约（VerifiedSession 或类似合约） | 链下 Policies（金额/合约/链/时间） |
| **权限检查** | Session 合约验证签名是否在范围内 | Cobo Policy Engine 检查每笔操作 |
| **有效性** | 时间戳过期 | 完成条件触发（金额/时间/任务） |
| **撤销方式** | 链上取消 Session | Cobo App 中 Freeze / Revoke |
| **链上可见** | ✅ 是（Session 合约公开） | ❌ 否（Cobo 内部） |
| **Gas 成本** | 每次 Session Key 签名需合约验证 | 仅链上交易需付 Gas |
| **成熟度** | 标准仍在演进 | 已上线产品 |

### 在 DCA Agent 中的结合思路

虽然 DCA Agent 目前使用的是 Cobo Pact，但可以借鉴 Session Key 的思路来增强设计：

```
Pact + Session Key 混合模型（未来扩展）：

① Pact 层（Cobo）：
   └─ 钱包级别的授权框架 → 审核、边界、撤销

② Session Key 层（ERC-4337 扩展）：
   └─ 具体操作级别的临时密钥
   └─ 例如：Agent 每次执行 swap 前，颁发一个仅对该笔 swap 有效的 Session Key
   └─ 过期后即使 API Key 未撤销，Session Key 也无法使用

③ 双重保险：
   └─ Pact 管预算和范围（链下）
   └─ Session Key 管具体操作的签名权限（链上）
   └─ 任何一个触发撤销，Agent 都无法继续执行
```

---

## 八、Agent 链上动作执行流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DCA Agent 链上动作执行流程图                       │
│            ● = 自动执行  |  ▲ = 需人工确认  |  ⚡ = 紧急人工         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  用户表达意图："帮我每周一定投 100 USDC 到 ETH"                     │
│          │                                                          │
│          ▼                                                          │
│  ┌──────────────────────────────────────┐                          │
│  │  dca.plan：意图解析                    │  ● 自动                   │
│  │  输出结构化 DCA 参数                   │  (无资产风险)              │
│  └──────────────┬───────────────────────┘                          │
│                 │                                                    │
│                 ▼                                                    │
│  ┌──────────────────────────────────────┐                          │
│  │  pact.submit：构造并提交 Pact          │  ▲ 人类审核                │
│  │  → 人类在 Cobo App 中审核/批准/拒绝    │  (必须人工确认)             │
│  └──────────────┬───────────────────────┘                          │
│                 │ Pact 批准                                          │
│                 ▼                                                    │
│  ┌──────────────────────────────────────┐                          │
│  │  dex.quote：查询 Uniswap 报价          │  ● 自动                   │
│  │  获取 amountOut、priceImpact          │  (只读，无风险)             │
│  └──────────────┬───────────────────────┘                          │
│                 │                                                    │
│                 ▼                                                    │
│  ┌──────────────────────────────────────┐                          │
│  │           策略检查 (Policy Engine)      │  ● 自动                   │
│  │  ├─ 金额 ≤ 单笔限额？ ✅                │  (基础设施强制执行)        │
│  │  ├─ 合约在白名单中？ ✅                 │                          │
│  │  └─ 累计未超预算？ ✅                   │                          │
│  └──────────────┬───────────────────────┘                          │
│                 │ 检查通过                                           │
│                 ▼                                                    │
│  ┌──────────────────────────────────────┐                          │
│  │  swap.execute：MPC 签名 + 链上广播     │  ● 自动                   │
│  │  → Cobo MPC 签名 → 交易上链           │  (Pact 已授权)             │
│  └──────────────┬───────────────────────┘                          │
│                 │                                                    │
│          ┌──────┴──────┐                                            │
│          ▼              ▼                                            │
│   ┌────────────┐  ┌────────────┐                                   │
│   │ 交易成功    │  │ 交易失败    │                                   │
│   └──────┬─────┘  └──────┬─────┘                                   │
│          │               │                                           │
│          ▼               ▼                                           │
│  ┌──────────────┐  ┌──────────────────────┐                       │
│  │ tx.verify    │  │ Agent 分析失败原因     │  ● 自动                  │
│  │ 记录结果+日志  │  │ → 生成调整建议        │                        │
│  └──────┬───────┘  │ → 提交人类决策         │  ▲ 人类确认              │
│         │          └──────────────────────┘                        │
│         │                    │                                       │
│         ▼                    ▼                                       │
│  ┌──────────────────────────────────────┐                          │
│  │  检查 Pact 完成条件                    │  ● 自动                   │
│  │  ├─ 累计 ≥3,000 USDC → 自动撤销       │                          │
│  │  └─ 30 天已过 → 自动撤销              │                          │
│  └──────────────┬───────────────────────┘                          │
│                 │                                                    │
│         ┌──────┴──────┐                                             │
│         ▼              ▼                                             │
│  ┌────────────┐  ┌────────────────────────┐                       │
│  │ Pact 继续   │  │ Pact 自动终止          │  ● 自动                  │
│  │ 等待下次执行 │  │ API Key 即时失效       │  (无需人类介入)          │
│  └────────────┘  └────────────────────────┘                       │
│                                                                     │
│  紧急操作（任意时刻）：                                               │
│  ┌──────────────────────────────────────┐                          │
│  │  ⚡ 人类在 Cobo App：                    │  ⚡ 紧急人工              │
│  │  ├─ Freeze：暂停 Agent 权限             │  (人类手动)              │
│  │  ├─ Revoke：永久撤销 Pact              │                          │
│  │  └─ RBF：加速卡住的交易                 │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 九、参考资料

- ERC-4337 官方文档：https://eips.ethereum.org/EIPS/eip-4337
- ERC-7702 官方文档：https://eips.ethereum.org/EIPS/eip-7702
- Safe 是什么：https://docs.safe.global/home/what-is-safe
- Safe Smart Account Guards：https://docs.safe.global/advanced/smart-account-guards
- Coinbase Policy Engine 概述：https://docs.cdp.coinbase.com/wallets/security-and-policies/policy-engine/overview
- Coinbase Onchain Policy Engine（Prime）：https://help.coinbase.com/en/prime/onchain-wallet/onchain-policy-engine
- Cobo Agentic Wallet 开发者文档：https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview
- Cobo Pact 机制详解：https://www.cobo.com/products/agentic-wallet/manual/start-here/what-is-a-pact
- MetaMask 服务器钱包教程（ERC-8004 集成）：https://docs.metamask.io/tutorials/design-server-wallets/
- LI.FI Agent 文档：https://docs.li.fi/agents/overview
- Session Key（ERC-4337 扩展）参考：https://eips.ethereum.org/EIPS/eip-7715
- ERC-6900（模块化智能合约账户）：https://eips.ethereum.org/EIPS/eip-6900
