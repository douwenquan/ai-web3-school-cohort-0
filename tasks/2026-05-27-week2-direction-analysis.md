# Week 2 方向探讨记录（更新版）

> 2026-05-27 · Module A 阶段产出 · 含竞品深度调研
> 方向未定，仅供后续选择参考

---

## 背景

根据 Module A 的选择方法，从 6 个方向中初步筛出 2 个感兴趣的方向：

1. **Dev Tooling / Agent Workflow** — 链上交易行为分析 + AI 财务教练
2. **Governance / Coordination / Public Goods** — AI 辅助 DAO 社区治理参与

---

## 方向一：链上行为分析 + 个人画像 + AI 财务教练

### 一句话定位

一个「链上版随手记/记账本」：分析用户历史的链上交易数据，生成个人行为画像，并结合盈亏信息给出交易风格诊断和改善建议。

AI 在这里做的不只是描述，而是诊断+咨询——像是一个**链上财务教练**。

### 真实用户是谁

Web3 活跃用户（尤其是 DeFi 参与者），想知道自己的链上行为到底什么样、做得怎么样、哪里可以改进。不是机构投资者，而是普通钱包用户。

### 如果没有 AI，为什么难以解决

链上交易行为分析可以靠规则引擎完成一部分（归类交易类型、统计频率），但更深层的诊断需要模式识别和个性化解读：

- 用户的交易风格是「开盘冲高型」还是「低吸型」？需要综合时间戳、Gas 策略、交易对选择来判断
- 用户的盈亏和交易行为之间的因果关系是什么？（是滑点吃太多、还是 LP 范围设得太窄？）
- 改进建议需要根据历史表现+当前市场环境+风险偏好三者的综合判断

规则引擎能做统计，但不能做诊断和咨询。AI 在这里的角色是分析、诊断、建议三层。

### 如果没有 Web3，为什么缺一块

全部数据源是链上公开交易记录，不需要用户授权、不需要第三方 API Key、不需要中心化服务器。用户只需要一个钱包地址，就能拿到完整的财务画像。

Web2 的财务分析工具（YNAB、Mint、PocketGuard）需要用户手动导入银行流水或连接银行API。链上数据天然就是开放、可查询的。

### 竞品深度调研

#### 第一类：投资组合追踪器

**DeBank**
- 功能：追踪钱包的 token 余额、DeFi 头寸、NFT，多链支持
- 定位：看你有多少资产、值多少钱
- 不做：行为分析、交易风格诊断、个人画像

**Zapper**
- 功能：类似 DeBank，增加 DeFi 资产管理（存入/提取）
- 定位：投资组合管理
- 不做：行为分析

**Zerion**
- 功能：组合追踪 + 内置交易功能（聚合DEX报价）
- 定位：组合管理 + 交易入口
- 不做：行为分析和诊断

这三家是目前最主流的个人链上资产追踪工具，但它们都是在回答「你持有多少」和「资产涨了跌了」，不是「你花了多少钱、怎么花的」。

#### 第二类：链上数据分析平台

**Nansen**
- 功能：5亿+标签化地址追踪、Smart Money 信号、组合追踪、AI 交易（Nansen AI）
- 定位：机构级链上情报，帮用户跟踪聪明钱在做什么
- 不做：分析你自己的行为模式，它帮你盯别人，不帮你照镜子

**Arkham**
- 功能：地址反匿名化、资金流向图谱、实体关联发现
- 定位：调查/合规/研究，追踪资金去了哪
- 不做：个人交易分析或改进建议

**Nansen AI（2026年新推出）**
- 功能：AI 辅助交易，从信号到执行
- 定位：「帮你交易」，不是「帮你分析自己的交易」

#### 第三类：其他相关工具

**Dune Analytics**
- 功能：自定义 SQL 查询链上数据，建可视化仪表盘
- 定位：高级用户自己做分析
- 缺点：需要会写 SQL，不是自动化的

**Rotkiapp**
- 功能：个人链上交易分析器，追踪支出和收入
- 定位：比较接近你的想法，但以 portfolio 追踪为主

