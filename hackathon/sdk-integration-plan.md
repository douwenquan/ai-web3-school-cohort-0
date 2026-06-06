# Cobo SDK / API Integration Plan

> DCA Automation Agent 接入 Cobo Agentic Wallet 的技术集成方案
> 含 Fallback 方案、Week 4 可完成性评估

---

## 一、集成概览

| 维度 | 内容 |
|------|------|
| **目标** | Agent 通过 Cobo API 创建 Pact → contract_call 执行 swap → 验证交易 |
| **测试环境** | Cobo Sandbox + Base Sepolia |
| **主要依赖** | Cobo Agentic Wallet API（REST） |
| **接入方式** | Python HTTP Client → Cobo API Endpoints |

---

## 二、需接入的 Cobo API

### 2.1 Cobo Agentic Wallet API

| API | 用途 | Week 4 是否必接 |
|-----|:----:|:---------------:|
| **Pact 创建** | 为每次 DCA 策略创建任务级授权（budget/scope/time window） | ✅ P0 |
| **contract_call** | 在 Pact 授权范围内发起合约调用（Uniswap swap） | ✅ P0 |
| **get_transaction_record** | 验证交易执行结果，用于投资分析 | ✅ P0 |
| **Pact 撤销** | 条件触发后自动移除授权 | ✅ P0 |
| **Pact 列表** | 查询当前活跃 Pact 及预算使用情况 | ✅ P0 |
| **x402 支付** | 机器间小额结算（P1 功能） | ⬜ P1 |

### 2.2 Cobo API 调用示例

```
POST https://api.cobo.com/v2/wallets/{wallet_id}/pacts
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "name": "DCA Plan #1 - Weekly ETH Buy",
  "budget": {
    "amount": "400",
    "token": "USDC"
  },
  "scope": {
    "contracts": ["0x...UniswapV3Router..."],
    "methods": ["swapExactInput"]
  },
  "time_window": {
    "start": "2026-06-08T00:00:00Z",
    "end": "2026-07-06T00:00:00Z",
    "frequency": "weekly"
  }
}
```

---

## 三、技术实现路线

### 3.1 架构

```
┌─────────────────────────────────────────┐
│  Agent 层 (Python)                       │
│  ┌────────────────────────────────────┐  │
│  │ cobo_client.py                     │  │
│  │  ├── create_pact()                  │  │
│  │  ├── contract_call()                │  │
│  │  ├── get_transaction_record()       │  │
│  │  └── revoke_pact()                  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ uniswap_client.py                   │  │
│  │  ├── quote()                        │  │
│  │  └── build_swap_tx()                │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  Cobo API Gateway                        │
│  ┌────────────────────────────────────┐  │
│  │  MPC Node → Sign → Broadcast       │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Policy Engine → Validate          │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│  Base Sepolia                            │
│  ┌────────────────────────────────────┐  │
│  │  Uniswap V3 Router → Swap          │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3.2 代码结构

```
src/
├── agent/
│   ├── dca_plan.py          ← NL → 结构化参数
│   ├── pact.py              ← Pact 构造与提交
│   ├── swap.py              ← swap 执行
│   └── analysis.py          ← 投资回看分析
├── cobo/
│   ├── client.py            ← Cobo API 客户端（HTTP wrapper）
│   ├── pact.py              ← Pact CRUD API
│   └── tx.py                ← 交易查询
├── uniswap/
│   ├── quoter.py            ← Uniswap V3 报价
│   └── router.py            ← swap 交易构造
└── config.py                ← 配置管理
```

### 3.3 关键实现细节

**cobo/client.py — Cobo API 客户端**

```python
class CoboClient:
    def __init__(self, api_key: str, base_url: str = COBO_SANDBOX_URL):
        self.api_key = api_key
        self.base_url = base_url
        self.session = httpx.Client()

    def create_pact(self, params: PactParams) -> Pact:
        """创建任务级授权"""
        ...

    def contract_call(self, pact_id: str, tx: ContractCallParams) -> TxResult:
        """在 Pact 授权内发起合约调用"""
        ...

    def get_transaction_record(self, tx_hash: str) -> TxRecord:
        """查询交易状态和详情"""
        ...

    def revoke_pact(self, pact_id: str) -> bool:
        """撤销 Pact（Agent 不可调用，仅用户 Cobo App）"""
        ...
