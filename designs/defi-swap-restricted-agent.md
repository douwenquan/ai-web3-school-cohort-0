# DeFi 兑换受限助手工作流设计

> AI 规划、解释、生成草稿 → 人类负责所有私钥操作
> 设计日期：2026-05-27

---

## 一、设计原则

```
┌─────────────────────────────────────────────────┐
│                  AI 能做                          │
│  意图解析 · 链上查询(只读) · calldata 生成        │
│  交易模拟 · Permit2 签名草稿 · 风险提示           │
│  结果验证(只读)                                   │
├─────────────────────────────────────────────────┤
│               AI 绝对不能做                        │
│  接触私钥 / 助记词 / API Key                      │
│  自动签名或广播交易                               │
│  绕过「人类确认墙」                               │
│  替用户授权 / swap                                │
└─────────────────────────────────────────────────┘
```

**三条铁律：**
1. **永不接触密钥** — 不生成、不保存、不请求私钥、助记词或任何 API Key
2. **永不自动签名** — 所有交易构建止步于原始 calldata，无签名步骤
3. **永不绕过确认** — 流程强制插入「人类验证合约地址/参数」断点

---

## 二、完整工作流

```
用户输入意图
↓
┌─────────────────────────────────────────────┐
│ Stage 1: 意图解析 & 链上查询（只读）          │
│   AI 提取：源链、输入/输出代币、数量、滑点、  │
│   DEX → 查询合约地址、报价、流动性深度         │
└─────────────────────────────────────────────┘
↓
┌─────────────────────────────────────────────┐
│ Stage 2: 交易草稿生成 & 模拟（只读 + 构造）   │
│   2a. 生成 Approve + Swap 的 calldata        │
│   2b. 生成 Permit2 签名草稿（EIP-712）        │
│   2c. Pre-flight Simulation（eth_call）       │
│   2d. 风险提示                                │
└─────────────────────────────────────────────┘
↓
╔═════════════════════════════════════════════╗
║   【确认墙 #1】核对合约地址（人类交叉验证）   ║
║     · Router 地址 vs 官方文档                 ║
║     · 代币地址 vs DefiLlama / Etherscan      ║
║     · 链 ID 是否正确                         ║
╚═════════════════════════════════════════════╝
↓
┌─────────────────────────────────────────────┐
│ Stage 3: 授权（Permit2 优先）                 │
│   路径 A：链下签名 Permit（EIP-712）           │
│   路径 B：链上传统 Approve                     │
└─────────────────────────────────────────────┘
↓
╔═════════════════════════════════════════════╗
║   【确认墙 #2】核对 Permit / Approve 参数    ║
║     · spender 地址                           ║
║     · 授权金额（避免无限授权）                ║
║     · nonce / deadline                       ║
╚═════════════════════════════════════════════╝
↓
╔═════════════════════════════════════════════╗
║   【确认墙 #3】核对 Swap 参数 & 签名          ║
║     · 接收地址、链 ID                         ║
║     · 发送金额、最小接收量（滑点一致）         ║
║     · calldata 与 AI 展示一致                ║
║     · deadline（建议 10-15 min）              ║
║     · 硬件钱包物理按键确认                     ║
╚═════════════════════════════════════════════╝
↓
用户广播交易 → 提供哈希
↓
┌─────────────────────────────────────────────┐
│ Stage 4: 结果验证（只读）                     │
│   AI 查询收据 → 分析状态 → 输出对比           │
│   用户最终在区块浏览器自主验证                 │
└─────────────────────────────────────────────┘
```

---

## 三、Stage 1：意图解析 & 链上查询

### 3.1 用户输入

用户用自然语言描述交易意图，例如：

> "我想在以太坊主网上用 100 USDC 换成 ETH，滑点容忍 0.5%，通过 Uniswap 操作。"

AI 可追问补充信息（如接收地址、网络），但**绝不要求提供私钥、助记词或 API Key**。

### 3.2 AI 解析 & 规划

| 字段 | 说明 |
|------|------|
| 源链 | 如 Ethereum Mainnet (chainId: 1) |
| 输入代币 | USDC |
| 输出代币 | ETH |
| 数量 | 100 USDC |
| 滑点 | 0.5% |
| 偏好 DEX | Uniswap V3 |
| 接收地址 | 用户钱包地址 |

### 3.3 链上只读查询

通过公共 RPC（如 `https://eth.llamarpc.com`）或去中心化索引器执行：

```
1. 查询 USDC 合约地址（官方：0xA0b86991...）
2. 查询用户 USDC 余额
3. 查询用户对 Router 的授权额度（allowance）
4. 调用 Uniswap Quoter 获取预期输出量（eth_call 静态调用）
   └ quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, sqrtPriceLimitX96)
5. 获取当前 Gas 价格 + 推荐 Gas Limit
6. 验证代币合约来源（是否经过审计、是否有蜜罐检测）
```

**注意：** 只使用无需认证的公共端点。不使用任何需要 API Key 的中心化服务，除非用户临时允许且仅用于查询。

---

## 四、Stage 2：交易草稿生成 & 模拟（核心新增）