**Crypto Analyzer（App Store）**
- 功能：隐私优先的加密资产追踪器，导入交易记录追踪表现和费用
- 定位：个人资产追踪

**Chainalysis / Elliptic / TRM Labs**
- 功能：区块链数据分析，反洗钱、合规调查
- 定位：面向政府和金融机构
- 不做：个人用户工具

#### 竞品地图总结

你的切入点和现有所有工具都不同：

```
现有工具都在做：
追踪资产（DeBank/Zapper/Zerion）→ "你值多少钱"
追踪别人（Nansen/Arkham）      → "聪明钱在做什么"
追踪合规（Chainalysis/Elliptic） → "有没有洗钱"

你的定位：
追踪行为 + 诊断 + 建议            → "你交易得怎么样"
```

这个空白区目前没有成熟产品。最接近的是 Nansen AI，但它侧重交易执行辅助而非行为诊断。

### 适合做什么

产品 Demo。Web 应用，用户输入地址或链接钱包即可输出画像报告。

### AI 承担的角色（三层）

- 第一层（描述）：归类交易，统计行为指标（频率、金额分布、协议偏好、Gas 策略、活跃时段）
- 第二层（诊断）：结合盈亏数据，识别问题模式。"你在 Uniswap V3 集中流动性做市上累计亏损 2.3 ETH，主要原因可能是价格范围设得太窄"
- 第三层（建议）：根据风险偏好和交易风格，给出可操作建议

### Web3 承担的角色

- 数据源：链上公开交易记录（无需许可）
- 身份入口：钱包地址即可（无需注册）
- 可验证性：所有分析结论可溯源到交易哈希
- 潜在执行：AI 建议可链接到合约交互，但拒绝自动签名

### 关键风险

- 盈亏计算复杂：gas 成本、多链、LP 做市盈亏、不同会计方法
- 用户预期管理：AI 建议不是财务建议
- 高频用户数据量大：需要高效索引

---

## 方向二：AI 辅助 DAO 社区治理参与

### 一句话定位

一个 AI 治理助手，帮助 DAO 成员降低参与门槛——自动总结提案、分析论坛讨论、评估投票影响，让更多人能在 5 分钟内做出知情投票。

### 真实用户是谁

DAO 普通成员（非专业 delegate）。有投票权但没时间追踪论坛+Discord+Snapshot 所有上下文。典型状态：想参与但信息过载。

### 如果没有 AI，为什么难以解决

一个提案要理解需要阅读：
- 治理论坛的讨论串（几十到上百条回复）
- 提案原文（常含技术细节和合约变更）
- Snapshot/Tally 上的投票状态
- Discord 相关讨论

把这些综合成一份可读的决策参考，需要大量文本理解、摘要、结构化和风险评估。规则引擎可以展示投票数据，但不能理解论坛讨论的脉络、不能判断提案争议点、不能评估潜在影响。

AI 的角色是「治理信息精简师」。

### 如果没有 Web3，为什么缺一块

DAO 治理数据（提案内容、投票记录、委托关系、金库影响）都在链上或去中心化协议中公开可查。Web3 提供了公开可验证的投票记录、链上可执行的治理动作、透明的金库状态。

Web2 的社区工具做不到透明、可审计、可执行的治理。

### 竞品深度调研

#### 第一类：治理数据平台

**DeepDAO**
- 功能：DAO 治理数据聚合引擎，分析投票率、提案统计、活跃度排名
- 有 Pro 版（付费）：前 100 DAO 实时仪表盘
- 定位：DAO 研究者和管理者，帮 DAO 看自己运行得怎么样
- 不做：AI 总结提案内容，不做个性化推荐
- 不做：降低参与门槛——它是给重度参与者用的，不是吸引轻度参与者的

**Boardroom**
- 功能：治理数据仪表盘、委托管理、投票追踪
- 定位：专业 DAO 参与者的治理工作台
- 不做：AI 总结或决策辅助

#### 第二类：投票平台

