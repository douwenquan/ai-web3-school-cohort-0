# Web3 基础概念学习笔记：Security（安全）

> 基于 Handbook Web3 基础章节：Security  
> 链上错误的成本远高于普通应用——不可回滚，不可撤销

---

## 0. 为什么 Web3 安全特别重要

### 链上安全的高代价

```
普通应用:
  出错 → 回滚数据库 → 修复 → 重新部署 → 用户最多受短暂影响

链上应用:
  出错 → 资产被转走 → 无法回滚 → 无法撤销 → 永久损失
```

### 安全三原则

```
1. 权限最小化 —— 不要给任何人/合约多余的权限
2. 执行前模拟 —— 签名前就知道会发生什么
3. 上线后监控 —— 出问题第一时间发现
```

---

## 1. Reentrancy（重入攻击）

### 核心定义

**Reentrancy** 是合约在**外部调用未完成前被再次调用**，导致状态被重复利用的经典漏洞。

### 攻击原理

```solidity
// ❌ 有漏洞的合约
contract VulnerableVault {
    mapping(address => uint) public balances;

    function withdraw() public {
        uint amount = balances[msg.sender];
        
        // 1. 先转账（外部调用）
        (bool success, ) = msg.sender.call{value: amount}("");
        
        // 2. 后更新状态 ← 太晚了！攻击者已经在第1步重新进入了
        balances[msg.sender] = 0;
    }
}
```

### 攻击时序

```
1. 攻击者调用 withdraw()
2. 合约向攻击者转账 → 触发攻击者的 receive() 函数
3. 在 receive() 里再次调用 withdraw()
4. 此时 balances[msg.sender] 还没被清 0
5. 合约再次转账
6. 循环直到合约被掏空
```

### 防护方案

```
✅ 使用 OpenZeppelin 的 ReentrancyGuard:

  import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
  
  contract SafeVault is ReentrancyGuard {
      function withdraw() public nonReentrant {
          // 整个函数被锁保护，无法重入
      }
  }

✅ 遵循 Checks-Effects-Interactions 模式:
  1. Checks  —— 先检查条件 (余额够不够)
  2. Effects —— 先更新状态 (余额归 0)
  3. Interactions —— 最后才转账
  
✅ 测试要覆盖多合约交互:
  不是只测单个函数，要测 A 调 B、B 回调 A 的场景
```

---

## 2. Access Control（权限控制）

### 核心定义

**Access Control** 决定**谁可以执行敏感动作**。

### 需要权限控制的敏感操作

| 操作 | 风险 | 为什么需要控制 |
|------|------|---------------|
| **mint** | 🔴 高 | 随意增发 → 通胀 → 持有者资产贬值 |
| **burn** | 🔴 高 | 随意销毁 → 破坏代币经济 |
| **pause** | 🟡 中 | 暂停合约 → 用户无法操作 |
| **upgrade** | 🔴 最高 | 升级合约 → 可以改变所有逻辑 |
| **withdraw** | 🔴 最高 | 提取资金 → 协议金库被盗 |
| **setOracle** | 🔴 高 | 替换预言机 → 操纵价格 → 触发错误清算 |
| **setFee** | 🟡 中 | 修改费率 → 影响用户成本 |
| **setRoot** | 🔴 高 | 修改 Merkle Root → 改变空投/白名单 |
| **changeOwner** | 🔴 最高 | 转移所有权 → 失去对合约的控制 |

### 权限控制方案

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| **Ownable** | 单一 owner，简单直接 | 早期原型、个人项目 |
| **AccessControl** | 角色-based 权限，细粒度 | 生产级协议 |
| **多签 (Multi-sig)** | M-of-N 签名，需多人同意 | 团队金库、DAO |
| **时间锁 (Timelock)** | 操作延时执行，给用户反应时间 | 关键升级、资金操作 |

### 权限最小化原则

