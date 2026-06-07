# Deep Research Pack — DCA Automation Agent

> 围绕 DCA Automation Agent 方向，选择 3 个核心标准/协议/项目，写阅读摘要
> 项目方向：Cobo Agentic Wallet × Uniswap V3 自动化定投

---

## 目录

1. [Cobo Pact & Policy Engine — 任务级授权与策略引擎](#1-cobo-pact--policy-engine)
2. [Uniswap V3 Quoter & Router — 链上报价与交易执行](#2-uniswap-v3-quoter--router)
3. [ERC-4337 Account Abstraction — 智能账户与 Agent 钱包的关系](#3-erc-4337-account-abstraction)

---

## 1. Cobo Pact & Policy Engine

### 概述

Cobo Agentic Wallet 的核心安全基础设施，让 AI Agent 在**可控、可审计、可撤销**的边界内执行链上操作。

### 核心概念

#### Pact（任务级授权）

Pact 是一种**一次性授权契约**，定义了 Agent 能做什么、花多少、做多久：

| 字段 | 说明 | 在项目中的对应 |
|------|------|---------------|
| `budget` | 总预算硬上限 | 400 USDC 定投总额 |
| `scope.contracts` | 允许调用的合约白名单 | Uniswap V3 Router 地址 |
| `scope.methods` | 允许调用的合约方法 | swapExactInput |
| `time_window` | 有效时段 | 4 周定投周期 |
| `frequency` | 执行频率限制 | 每周最多 1 次 |

#### Policy Engine（策略引擎）

在 Pact 之上叠加**策略规则**，作为第二道防线：

| 规则类型 | 示例 | 保护场景 |
|---------|------|---------|
| 合约白名单 | 只允许 0x...UniswapV3 | Prompt Injection 想调其他合约 |
| 金额上限 | 单笔 ≤ 100 USDC | Agent 意图理解错误 |
| 频率限制 | 每周 1 次 | Agent 被注入循环调用 |
| 方法白名单 | 只允许 swapExactInput | 不允许 approve 等危险方法 |

### 关键设计哲学

> **不要信任 Agent，给 Agent 受限的权限 + 可撤销的钥匙。**

- Agent 永远不能自己创建/修改 Pact → 只能通过用户 Cobo App 操作
- Pact 到期自动失效 → 不需要用户记得 Revoke
- Policy Engine 在签名前做最终校验 → Agent 绕过 Pact 也无法执行

### 在项目中的应用

| Pact/Policy 概念 | DCA Automation Agent 映射 |
|-----------------|--------------------------|
| Pact budget | "定投 400 USDC 到 ETH" 的预算上限 |
| Pact scope | DCA Agent 只能调用 Uniswap V3 |
| Pact time window | "持续 4 周" = 28 天有效期 |
| Policy Engine | 即使 Agent 被注入攻击，也无法超越这些边界 |
| Pact 自动撤销 | 4 周定投结束后，权限自动消失 |

### 关键链接

- Cobo Developer Docs: https://docs.cobo.com/
- Cobo Agentic Wallet: https://www.cobo.com/products/agentic-wallet

---

## 2. Uniswap V3 Quoter & Router

### 概述

Uniswap V3 是部署在多个 EVM 链上的自动化做市商（AMM），提供链上代币兑换功能。本项目中 Agent 通过 Uniswap V3 执行 USDC→ETH 的定投 swap。

### 核心合约

#### Quoter（报价合约）

用于**模拟**一次 swap 的结果，不实际执行交易：

```
function quoteExactInputSingle(
    address tokenIn,
    address tokenOut,
    uint24 fee,
    uint256 amountIn,
    uint160 sqrtPriceLimitX96
) external returns (
    uint256 amountOut,
    uint160 sqrtPriceX96After,
    uint32 initializedTicksCrossed,
    uint256 gasEstimate
)
```

| 返回字段 | 说明 | Agent 如何使用 |
|---------|------|--------------|
| `amountOut` | 预期收到数量 | 计算执行价格 |
| `sqrtPriceX96After` | 交易后的价格平方根 | 计算滑点 |
| `gasEstimate` | 预估 gas | 预算校验 |

#### Router（路由合约）

实际执行 swap 的入口：

```
function swapExactInputSingle(
    ISwapRouter.ExactInputSingleParams calldata params
) external payable returns (uint256 amountOut)
```

| 参数 | 说明 |
|------|------|
| `tokenIn` | 输入代币地址（USDC）|
| `tokenOut` | 输出代币地址（WETH）|
| `fee` | 手续费等级（3000 = 0.3%）|
| `recipient` | 收款地址 |
| `amountIn` | 输入数量 |
| `amountOutMinimum` | 最小输出（slippage 保护）|
| `sqrtPriceLimitX96` | 价格限制（0 = 无限制）|

### Slippage 保护机制

```
报价: 100 USDC → 0.038 ETH
设置 slippage: 0.5%
amountOutMinimum = 0.038 × (1 - 0.005) = 0.03781 ETH
→ 如果链上执行时价格跌到只能换 0.037 ETH → 交易 revert
→ 保护用户不被 MEV 和三明治攻击
```

### Base Sepolia 部署

| 合约 | 地址 |
|------|------|
| Uniswap V3 Factory | `0x...`（需从官方文档确认）|
| Uniswap V3 Router | `0x...` |
| Quoter | `0x...` |
| WETH | `0x...` |

> **注意**：Base Sepolia 的 Uniswap V3 部署地址可能与主网不同，需在 6/8 Day 1 确认。

### 关键链接

- Uniswap V3 文档: https://docs.uniswap.org/contracts/v3/overview
- Base Sepolia: https://docs.base.org/docs/base-sepolia-testnet/

---

## 3. ERC-4337 Account Abstraction

### 概述

ERC-4337 是以太坊的账户抽象标准，允许智能合约作为账户（Smart Account），实现灵活的签名验证、Gas 支付和权限管理。

### 核心机制

```
UserOperation → Bundler → EntryPoint → Smart Account → 执行
```

| 组件 | 功能 | 与 Cobo CAW 的关系 |
|------|------|-------------------|
| UserOperation | 用户意图的打包表达 | Pact 是 Cobo 版的任务意图表达 |
| Bundler | 打包 UserOp 提交上链 | Cobo MPC 节点承担签名聚合 |
| EntryPoint | 统一验证和执行入口 | Cobo CAW 内置兼容 |
| Smart Account | 执行交易逻辑的钱包合约 | Cobo CAW 是 MPC 托管的 Smart Account |

### ERC-4337 vs Cobo CAW

| 维度 | ERC-4337 Smart Account | Cobo CAW |
|------|----------------------|----------|
| **私钥管理** | 自定义签名验证 | MPC 分片，Cobo 托管 |
| **权限控制** | 合约逻辑自定义 | Pact + Policy Engine |
| **Gas 支付** | Paymaster 代付 | 用户钱包 gas |
| **部署** | 链上合约 | Cobo 托管 + 链上兼容 |
| **适用场景** | 通用 AA 钱包 | Agentic Wallet 专用 |

### 对项目的意义

虽然 DCA Automation Agent 不直接实现 ERC-4337，但理解 AA 有助于：

1. **理解 Cobo CAW 的底层架构** — Cobo CAW 本质上是一个兼容 ERC-4337 的 Smart Account
2. **Future 扩展** — 如果需要做更灵活的权限策略（如 Session Key），可以借鉴 ERC-4337 的验证逻辑
3. **Agent 钱包生态** — Cobo 的 Pact + Policy Engine 可以看作 ERC-4337 的 Agent 版增强实现

### Agent 钱包的演进方向

```
传统 EOA → ERC-4337 Smart Account → Cobo Agentic Wallet
    ↓              ↓                      ↓
单私钥       灵活验证              MPC + Pact + Policy
无权限控制    可编程权限            任务级授权 + 自动撤销
人操作       可自动化              Agent Native
```

### 关键链接

- ERC-4337 规范: https://eips.ethereum.org/EIPS/eip-4337
- Cobo CAW 文档（提及 AA 兼容性）
- Account Abstraction 概述: https://ethereum.org/en/roadmap/account-abstraction/

---

## 研究总结

| 主题 | 关键发现 | 项目影响 |
|------|---------|---------|
| Cobo Pact & Policy | Agent 在 Pact 授权内执行，Policy Engine 做二次校验 | 项目安全架构的核心依赖 |
| Uniswap V3 | Quoter 提供链上报价，Router 执行 swap，slippage 保护 | Agent 执行层的关键组件 |
| ERC-4337 AA | CAW 本质上是 AA 增强版，支持灵活的权限和签名 | 理解底层，为后续扩展做准备 |

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*深度研究：Cobo Pact · Uniswap V3 · ERC-4337 Account Abstraction*