**Snapshot**
- 功能：链下投票平台，DAO 创建空间、发布提案、收集投票
- 定位：投票通道
- 不做：AI 总结、建议、降低理解门槛

**Tally**
- 功能：治理平台，支持投票、委托、提案浏览
- 已集成 Karma 的 delegate score（委托人评分）
- 定位：比 Snapshot 多一层 delegate 管理
- 不做：AI 治理分析

**Agora**
- 功能：治理平台，支持提案讨论和投票
- 定位：治理讨论+投票
- 不做：AI 摘要

#### 第三类：其他相关工具

**Karma**
- 功能：delegate 评分系统，评估委托人的参与度、投票历史
- 已被 Tally 集成
- 定位：帮用户选一个好的委托人，不是帮用户自己参与

**Sybil**
- 功能：查看委托关系和投票权重的查询工具
- 定位：投票权查询

**Governance Tracker（社区自制）**
- 功能：跨论坛+Snapshot+Tally 追踪提案状态（Arbitrum 社区）
- 定位：提案状态看板

**DAO-Analyzer（学术）**
- 功能：研究 DAO 治理活动、投票模式、参与趋势
- 定位：学术研究

#### 竞品地图总结

```
现有工具在做：
DeepDAO/Boardroom → 数据仪表盘（给重度参与者和研究者）
Snapshot/Tally/Agora → 投票通道（给知道要投什么的人）
Karma/Sybil → 委托决策（帮你找人代投）
Governance Tracker → 提案状态追踪（帮你跟进度）

你的定位：
AI 总结 + 决策辅助 → 降低理解门槛（让不想花时间的人也参与）
```

这个空白区目前**几乎没有成熟产品**。DeepDAO 是最接近的，但它给的是数据仪表盘而不是 AI 摘要。AI 治理解读这一块还是蓝海。

### 适合做什么

产品 Demo。Web 应用或浏览器插件（嵌入 Snapshot/Tally 页面）。

### AI 承担的角色

- 提案摘要：把技术提案翻译为自然语言，标注金库支出、合约变更、治理权力变化
- 论坛脉络分析：追踪正反方核心论点，标注争议焦点
- 投票影响评估：这个提案通过后会改变什么？对代币持有者有什么影响？
- 个性化推送：根据用户的持仓和参与历史推荐相关提案

### Web3 承担的角色

- 数据源：Snapshot/Tally 的投票数据、链上提案执行状态、金库数据
- 身份入口：连接钱包即可查看治理信息
- 执行验证：AI 建议和最终链上结果可对比验证

### 关键风险

- 总结偏差：AI 可能遗漏关键细节或偏向一方
- 多 DAO 数据源各异：Snapshot/Tally/Realms/论坛 格式不同
- 权威性问题：AI 建议必须标注"仅供参考"
- 参与率提升的实际验证难度

---

## 补充调研：交叉方向的参考项目

### Agent DeFi Execution 框架（你的 Week 1 设计相关）

- **Cobo Agentic Wallet**：你已了解的 Pact 机制——任务级授权、边界控制、审计记录
  - 文档：cobo.com/products/agentic-wallet/manual/llms.txt
- **LI.FI Agent**：跨链交易的 agent 接口，查询 token、链状态、执行跨链
- **Safe Smart Account Guards**：在 Safe 上做执行前检查的 guard 机制

### Identity / Capability 方向（Agent Profile 相关）

- **MCP**：Model Context Protocol，agent 与工具的接口协议
- **A2A**：Agent-to-Agent 协议（Google 主导）
- **ERC-8004 / ERC-8183**：Agent trust、job、escrow 的协议标准

---

## 两个方向的关键对比

对比维度，方向一（链上财务教练）vs 方向二（AI 治理助手）：

AI 角色：方向一是分析+诊断+建议（深层），方向二是总结+梳理+翻译（深层）。两个都是三层结构，AI 都不是装饰

Web3 角色：方向一中链上数据是全部数据源，Web3 不可替代；方向二中链上数据是治理信息来源，Web3 同样不可替代