这是整个设计的核心增强——在用户接触私钥前，AI 完成所有可离线/只读验证的工作。

### 4.1 生成 Approve + Swap 的 calldata

使用 ethers/viem 离线构造交易数据（**不广播**）：

**授权交易（Approve）**

| 字段 | 值 |
|------|-----|
| to | USDC 合约地址 |
| data | `approve(spender: Router地址, amount: 100000000)` |
| spender | Uniswap Router 合约地址 |
| amount | 精确额度（建议不设无限授权） |

**兑换交易（Swap）**

| 字段 | 值 |
|------|-----|
| to | Router 合约地址 |
| data | `swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)` |
| amountIn | 100 USDC（含小数位） |
| amountOutMin | Quoter 返回值 × (1 - 滑点) |
| deadline | `block.timestamp + 900`（15分钟） |

### 4.2 生成 Permit2 签名草稿

Permit2 是 Uniswap 的标准，允许用户通过**链下签名**一次性授权，然后在一笔交易内完成 Approve + Swap，消除 MEV 窗口。

AI 构造 EIP-712 结构化数据（用户只需在钱包里签名即可）：

```json
{
  "domain": {
    "name": "Permit2",
    "version": "1",
    "chainId": 1,
    "verifyingContract": "0x000000000022D473030F116dDEE9F6B43aC78BA3"
  },
  "message": {
    "permitted": {
      "token": "0xA0b86991...",
      "amount": "100000000"
    },
    "spender": "<Router地址>",
    "nonce": "<Permit2 nonce>",
    "deadline": "<当前时间 + 1h>"
  }
}
```

**对比：传统 Approve vs Permit2**

| 维度 | 传统 Approve | Permit2 |
|------|-------------|---------|
| 链上交易数 | 2（Approve + Swap） | 1（SwapWithPermit） |
| MEV 攻击窗口 | 两笔交易之间 | 无（合并为一笔） |
| Gas 消耗 | 更高 | 更低 |
| 用户操作 | 签名两次（两笔 tx） | 签名一次消息 + 一次 tx |
| 钱包兼容性 | 所有钱包 | 需要 EIP-712 支持 |

**回退方案：** 如果用户使用的钱包或 DApp 不支持 Permit2，退回到传统 Approve。

### 4.3 Pre-flight Simulation（预执行模拟）⭐ 新增

这是用户在签名前最重要的安全屏障。

**原理：** 用 `eth_call` 在节点上**模拟执行**完整的 swap 交易，返回实际执行结果。

#### Step 1：检查授权状态

```typescript
// eth_call: 查询用户 USDC 对 Router 的 allowance
const allowance = await publicClient.readContract({
  address: USDC_ADDRESS,
  abi: erc20Abi,
  functionName: 'allowance',
  args: [userAddress, ROUTER_ADDRESS],
})

if (allowance < amountIn) {
  → AI 提示："USDC 授权不足，需要先执行 Approve"
  → 建议走 Permit2 或传统 Approve
}
```

#### Step 2：模拟 swap 交易

```typescript
// 构造完整交易对象（不广播）
const simulatedTx = {
  from: userAddress,
  to: ROUTER_ADDRESS,
  data: swapCalldata,
  gas: estimatedGas,
}

// eth_call 模拟执行
const { result, gasUsed } = await publicClient.simulateContract({
  address: ROUTER_ADDRESS,
  abi: routerAbi,
  functionName: 'swapExactTokensForETH',
  args: [amountIn, amountOutMin, path, userAddress, deadline],
  account: userAddress,
})
```

#### Step 3：输出模拟结果

| 指标 | 模拟值 | Quoter 报价 | 差异 |
|------|--------|-------------|------|
| 预期输出 ETH | 0.0523 ETH | 0.0528 ETH | -0.95% |
| Gas 预估 | 185,000 | — | — |
| 路由路径 | USDC → WETH | USDC → WETH | 一致 |
| 模拟状态 | ✅ 成功 | — | — |

**模拟失败时：** AI 解码 revert 原因并给出建议。

| Revert 原因 | 含义 | 建议 |
|-------------|------|------|
| `INSUFFICIENT_OUTPUT_AMOUNT` | 滑点设置过低 | 提高滑点或等待更优价格 |
| `TRANSFER_FROM_FAILED` | 授权不足 | 先执行 Approve / Permit |
| `EXPIRED` | deadline 过短 | 重新生成 |
| `STALE_PRICE` | 报价已过时 | 重新查询 |

#### 模拟的优势

- 跑的是 **真实链上状态 + 用户余额 + 当前路径**
- 比 Quoter 报价更精确（Quoter 是数学计算，模拟是完整 EVM 执行）
- 天然检测到授权不足、余额不足、滑点过低等问题
- **不消耗 Gas、不广播交易、不改写链上状态**

### 4.4 风险提示

生成草稿后，AI 输出风险清单：