```
不是: "admin 能做什么？" 
而是: "这个操作最少需要什么权限？"

只有真正需要的人/合约才给权限
不给多余的、不给永久的、不给不可撤销的
```

---

## 3. Audit（安全审计）

### 核心定义

**Audit** 是外部安全审计，不是安全保证书。审计可以发现设计、实现和测试中的问题，但**不能保证永远安全**。

### 审计能发现什么

| 能发现 | 不能保证 |
|--------|----------|
| ✅ 重入漏洞 | ❌ 未来不会出现新攻击方式 |
| ✅ 权限配置错误 | ❌ 审计后新增的代码 |
| ✅ 逻辑漏洞 | ❌ 治理攻击（用户被钓鱼签名） |
| ✅ 整数溢出 | ❌ 预言机被操纵导致的间接攻击 |
| ✅ Gas 效率问题 | ❌ 私钥泄露 |

### 审计的正确心态

```
审计 = 专业体检 ✓
审计 ≠ 终身免疫 ✗

审计通过 → 上线 → 持续监控 → 必要时再审计
```

---

## 4. Simulation（交易模拟）

### 核心定义

**Simulation** 是交易发出前的**预演**，在用户或 Agent 签名之前就知道这笔交易会做什么。

### 模拟能告诉你什么

```
签名前先模拟:

  ✅ 调用哪个合约？
  ✅ 会转出哪些 Token？转出多少？
  ✅ 会收到什么资产？收到多少？
  ✅ 权限会有什么变化？（approve、delegate）
  ✅ Gas 大概多少？
  ✅ 会不会 revert？
```

### 模拟 vs 正式执行

```
模拟:
  在本地/节点 fork 环境执行
  不消耗 Gas
  不改变链上状态
  纯粹预演

正式执行:
  签名 → 广播 → 消耗 Gas → 改变链上状态 → 不可逆
```

### 为什么 Agent 尤其需要模拟

```
用户问 Agent: "帮我 swap 100 USDC 到 ETH"

Agent 应该先模拟:
  → 当前 Uniswap 池子比例
  → 预估滑点
  → 实际到手的 ETH 数量
  → Gas 估算
  
然后展示给用户确认，而不是直接签名发送
```

---

## 5. Monitoring（链上监控）

### 核心定义

**Monitoring** 是上线后的**安全感知层**，用来发现异常并触发响应。

### 需要监控的链上事件

| 监控项 | 为什么 |
|--------|--------|
| **大额转账** | 可能是金库被盗或异常提款 |
| **管理员权限变更** | Owner 转移或新 Admin 添加 |
| **合约升级** | 逻辑变更可能引入后门 |
| **异常清算** | 预言机操纵后的连锁反应 |
| **Pause/Unpause** | 意外暂停或恶意暂停 |
| **Fee 参数变更** | 费率突变可能是攻击前兆 |
| **异常 Gas** | 高 Gas 的复杂调用可能是攻击 |
| **合约余额剧烈变化** | TVL 跳水、资金异常流出 |

### 监控 + 响应

```
监控: 发现异常 → 触发告警
响应:
  ├── 通知团队 (Telegram/Discord/Email)
  ├── 自动暂停合约 (如果预设了断路器)
  ├── 生成事件报告
  └── 触发人工干预
```

---

## Security 全景总结

```
开发阶段:
  ├── Access Control: 谁可以做什么，权限最小化
  └── 防 Reentrancy: Checks-Effects-Interactions + ReentrancyGuard

上线前:
  ├── Simulation: 签名前预演，知道交易会做什么
  └── Audit: 外部审计，发现已知问题

上线后:
  └── Monitoring: 监控异常 → 触发告警 → 快速响应

核心理念:
  "区块链不会原谅错误 —— 所以要在错误发生之前抓住它"
```

---

**学习日期**: 2026-05-25  
**Handbook 章节**: [Web3 基础 - Security](https://aiweb3.school/zh/handbook/web3/security/)  
**学习方式**: 概念口述 + Agent 结构化整理