竞品空白度：方向一竞品较多但无人做行为诊断（空白度中等）；方向二竞品更少、几乎无 AI 治理助手（空白度高）

工程难度：方向一的核心难点是 tx 解析归类+盈亏计算；方向二的核心难点是跨 DAO 数据格式异构+论坛文本理解

你的个人积累：方向一你已设计 DeFi Swap Agent（有链上交互理解基础）；方向二你有良心岛周会的一手痛点

目标用户的广度：方向一的用户是所有链上活跃地址（百万级）；方向二的用户是所有 DAO 成员（但活跃度仅5%，潜在用户规模较小但需求更痛）

---

## 初步结论（待定）

两个方向的 AI 和 Web3 交叉程度都不弱，都满足"同时不可替代"的判断标准。最大的差异是：

- 方向一：竞品更多但没人做"行为诊断"这个角度，用户基数大，你的 DeFi Swap 设计可以直接用
- 方向二：竞品更少、空白度更高，有实际痛点验证，但用户规模相对小

最终选择不急，你可以继续思考，也可以先画草稿体验一下再决定。

---

## 参考来源

### 方向一相关

- DeBank — https://debank.com
- Zapper — https://zapper.xyz
- Zerion — https://zerion.io
- Nansen — https://nansen.ai
- Arkham — https://arkm.com
- Dune Analytics — https://dune.com
- Rotkiapp — https://rotkiapp.com
- Crypto Analyzer（App Store）
- Chainalysis — https://chainalysis.com
- Elliptic — https://elliptic.co
- TRM Labs — https://trmlabs.com

### 方向二相关

- DeepDAO — https://deepdao.io
- Snapshot — https://snapshot.box
- Tally — https://tally.xyz
- Agora — https://vote.agora.xyz
- Karma — https://karmahq.xyz
- Boardroom — https://boardroom.io
- Sybil — https://sybil.org
- DAO-Analyzer 论文 — https://www.researchgate.net/publication/365217376

### 交叉方向

- Cobo Agentic Wallet — https://cobo.com/products/agentic-wallet
- MCP — https://modelcontextprotocol.io
- A2A — https://github.com/a2aproject/A2A
- ERC-8004 — https://eips.ethereum.org/EIPS/eip-8004
- ERC-8183 — https://eips.ethereum.org/EIPS/eip-8183


---

## 2026-05-29 讨论记录

### 第一类竞品深度分析（DeBank / Zapper / Zerion）

**DeBank**
- 定位：链上数据追踪+研究工具，主打数据最全、更新最快
- 核心：覆盖 30+ EVM 链，实时追踪 DeFi 头寸、借贷仓位、奖励
- 附加：基础的交易功能 + 自家 Rabbit 浏览器钱包
- 缺点：主打分析功能，管理和买卖不做；止步于"看数据"，不做诊断和建议

**Zapper**
- 定位：资产管理 + 执行中心，一站式管理和复杂 DeFi 操作
- 核心：聚合了较强的交易功能（聚合DEX报价），支持多种跨链桥
- 缺点：想做超级应用，体量太大；新协议和长尾链支持慢；数据分析比较表面；性能和稳定性相对不好

**Zerion**
- 定位：移动钱包 + 追踪功能，操作体验好
- 核心：自带智能钱包，内置交易聚合器，硬件钱包兼容
- 缺点：专业性不足，投研功能弱

**共同短板：** 三者在回答"你持有多少、值多少钱"，没有回答"你的交易行为怎么样、怎么改进"。

### 第二类竞品分析（Dune / Nansen / Arkham）

**Dune Analytics**
- 链上数据查询分析平台，用 SQL 查询和展示链上宏观和微观数据
- 社区 20 万+ 共享仪表盘，自由度极高
- 缺点：门槛高（需要会写 SQL），查的是全链数据而非个人自动化报告，没有诊断和建议层

**Nansen**
- 5亿+标签化地址，追踪 Smart Money 动向，Nansen AI 辅助交易
- 视角是"别人在做什么"，不是分析你自己
- 核心差异：帮你盯别人，不帮你照镜子

