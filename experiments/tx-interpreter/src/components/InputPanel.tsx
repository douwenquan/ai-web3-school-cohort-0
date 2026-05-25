import { useState } from 'react';

interface InputPanelProps {
  onAnalyze: (txHash: string, manualABI?: string) => void;
  loading: boolean;
}

export default function InputPanel({ onAnalyze, loading }: InputPanelProps) {
  const [txHash, setTxHash] = useState('');
  const [manualABI, setManualABI] = useState('');
  const [showManualABI, setShowManualABI] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txHash.trim()) return;
    const abi = showManualABI && manualABI.trim() ? manualABI.trim() : undefined;
    onAnalyze(txHash.trim(), abi);
  }

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <div className="input-row">
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="输入交易哈希 (0x...)"
          className="tx-input"
        />
        <button type="submit" disabled={loading || !txHash.trim()}>
          {loading ? '分析中...' : '分析'}
        </button>
      </div>
      <div className="manual-abi-toggle">
        <button type="button" onClick={() => setShowManualABI(!showManualABI)} className="link-btn">
          {showManualABI ? '收起' : '+ 手动粘贴 ABI（可选）'}
        </button>
      </div>
      {showManualABI && (
        <textarea
          value={manualABI}
          onChange={(e) => setManualABI(e.target.value)}
          placeholder="粘贴合约 ABI JSON..."
          rows={6}
          className="abi-textarea"
        />
      )}
    </form>
  );
}
