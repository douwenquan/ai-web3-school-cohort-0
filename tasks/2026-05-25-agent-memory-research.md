# Agent 记忆系统调研 — 四种产品实践与研究

> 来源：同学笔记 @MrtWallace — agent-memory-optimization.md  
> 参考文档：https://github.com/MrtWallace/ai-web3-school/blob/main/notes/agent-memory-optimization.md

---

## 背景

主流记忆方案各有短板：

| 方案 | 核心问题 |
|------|---------|
| 纯上下文窗口 | Token 硬性上限，超出即遗忘 |
| 传统 RAG | 原文 chunk 碎片化，无去重 |
| 知识图谱 | 维护成本高，schema 难设计 |
| 全量注入 | 每轮浪费大量 token |

---

## 六大架构全景

| 架构 | 原理 | 代表产品 |
|------|------|---------|
| **Context Window** | 对话历史直接塞 prompt | ChatGPT |
| **RAG-based** | 文档→chunk→embedding→向量检索 | LangChain, LlamaIndex |
| **Structured (Knowledge Graph)** | 实体/关系→知识图谱→图查询 | Zep v2, GraphRAG |
| **Memory-as-a-Service** | 自动提取 facts→分类存储 | Mem0, Hindsight |
| **Agentic/Self-Editing** | Agent 自主决定存/改/删 | MemGPT/Letta |
| **Tiered Memory** | 短期→中期→长期分层 | MemGPT |

---

## 待研究清单

### 1️⃣ MemGPT / Letta

- **类型**: Agentic/Self-Editing + Tiered Memory
- **核心机制**: 分层记忆（短期→中期→长期）+ 自编辑。Agent 像操作系统管理内存一样管理自己的记忆
- **开源**: ✅
- **适合场景**: OS 级内存管理的复杂 Agent

**调研任务**:
- [ ] 了解 MemGPT 的分层记忆架构
- [ ] 了解 Letta（MemGPT 的演进版本）的核心设计
- [ ] 对比其自编辑机制与 Hindsight 的 consolidation 机制
- [ ] 评估是否适合集成到 Hermes Agent

---

### 2️⃣ Mem0

- **类型**: Memory-as-a-Service
- **核心机制**: 自动提取对话中的 facts，通过 RAG 检索注入上下文
- **开源**: ✅
- **适合场景**: 快速为现有 Agent 加记忆

**调研任务**:
- [ ] 了解 Mem0 的自动提取机制和存储结构
- [ ] 了解 Mem0 的 API 和集成方式
- [ ] 对比与 Hindsight 的差异（提取质量、去重、召回）
- [ ] 评估集成到 Hermes Agent 的可行性

---

### 3️⃣ Zep

- **类型**: Structured (Knowledge Graph)
- **核心机制**: 图记忆 + 时序，支持关系推理
- **开源**: ✅
- **适合场景**: 需要关系推理的商业应用

**调研任务**:
- [ ] 了解 Zep 的图记忆架构
- [ ] 了解 Zep v2 的知识图谱能力
- [ ] 对比图记忆 vs 向量检索的记忆召回效果
- [ ] 评估关系推理在实际 Agent 场景中的价值

---

### 4️⃣ LangChain Memory

- **类型**: 多种策略组合
- **核心机制**: 提供多种记忆策略（Buffer、Summary、Vector Store、KG 等）
- **开源**: ✅
- **适合场景**: 已在 LangChain 生态内的项目

**调研任务**:
- [ ] 了解 LangChain Memory 的多种策略和适用场景
- [ ] 了解 ConversationSummaryMemory、VectorStoreRetrieverMemory 等实现
- [ ] 对比 LangChain Memory 与独立记忆服务的优劣
- [ ] 评估是否值得依赖 LangChain 生态

---

## Hindsight 深度参考（作为对比基准）

Hindsight 是参考文档作者实际使用的系统，核心数据流：

```
原始对话 → LLM 提取 fact (fact_extraction.py)
    → 存入 memory_units 表
    → Consolidation (异步 worker) 合并多个 fact
    → 存入 observations 表
    → Mental Model / Reflect (按需) 合成高层总结
    → 存入 mental_models 表
    → 召回: embedding + 向量搜索 + 图遍历 + 实体匹配
```

### 三种记忆类型

| 类型 | 说明 |
|------|------|
| **world** | 对话中的客观事实 |
| **observation** | consolidation 合并后的精炼事实 |
| **experience** | 反思生成的高层经验总结 |

### Hindsight 的关键设计

- 每个 observation 只跟踪一个特定方面
- 同一方面的新 fact 会 UPDATE 而非重复新增
- `source_memory_ids` 追溯来源 fact
- `proof_count` 追踪支持的 fact 数量
- LLM 重写为干净散文，不复制原始元数据

---

## 期望产出

对每种产品完成以下维度的评估：

| 维度 | 说明 |
|------|------|
| 机制 | 核心记忆机制和存储结构 |
| 优缺点 | 主要优势和已知局限 |
| 集成成本 | 接入 Hermes Agent 的难度 |
| 适用场景 | 适合什么类型的 Agent |
| 推荐度 | 是否值得引入 |

---

**任务创建日期**: 2026-05-25  
**参考来源**: https://github.com/MrtWallace/ai-web3-school/blob/main/notes/agent-memory-optimization.md  
**相关笔记**: daily/2026-05-25.md（待研究事项）