**Arkham**
- 地址反匿名化，实体关联映射，资金流向可视化
- 面向调查和合规场景，不是个人行为分析

### 第三类竞品分析（Chainalysis / Elliptic / TRM Labs）

**三者共性：** 全部是 B 端工具，用户是政府、交易所、合规部门，不是个人用户。

**Chainalysis**
- 区块链数据分析领域龙头，核心产品 Reactor（资金流向可视化调查工具）+ 合规筛查 API
- 客户：美国联邦机构（FBI、IRS、ICE）、头部交易所
- 核心能力：实体聚类——把地址归到同一实体下，追踪洗钱路径

**Elliptic**
- 偏合规方向，核心是交易发生前的风险评估
- 3000亿+历史交易记录数据库，实时计算风险评分
- 客户：银行和加密金融机构

**TRM Labs**
- AI 驱动的区块链情报，覆盖链最广（190+ 链，19亿+ 资产）
- 最新的 Co-Case Agent（AI 辅助调查工具）
- 客户：政府机构比例高（IRS、DOJ 等）

**与你方向的关系：** 数据源相同（链上公开数据），但分析维度和用户完全不同——它们做合规和执法层面的分析，你做个人层面的行为画像。

### 方向约束条件

确定方向的两个关键约束：
- 只有两周时间做项目（个人黑客松，需要较高完成度）
- 不能做得太复杂，要能落地

### 方向一 MVP 思路

- 数据源单一可控：链上交易记录，从 RPC 或 Etherscan 直接拿
- MVP 边界清晰：一个地址 → 一份画像报告
- 可拓展：先覆盖主流 EVM 链（交易量大），代码基本可复用
- Stretch goal：如果时间足够，可以尝试 CEX 交易分析的导入（看数据可获取性）
- 你本人就是目标用户，做完可以马上自测

### 方向二 MVP 思路

- 不需要预先接入每个 DAO：用户提供 Snapshot 空间地址或提案链接 → AI 直接去抓取分析
- 工程难点从"多 DAO 集成"变成"抓取+解析+总结"，更可控
- 但需要真实用户验证

### 状态

方向未定，下次继续讨论。

# Week 2 竞品调研记录

> 2026-05-27 · 纯记录，待后续分析讨论

---

## 方向一：链上行为分析 / 个人画像 / 财务诊断

### DeBank

- 网址：https://debank.com
- 定位：个人链上资产追踪器
- 核心功能：多链 token 余额、DeFi 头寸、NFT、交易历史

### Zapper

- 网址：https://zapper.xyz
- 定位：个人 DeFi 组合管理
- 核心功能：组合追踪、DeFi 资产管理（存入/提取）

### Zerion

- 网址：https://zerion.io
- 定位：组合管理 + 交易入口
- 核心功能：组合追踪、聚合 DEX 报价、内置交易

### Nansen

- 网址：https://nansen.ai
- 定位：链上情报分析平台
- 核心功能：5亿+标签地址追踪、Smart Money 信号、组合追踪、Nansen AI（AI 辅助交易）

### Arkham

- 网址：https://arkm.com
- 定位：链上反匿名化平台
- 核心功能：地址实体关联、资金流向图谱、交易可视化

### Dune Analytics

- 网址：https://dune.com
- 定位：自定义链上数据查询平台
- 核心功能：SQL 查询链上数据、自定义仪表盘、社区共享

### Rotkiapp

- 网址：https://rotkiapp.com
- 定位：个人链上支出分析
- 核心功能：交易追踪、收入支出分析

### Crypto Analyzer

- 平台：App Store
- 定位：隐私优先加密资产追踪
- 核心功能：导入交易、追踪表现和费用

### Chainalysis

- 网址：https://chainalysis.com
- 定位：区块链数据平台（企业级）
- 核心功能：合规检查、反洗钱、交易监控

### Elliptic

- 网址：https://elliptic.co
- 定位：区块链分析与合规方案
- 核心功能：加密合规、调查与情报、稳定币风险管理

### TRM Labs

