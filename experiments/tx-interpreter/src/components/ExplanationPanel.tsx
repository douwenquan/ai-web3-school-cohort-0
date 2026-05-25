import { Explanation } from '../types';

interface ExplanationPanelProps {
  explanation: Explanation;
}

interface BlockConfig {
  key: keyof Explanation;
  title: string;
  badge: { text: string; className: string };
}

const BLOCKS: BlockConfig[] = [
  {
    key: 'actionSummary',
    title: '动作摘要',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'assetsAndAddresses',
    title: '资产与地址',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'onChainData',
    title: '链上数据摘要',
    badge: { text: '📡 链上数据', className: 'badge-data' },
  },
  {
    key: 'modelInference',
    title: '模型推断',
    badge: { text: '⚠️ 需人工验证', className: 'badge-verify' },
  },
  {
    key: 'uncertainties',
    title: '不确定项',
    badge: { text: '🤖 AI 生成', className: 'badge-ai' },
  },
  {
    key: 'securityChecklist',
    title: '安全检查清单',
    badge: { text: '⚠️ 需人工验证', className: 'badge-verify' },
  },
];

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <div className="explanation-panel">
      <h3>AI 解释</h3>
      <div className="explanation-grid">
        {BLOCKS.map((block) => (
          <div key={block.key} className="explanation-block">
            <div className="block-header">
              <h4>{block.title}</h4>
              <span className={`badge ${block.badge.className}`}>{block.badge.text}</span>
            </div>
            <div className="block-content">
              {explanation[block.key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