```
┌─────────────────────────────────────┐
│ ⚠️ 风险检查清单                       │
│                                     │
│ □ 流动性深度：USDC/ETH 池 TVL > 5M  │
│ □ 滑点损失预估：0.5% 可接受           │
│ □ MEV 风险：中等（建议使用 MEV 保护）  │
│ □ 代币安全：USDC 已审计（主流稳定币） │
│ □ Router 地址：已验证（Uniswap 官方） │
│ □ 报价时效：数据生成于 30 秒前        │
└─────────────────────────────────────┘
```

---

## 五、Stage 3：用户签名执行

### 5.1 授权（路径 A：Permit2 优先）

用户用钱包签名 EIP-712 消息（**不是链上交易**）：

```
钱包弹出签名界面 →
  ┌──────────────────────────┐
  │ Sign Permit2              │
  │ Token: USDC               │
  │ Amount: 100 USDC          │
  │ Spender: Uniswap Router   │
  │ Deadline: 2026-05-27 14:30│
  │                           │
  │ [Cancel]     [Sign]       │
  └──────────────────────────┘
```

**AI 提供的签前核对清单：**
- [ ] spender = Permit2 官方地址（`0x000000000022D473...`）
- [ ] token = USDC 地址（`0xA0b86991...`）
- [ ] amount ≠ 无限授权，且有上限
- [ ] chainId = 1（Ethereum）

### 5.2 授权（路径 B：传统 Approve 回退）

如果用户不支持 Permit2，退回到链上 Approve 交易：

```
钱包弹出交易确认 →
  ┌──────────────────────────┐
  │ Approve USDC              │
  │ Spender: Uniswap Router   │
  │ Amount: 100 USDC          │
  │ Network Fee: ~$3.50       │
  │                           │
  │ [Reject]    [Confirm]     │
  └──────────────────────────┘
```

### 5.3 执行 Swap

用户在钱包中发起 Swap 交易，逐字核对 AI 提供的参数：

```
钱包弹出交易确认 →
  ┌──────────────────────────────────┐
  │ Swap USDC → ETH                  │
  │ Send: 100 USDC                   │
  │ Receive (min): 0.0523 ETH         │
  │ Slippage: 0.5%                   │
  │ Router: 0xE592427... （核对！）   │
  │ Deadline: 14:30                   │
  │ Network Fee: ~$12.00             │
  │                                  │
  │ Calldata: fetchCalldata()        │
  │ [Reject]    [Confirm]            │
  └──────────────────────────────────┘
```

**⛔ 约束：AI 绝不会替用户发送此交易。**

---

## 六、Stage 4：结果验证

用户提供交易哈希后，AI 通过公共 RPC 查询收据：

```
┌─────────────────────────────────────┐
│ ✅ 交易成功                          │
│                                     │
│ 交易哈希                             │
│ 0xabc...def                         │
│                                     │
│ ▪ 状态: Success (1 block confirm)   │
│ ▪ 实际收到: 0.0525 ETH              │
│ ▪ 预期最小: 0.0523 ETH              │
│ ▪ Gas 消耗: 182,000 gas             │
│ ▪ Gas 费: $11.80                    │
│                                     │
│ 请打开 Etherscan 自行核对：          │
│ https://etherscan.io/tx/0xabc...def │
└─────────────────────────────────────┘
```

**失败时：** 解码 revert 原因，输出调整建议。

---

## 七、确认墙总表

| # | 确认点 | AI 做什么 | 人类做什么 |
|---|--------|-----------|-----------|
| 1 | 合约地址核对 | 生成地址列表 + 官方来源链接 | 从官方文档/DLL交叉验证 |
| 2 | Permit / Approve 参数 | 生成 EIP-712 签名草稿，标注核心字段 | 钱包内逐字核对 spender/amount |
| 3 | Swap 参数 | 生成 calldata + 参数清单 + 模拟结果 | 钱包内核对所有字段并签名 |
| 4 | 交易验证 | 查询收据 + 分析结果 | 打开区块浏览器终审 |

---

## 八、风险与缓解措施

| 风险 | 说明 | 缓解 |
|------|------|------|
| 地址欺诈 | AI 给出仿冒代币地址 | 用户必须从官方渠道交叉验证 |
| 报价过时 | 查询与签名间价差导致滑点 | AI 提示「请尽快确认」+ 模拟验证 |
| 前端篡改 | calldata 在传递中被篡改 | 钱包内逐字核对 calldata |
| 公共 RPC 不可靠 | 限速或错误数据 | 模拟 + 钱包内置报价双校验 |
| Permit2 nonce 冲突 | 重复 signing 导致授权失败 | AI 查询最新 nonce + 过期清理策略 |

---

## 九、技术参考

- **RPC 端点：** `https://eth.llamarpc.com`（公共，无需 Key）
- **合约库：** ethers.js / viem
- **报价查询：** Uniswap V3 Quoter Contract
- **模拟：** `publicClient.simulateContract()`（viem）/ `eth_call`
- **Permit2 合约：** `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- **Permit2 EIP-712 规范：** [Uniswap Permit2 Docs](https://docs.uniswap.org/contracts/permit2/overview)

---

## 十、版本记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-05-27 | v1.0 | 初始设计：四阶段 + 三条铁律 |
| 2026-05-27 | v1.1 | 新增 Pre-flight Simulation + Permit2 集成 |