- 网址：https://trmlabs.com
- 定位：区块链情报与反犯罪
- 核心功能：链上分析、风险评分、调查工具

---

## 方向二：AI 辅助 DAO 治理参与

### DeepDAO

- 网址：https://deepdao.io
- 定位：DAO 治理数据聚合引擎
- 核心功能：投票率统计、提案追踪、DAO 排名、Pro 版含前 100 DAO 实时仪表盘

### Snapshot

- 网址：https://snapshot.box
- 定位：链下投票平台
- 核心功能：DAO 创建空间、发布提案、代币加权投票（gasless）

### Tally

- 网址：https://tally.xyz
- 定位：链上治理平台
- 核心功能：投票、委托管理、提案浏览、已集成 Karma delegate score

### Agora

- 网址：https://vote.agora.xyz
- 定位：治理讨论+投票平台
- 核心功能：提案讨论、投票、治理信息展示

### Karma

- 网址：https://karmahq.xyz
- 定位：DAO 委托评分系统
- 核心功能：delegate 参与度评分、投票历史分析、已集成到 Tally

### Boardroom

- 网址：https://boardroom.io
- 定位：治理数据工作台
- 核心功能：治理仪表盘、委托管理、投票追踪

### Sybil

- 网址：https://sybil.org
- 定位：委托关系查询工具
- 核心功能：查看投票委托关系、投票权重查询

### DAO-Analyzer

- 性质：学术研究工具
- 核心功能：分析 DAO 治理活动、投票模式、参与趋势
- 论文：https://www.researchgate.net/publication/365217376

---

## 其他相关

### Cobo Agentic Wallet

- 网址：https://cobo.com/products/agentic-wallet
- 核心文档：https://cobo.com/products/agentic-wallet/manual/llms.txt
- 相关概念：Pact 机制（任务级授权）、审计记录

### LI.FI Agent

- 网址：https://docs.li.fi/agents/overview
- 定位：跨链交易 agent 接口

### Safe Smart Account Guards

- 网址：https://docs.safe.global/advanced/smart-account-guards
- 定位：多签智能账户的执行前安全检查

---

*纯记录，不包含分析或评价。后续讨论用。*


---


# Week 2 模块选择指南

> 基于 Week 1 已有产出，帮你选最省力、产出最高的方向

---

## 一、七模块速览对比

| 模块 | 一句话核心问题 | 典型产出形态 | 学习曲线 |
|------|--------------|-------------|:--------:|
| **A. 问题地图** | AI × Web3 的全景是什么？我该选哪个方向？ | 一张地图 + 方向说明 | 低（但只是起点） |
| **B. Payment / Commerce** | Agent 怎么付钱、收钱、结账？ | 流程图 + 协议比较 | 中高 |
| **C. Identity / Capability** | Agent 怎么介绍自己、被找到、被调用？ | Profile 草图 + 协议比较 | 中 |
| **D. Wallet / Permission** | Agent 链上动作的权限怎么管？ | 权限策略 + 执行流程图 | 中 |
| **E. Agent DeFi Execution** ⭐ | Agent 做 Swap/Deposit/Borrow 时安全吗？ | 全链路设计 + 模拟实现 | 中高 |
| **F. Privacy / Security** | Agent 系统有哪些攻击面？怎么防守？ | Threat model + 边界策略 | 中 |
| **G. Governance / Coordination** | AI 怎么辅助 DAO 和社区协作？ | 流程图 + 草图 | 中 |

---

## 二、你的 Week 1 积累 vs 各模块匹配度