```

**uniswap/quoter.py — Uniswap V3 报价**

```python
class UniswapQuoter:
    def __init__(self, rpc_url: str):
        self.quoter = Contract(...)  # Uniswap V3 Quoter ABI

    def quote_exact_input(self, token_in, token_out, amount, fee=3000):
        """获取报价"""
        ...
```

---

## 四、Week 4 可完成性评估

### 时间预估

| 组件 | 预估工时 | 风险 |
|------|:--------:|:----:|
| Cobo API 客户端基础封装 | 1h | 🟢 低 — 标准 HTTP wrapper |
| Pact 创建 | 2h | 🟡 中 — 需确认 API 参数 |
| Uniswap Quoter 调用 | 1.5h | 🟡 中 — 需链上交互 |
| contract_call swap 集成 | 3h | 🔴 高 — 核心链路，未知坑最多 |
| 交易验证与日志 | 1h | 🟢 低 |
| 端到端联调 + 测试 | 2h | 🟡 中 |
| **总计** | **~10.5h** | |

### 每日分配（每天 2-3h）

| 日期 | 目标 | 工时 |
|:----:|------|:----:|
| 6/8（一） | Cobo 测试钱包 + API Key 配置 + Uniswap Quoter 调用验证 | 2.5h |
| 6/9（二） | Pact 创建 + contract_call 测试 | 3h |
| 6/10（三） | swap 集成 + 交易验证 | 3h |
| 6/11（四） | 端到端联调 + 安全攻击模拟 | 2h |
| 6/12（五） | Demo 准备 + 提交材料 | 2h |

---

## 五、Fallback 方案

### 各组件独立 Fallback

| 组件 | 打通方案 | 不可用时的 Fallback |
|------|---------|-------------------|
| Cobo API（完整） | 直接调用 Sandbox | Fallback A: 展示 API 请求/响应截图 |
| Pact 创建 | API 创建 → Cobo App 审核 | 人工在 App 创建 Pact → Agent 使用 |
| contract_call | API 发起 swap | Fallback B: 展示代码 + 架构讲解 |
| Uniswap Quoter | 链上 RPC 调用 | 本地 Mock 报价数据 |
| 投资分析 | 基于真实交易数据 | 基于模拟数据 + 截图 |

### 最终演示方案

| 场景 | Demo 方式 |
|------|----------|
| ✅ 全链路打通 | 实时演示：NL → swap → 验证，配合 Cobo App 审核 |
| ⚠️ Cobo 通但 swap 不通 | 实时演示 NL 解析 + Cobo Pact 创建 + 投资回看代码 |
| ❌ 仅 Uniswap 通 | 实时运行 Quoter + 展示 Cobo 官方文档截图 |
| 🔴 全部不通 | 录播演示 + 架构图 + 代码展示 |

---

## 六、预研清单（6/8 前可做）

| # | 事项 | 耗时 | 可提前做？ |
|:-:|------|:----:|:---------:|
| 1 | 阅读 Cobo API 文档，确认 Sandbox 开通流程 | 30min | ✅ 是 |
| 2 | 确认 Base Sepolia Uniswap V3 合约地址 | 10min | ✅ 是 |
| 3 | 安装 Python 依赖（web3.py, httpx） | 10min | ✅ 是 |
| 4 | 编写 cobo_client.py 基础骨架 | 30min | ✅ 是 |
| 5 | 编写 uniswap/quoter.py 基础骨架 | 20min | ✅ 是 |
| 6 | 确认 Cobo API Key 有 Sandbox 权限 | 10min | ❌ 需要 Cobo App |

---

*Hackathon 项目 · DCA Automation Agent · AI × Web3 School Cohort 0 · 2026-06*
*为 Week 4 Sprint 准备的 API 集成方案*