| 模块 | 你已有的东西 | 匹配度 | 理由 |
|------|------------|:-----:|------|
| **D** | `designs/defi-swap-restricted-agent.md` 全篇讲权限边界、三条铁律、三堵确认墙 | ⭐⭐⭐⭐⭐ | 你的设计本身就是 D 的完整实践 |
| **E** | 同上，Swap/Approve/Permit2/Simulation 就是 E 的内容 | ⭐⭐⭐⭐⭐ | DeFi 执行的每个环节都已覆盖 |
| **F** | Threat model 你已经隐性做了（枚举了 5 种风险+缓解） | ⭐⭐⭐⭐ | 只差一份正式的威胁模型文档 |
| **C** | 你现在就是 Learning Agent，每天在和自己的 agent profile 打交道 | ⭐⭐⭐ | 但需要从零写 profile |
| **B** | x402/MPP/CAW 你刚看完但还没实践 | ⭐⭐ | 需要较多新学习 |
| **G** | Week 1 画过治理流程图（governance-workflow.html） | ⭐⭐ | 但治理不是你 Week 1 主线 |
| **A** | 只作为起点，不单独做 | — | A 是帮人选方向的，不是终点 |

---

## 三、每条路的 Week 2 产出预估

假设你每天 2-3 小时，到 6/1 还有约 5 天：

### 路线 1：选 E（Agent DeFi Execution）为主 + D 配套

| 日 | 产出 |
|:-:|------|
| 今天 | 确定方向 + 画问题地图（A 的交付） |
| 5/28 | 把 DeFi Swap 设计文档升级为 E 的深挖包 |
| 5/29 | 参加例会 + 方向选择说明 |
| 5/30 | 写 Proposal + 参考资料清单 |
| 5/31 | 补流程图和反例 |
| 6/1 | 总交付整合 + WCB 提交 |

**闭环路径：** Week 1 的设计文档 → Week 2 直接升级为方向深挖包 → Week 3 可以做成可运行的 prototype

### 路线 2：选 D（Wallet/Permission）为主

产出类似路线 1，但更聚焦权限策略而非执行细节。Week 1 的 DeFi Swap 文档可以提纯为通用的 permission policy 设计。

### 路线 3：选 C（Identity/Capability）为主

从零开始写自己的 Agent Profile，结合 Hermes 的使用体验做案例。你 Week 1 的 Agent memory 调研（`tasks/2026-05-25-agent-memory-research.md`）部分相关。

### 路线 4：选 B（Payment/Commerce）为主

需要较多新学习（x402/MPP/CAW 实操），时间紧张但回报是掌握 agent commerce 的实操链路。

### 路线 5：选 F（Security/Privacy）为主

把你的 DeFi Swap 文档中的风险部分提纯为通用 Threat Model，工作量中等。

---

## 四、我的建议

**第一推荐：路线 1 — E 为主 + D 配套**

理由很直接——你 Week 1 的 DeFi Swap 设计文档（414 行）已经覆盖了 E 和 D 的核心内容：

| Week 1 已有的 | 对应 Week 2 交付物 |
|--------------|-------------------|
| 四阶段工作流 | → 问题拆解（③） |
| Pre-flight Simulation + Permit2 | → 深挖包的流程图 + 场景（⑥） |
| 三条铁律 + 三堵确认墙 | → 权限策略设计（D 的任务） |
| 5 种风险 + 缓解措施 | → 关键风险（⑥的一部分） |
| 技术参考清单 | → 参考资料清单（⑤） |

换句话说，**你的 Week 2 总交付不是从零写，而是把 Week 1 的设计升级为正式的方向深挖包**。这比其他路线省至少 2-3 天的时间。

**第二推荐：路线 5 — F（Security）**

如果你对安全方向更感兴趣，可以直接把 DeFi Swap 文档中的风险部分扩展为通用 Threat Model。Week 2 总交付里的"风险边界"和"验证方式"就是为此设计的。

**如果你坚持想走新的方向（B/C/G）**，也完全 ok，但要做好付出更多学习时间的准备。

---

## 五、现在做决定

按模块 A 的选择方法，回答这两个问题：

1. **前 2 个感兴趣的方向是？**
   - 比如：D（Wallet/Permission）+ E（Agent DeFi Execution）

2. **各写一句：这个方向的真实用户是谁？**
   - D：使用 Agent 执行链上操作的 DeFi 用户，需要权限分层和人工确认机制
   - E：希望通过 Agent 辅助 Swap/Deposit 但不想失去资金控制权的普通用户

然后我们选一个作为 Week 2 主线，今天就开始画问题地图。
